import os
from supabase import create_client

# Configurar cliente de Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL y SUPABASE_SERVICE_KEY deben estar configurados")
    exit(1)

supabase = create_client(url, key)

# Leer archivo de índices
with open("migrations/add-performance-indexes.sql", "r") as f:
    sql_content = f.read()

# Dividir por comandos CREATE INDEX
commands = [cmd.strip() + ";" for cmd in sql_content.split(";") if "CREATE INDEX" in cmd]

print(f"Aplicando {len(commands)} índices...")

# El cliente Python de Supabase no soporta SQL DDL directamente
# Los índices deben aplicarse manualmente desde el SQL Editor de Supabase
print("\n⚠️  NOTA: El cliente Python de Supabase no soporta ejecución de DDL.")
print("Los índices deben aplicarse manualmente desde el SQL Editor de Supabase.")
print("\nPasos:")
print("1. Abrir https://supabase.com/dashboard")
print("2. Ir a SQL Editor")
print("3. Copiar el contenido de migrations/add-performance-indexes.sql")
print("4. Ejecutar el script")
print("\nÍndices a aplicar:")
for i, cmd in enumerate(commands, 1):
    print(f"{i}. {cmd[:80]}...")
