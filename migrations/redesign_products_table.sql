-- =====================================================
-- REDISEÑO DE TABLA PRODUCTS
-- Campos específicos para Equipos y SIMs
-- =====================================================

-- Eliminar campos obsoletos
ALTER TABLE products 
DROP COLUMN IF EXISTS sku_code,
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS cost_price,
DROP COLUMN IF EXISTS list_price,
DROP COLUMN IF EXISTS min_price,
DROP COLUMN IF EXISTS stock_minimo,
DROP COLUMN IF EXISTS commission_base,
DROP COLUMN IF EXISTS category_id;

-- Agregar campos para EQUIPOS (HANDSET)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS brand TEXT COMMENT 'Marca del equipo',
ADD COLUMN IF NOT EXISTS model TEXT COMMENT 'Modelo del equipo',
ADD COLUMN IF NOT EXISTS imei VARCHAR(20) UNIQUE COMMENT 'IMEI del equipo',
ADD COLUMN IF NOT EXISTS model_nomenclature TEXT COMMENT 'Nomenclatura del modelo',
ADD COLUMN IF NOT EXISTS color TEXT COMMENT 'Color del equipo',
ADD COLUMN IF NOT EXISTS ram_capacity INT COMMENT 'Capacidad de RAM en GB',
ADD COLUMN IF NOT EXISTS storage_capacity INT COMMENT 'Capacidad de Memoria en GB',
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2) COMMENT 'Precio de compra',
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2) COMMENT 'Precio de venta',
ADD COLUMN IF NOT EXISTS payjoy_price DECIMAL(10,2) COMMENT 'Precio PayJoy';

-- Agregar campos para SIM
ALTER TABLE products
ADD COLUMN IF NOT EXISTS iccid VARCHAR(25) UNIQUE COMMENT 'ICCID de la SIM',
ADD COLUMN IF NOT EXISTS carrier TEXT COMMENT 'Telefonía (operador)',
ADD COLUMN IF NOT EXISTS package TEXT COMMENT 'Paquete de la SIM';

-- Agregar campo de comisión
ALTER TABLE products
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) COMMENT '% Comisión del vendedor';

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_products_imei ON products(imei);
CREATE INDEX IF NOT EXISTS idx_products_iccid ON products(iccid);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand(255));
CREATE INDEX IF NOT EXISTS idx_products_model ON products(model(255));
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);

-- Verificar estructura final
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'products'
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
