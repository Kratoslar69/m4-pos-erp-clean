import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://tskihgbxsxkwvfmoiffs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyProductsTable() {
  console.log('🔍 Verificando estructura de tabla products...\n');

  // Intentar hacer una query simple
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error al acceder a la tabla products:', error.message);
    return false;
  }

  console.log('✅ Tabla products accesible');

  // Verificar que podemos insertar un registro de prueba
  const testHandset = {
    type: 'HANDSET',
    brand: 'TEST',
    model: 'TEST_MODEL',
    imei: 'TEST_' + Date.now(),
    model_nomenclature: 'TEST_NOM',
    color: 'BLACK',
    ram_capacity: 8,
    storage_capacity: 128,
    purchase_price: 100.00,
    sale_price: 150.00,
    is_offer: false,
    is_active: true,
  };

  console.log('\n🧪 Probando inserción de registro de prueba...');
  const { data: insertData, error: insertError } = await supabase
    .from('products')
    .insert(testHandset)
    .select();

  if (insertError) {
    console.error('❌ Error al insertar registro de prueba:', insertError.message);
    console.error('Detalles:', insertError);
    return false;
  }

  console.log('✅ Inserción de prueba exitosa');
  console.log('Registro creado:', insertData[0]);

  // Eliminar el registro de prueba
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('id', insertData[0].id);

  if (deleteError) {
    console.warn('⚠️  Error al eliminar registro de prueba:', deleteError.message);
  } else {
    console.log('🗑️  Registro de prueba eliminado');
  }

  console.log('\n✅ ¡Verificación completada exitosamente!\n');
  return true;
}

// Ejecutar verificación
verifyProductsTable()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('💥 Error inesperado:', err);
    process.exit(1);
  });
