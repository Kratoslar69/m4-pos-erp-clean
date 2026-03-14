-- =====================================================
-- AGREGAR CAMPOS FALTANTES A TABLA PRODUCTS
-- =====================================================

-- Agregar campos para EQUIPOS que faltan
ALTER TABLE products
ADD COLUMN IF NOT EXISTS model_nomenclature TEXT,
ADD COLUMN IF NOT EXISTS ram_capacity INTEGER,
ADD COLUMN IF NOT EXISTS storage_capacity INTEGER,
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2);

-- Agregar campos para SIM
ALTER TABLE products
ADD COLUMN IF NOT EXISTS iccid VARCHAR(25) UNIQUE,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS package TEXT;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_products_imei ON products(imei);
CREATE INDEX IF NOT EXISTS idx_products_iccid ON products(iccid);

-- Verificar campos agregados
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('model_nomenclature', 'ram_capacity', 'storage_capacity', 'purchase_price', 'sale_price', 'iccid', 'carrier', 'package')
ORDER BY column_name;
