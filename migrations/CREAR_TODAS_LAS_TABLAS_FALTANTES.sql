-- ============================================
-- CREAR TODAS LAS TABLAS FALTANTES
-- Sistema M4 POS/ERP
-- ============================================

-- Tabla: product_movements (Historial de movimientos de productos)
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

-- Tabla: stock_alerts (Alertas de stock bajo)
CREATE TABLE IF NOT EXISTS stock_alerts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('CRITICA', 'URGENTE', 'NORMAL')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVA' CHECK (status IN ('ACTIVA', 'RESUELTA')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Tabla: product_categories (Categorías de productos)
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: category_commission_rates (Comisiones por categoría)
CREATE TABLE IF NOT EXISTS category_commission_rates (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, user_id)
);

-- Tabla: customers (Clientes)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: notifications (Notificaciones del sistema)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO' CHECK (type IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para todas las tablas
CREATE INDEX IF NOT EXISTS idx_product_movements_product_id ON product_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_product_movements_imei ON product_movements(imei);
CREATE INDEX IF NOT EXISTS idx_product_movements_type ON product_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_product_movements_created_at ON product_movements(created_at);

CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_status ON stock_alerts(status);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_severity ON stock_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at ON stock_alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_category_commission_rates_category_id ON category_commission_rates(category_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_user_id ON category_commission_rates(user_id);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Verificar que las tablas se crearon
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('product_movements', 'stock_alerts', 'product_categories', 'category_commission_rates', 'customers', 'notifications')
ORDER BY table_name;
