-- Habilitar RLS en product_movements
ALTER TABLE product_movements ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Allow read access to authenticated users" ON product_movements
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Allow insert to authenticated users" ON product_movements
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Allow update to authenticated users" ON product_movements
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política para permitir eliminación a usuarios autenticados
CREATE POLICY "Allow delete to authenticated users" ON product_movements
  FOR DELETE
  USING (auth.role() = 'authenticated');
