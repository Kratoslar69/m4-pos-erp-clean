import os
from supabase import create_client

# Leer el script SQL
with open('migrations/APLICAR_TODAS_LAS_MIGRACIONES.sql', 'r') as f:
    sql_script = f.read()

# Conectar con service role
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_KEY')
supabase = create_client(url, key)

# Dividir en statements individuales
statements = [s.strip() for s in sql_script.split(';') if s.strip() and not s.strip().startswith('--')]

print(f"Aplicando {len(statements)} statements SQL...")

success_count = 0
error_count = 0

for i, statement in enumerate(statements, 1):
    # Saltar comentarios y líneas vacías
    if not statement or statement.startswith('--') or statement.startswith('/*'):
        continue
    
    try:
        # Ejecutar usando rpc con una función que ejecute SQL
        result = supabase.rpc('exec_sql', {'query': statement}).execute()
        success_count += 1
        print(f"✓ Statement {i} ejecutado")
    except Exception as e:
        error_msg = str(e)
        if 'already exists' in error_msg or 'duplicate' in error_msg.lower():
            print(f"⊙ Statement {i} ya existía (ignorado)")
            success_count += 1
        else:
            print(f"✗ Error en statement {i}: {error_msg[:100]}")
            error_count += 1

print(f"\n{'='*50}")
print(f"Resultado: {success_count} exitosos, {error_count} errores")
print(f"{'='*50}")
