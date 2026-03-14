import os
from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(url, key)

sql = """
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS commission_base TEXT CHECK (commission_base IN ('list_price', 'min_price', 'payjoy_price', 'cost'));
"""

try:
    result = supabase.rpc('exec_sql', {'query': sql}).execute()
    print("✓ Migración aplicada exitosamente")
    print(result)
except Exception as e:
    print(f"✗ Error: {e}")
