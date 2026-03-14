# Exportación de Reportes y Comisiones por Categoría

## Resumen

Este documento describe las nuevas funcionalidades implementadas en el sistema M4 POS/ERP para mejorar la gestión de comisiones:

1. **Exportación de Reportes**: Permite exportar reportes de comisiones en formato PDF y Excel
2. **Comisiones por Categoría**: Sistema jerárquico de comisiones basado en producto > categoría > vendedor

---

## 1. Exportación de Reportes de Comisiones

### Funcionalidad

Los usuarios pueden exportar reportes de comisiones con los filtros aplicados (período y vendedor) en dos formatos:

- **PDF**: Reporte profesional con logo M4, tablas formateadas y resumen visual
- **Excel**: Archivo `.xlsx` con datos estructurados para análisis adicional

### Interfaz de Usuario

En la página de **Comisiones** (`/commissions`), se agregaron dos botones en la barra superior:

- **Exportar PDF**: Genera un archivo PDF con el reporte
- **Exportar Excel**: Genera un archivo Excel con los datos

Los botones se deshabilitan automáticamente cuando:
- No hay comisiones registradas para el período seleccionado
- La exportación está en progreso

### Estructura del Reporte

Ambos formatos incluyen:

1. **Encabezado**:
   - Logo y nombre del sistema (M4 POS/ERP)
   - Título: "Reporte de Comisiones"
   - Período seleccionado (formato: "Enero 2026")
   - Vendedor (si se filtró por vendedor específico)

2. **Resumen**:
   - Total de comisiones generadas
   - Comisiones pagadas
   - Comisiones pendientes

3. **Detalle**:
   - Tabla con todas las comisiones del período
   - Columnas: Fecha, Vendedor, ID Venta, Monto Venta, Tasa (%), Comisión, Estado

4. **Pie de página**:
   - Fecha y hora de generación del reporte
   - Número de página (solo PDF)

### Implementación Técnica

#### Backend (tRPC Procedures)

**Archivo**: `server/routers.ts`

```typescript
// Procedimiento para exportar PDF
commissions.exportPDF: protectedProcedure
  .input(z.object({
    userId: z.string().optional(),
    period: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Obtener comisiones filtradas
    // 2. Calcular resumen (total, pagadas, pendientes)
    // 3. Generar PDF usando pdfkit
    // 4. Retornar archivo como base64
  })

// Procedimiento para exportar Excel
commissions.exportExcel: protectedProcedure
  .input(z.object({
    userId: z.string().optional(),
    period: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Obtener comisiones filtradas
    // 2. Calcular resumen
    // 3. Generar Excel usando xlsx
    // 4. Retornar archivo como base64
  })
```

#### Helpers de Exportación

**Archivo**: `server/_core/pdfExport.ts`
- Función: `generateCommissionPDF(data: CommissionReportData): Promise<Buffer>`
- Librería: `pdfkit`
- Genera PDF con formato profesional, tablas y paginación automática

**Archivo**: `server/_core/excelExport.ts`
- Función: `generateCommissionExcel(data: CommissionReportData): Buffer`
- Librería: `xlsx`
- Genera archivo Excel con hojas de cálculo estructuradas

#### Frontend

**Archivo**: `client/src/pages/Commissions.tsx`

```typescript
const exportPDFMutation = trpc.commissions.exportPDF.useMutation();
const exportExcelMutation = trpc.commissions.exportExcel.useMutation();

const handleExportPDF = async () => {
  const result = await exportPDFMutation.mutateAsync({
    period: selectedPeriod,
    userId: selectedUser === "all" ? undefined : selectedUser,
  });
  
  // Descargar archivo
  const link = document.createElement('a');
  link.href = `data:application/pdf;base64,${result.data}`;
  link.download = result.filename;
  link.click();
};
```

### Dependencias Instaladas

```json
{
  "pdfkit": "^0.17.2",
  "@types/pdfkit": "^0.17.4",
  "xlsx": "^0.18.5"
}
```

---

## 2. Sistema de Comisiones por Categoría

### Concepto

El sistema implementa una **jerarquía de tres niveles** para determinar la tasa de comisión aplicable a cada venta:

1. **Producto** (prioridad más alta): Comisión específica del producto
2. **Categoría**: Comisión por categoría de producto para un vendedor
3. **Vendedor** (prioridad más baja): Comisión base del vendedor

### Jerarquía de Cálculo

Cuando se registra una venta, el sistema busca la comisión en este orden:

```
1. ¿El producto tiene commission_rate?
   → SÍ: Usar comisión del producto
   → NO: Continuar al paso 2

2. ¿El producto tiene categoría Y existe comisión de categoría para este vendedor?
   → SÍ: Usar comisión de la categoría
   → NO: Continuar al paso 3

3. ¿El vendedor tiene commission_rate?
   → SÍ: Usar comisión del vendedor
   → NO: No se genera comisión
```

### Estructura de Base de Datos

#### Tabla: `product_categories`

Categorías de productos para clasificación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | VARCHAR(100) | Nombre de la categoría (único) |
| `description` | TEXT | Descripción opcional |
| `created_at` | TIMESTAMP | Fecha de creación |

**Categorías por defecto**:
- Equipos
- SIM Cards
- Accesorios
- Servicios

#### Tabla: `category_commission_rates`

Tasas de comisión específicas por categoría y vendedor.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `category_id` | UUID | Referencia a `product_categories` |
| `user_id` | VARCHAR(64) | Referencia a `profiles` (vendedor) |
| `commission_rate` | DECIMAL(5,2) | Porcentaje de comisión |
| `created_at` | TIMESTAMP | Fecha de creación |

**Restricción**: Única combinación de `category_id` y `user_id`

#### Modificaciones en `products`

Se agregaron dos campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `category_id` | UUID | Referencia a `product_categories` |
| `commission_rate` | DECIMAL(5,2) | Comisión específica del producto |

### Implementación del Cálculo

**Archivo**: `server/routers.ts` (procedimiento `sales.create`)

```typescript
// Calcular comisión con jerarquía
let commissionRate: number | null = null;

// 1. Buscar comisión de producto
for (const item of input.items) {
  const { data: product } = await supabase
    .from('products')
    .select('commission_rate, category_id')
    .eq('id', item.productId)
    .single();
  
  if (product?.commission_rate) {
    commissionRate = parseFloat(product.commission_rate);
    break;
  } else if (product?.category_id && !commissionRate) {
    // 2. Buscar comisión de categoría
    const { data: categoryRate } = await supabase
      .from('category_commission_rates')
      .select('commission_rate')
      .eq('category_id', product.category_id)
      .eq('user_id', ctx.user!.id)
      .single();
    
    if (categoryRate) {
      commissionRate = parseFloat(categoryRate.commission_rate);
    }
  }
}

// 3. Si no se encontró, usar comisión del vendedor
if (!commissionRate) {
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('commission_rate')
    .eq('id', ctx.user!.id)
    .single();
  
  if (userProfile?.commission_rate) {
    commissionRate = parseFloat(userProfile.commission_rate);
  }
}

// Registrar comisión si se encontró una tasa
if (commissionRate) {
  const commissionAmount = (total * commissionRate) / 100;
  // ... insertar en tabla commissions
}
```

### Ejemplo de Uso

**Escenario 1: Solo comisión de vendedor**
- Vendedor: Juan (5% de comisión base)
- Producto: Accesorio genérico (sin categoría ni comisión específica)
- Venta: $1,000
- **Comisión**: $50 (5% de $1,000)

**Escenario 2: Comisión de categoría**
- Vendedor: Juan (5% base)
- Producto: iPhone 15 (categoría: Equipos, comisión de categoría: 7%)
- Venta: $1,000
- **Comisión**: $70 (7% de $1,000)

**Escenario 3: Comisión de producto**
- Vendedor: Juan (5% base)
- Producto: iPhone 15 Pro Max (categoría: Equipos, comisión específica: 10%)
- Venta: $1,000
- **Comisión**: $100 (10% de $1,000)

### Configuración

Para configurar comisiones por categoría:

1. **Crear categorías** (si no existen):
   ```sql
   INSERT INTO product_categories (name, description)
   VALUES ('Equipos Premium', 'Smartphones de alta gama');
   ```

2. **Asignar categoría a productos**:
   ```sql
   UPDATE products
   SET category_id = '<uuid-de-categoria>'
   WHERE sku = 'IPHONE-15-PRO';
   ```

3. **Configurar comisión de categoría para vendedor**:
   ```sql
   INSERT INTO category_commission_rates (category_id, user_id, commission_rate)
   VALUES ('<uuid-categoria>', '<uuid-vendedor>', 8.5);
   ```

4. **Configurar comisión específica de producto** (opcional):
   ```sql
   UPDATE products
   SET commission_rate = 12.0
   WHERE sku = 'IPHONE-15-PRO-MAX';
   ```

---

## Tests

### Test de Jerarquía de Comisiones

**Archivo**: `server/commission.hierarchy.test.ts`

El test verifica:
1. Existencia de tablas `product_categories` y `category_commission_rates`
2. Categorías por defecto creadas
3. Capacidad de crear tasas de comisión por categoría
4. Lógica de jerarquía con datos de prueba
5. Columna `commission_rate` en tabla `profiles`

**Ejecutar tests**:
```bash
pnpm test commission.hierarchy
```

**Resultado esperado**: ✓ 6 tests pasados

---

## Migraciones Aplicadas

### 1. `add-category-commissions.sql`

Crea la estructura de categorías y comisiones:
- Tabla `product_categories`
- Tabla `category_commission_rates`
- Campos `category_id` y `commission_rate` en `products`
- Categorías por defecto

### 2. `add-category-rls-policies.sql`

Configura permisos de acceso:
- Deshabilita RLS para permitir acceso con service_role
- Otorga permisos a roles `authenticated`, `anon` y `service_role`

---

## Archivos Modificados

### Backend
- `server/routers.ts`: Procedimientos de exportación y cálculo de comisiones
- `server/_core/pdfExport.ts`: Helper para generar PDFs (nuevo)
- `server/_core/excelExport.ts`: Helper para generar Excel (nuevo)
- `server/commission.hierarchy.test.ts`: Tests de jerarquía (nuevo)

### Frontend
- `client/src/pages/Commissions.tsx`: Botones de exportación
- `client/src/hooks/use-toast.ts`: Hook para notificaciones (nuevo)

### Base de Datos
- `migrations/add-category-commissions.sql`: Estructura de categorías (nuevo)
- `migrations/add-category-rls-policies.sql`: Permisos RLS (nuevo)

### Documentación
- `todo.md`: Actualizado con funcionalidades completadas
- `docs/COMISIONES_AUTOMATICAS.md`: Documentación de comisiones automáticas
- `docs/EXPORTACION_Y_CATEGORIAS.md`: Este documento (nuevo)

---

## Próximos Pasos Sugeridos

1. **Interfaz de Administración de Categorías**:
   - Página para crear/editar/eliminar categorías
   - Asignar categorías a productos desde la UI
   - Configurar comisiones por categoría para cada vendedor

2. **Dashboard de Comisiones**:
   - Gráficas de comisiones por categoría
   - Comparativa de rendimiento por vendedor
   - Proyecciones de comisiones

3. **Notificaciones**:
   - Alertar a vendedores cuando se genera una comisión
   - Notificar al administrador cuando hay comisiones pendientes de pago

4. **Reportes Avanzados**:
   - Reporte de comisiones por categoría
   - Análisis de rentabilidad por producto/categoría
   - Exportación masiva de múltiples períodos

---

## Soporte

Para preguntas o problemas relacionados con estas funcionalidades, consultar:
- Documentación técnica en `/docs`
- Tests en `/server/*.test.ts`
- Código fuente en `/server/routers.ts`
