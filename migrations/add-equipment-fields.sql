-- Migración: Agregar campos específicos para productos tipo Equipo
-- Fecha: 2026-02-02
-- Descripción: Agrega campos IMEI, Color, Precio PayJoy y Porcentaje de Comisión

-- 1. Renombrar columna SKU a IMEI (para equipos)
-- Nota: Mantenemos 'sku' como nombre de columna pero lo usaremos para IMEI en equipos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS imei VARCHAR(50) UNIQUE;

-- 2. Agregar campo Color
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- 3. Agregar campo Precio PayJoy
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS precio_payjoy DECIMAL(10,2);

-- 4. Comentarios para documentar el uso
COMMENT ON COLUMN products.imei IS 'IMEI del equipo (solo para productos tipo Equipo)';
COMMENT ON COLUMN products.color IS 'Color del equipo (solo para productos tipo Equipo)';
COMMENT ON COLUMN products.precio_payjoy IS 'Precio especial para plan de pago PayJoy';
COMMENT ON COLUMN products.commission_rate IS 'Porcentaje de comisión específico del producto (prioridad sobre categoría y vendedor)';

-- 5. Crear índice para búsqueda rápida por IMEI
CREATE INDEX IF NOT EXISTS idx_products_imei ON products(imei);
