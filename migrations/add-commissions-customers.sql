-- Agregar columna commission_rate a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0;

-- Crear tabla customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(320),
  address TEXT,
  notes TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS customers_name_idx ON customers(name);

-- Crear tabla commissions
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(64) NOT NULL REFERENCES profiles(id),
  sale_id UUID NOT NULL REFERENCES sales(id),
  sale_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  period VARCHAR(7) NOT NULL, -- YYYY-MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS commissions_user_idx ON commissions(user_id);
CREATE INDEX IF NOT EXISTS commissions_period_idx ON commissions(period);
CREATE INDEX IF NOT EXISTS commissions_is_paid_idx ON commissions(is_paid);

-- Actualizar commission_rate del usuario admin a 5%
UPDATE profiles SET commission_rate = 5.00 WHERE username = 'admin';

-- Comentarios
COMMENT ON COLUMN profiles.commission_rate IS 'Porcentaje de comisión del vendedor (ej: 5.00 = 5%)';
COMMENT ON TABLE customers IS 'Tabla de clientes con programa de fidelidad';
COMMENT ON TABLE commissions IS 'Registro de comisiones calculadas automáticamente por ventas';
