-- Agregar campos de stock a la tabla products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_actual INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 5;

-- Crear tabla para registrar alertas de stock bajo
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'LOW_STOCK',
  stock_actual INTEGER NOT NULL,
  stock_minimo INTEGER NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_resolved ON stock_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_created_at ON stock_alerts(created_at DESC);

-- Comentarios para documentación
COMMENT ON COLUMN products.stock_actual IS 'Cantidad actual en inventario';
COMMENT ON COLUMN products.stock_minimo IS 'Umbral mínimo para generar alerta';
COMMENT ON TABLE stock_alerts IS 'Registro de alertas de stock bajo para notificaciones';
