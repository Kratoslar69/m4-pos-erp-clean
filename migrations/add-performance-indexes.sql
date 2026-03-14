-- Migración: Agregar índices para optimizar rendimiento
-- Fecha: 2026-02-03

-- Índices en tabla products
CREATE INDEX IF NOT EXISTS idx_products_imei ON products(imei);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_stock_actual ON products(stock_actual);
CREATE INDEX IF NOT EXISTS idx_products_stock_minimo ON products(stock_minimo);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Índices en tabla product_movements
CREATE INDEX IF NOT EXISTS idx_product_movements_product_id ON product_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_product_movements_created_at ON product_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_movements_product_created ON product_movements(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_movements_type ON product_movements(movement_type);

-- Índices en tabla stock_alerts
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_is_resolved ON stock_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_resolved ON stock_alerts(product_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at ON stock_alerts(created_at DESC);

-- Índices en tabla commissions
CREATE INDEX IF NOT EXISTS idx_commissions_user_id ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_period ON commissions(period);
CREATE INDEX IF NOT EXISTS idx_commissions_user_period ON commissions(user_id, period);
CREATE INDEX IF NOT EXISTS idx_commissions_is_paid ON commissions(is_paid);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at DESC);

-- Índices en tabla sales
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);

-- Índices en tabla purchases
CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

-- Índices en tabla category_commission_rates
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_category_id ON category_commission_rates(category_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_user_id ON category_commission_rates(user_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_category_user ON category_commission_rates(category_id, user_id);
