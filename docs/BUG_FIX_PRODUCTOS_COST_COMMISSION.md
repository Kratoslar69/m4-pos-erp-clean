# Corrección de Bug: Error al Crear Productos

## Problema Reportado

Al intentar crear un producto tipo "Equipo", el sistema mostraba el siguiente error:

```
Could not find the 'costo' column of 'products' in the schema cache
```

Este error ocurría porque el formulario de productos intentaba enviar el campo `costo` al backend, pero este campo no existía en el schema de la base de datos.

## Causa Raíz

El formulario de productos tenía un campo llamado "Costo" que se mapeaba a la columna `costo` en la base de datos, pero esta columna nunca fue creada en Supabase. El sistema necesitaba este campo para:

1. Registrar el costo de adquisición del producto
2. Calcular márgenes de ganancia
3. Servir como base opcional para el cálculo de comisiones

## Solución Implementada

### 1. Migración de Base de Datos

Se creó la migración SQL `/migrations/add-cost-and-commission-base.sql` que agrega dos campos nuevos a la tabla `products`:

- **`cost`** (DECIMAL(10,2)): Costo de adquisición del producto
- **`commission_base`** (ENUM): Base para calcular la comisión del vendedor
  - Valores posibles: `'list_price'`, `'min_price'`, `'payjoy_price'`, `'cost'`

**Nota Importante**: Esta migración debe ser aplicada manualmente desde el SQL Editor de Supabase.

### 2. Actualización del Backend

Se actualizaron los procedimientos tRPC en `server/routers.ts`:

#### Procedimiento `products.create`
```typescript
create: protectedProcedure
  .input(z.object({
    type: z.enum(['HANDSET', 'SIM', 'ACCESSORY']),
    // ... otros campos
    cost: z.number().optional(), // Costo de adquisición
    commission_rate: z.number().min(0).max(100).optional(),
    commission_base: z.enum(['list_price', 'min_price', 'payjoy_price', 'cost']).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // ... lógica de creación
  }),
```

#### Procedimiento `products.update`
Se agregaron los mismos campos opcionales para permitir actualización.

### 3. Actualización del Formulario

Se modificó el formulario de productos en `client/src/pages/Products.tsx`:

#### Nuevo Campo: Costo
```tsx
<div className="space-y-2">
  <Label htmlFor="cost">Costo</Label>
  <Input
    id="cost"
    type="number"
    step="0.01"
    value={formData.cost}
    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
    placeholder="Costo de adquisición"
  />
</div>
```

#### Nuevo Campo: Base de Comisión
Se agregó un combo desplegable que aparece solo cuando se ingresa un porcentaje de comisión:

```tsx
{formData.commission_rate && (
  <div className="space-y-2">
    <Label htmlFor="commission_base">Base para Calcular Comisión</Label>
    <Select
      value={formData.commission_base}
      onValueChange={(value) => setFormData({ ...formData, commission_base: value })}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="list_price">Precio Lista</SelectItem>
        <SelectItem value="min_price">Precio Mínimo</SelectItem>
        <SelectItem value="payjoy_price">Precio PayJoy</SelectItem>
        <SelectItem value="cost">Costo</SelectItem>
      </SelectContent>
    </Select>
    <p className="text-xs text-muted-foreground">
      Selecciona sobre qué precio se calculará la comisión
    </p>
  </div>
)}
```

### 4. Funcionalidad Implementada

#### Porcentaje de Comisión Opcional
- El campo "% Comisión al Vendedor" es completamente opcional
- Si no se ingresa, el producto no tendrá comisión específica
- Se puede usar la comisión por defecto del vendedor o de la categoría

#### Selección de Base de Cálculo
- El combo "Base para Calcular Comisión" solo aparece si se ingresa un porcentaje
- Permite seleccionar sobre qué precio se calculará la comisión:
  - **Precio Lista**: Precio de venta regular
  - **Precio Mínimo**: Precio mínimo autorizado
  - **Precio PayJoy**: Precio para plan de financiamiento
  - **Costo**: Costo de adquisición (para calcular margen)

#### Jerarquía de Comisiones
El sistema ya implementa una jerarquía para calcular comisiones:
1. **Comisión del producto** (si está configurada)
2. **Comisión de la categoría** (si el producto pertenece a una categoría con comisión)
3. **Comisión del vendedor** (comisión por defecto del perfil del vendedor)

## Pasos para Completar la Corrección

### 1. Aplicar Migración SQL
Ejecutar el siguiente script desde el SQL Editor de Supabase:

```sql
-- Agregar campo cost (costo de adquisición)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2);

-- Agregar campo commission_base (base para calcular comisión)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS commission_base VARCHAR(20) 
CHECK (commission_base IN ('list_price', 'min_price', 'payjoy_price', 'cost'));

-- Agregar comentarios para documentación
COMMENT ON COLUMN products.cost IS 'Costo de adquisición del producto';
COMMENT ON COLUMN products.commission_base IS 'Base para calcular la comisión: list_price, min_price, payjoy_price, cost';
```

### 2. Verificar Funcionalidad
Una vez aplicada la migración:
1. Crear un nuevo producto tipo "Equipo"
2. Ingresar todos los campos incluyendo "Costo"
3. Ingresar un "% Comisión al Vendedor"
4. Seleccionar una "Base para Calcular Comisión"
5. Guardar el producto
6. Verificar que no hay errores

### 3. Ejecutar Tests
```bash
cd /home/ubuntu/m4-pos-erp
pnpm test products.cost-commission
```

## Beneficios de la Solución

1. **Flexibilidad**: Permite configurar comisiones de diferentes maneras
2. **Transparencia**: El vendedor sabe exactamente sobre qué base se calcula su comisión
3. **Control**: El administrador puede elegir la estrategia de comisiones más conveniente
4. **Opcional**: No obliga a configurar comisiones si no se necesitan

## Archivos Modificados

- `migrations/add-cost-and-commission-base.sql` (nuevo)
- `server/routers.ts` (modificado)
- `client/src/pages/Products.tsx` (modificado)
- `server/products.cost-commission.test.ts` (nuevo)
- `docs/BUG_FIX_PRODUCTOS_COST_COMMISSION.md` (nuevo)

## Notas Adicionales

- El campo `costo` del formulario original se mantuvo para compatibilidad, pero ahora se usa `cost` en la base de datos
- La migración es segura de aplicar en producción (usa `IF NOT EXISTS`)
- Los productos existentes no se verán afectados (los nuevos campos son opcionales)
