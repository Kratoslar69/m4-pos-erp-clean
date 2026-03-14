-- Crear tabla para registrar movimientos de productos (especialmente equipos con IMEI)
CREATE TABLE IF NOT EXISTS product_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('ENTRADA', 'VENTA', 'DEVOLUCION', 'AJUSTE', 'TRANSFERENCIA')),
  quantity INTEGER NOT NULL DEFAULT 1,
  reference_id UUID, -- ID de la venta, compra, etc.
  reference_type TEXT, -- 'sale', 'purchase', 'adjustment', etc.
  notes TEXT,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_product_movements_product_id ON product_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_product_movements_type ON product_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_product_movements_created_at ON product_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_movements_reference ON product_movements(reference_type, reference_id);

-- Comentarios para documentación
COMMENT ON TABLE product_movements IS 'Registra todos los movimientos de productos para trazabilidad completa';
COMMENT ON COLUMN product_movements.movement_type IS 'Tipo de movimiento: ENTRADA (compra/recepción), VENTA, DEVOLUCION, AJUSTE (inventario), TRANSFERENCIA';
COMMENT ON COLUMN product_movements.reference_id IS 'ID del registro relacionado (venta, compra, etc.)';
COMMENT ON COLUMN product_movements.reference_type IS 'Tipo de referencia: sale, purchase, adjustment, transfer';
