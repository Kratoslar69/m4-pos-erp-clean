import os
from supabase import create_client

# Leer la migración SQL
with open('migrations/add-cost-and-commission-base.sql', 'r') as f:
    sql = f.read()

# Conectar a Supabase
supabase = create_client(
    os.environ['SUPABASE_URL'],
    os.environ['SUPABASE_SERVICE_KEY']
)

print("Aplicando migración SQL...")
print(sql)
print("\nNota: Supabase no permite ejecutar ALTER TABLE directamente desde el cliente.")
print("Por favor, ejecuta el SQL manualmente desde el SQL Editor de Supabase.")
