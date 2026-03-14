import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tskihgbxsxkwvfmoiffs.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Cliente de Supabase con service_role key para operaciones del servidor
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'm4-pos-erp'
    }
  }
});

// Helper para obtener perfil de usuario por ID
export async function getProfileById(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

// Helper para crear o actualizar perfil
export async function upsertProfile(profile: {
  id: string;
  store_id?: string | null;
  role: string;
  name?: string | null;
  email?: string | null;
}) {
  const { data, error} = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }

  return data;
}

// Helper para obtener tiendas
export async function getStores(activeOnly = true) {
  let query = supabase.from('stores').select('*');
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching stores:', error);
    return [];
  }

  return data;
}

// Helper para obtener productos
export async function getProducts(activeOnly = true) {
  let query = supabase.from('products').select('*');
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data;
}
