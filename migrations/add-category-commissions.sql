-- Crear tabla de categorías de productos
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS product_categories_name_idx ON product_categories(name);

-- Agregar campo category_id a tabla products
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);

-- Agregar campo commission_rate a tabla products (comisión específica por producto)
ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2);

-- Crear tabla de tasas de comisión por categoría
CREATE TABLE IF NOT EXISTS category_commission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES profiles(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(category_id, user_id)
);

CREATE INDEX IF NOT EXISTS category_commission_rates_category_idx ON category_commission_rates(category_id);
CREATE INDEX IF NOT EXISTS category_commission_rates_user_idx ON category_commission_rates(user_id);

-- Insertar categorías por defecto
INSERT INTO product_categories (name, description) VALUES
  ('Equipos', 'Teléfonos celulares y smartphones'),
  ('SIM Cards', 'Tarjetas SIM y eSIM'),
  ('Accesorios', 'Accesorios para dispositivos móviles'),
  ('Servicios', 'Planes y servicios de telefonía')
ON CONFLICT (name) DO NOTHING;

-- Comentarios
COMMENT ON TABLE product_categories IS 'Categorías de productos para clasificación y comisiones';
COMMENT ON TABLE category_commission_rates IS 'Tasas de comisión específicas por categoría y vendedor';
COMMENT ON COLUMN products.commission_rate IS 'Porcentaje de comisión específico del producto (sobrescribe categoría y vendedor)';
COMMENT ON COLUMN products.category_id IS 'Categoría del producto para cálculo de comisiones';
