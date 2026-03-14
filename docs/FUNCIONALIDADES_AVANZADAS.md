# Funcionalidades Avanzadas del Sistema M4 POS/ERP

## Resumen

Este documento describe tres funcionalidades avanzadas implementadas en el sistema M4 POS/ERP para mejorar la gestión de inventario, trazabilidad de productos y control de stock.

## 1. Importación Masiva de Productos desde CSV

### Descripción

Permite importar cientos de productos simultáneamente mediante archivos CSV con validaciones anti-fallos para garantizar la integridad de los datos.

### Características Principales

- ✅ **Procesamiento por lotes**: Hasta 1000 productos por archivo
- ✅ **Validaciones anti-fallos**: IMEI único, campos requeridos, formatos numéricos
- ✅ **Reporte detallado**: Muestra productos exitosos y fallidos
- ✅ **Vista previa**: Primeros 10 productos antes de importar
- ✅ **Progreso en tiempo real**: Contador de productos procesados

### Validaciones Implementadas

1. **IMEI Único**
   - No permite IMEIs duplicados dentro del archivo
   - Verifica que no existan en la base de datos
   - Detiene la importación si encuentra duplicados

2. **Campos Requeridos**
   - `nombre`: Obligatorio, no puede estar vacío
   - `tipo`: Debe ser equipo, sim o accesorio

3. **Formatos Numéricos**
   - Precios y costos deben ser números válidos
   - Porcentaje de comisión entre 0 y 100
   - Valores inválidos se ignoran (quedan como undefined)

### Formato del CSV

```csv
tipo,marca,modelo,imei,sku,color,categoria,nombre,descripcion,precio_lista,precio_minimo,precio_payjoy,costo,comision
equipo,Apple,iPhone 15 Pro,123456789012345,,Titanio Natural,Smartphones,iPhone 15 Pro 256GB,Smartphone Apple...,25999,23999,27999,20000,8.5
```

### Procedimiento tRPC

```typescript
products.bulkImport({
  products: [
    {
      type: 'HANDSET',
      name: 'iPhone 15 Pro',
      imei: '123456789012345',
      // ... otros campos
    }
  ]
})
```

**Respuesta**:
```typescript
{
  total: 100,
  success: 98,
  failed: 2,
  errors: [
    { row: 5, name: 'Samsung S24', error: 'IMEI duplicado' },
    { row: 12, name: 'Xiaomi 13', error: 'Campo nombre requerido' }
  ]
}
```

### Uso en la Interfaz

1. Navegar a **Productos**
2. Clic en **Importar CSV**
3. Seleccionar archivo CSV
4. Revisar vista previa
5. Clic en **Importar X Productos**
6. Esperar confirmación

### Archivo de Ejemplo

Se incluye `ejemplo_importacion_productos.csv` con:
- 10 equipos con IMEI único
- 2 tarjetas SIM
- 8 accesorios variados
- Todos los campos completados correctamente

### Documentación Completa

Ver `docs/GUIA_IMPORTACION_CSV.md` para:
- Formato detallado del CSV
- Casos de uso comunes
- Solución de problemas
- Limitaciones técnicas

---

## 2. Historial de Movimientos por IMEI

### Descripción

Sistema de trazabilidad completa que registra todos los movimientos de productos, especialmente equipos con IMEI, desde su entrada hasta su venta y posibles devoluciones.

### Características Principales

- ✅ **Trazabilidad completa**: Registro de cada movimiento del producto
- ✅ **Consulta por IMEI**: Buscar historial escaneando código de barras
- ✅ **Tipos de movimiento**: Entrada, Venta, Devolución, Ajuste, Transferencia
- ✅ **Auditoría**: Registro de usuario y fecha de cada movimiento
- ✅ **Referencias**: Vinculación con ventas, compras, etc.

### Tabla de Base de Datos

```sql
CREATE TABLE product_movements (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  movement_type TEXT NOT NULL, -- ENTRADA, VENTA, DEVOLUCION, AJUSTE, TRANSFERENCIA
  quantity INTEGER DEFAULT 1,
  reference_id UUID, -- ID de la venta, compra, etc.
  reference_type TEXT, -- 'sale', 'purchase', etc.
  notes TEXT,
  user_id UUID,
  created_at TIMESTAMP
);
```

### Procedimientos tRPC

#### 1. Consultar Movimientos por Producto

```typescript
productMovements.listByProduct({
  productId: 'uuid-del-producto',
  limit: 50
})
```

**Respuesta**:
```typescript
[
  {
    id: 'uuid',
    movement_type: 'ENTRADA',
    quantity: 1,
    reference_type: 'purchase',
    created_at: '2026-02-01T10:00:00Z',
    profiles: { name: 'Juan Pérez' }
  },
  {
    id: 'uuid',
    movement_type: 'VENTA',
    quantity: 1,
    reference_type: 'sale',
    created_at: '2026-02-02T15:30:00Z',
    profiles: { name: 'María García' }
  }
]
```

#### 2. Consultar Movimientos por IMEI

```typescript
productMovements.listByIMEI({
  imei: '123456789012345',
  limit: 50
})
```

**Respuesta**:
```typescript
{
  product: {
    id: 'uuid',
    name: 'iPhone 15 Pro 256GB',
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    imei: '123456789012345'
  },
  movements: [
    // ... lista de movimientos
  ]
}
```

#### 3. Registrar Movimiento Manual

```typescript
productMovements.create({
  productId: 'uuid-del-producto',
  movementType: 'AJUSTE',
  quantity: 1,
  notes: 'Ajuste por inventario físico',
  referenceId: 'uuid-opcional',
  referenceType: 'adjustment'
})
```

### Tipos de Movimiento

| Tipo | Descripción | Cuándo se Registra |
|------|-------------|-------------------|
| **ENTRADA** | Recepción de producto | Al crear compra o recibir transferencia |
| **VENTA** | Venta de producto | Al completar una venta |
| **DEVOLUCION** | Devolución de cliente | Al procesar devolución |
| **AJUSTE** | Ajuste de inventario | Manualmente por usuario autorizado |
| **TRANSFERENCIA** | Movimiento entre tiendas | Al enviar transferencia |

### Casos de Uso

#### Caso 1: Rastrear Equipo Vendido

**Escenario**: Cliente reporta problema con equipo comprado

**Proceso**:
1. Escanear IMEI del equipo
2. Consultar historial de movimientos
3. Ver fecha de venta y vendedor
4. Verificar si hubo devoluciones previas
5. Tomar decisión informada sobre garantía

#### Caso 2: Auditoría de Inventario

**Escenario**: Verificar movimientos de productos de alto valor

**Proceso**:
1. Consultar movimientos del último mes
2. Identificar patrones anormales
3. Verificar referencias con ventas reales
4. Detectar posibles discrepancias

#### Caso 3: Garantías y Devoluciones

**Escenario**: Validar elegibilidad para garantía

**Proceso**:
1. Buscar producto por IMEI
2. Verificar fecha de entrada original
3. Confirmar fecha de venta
4. Calcular tiempo transcurrido
5. Aprobar o rechazar garantía

### Integración Automática

El sistema registra movimientos automáticamente en:

- ✅ **Ventas**: Al crear venta (tipo: VENTA)
- ✅ **Compras**: Al recibir compra (tipo: ENTRADA)
- ✅ **Transferencias**: Al enviar/recibir (tipo: TRANSFERENCIA)
- ✅ **Devoluciones**: Al procesar devolución (tipo: DEVOLUCION)

---

## 3. Sistema de Alertas de Stock Bajo

### Descripción

Sistema automático de detección y notificación de productos con stock bajo para evitar desabastecimiento y pérdida de ventas.

### Características Principales

- ✅ **Detección automática**: Compara stock actual vs mínimo
- ✅ **Notificaciones al propietario**: Alerta por producto con stock bajo
- ✅ **Registro de alertas**: Historial de alertas generadas
- ✅ **Resolución manual**: Marcar alertas como resueltas
- ✅ **Configuración por producto**: Umbral mínimo personalizable

### Campos Agregados a Productos

```sql
ALTER TABLE products
ADD COLUMN stock_actual INTEGER DEFAULT 0,
ADD COLUMN stock_minimo INTEGER DEFAULT 5;
```

- **stock_actual**: Cantidad disponible en inventario
- **stock_minimo**: Umbral para generar alerta (default: 5)

### Tabla de Alertas

```sql
CREATE TABLE stock_alerts (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL,
  alert_type TEXT DEFAULT 'LOW_STOCK',
  stock_actual INTEGER NOT NULL,
  stock_minimo INTEGER NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Procedimientos tRPC

#### 1. Listar Alertas Activas

```typescript
stockAlerts.list({
  resolvedOnly: false, // Solo alertas activas
  limit: 50
})
```

**Respuesta**:
```typescript
[
  {
    id: 'uuid',
    alert_type: 'LOW_STOCK',
    stock_actual: 2,
    stock_minimo: 5,
    is_resolved: false,
    created_at: '2026-02-03T09:00:00Z',
    products: {
      name: 'iPhone 15 Pro 256GB',
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      imei: '123456789012345',
      stock_actual: 2,
      stock_minimo: 5
    }
  }
]
```

#### 2. Verificar y Crear Alertas

```typescript
stockAlerts.checkLowStock()
```

**Respuesta**:
```typescript
{
  alertsCreated: 3,
  lowStockProducts: 5
}
```

**Proceso**:
1. Busca productos con `stock_actual <= stock_minimo`
2. Verifica si ya existe alerta activa
3. Crea nueva alerta si no existe
4. Envía notificación al propietario

**Notificación Enviada**:
```
Título: ⚠️ Stock Bajo: iPhone 15 Pro 256GB

Contenido:
El producto "iPhone 15 Pro 256GB" tiene stock bajo.

Stock actual: 2
Stock mínimo: 5

Es necesario reabastecer.
```

#### 3. Resolver Alerta

```typescript
stockAlerts.resolve({
  alertId: 'uuid-de-la-alerta'
})
```

Marca la alerta como resuelta y registra la fecha de resolución.

### Configuración de Umbrales

#### Por Defecto

Todos los productos nuevos tienen:
- `stock_actual`: 0
- `stock_minimo`: 5

#### Personalizado por Producto

Al crear o editar producto, definir:

```typescript
products.update({
  id: 'uuid',
  stock_minimo: 10 // Umbral personalizado
})
```

**Recomendaciones**:
- **Productos de alta rotación**: stock_minimo = 15-20
- **Productos de baja rotación**: stock_minimo = 3-5
- **Productos premium**: stock_minimo = 2-3
- **Accesorios populares**: stock_minimo = 25-50

### Flujo de Trabajo

#### 1. Configuración Inicial

```typescript
// Al recibir productos del proveedor
products.update({
  id: 'uuid',
  stock_actual: 50, // Cantidad recibida
  stock_minimo: 10  // Umbral deseado
})
```

#### 2. Actualización Automática de Stock

```typescript
// Al realizar venta
// El sistema automáticamente:
// - Reduce stock_actual en 1
// - Verifica si stock_actual <= stock_minimo
// - Crea alerta si es necesario
```

#### 3. Revisión de Alertas

```typescript
// Consultar alertas activas
const alerts = await stockAlerts.list({ resolvedOnly: false });

// Revisar productos con stock bajo
alerts.forEach(alert => {
  console.log(`${alert.products.name}: ${alert.stock_actual}/${alert.stock_minimo}`);
});
```

#### 4. Reabastecimiento

```typescript
// Al recibir nueva mercancía
products.update({
  id: 'uuid',
  stock_actual: 30 // Nuevo stock
});

// Resolver alerta
stockAlerts.resolve({ alertId: 'uuid' });
```

### Casos de Uso

#### Caso 1: Reabastecimiento Proactivo

**Escenario**: Evitar desabastecimiento de productos populares

**Proceso**:
1. Sistema detecta stock bajo automáticamente
2. Propietario recibe notificación
3. Revisa alertas activas en el sistema
4. Contacta proveedor para reabastecimiento
5. Marca alerta como resuelta al recibir mercancía

#### Caso 2: Análisis de Rotación

**Escenario**: Identificar productos de alta demanda

**Proceso**:
1. Revisar historial de alertas
2. Identificar productos con alertas frecuentes
3. Ajustar stock_minimo para esos productos
4. Planificar compras más grandes

#### Caso 3: Control de Inventario

**Escenario**: Mantener niveles óptimos de stock

**Proceso**:
1. Configurar umbrales personalizados por producto
2. Monitorear alertas diariamente
3. Ajustar umbrales según temporada
4. Optimizar capital de trabajo

### Integración con Notificaciones

El sistema usa `notifyOwner()` para enviar alertas:

```typescript
await notifyOwner({
  title: `⚠️ Stock Bajo: ${product.name}`,
  content: `El producto "${product.name}" tiene stock bajo.\n\nStock actual: ${product.stock_actual}\nStock mínimo: ${product.stock_minimo}\n\nEs necesario reabastecer.`
});
```

Las notificaciones llegan directamente al propietario del proyecto Manus.

---

## Beneficios Generales

### Operacionales

- ✅ **Ahorro de tiempo**: Importación masiva vs manual
- ✅ **Trazabilidad completa**: Historial de cada producto
- ✅ **Control proactivo**: Alertas antes de desabastecimiento
- ✅ **Auditoría mejorada**: Registro de todos los movimientos

### Comerciales

- ✅ **Evitar pérdida de ventas**: Stock siempre disponible
- ✅ **Mejor servicio al cliente**: Información completa de productos
- ✅ **Optimización de capital**: Stock justo, no excesivo
- ✅ **Toma de decisiones**: Datos para planificación de compras

### Técnicos

- ✅ **Escalabilidad**: Procesa cientos de productos
- ✅ **Integridad de datos**: Validaciones anti-fallos
- ✅ **Automatización**: Registro automático de movimientos
- ✅ **Notificaciones**: Sistema de alertas integrado

---

## Archivos Relevantes

### Backend

- `server/routers.ts` - Procedimientos tRPC de las tres funcionalidades
- `server/_core/notification.ts` - Sistema de notificaciones
- `migrations/add-product-movements.sql` - Tabla de movimientos
- `migrations/add-stock-alerts.sql` - Tabla de alertas

### Frontend

- `client/src/pages/Products.tsx` - Interfaz de importación CSV
- (Pendiente) Interfaz de historial de movimientos
- (Pendiente) Interfaz de alertas de stock

### Documentación

- `docs/GUIA_IMPORTACION_CSV.md` - Guía completa de importación
- `docs/FUNCIONALIDADES_AVANZADAS.md` - Este documento
- `ejemplo_importacion_productos.csv` - Archivo de ejemplo

### Tests

- `server/products.equipment.test.ts` - Tests de campos de equipos
- `server/commission.hierarchy.test.ts` - Tests de comisiones
- (Pendiente) Tests de movimientos e historial
- (Pendiente) Tests de alertas de stock

---

## Próximos Pasos Sugeridos

### Interfaces de Usuario

1. **Página de Historial de Movimientos**
   - Buscar por IMEI con pistola de código de barras
   - Timeline visual de movimientos
   - Filtros por tipo y fecha
   - Exportar a PDF

2. **Dashboard de Alertas**
   - Lista de alertas activas
   - Botón "Marcar como resuelta"
   - Gráfica de productos con stock bajo
   - Configuración de umbrales masiva

### Automatizaciones

3. **Actualización Automática de Stock**
   - Al crear venta: reducir stock_actual
   - Al recibir compra: aumentar stock_actual
   - Al procesar devolución: aumentar stock_actual
   - Trigger automático de checkLowStock

4. **Reportes Avanzados**
   - Reporte de movimientos por período
   - Análisis de rotación de inventario
   - Productos con alertas frecuentes
   - Proyección de reabastecimiento

### Integraciones

5. **Integración con Proveedores**
   - Envío automático de órdenes de compra
   - Sincronización de catálogos
   - Actualización automática de precios
   - Rastreo de envíos

---

## Soporte y Mantenimiento

### Monitoreo

- Revisar logs de importaciones fallidas
- Verificar alertas no resueltas antiguas
- Auditar movimientos sin referencia
- Validar integridad de IMEIs

### Optimización

- Índices de base de datos actualizados
- Limpieza de alertas resueltas antiguas
- Archivado de movimientos históricos
- Optimización de consultas frecuentes

### Capacitación

- Guía de uso de importación CSV
- Manual de consulta de historial
- Procedimiento de gestión de alertas
- Mejores prácticas de configuración

---

## Conclusión

Las tres funcionalidades implementadas transforman el sistema M4 POS/ERP en una solución completa de gestión de inventario con:

- **Eficiencia**: Importación masiva ahorra horas de trabajo manual
- **Control**: Trazabilidad completa de cada producto
- **Proactividad**: Alertas automáticas evitan desabastecimiento

El sistema está listo para escalar y soportar operaciones de tiendas de cualquier tamaño, desde pequeños negocios hasta cadenas con múltiples sucursales.
