-- Deshabilitar RLS para permitir acceso con service_role key
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE category_commission_rates DISABLE ROW LEVEL SECURITY;

-- Otorgar permisos completos al rol autenticado
GRANT ALL ON product_categories TO authenticated;
GRANT ALL ON category_commission_rates TO authenticated;

-- Otorgar permisos completos al rol anon (para service_role)
GRANT ALL ON product_categories TO anon;
GRANT ALL ON category_commission_rates TO anon;

-- Otorgar permisos al rol service_role
GRANT ALL ON product_categories TO service_role;
GRANT ALL ON category_commission_rates TO service_role;
