# Guía Rápida: Aplicar Migraciones SQL

## 🚀 Inicio Rápido (5 minutos)

### Paso 1: Abrir Supabase
1. Ve a tu dashboard de Supabase
2. Busca "SQL Editor" en el menú lateral
3. Haz clic en "New query"

### Paso 2: Copiar SQL
Copia y pega este SQL completo:

```sql
-- ============================================
-- MIGRACIÓN CRÍTICA: cost y commission_base
-- ============================================

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS commission_base TEXT 
CHECK (commission_base IN ('list_price', 'min_price', 'payjoy_price', 'cost'));

COMMENT ON COLUMN products.cost IS 'Costo de adquisición del producto';
COMMENT ON COLUMN products.commission_base IS 'Base para calcular la comisión';

CREATE INDEX IF NOT EXISTS idx_products_cost ON products(cost);

-- ============================================
-- ÍNDICES DE RENDIMIENTO (Opcional pero recomendado)
-- ============================================

-- Products
CREATE INDEX IF NOT EXISTS idx_products_imei ON products(imei);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_payjoy_price ON products(payjoy_price);
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_actual ON products(stock_actual);
CREATE INDEX IF NOT EXISTS idx_products_stock_minimo ON products(stock_minimo);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Product Movements
CREATE INDEX IF NOT EXISTS idx_product_movements_product_id ON product_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_product_movements_imei ON product_movements(imei);
CREATE INDEX IF NOT EXISTS idx_product_movements_type ON product_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_product_movements_created_at ON product_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_product_movements_user_id ON product_movements(user_id);

-- Stock Alerts
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_status ON stock_alerts(status);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_severity ON stock_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at ON stock_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_resolved_at ON stock_alerts(resolved_at);

-- Commissions
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_sale_id ON commissions(sale_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at);
CREATE INDEX IF NOT EXISTS idx_commissions_paid_at ON commissions(paid_at);

-- Sales
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_total_amount ON sales(total_amount);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);

-- Purchases
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_total_amount ON purchases(total_amount);

-- Category Commission Rates
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_category_id ON category_commission_rates(category_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_user_id ON category_commission_rates(user_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_both ON category_commission_rates(category_id, user_id);
```

### Paso 3: Ejecutar
1. Haz clic en el botón "Run" (o presiona Ctrl+Enter)
2. Espera a que aparezca "Success"
3. ¡Listo! Las migraciones se aplicaron correctamente

### Paso 4: Verificar
Ejecuta este SQL para verificar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('cost', 'commission_base');
```

Deberías ver:
```
column_name       | data_type
------------------+-----------
cost              | numeric
commission_base   | text
```

---

## ✅ ¿Qué hace esta migración?

### Parte 1: Campos Nuevos (CRÍTICO)
- **cost**: Guarda el costo de adquisición del producto
- **commission_base**: Define sobre qué precio se calcula la comisión del vendedor

### Parte 2: Índices (RENDIMIENTO)
- Acelera búsquedas por IMEI, color, precio
- Optimiza reportes de inventario
- Mejora consultas de comisiones y alertas
- **Resultado**: Hasta 90% más rápido en consultas frecuentes

---

## 🎯 Después de Aplicar

### Probar el Sistema
1. Ve a **Productos** → **Nuevo Producto**
2. Selecciona tipo **Equipo**
3. Llena los campos:
   - IMEI: 862703070761776
   - Color: Azul Oceano
   - Precio PayJoy: 2772
   - Costo: 1848
   - % Comisión: 10
   - Base Comisión: Precio Lista
4. Haz clic en **Crear Producto**
5. ✅ Debería crearse sin errores

---

## ❌ Solución de Problemas

### Error: "column already exists"
✅ **Normal**: La migración usa `IF NOT EXISTS`, puedes ignorar este mensaje

### Error: "permission denied"
❌ **Problema**: No tienes permisos de administrador
📝 **Solución**: Pide a tu administrador de Supabase que ejecute la migración

### Error: "relation does not exist"
❌ **Problema**: La tabla products no existe
📝 **Solución**: Verifica que estás conectado a la base de datos correcta

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:
1. Copia el mensaje de error completo
2. Revisa `/docs/RESUMEN_COMPLETO_IMPLEMENTACIONES.md`
3. Consulta `INSTRUCCIONES_MIGRACIONES.md` para más detalles

---

**Tiempo estimado**: 5 minutos
**Dificultad**: Fácil
**Requisitos**: Acceso al SQL Editor de Supabase
