import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

describe('Products - Cost and Commission Base', () => {
  let testProductId: string;

  beforeAll(async () => {
    // Limpiar datos de prueba anteriores
    await supabase
      .from('products')
      .delete()
      .eq('name', 'Test Product Cost Commission');
  });

  it('debe crear un producto con cost y commission_base', async () => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        type: 'HANDSET',
        name: 'Test Product Cost Commission',
        brand: 'Test Brand',
        model: 'Test Model',
        imei: `TEST${Date.now()}`,
        color: 'Negro',
        precio_lista: 3000,
        precio_minimo: 2500,
        precio_payjoy: 2800,
        cost: 2000,
        commission_rate: 10,
        commission_base: 'list_price',
        is_active: true,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.cost).toBe(2000);
    expect(data?.commission_rate).toBe(10);
    expect(data?.commission_base).toBe('list_price');

    testProductId = data!.id;
  });

  it('debe actualizar commission_base de un producto', async () => {
    const { data, error } = await supabase
      .from('products')
      .update({
        commission_base: 'cost',
      })
      .eq('id', testProductId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.commission_base).toBe('cost');
  });

  it('debe permitir commission_rate sin commission_base (opcional)', async () => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        type: 'SIM',
        name: 'Test SIM Without Base',
        precio_lista: 100,
        commission_rate: 5,
        // commission_base es opcional
        is_active: true,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.commission_rate).toBe(5);
    // commission_base puede ser null o tener un valor por defecto
  });

  it('debe permitir crear producto sin commission_rate ni commission_base', async () => {
    const { data, error } = await supabase
      .from('products')
      .insert({
        type: 'ACCESSORY',
        name: 'Test Accessory No Commission',
        precio_lista: 50,
        is_active: true,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    // Ambos campos son opcionales
  });
});
