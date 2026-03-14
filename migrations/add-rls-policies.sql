-- Deshabilitar RLS para permitir acceso con service_role key
ALTER TABLE commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos completos al rol autenticado
GRANT ALL ON commissions TO authenticated;
GRANT ALL ON customers TO authenticated;

-- Otorgar permisos completos al rol anon (para service_role)
GRANT ALL ON commissions TO anon;
GRANT ALL ON customers TO anon;

-- Otorgar permisos al rol service_role
GRANT ALL ON commissions TO service_role;
GRANT ALL ON customers TO service_role;
