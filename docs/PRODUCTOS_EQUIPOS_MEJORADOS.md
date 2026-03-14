# Mejoras al Formulario de Productos - Equipos

## Resumen

Se ha mejorado significativamente el formulario de creación y edición de productos tipo "Equipo" (HANDSET) con campos específicos para la gestión de dispositivos móviles y su integración con el sistema de comisiones.

## Nuevos Campos Implementados

### 1. IMEI del Equipo
- **Reemplaza**: Campo SKU (solo para productos tipo Equipo)
- **Características**:
  - Campo de texto que acepta entrada manual o escaneo con pistola de código de barras
  - Validación de unicidad a nivel de base de datos
  - Validación en backend para prevenir duplicados
  - Soporte automático para pistolas de código de barras (funcionan como teclado)
  - Placeholder informativo: "Escanear o ingresar manualmente"
  - AutoFocus en modo creación para facilitar escaneo rápido

### 2. Color del Equipo
- **Propósito**: Identificar la variante de color del dispositivo
- **Características**:
  - Campo de texto libre
  - Placeholder: "Ej: Negro, Blanco, Azul"
  - Visible solo para productos tipo Equipo
  - Mostrado en tabla de productos

### 3. Precio PayJoy
- **Propósito**: Precio especial para planes de financiamiento PayJoy
- **Características**:
  - Campo numérico con decimales (paso 0.01)
  - Placeholder: "Precio para plan PayJoy"
  - Visible solo para productos tipo Equipo
  - Mostrado en tabla de productos (columna adicional)

### 4. Porcentaje de Comisión al Vendedor
- **Propósito**: Definir comisión específica por producto
- **Características**:
  - Campo numérico con rango 0-100
  - Paso de 0.01 para decimales
  - Placeholder: "Ej: 5.5"
  - Nota informativa: "Porcentaje específico para este producto (opcional)"
  - Integrado con sistema de comisiones existente
  - Visible para todos los tipos de productos
  - Mostrado en tabla de productos (columna % Com.)

## Jerarquía de Comisiones

El sistema calcula comisiones con la siguiente prioridad:

1. **Comisión del Producto** (`products.commission_rate`) - Mayor prioridad
2. **Comisión de la Categoría** (`category_commission_rates.commission_rate`)
3. **Comisión del Vendedor** (`profiles.commission_rate`) - Fallback por defecto

## Estructura de Base de Datos

### Tabla `products` - Nuevas Columnas

```sql
ALTER TABLE products
ADD COLUMN imei TEXT UNIQUE,
ADD COLUMN color TEXT,
ADD COLUMN precio_payjoy DECIMAL(10, 2),
ADD COLUMN commission_rate DECIMAL(5, 2) CHECK (commission_rate >= 0 AND commission_rate <= 100);

CREATE INDEX idx_products_imei ON products(imei) WHERE imei IS NOT NULL;
```

### Validaciones

- **IMEI**: Unicidad garantizada por constraint UNIQUE
- **commission_rate**: Rango 0-100 validado por CHECK constraint
- **precio_payjoy**: Formato decimal con 2 decimales

## Interfaz de Usuario

### Formulario de Creación/Edición

El formulario ahora muestra campos condicionales según el tipo de producto:

**Para Equipos (HANDSET)**:
- Marca
- Modelo
- **IMEI del Equipo** (con soporte para escaneo)
- **Color**
- Categoría
- Nombre *
- Descripción
- Precio Lista
- Precio Mínimo
- **Precio PayJoy**
- Costo
- **% Comisión al Vendedor**

**Para SIM y Accesorios**:
- Marca
- Modelo
- **SKU** (mantiene campo original)
- Categoría
- Nombre *
- Descripción
- Precio Lista
- Precio Mínimo
- Costo
- **% Comisión al Vendedor**

### Tabla de Productos

La tabla ahora muestra columnas dinámicas según el tipo activo:

**Vista de Equipos**:
- Nombre
- Marca
- Modelo
- **IMEI**
- **Color**
- Costo
- Precio Lista
- **Precio PayJoy**
- **% Com.**
- Acciones

**Vista de SIM/Accesorios**:
- Nombre
- Marca
- Modelo
- **SKU**
- Costo
- Precio Lista
- **% Com.**
- Acciones

### Búsqueda Mejorada

El buscador ahora incluye IMEI en los criterios de búsqueda:
- Nombre
- Marca
- Modelo
- SKU
- **IMEI**

## Soporte para Pistola de Código de Barras

### Funcionamiento

Las pistolas de código de barras funcionan como teclados USB/Bluetooth que:
1. Enfocan automáticamente el campo activo
2. Ingresan el código escaneado como texto
3. Presionan Enter automáticamente (opcional según configuración)

### Implementación

No se requiere configuración especial en el frontend. El campo IMEI:
- Es un `<input type="text">` estándar
- Tiene `autoFocus` en modo creación
- Acepta cualquier entrada de teclado (incluyendo pistola)

### Recomendaciones de Uso

1. **Configurar pistola** para agregar Enter al final del escaneo
2. **Abrir formulario** de nuevo producto
3. **Escanear código** directamente (el campo IMEI tiene autofocus)
4. **Completar** otros campos manualmente
5. **Guardar** producto

## Backend - Validaciones

### Procedimiento `products.create`

```typescript
// Validar IMEI único
if (input.imei) {
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('imei', input.imei)
    .single();
  
  if (existing) {
    throw new Error('Ya existe un producto con este IMEI');
  }
}
```

### Procedimiento `products.update`

```typescript
// Validar IMEI único (excluyendo el producto actual)
if (input.imei) {
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('imei', input.imei)
    .neq('id', input.id)
    .single();
  
  if (existing) {
    throw new Error('Ya existe un producto con este IMEI');
  }
}
```

## Integración con Sistema de Comisiones

### Cálculo Automático en Ventas

Cuando se crea una venta, el sistema:

1. Obtiene el producto vendido
2. Verifica `product.commission_rate`
3. Si no existe, busca `category_commission_rates` para el vendedor y categoría
4. Si no existe, usa `profile.commission_rate` del vendedor
5. Calcula comisión: `(sale_amount * commission_rate) / 100`
6. Crea registro en tabla `commissions`

### Ejemplo de Uso

```typescript
// Producto con comisión específica
const product = {
  name: "iPhone 15 Pro",
  commission_rate: 8.5, // 8.5% de comisión
  precio_lista: 25999
};

// Venta de $25,999
// Comisión calculada: $25,999 * 8.5% = $2,209.92
```

## Tests Implementados

### `server/products.equipment.test.ts`

1. ✅ Verificar columna `imei` en tabla products
2. ✅ Verificar columna `color` en tabla products
3. ✅ Verificar columna `precio_payjoy` en tabla products
4. ✅ Verificar columna `commission_rate` en tabla products
5. ✅ Crear producto con campos específicos de equipos
6. ✅ Validar constraint de IMEI único
7. ✅ Verificar integración con sistema de comisiones
8. ✅ Verificar compatibilidad con pistola de código de barras

## Casos de Uso

### Caso 1: Registro Rápido con Pistola

1. Vendedor abre "Nuevo Producto"
2. Selecciona tipo "Equipo"
3. Escanea código de barras del IMEI
4. Completa marca, modelo, color
5. Ingresa precios
6. Define comisión específica (opcional)
7. Guarda producto

### Caso 2: Producto con Comisión Especial

1. Crear producto con `commission_rate: 10`
2. Al vender este producto, la comisión será 10%
3. Ignora comisión de categoría y vendedor
4. Útil para promociones o productos premium

### Caso 3: Gestión de Inventario por IMEI

1. Buscar producto por IMEI escaneado
2. Ver historial de ventas del equipo específico
3. Rastrear garantías y devoluciones
4. Control de stock por dispositivo individual

## Beneficios

### Operacionales
- ✅ Registro más rápido con pistola de código de barras
- ✅ Identificación única de cada dispositivo
- ✅ Mejor control de inventario
- ✅ Trazabilidad completa de equipos

### Comerciales
- ✅ Precios diferenciados para PayJoy
- ✅ Comisiones personalizadas por producto
- ✅ Incentivos específicos para ciertos modelos
- ✅ Mayor flexibilidad en estrategia de ventas

### Técnicos
- ✅ Validación de unicidad en base de datos
- ✅ Integración con sistema de comisiones
- ✅ Tests automatizados
- ✅ Código limpio y mantenible

## Próximos Pasos Sugeridos

1. **Importación masiva**: Agregar soporte para importar productos con IMEI desde CSV
2. **Historial de IMEI**: Rastrear cambios de propietario y ventas por IMEI
3. **Alertas de duplicados**: Notificar al intentar registrar IMEI existente
4. **Reportes por IMEI**: Generar reportes de garantías y devoluciones
5. **Integración con proveedores**: Sincronizar IMEI con sistemas de distribuidores

## Archivos Modificados

### Backend
- `server/routers.ts` - Procedimientos create/update de productos
- `migrations/add-equipment-fields.sql` - Migración de base de datos
- `server/products.equipment.test.ts` - Tests de nuevos campos

### Frontend
- `client/src/pages/Products.tsx` - Formulario y tabla de productos

### Documentación
- `todo.md` - Seguimiento de tareas completadas
- `docs/PRODUCTOS_EQUIPOS_MEJORADOS.md` - Este documento

## Soporte

Para dudas o problemas con la funcionalidad de productos:
1. Revisar tests en `server/products.equipment.test.ts`
2. Verificar migraciones aplicadas en Supabase
3. Consultar documentación de sistema de comisiones
4. Revisar logs del servidor para errores de validación
