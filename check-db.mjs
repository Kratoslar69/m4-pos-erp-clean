import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.DATABASE_URL?.match(/host=([^;]+)/)?.[1] || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

console.log('Checking database connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(`https://${supabaseUrl}`, supabaseKey);

// Intentar listar productos
const { data, error } = await supabase.from('products').select('id').limit(1);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Success! Found', data?.length || 0, 'products');
}
