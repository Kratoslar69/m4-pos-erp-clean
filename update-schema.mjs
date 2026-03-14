import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tskihgbxsxkwvfmoiffs.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateSchema() {
  console.log('Verificando y actualizando schema...\n');
  
  // 1. Verificar si commission_rate existe en profiles
  console.log('1. Verificando columna commission_rate en profiles...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, commission_rate')
    .limit(1);
  
  if (profilesError) {
    console.log('   ❌ Error:', profilesError.message);
    console.log('   La columna commission_rate NO existe en profiles');
  } else {
    console.log('   ✅ La columna commission_rate existe en profiles');
  }
  
  // 2. Verificar si tabla commissions existe
  console.log('\n2. Verificando tabla commissions...');
  const { data: commissions, error: commissionsError } = await supabase
    .from('commissions')
    .select('id')
    .limit(1);
  
  if (commissionsError) {
    console.log('   ❌ Error:', commissionsError.message);
    console.log('   La tabla commissions NO existe');
  } else {
    console.log('   ✅ La tabla commissions existe');
  }
  
  // 3. Verificar si tabla customers existe
  console.log('\n3. Verificando tabla customers...');
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id')
    .limit(1);
  
  if (customersError) {
    console.log('   ❌ Error:', customersError.message);
    console.log('   La tabla customers NO existe');
  } else {
    console.log('   ✅ La tabla customers existe');
  }
  
  console.log('\n✅ Verificación completada');
  console.log('\nNOTA: Si faltan tablas o columnas, debes crearlas manualmente en Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/tskihgbxsxkwvfmoiffs/editor');
}

updateSchema().catch(console.error);
