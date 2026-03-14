-- ============================================
-- SCRIPT SQL DEFINITIVO PARA MYSQL/TIDB
-- Sistema M4 POS/ERP - Basado en schema real
-- ============================================

-- Este script está diseñado para el schema actual que usa:
-- - MySQL/TiDB (no PostgreSQL)
-- - Tablas: stores, profiles, suppliers, products, inventory_items, inventory_stock,
--   purchase_orders, purchase_items, transfer_orders, transfer_items, sales, sale_items,
--   pricing_plans, daily_cashouts, customers, commissions, inventory_events

-- ====================
-- TABLA: commissions
-- ====================
-- Agregar campos faltantes si no existen
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS status ENUM('PENDIENTE', 'PAGADA') DEFAULT 'PENDIENTE';
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL;

-- ====================
-- TABLA: products  
-- ====================
-- Nota: La mayoría de campos ya existen en el schema
-- Solo verificamos los que podrían faltar

-- Campo para comisiones personalizadas por producto
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) NULL;

-- Campo para base de cálculo de comisión
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_base ENUM('list_price', 'min_price', 'cost_price') NULL;

-- ====================
-- TABLA: profiles
-- ====================
-- El campo commission_rate ya existe en el schema
-- Solo verificamos que exista
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0;

-- ====================
-- CREAR TABLAS FALTANTES
-- ====================

-- Tabla: product_categories (para organizar productos)
CREATE TABLE IF NOT EXISTS product_categories (
    id VARCHAR(36) PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_name (name(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: category_commission_rates (comisiones por categoría y vendedor)
CREATE TABLE IF NOT EXISTS category_commission_rates (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category_user (category_id, user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: stock_alerts (alertas de stock bajo)
CREATE TABLE IF NOT EXISTS stock_alerts (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    store_id VARCHAR(36) NOT NULL,
    severity ENUM('CRITICA', 'URGENTE', 'NORMAL') NOT NULL,
    message TEXT NOT NULL,
    status ENUM('ACTIVA', 'RESUELTA') DEFAULT 'ACTIVA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_product_id (product_id),
    INDEX idx_store_id (store_id),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: notifications (notificaciones del sistema)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================
-- ÍNDICES DE RENDIMIENTO ADICIONALES
-- ====================

-- Índices para products (algunos ya existen, usamos IF NOT EXISTS implícito)
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_products_commission_base ON products(commission_base);
CREATE INDEX IF NOT EXISTS idx_products_stock_minimo ON products(stock_minimo);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Índices para commissions
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_paid_at ON commissions(paid_at);

-- Índices para inventory_items
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON inventory_items(product_id);

-- Índices para sales
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_payment_plan ON sales(payment_plan);

-- Índices para purchase_orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON purchase_orders(created_by);

-- Índices para inventory_events
CREATE INDEX IF NOT EXISTS idx_inventory_events_product_id ON inventory_events(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_events_store_id ON inventory_events(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_events_event_type ON inventory_events(event_type);
CREATE INDEX IF NOT EXISTS idx_inventory_events_created_at ON inventory_events(created_at);

-- ====================
-- VERIFICACIÓN FINAL
-- ====================

-- Verificar tablas creadas
SELECT 'Tablas en la base de datos:' as info;
SHOW TABLES;

-- Verificar campos en products
SELECT 'Campos en products:' as info;
DESCRIBE products;

-- Verificar campos en commissions
SELECT 'Campos en commissions:' as info;
DESCRIBE commissions;

-- Verificar índices
SELECT 'Índices creados:' as info;
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('products', 'commissions', 'sales', 'purchase_orders', 'inventory_events', 'stock_alerts', 'notifications')
ORDER BY TABLE_NAME, INDEX_NAME;

-- ====================
-- FIN DEL SCRIPT
-- ====================
-- ¡Migraciones aplicadas exitosamente! 🎉
