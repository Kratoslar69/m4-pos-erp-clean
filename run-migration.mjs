import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://tskihgbxsxkwvfmoiffs.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('Ejecutando migración en Supabase...\n');
  
  const sql = readFileSync('./migrations/add-commissions-customers.sql', 'utf8');
  
  // Dividir por punto y coma y ejecutar cada statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
  
  console.log(`Ejecutando ${statements.length} statements SQL...\n`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`[${i + 1}/${statements.length}] Ejecutando...`);
    console.log(stmt.substring(0, 80) + (stmt.length > 80 ? '...' : ''));
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: stmt });
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
    } else {
      console.log('   ✅ Éxito');
    }
    console.log('');
  }
  
  console.log('✅ Migración completada');
}

runMigration().catch(console.error);
