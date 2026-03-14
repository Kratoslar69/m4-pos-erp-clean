-- Migración: Agregar campos cost y commission_base a products
-- Fecha: 2026-02-03
-- Descripción: Corrige error al crear productos y permite seleccionar base de cálculo de comisión

-- Agregar campo cost (costo del producto)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0;

-- Agregar campo commission_base (base para calcular comisión)
-- Opciones: 'list_price', 'min_price', 'payjoy_price', 'cost'
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS commission_base TEXT CHECK (commission_base IN ('list_price', 'min_price', 'payjoy_price', 'cost'));

-- Comentarios para documentación
COMMENT ON COLUMN products.cost IS 'Costo de adquisición del producto';
COMMENT ON COLUMN products.commission_base IS 'Base para calcular la comisión: list_price, min_price, payjoy_price o cost';

-- Índice para mejorar consultas por cost
CREATE INDEX IF NOT EXISTS idx_products_cost ON products(cost);
