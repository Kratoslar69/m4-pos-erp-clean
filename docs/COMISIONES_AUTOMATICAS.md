# Funcionalidad de Comisiones Automáticas

## Descripción General

El sistema M4 POS/ERP ahora calcula automáticamente las comisiones de los vendedores al registrar cada venta. Esta funcionalidad permite un seguimiento preciso y en tiempo real de las comisiones generadas por cada vendedor.

## Características Implementadas

### 1. Cálculo Automático de Comisiones

Cuando se registra una venta en el sistema, automáticamente:
- Se obtiene el porcentaje de comisión configurado para el vendedor (`commission_rate` en la tabla `profiles`)
- Se calcula el monto de la comisión: `venta_total × (commission_rate / 100)`
- Se crea un registro en la tabla `commissions` con todos los detalles

### 2. Estructura de Datos

#### Tabla `profiles`
- **Nueva columna**: `commission_rate` (DECIMAL 5,2)
  - Almacena el porcentaje de comisión del vendedor
  - Ejemplo: 5.00 = 5%
  - Valor por defecto: 0

#### Tabla `commissions`
Campos principales:
- `id`: Identificador único (UUID)
- `user_id`: Referencia al vendedor
- `sale_id`: Referencia a la venta
- `sale_amount`: Monto total de la venta
- `commission_rate`: Porcentaje aplicado
- `commission_amount`: Monto calculado de la comisión
- `is_paid`: Estado de pago (false por defecto)
- `paid_at`: Fecha de pago (null hasta que se pague)
- `period`: Período en formato YYYY-MM
- `created_at`: Fecha de creación del registro

#### Tabla `customers`
Nueva tabla para gestión de clientes:
- `id`: Identificador único (UUID)
- `name`: Nombre del cliente
- `phone`: Teléfono
- `email`: Correo electrónico
- `address`: Dirección
- `notes`: Notas adicionales
- `loyalty_points`: Puntos de fidelidad
- `created_at`: Fecha de creación

### 3. Procedimiento de Ventas Actualizado

El procedimiento `sales.create` en `server/routers.ts` ahora:

1. Crea el registro de venta
2. Obtiene el perfil del vendedor para consultar su `commission_rate`
3. Si el vendedor tiene un `commission_rate` > 0:
   - Calcula el monto de la comisión
   - Crea el registro en la tabla `commissions`
   - Asocia la comisión con la venta y el período actual

### 4. Módulo de Consulta de Comisiones

Nueva página en `/commissions` que permite:
- **Filtrar por período**: Últimos 12 meses disponibles
- **Filtrar por vendedor**: Ver comisiones de un vendedor específico o todos
- **Resumen visual**: Tarjetas con totales
  - Total de comisiones generadas
  - Comisiones pagadas
  - Comisiones pendientes de pago
- **Detalle de comisiones**: Tabla con todas las comisiones del período seleccionado

## Flujo de Trabajo

### Configuración Inicial

1. **Asignar porcentaje de comisión a vendedores**:
   ```sql
   UPDATE profiles 
   SET commission_rate = 5.00 
   WHERE username = 'vendedor1';
   ```

### Registro de Ventas

1. El vendedor registra una venta en el sistema
2. El sistema automáticamente:
   - Guarda la venta
   - Consulta el `commission_rate` del vendedor
   - Calcula y registra la comisión

### Consulta de Comisiones

1. Acceder al módulo "Comisiones" desde el menú lateral
2. Seleccionar el período deseado
3. Opcionalmente filtrar por vendedor
4. Ver el resumen y detalle de comisiones

### Pago de Comisiones

Para marcar una comisión como pagada:
```sql
UPDATE commissions 
SET is_paid = true, 
    paid_at = NOW() 
WHERE id = 'commission_id';
```

## Migraciones Aplicadas

### 1. `add_commissions_and_customers.sql`
- Agrega columna `commission_rate` a `profiles`
- Crea tabla `customers`
- Crea tabla `commissions`
- Actualiza `commission_rate` del usuario admin a 5%

### 2. `add_rls_policies.sql`
- Deshabilita RLS para `commissions` y `customers`
- Otorga permisos necesarios a los roles de Supabase

## Tests Implementados

Archivo: `server/sales.commission.test.ts`

Tests incluidos:
1. ✅ Verificación de lógica de cálculo de comisiones
2. ✅ Verificación de creación de registros de comisiones
3. ✅ Verificación de estructura de datos
4. ✅ Verificación de permisos de acceso

## Ejemplo de Uso

### Escenario: Venta de $1,000 con comisión del 5%

1. **Vendedor**: Juan Pérez (`commission_rate = 5.00`)
2. **Venta**: $1,000.00
3. **Comisión calculada**: $1,000.00 × 5% = $50.00

**Registro creado en `commissions`**:
```json
{
  "user_id": "juan_perez_id",
  "sale_id": "venta_id",
  "sale_amount": 1000.00,
  "commission_rate": 5.00,
  "commission_amount": 50.00,
  "is_paid": false,
  "period": "2026-02",
  "created_at": "2026-02-01T20:30:00Z"
}
```

## Próximas Mejoras Sugeridas

1. **Interfaz de gestión de comisiones**:
   - Botón para marcar comisiones como pagadas
   - Exportar reportes de comisiones a PDF/Excel
   
2. **Configuración avanzada**:
   - Diferentes porcentajes por categoría de producto
   - Comisiones escalonadas por metas de ventas
   
3. **Notificaciones**:
   - Alertas cuando se acumulan comisiones pendientes
   - Resumen mensual automático por email

4. **Reportes**:
   - Gráficas de evolución de comisiones
   - Comparativa entre vendedores
   - Proyecciones de comisiones

## Notas Técnicas

- Las comisiones se calculan sobre el monto total de la venta
- El período se determina automáticamente en formato YYYY-MM
- Las comisiones se crean en estado "no pagado" por defecto
- Los permisos RLS están deshabilitados para permitir acceso completo desde el backend
- Se utilizan índices en las columnas más consultadas para optimizar el rendimiento

## Soporte

Para preguntas o problemas relacionados con esta funcionalidad, contactar al equipo de desarrollo.
