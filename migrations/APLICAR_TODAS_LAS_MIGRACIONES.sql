-- ============================================
-- SCRIPT CONSOLIDADO DE MIGRACIONES
-- Sistema M4 POS/ERP
-- Fecha: 2026-02-03
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Abrir Supabase Dashboard → SQL Editor
-- 2. Copiar y pegar TODO este archivo
-- 3. Hacer clic en "Run" (Ctrl+Enter)
-- 4. Verificar que aparezca "Success"
--
-- ============================================

-- ============================================
-- PARTE 1: CAMPOS CRÍTICOS (OBLIGATORIO)
-- ============================================

-- Agregar campo cost (costo del producto)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0;

-- Agregar campo commission_base (base para calcular comisión)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS commission_base TEXT 
CHECK (commission_base IN ('list_price', 'min_price', 'payjoy_price', 'cost'));

-- Comentarios para documentación
COMMENT ON COLUMN products.cost IS 'Costo de adquisición del producto';
COMMENT ON COLUMN products.commission_base IS 'Base para calcular la comisión: list_price, min_price, payjoy_price o cost';

-- ============================================
-- PARTE 2: ÍNDICES DE RENDIMIENTO
-- ============================================

-- Índices para tabla products
CREATE INDEX IF NOT EXISTS idx_products_cost ON products(cost);
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

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Verificar que los campos se crearon correctamente
SELECT 
    'Verificación de campos' as tipo,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('cost', 'commission_base')
ORDER BY column_name;

-- Contar índices creados
SELECT 
    'Total de índices creados' as tipo,
    COUNT(*) as total
FROM pg_indexes 
WHERE tablename IN (
    'products', 
    'product_movements', 
    'stock_alerts', 
    'commissions', 
    'sales', 
    'purchases', 
    'category_commission_rates'
)
AND indexname LIKE 'idx_%';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- 
-- Si todo salió bien, deberías ver:
-- - 2 filas en "Verificación de campos" (cost y commission_base)
-- - Un número mayor a 30 en "Total de índices creados"
--
-- ¡Migraciones aplicadas exitosamente! 🎉
--
-- ============================================
