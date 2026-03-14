-- ============================================
-- MIGRACIÓN COMPLETA: TODOS LOS CAMPOS DE PRODUCTOS
-- Sistema M4 POS/ERP
-- ============================================

-- Agregar TODOS los campos que faltan en la tabla products

-- Campos básicos de equipos
ALTER TABLE products ADD COLUMN IF NOT EXISTS imei TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS payjoy_price DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0;

-- Campos de comisiones
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_base TEXT CHECK (commission_base IN ('list_price', 'min_price', 'payjoy_price', 'cost'));

-- Campos de stock
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_actual INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 0;

-- Campos de categoría
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_products_imei ON products(imei);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_payjoy_price ON products(payjoy_price);
CREATE INDEX IF NOT EXISTS idx_products_cost ON products(cost);
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_products_stock_actual ON products(stock_actual);
CREATE INDEX IF NOT EXISTS idx_products_stock_minimo ON products(stock_minimo);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Verificar que los campos se crearon
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('imei', 'color', 'payjoy_price', 'cost', 'commission_rate', 'commission_base', 'stock_actual', 'stock_minimo', 'category_id')
ORDER BY column_name;
