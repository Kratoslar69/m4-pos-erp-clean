import os
from supabase import create_client

# Leer variables de entorno
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL o SUPABASE_SERVICE_KEY no están configurados")
    exit(1)

# Crear cliente
supabase = create_client(url, key)

# Leer archivo SQL
with open("migrations/add-performance-indexes.sql", "r") as f:
    sql_content = f.read()

# Dividir por comandos individuales
commands = [cmd.strip() for cmd in sql_content.split(";") if cmd.strip() and not cmd.strip().startswith("--")]

print(f"Aplicando {len(commands)} índices...")

success_count = 0
error_count = 0

for i, cmd in enumerate(commands, 1):
    if not cmd or cmd.startswith("--"):
        continue
    
    try:
        # Ejecutar comando
        result = supabase.rpc("exec_sql", {"query": cmd}).execute()
        print(f"✓ Índice {i}/{len(commands)} aplicado correctamente")
        success_count += 1
    except Exception as e:
        error_msg = str(e)
        # Ignorar errores de índices que ya existen
        if "already exists" in error_msg or "IF NOT EXISTS" in cmd:
            print(f"⚠ Índice {i}/{len(commands)} ya existe (ignorado)")
            success_count += 1
        else:
            print(f"✗ Error en índice {i}/{len(commands)}: {error_msg}")
            error_count += 1

print(f"\nResumen: {success_count} exitosos, {error_count} errores")
