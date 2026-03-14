-- ============================================
-- SCRIPT SQL DEFINITIVO Y COMPLETO
-- Sistema M4 POS/ERP - Todas las tablas y campos
-- ============================================

-- ====================
-- TABLA: commissions
-- ====================
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'PAGADA'));
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- ====================
-- TABLA: products  
-- ====================
-- Campos de equipos
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

-- Campos de precios
ALTER TABLE products ADD COLUMN IF NOT EXISTS list_price DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_price DECIMAL(10, 2);

-- ====================
-- TABLA: profiles
-- ====================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- ====================
-- TABLA: sales
-- ====================
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id INTEGER;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS notes TEXT;

-- ====================
-- TABLA: purchases
-- ====================
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS supplier_id INTEGER;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS notes TEXT;

-- ====================
-- CREAR TABLAS FALTANTES
-- ====================

-- Tabla: product_movements
CREATE TABLE IF NOT EXISTS product_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    imei TEXT,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('ENTRADA', 'VENTA', 'DEVOLUCION', 'AJUSTE')),
    quantity INTEGER NOT NULL,
    notes TEXT,
    user_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: stock_alerts
CREATE TABLE IF NOT EXISTS stock_alerts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('CRITICA', 'URGENTE', 'NORMAL')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVA' CHECK (status IN ('ACTIVA', 'RESUELTA')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Tabla: product_categories
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: category_commission_rates
CREATE TABLE IF NOT EXISTS category_commission_rates (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, user_id)
);

-- Tabla: customers
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO' CHECK (type IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- ÍNDICES DE RENDIMIENTO
-- ====================

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_imei ON products(imei);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);
CREATE INDEX IF NOT EXISTS idx_products_payjoy_price ON products(payjoy_price);
CREATE INDEX IF NOT EXISTS idx_products_cost ON products(cost);
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_products_stock_actual ON products(stock_actual);
CREATE INDEX IF NOT EXISTS idx_products_stock_minimo ON products(stock_minimo);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Índices para product_movements
CREATE INDEX IF NOT EXISTS idx_product_movements_product_id ON product_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_product_movements_imei ON product_movements(imei);
CREATE INDEX IF NOT EXISTS idx_product_movements_type ON product_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_product_movements_created_at ON product_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_product_movements_user_id ON product_movements(user_id);

-- Índices para stock_alerts
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_status ON stock_alerts(status);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_severity ON stock_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at ON stock_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_resolved_at ON stock_alerts(resolved_at);

-- Índices para commissions
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_sale_id ON commissions(sale_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at);
CREATE INDEX IF NOT EXISTS idx_commissions_paid_at ON commissions(paid_at);

-- Índices para sales
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_total_amount ON sales(total_amount);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);

-- Índices para purchases
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);
CREATE INDEX IF NOT EXISTS idx_purchases_total_amount ON purchases(total_amount);

-- Índices para category_commission_rates
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_category_id ON category_commission_rates(category_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_user_id ON category_commission_rates(user_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_both ON category_commission_rates(category_id, user_id);

-- Índices para customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ====================
-- VERIFICACIÓN FINAL
-- ====================

-- Verificar tablas creadas
SELECT 'Tablas creadas:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('product_movements', 'stock_alerts', 'product_categories', 'category_commission_rates', 'customers', 'notifications', 'commissions', 'products', 'profiles', 'sales', 'purchases')
ORDER BY table_name;

-- Verificar campos en products
SELECT 'Campos en products:' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('imei', 'color', 'payjoy_price', 'cost', 'commission_rate', 'commission_base', 'stock_actual', 'stock_minimo', 'category_id', 'list_price', 'min_price')
ORDER BY column_name;

-- Verificar campos en commissions
SELECT 'Campos en commissions:' as info, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'commissions' 
AND column_name IN ('status', 'paid_at')
ORDER BY column_name;

-- Contar índices creados
SELECT 'Total índices:' as info, COUNT(*) as total
FROM pg_indexes 
WHERE tablename IN ('products', 'product_movements', 'stock_alerts', 'commissions', 'sales', 'purchases', 'category_commission_rates', 'customers', 'notifications')
AND indexname LIKE 'idx_%';

-- ====================
-- FIN DEL SCRIPT
-- ====================
-- ¡Migraciones aplicadas exitosamente! 🎉
