-- Agregar campos faltantes en products
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_base TEXT CHECK (commission_base IN ('list_price', 'min_price', 'cost_price'));

-- Agregar campos faltantes en commissions
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'PAGADA'));

-- Crear tabla category_commission_rates si no existe
CREATE TABLE IF NOT EXISTS category_commission_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES product_categories(id),
    user_id TEXT NOT NULL REFERENCES profiles(id),
    commission_rate NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(category_id, user_id)
);

-- Crear índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate);
CREATE INDEX IF NOT EXISTS idx_products_commission_base ON products(commission_base);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_category_id ON category_commission_rates(category_id);
CREATE INDEX IF NOT EXISTS idx_category_commission_rates_user_id ON category_commission_rates(user_id);
