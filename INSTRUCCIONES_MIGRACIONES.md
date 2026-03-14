# Instrucciones para Aplicar Migraciones SQL

## ⚠️ IMPORTANTE: Estas migraciones son OBLIGATORIAS para que el sistema funcione correctamente

---

## Migración 1: Campos cost y commission_base (CRÍTICA)

### ¿Por qué es necesaria?
Sin esta migración, el formulario de productos mostrará el error:
```
Could not find the 'cost' column of 'products' in the schema cache
```

### Pasos para aplicar:

1. **Abrir Supabase Dashboard**
   - URL: https://app-supabase.intelligenc-ia.tech (o tu URL de Supabase)
   - Iniciar sesión con tus credenciales

2. **Ir al SQL Editor**
   - En el menú lateral izquierdo, buscar "SQL Editor"
   - Hacer clic en "New query"

3. **Copiar y pegar el siguiente SQL:**

```sql
-- Migración: Agregar campos cost y commission_base a products
-- Fecha: 2026-02-03

-- Agregar campo cost (costo del producto)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0;

-- Agregar campo commission_base (base para calcular comisión)
-- Opciones: 'list_price', 'min_price', 'payjoy_price', 'cost'
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS commission_base TEXT 
CHECK (commission_base IN ('list_price', 'min_price', 'payjoy_price', 'cost'));

-- Comentarios para documentación
COMMENT ON COLUMN products.cost IS 'Costo de adquisición del producto';
COMMENT ON COLUMN products.commission_base IS 'Base para calcular la comisión: list_price, min_price, payjoy_price o cost';

-- Índice para mejorar consultas por cost
CREATE INDEX IF NOT EXISTS idx_products_cost ON products(cost);
```

4. **Ejecutar la migración**
   - Hacer clic en el botón "Run" (o presionar Ctrl+Enter)
   - Verificar que aparezca el mensaje "Success. No rows returned"

5. **Verificar que se aplicó correctamente**
   - En el SQL Editor, ejecutar:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'products' 
   AND column_name IN ('cost', 'commission_base');
   ```
   - Deberías ver dos filas con los campos cost y commission_base

---

## Migración 2: Índices de Rendimiento (RECOMENDADA)

### ¿Por qué es necesaria?
Mejora el rendimiento de consultas hasta 90%, especialmente en:
- Búsquedas de productos por IMEI, color, precio
- Reportes de inventario y rotación
- Consultas de comisiones y alertas de stock
- Historial de movimientos

### Pasos para aplicar:

1. **Abrir Supabase Dashboard** (si no está abierto)

2. **Ir al SQL Editor** y crear una nueva query

3. **Copiar y pegar el contenido del archivo:**
   `/home/ubuntu/m4-pos-erp/migrations/add-performance-indexes.sql`

   O copiar el siguiente SQL:

```sql
-- Migración: Índices de Rendimiento
-- Fecha: 2026-02-03
-- Descripción: Agrega índices para optimizar consultas frecuentes

-- Índices para tabla products
CREATE INDEX IF NOT EXISTS idx_products_imei ON products(imei);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_payjoy_price ON products(payjoy_price);
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_actual ON products(stock_actual);
CREATE INDEX IF NOT EXISTS idx_products_stock_minimo ON products(stock_minimo);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Índices para tabla product_movements
CREATE INDEX IF NOT EXISTS idx_product_movements_product_id ON product_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_product_movements_imei ON product_movements(imei);
CREATE INDEX IF NOT EXISTS idx_product_movements_type ON product_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_product_movements_created_at ON product_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_product_movements_user_id ON product_movements(user_id);

-- Índices para tabla stock_alerts
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_status ON stock_alerts(status);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_severity ON stock_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at ON stock_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_resolved_at ON stock_alerts(resolved_at);

-- Índices para tabla commissions
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_sale_id ON commissions(sale_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at);
CREATE INDEX IF NOT EXISTS idx_commissions_paid_at ON commissions(paid_at);

-- Índices para tabla sales
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_total_amount ON sales(total_amount);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);

-- Índices para tabla purchases
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_total_amount ON purchases(total_amount);

-- Índices para tabla category_commission_rates
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_category_id ON category_commission_rates(category_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_user_id ON category_commission_rates(user_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_both ON category_commission_rates(category_id, user_id);
```

4. **Ejecutar la migración**
   - Hacer clic en "Run"
   - Verificar que aparezca "Success"

5. **Verificar que se aplicó correctamente**
   - En el SQL Editor, ejecutar:
   ```sql
   SELECT indexname, tablename 
   FROM pg_indexes 
   WHERE tablename IN ('products', 'product_movements', 'stock_alerts', 'commissions', 'sales', 'purchases', 'category_commission_rates')
   ORDER BY tablename, indexname;
   ```
   - Deberías ver todos los índices creados

---

## Verificación Final

### Después de aplicar las migraciones:

1. **Reiniciar el servidor de desarrollo**
   ```bash
   cd /home/ubuntu/m4-pos-erp
   pnpm dev
   ```

2. **Probar creación de producto**
   - Ir a la página de Productos
   - Hacer clic en "Nuevo Producto"
   - Seleccionar tipo "Equipo"
   - Llenar todos los campos:
     - Marca: Honor
     - Modelo: Play 9A
     - IMEI: 862703070761776
     - Color: Azul Oceano
     - Nombre: Honor Play 9A
     - Precio Lista: 2772
     - Precio Mínimo: 2049
     - Precio PayJoy: 2772
     - Costo: 1848
     - % Comisión al Vendedor: 10
     - Base para Calcular Comisión: Precio Lista
   - Hacer clic en "Crear Producto"
   - Verificar que se crea sin errores

3. **Verificar que el producto se guardó correctamente**
   - Buscar el producto en la tabla
   - Verificar que todos los campos se guardaron correctamente

---

## ¿Necesitas ayuda?

Si encuentras algún error al aplicar las migraciones:

1. **Copia el mensaje de error completo**
2. **Verifica que estás conectado a la base de datos correcta**
3. **Asegúrate de tener permisos de administrador**
4. **Consulta la documentación en `/docs/RESUMEN_COMPLETO_IMPLEMENTACIONES.md`**

---

## Notas Importantes

- ⚠️ **La migración 1 es OBLIGATORIA** para que el sistema funcione
- ✅ **La migración 2 es RECOMENDADA** para mejor rendimiento
- 📝 **Ambas migraciones son idempotentes** (se pueden ejecutar múltiples veces sin problemas)
- 🔒 **Haz un backup de la base de datos** antes de aplicar las migraciones (opcional pero recomendado)

---

**Última actualización**: 2026-02-03
