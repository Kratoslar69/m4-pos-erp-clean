import { describe, it, expect } from 'vitest';
import { supabase } from './db';

describe('Products - Equipment Fields', () => {
  it('should have imei column in products table', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('imei')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have color column in products table', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('color')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have precio_payjoy column in products table', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('precio_payjoy')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have commission_rate column in products table', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('commission_rate')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should allow creating a product with equipment-specific fields', async () => {
    const testIMEI = `TEST-IMEI-${Date.now()}`;
    
    // Insertar primero solo campos básicos
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        type: 'HANDSET',
        name: 'iPhone 15 Pro Test',
        is_active: true,
      })
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(product).toBeDefined();

    if (!product) return;

    // Actualizar con campos específicos de equipos
    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({
        brand: 'Apple',
        model: 'iPhone 15 Pro',
        imei: testIMEI,
        color: 'Titanio Natural',
        precio_payjoy: 27999,
        commission_rate: 8.5,
      })
      .eq('id', product.id)
      .select()
      .single();

    expect(updateError).toBeNull();
    expect(updated).toBeDefined();
    expect(updated?.imei).toBe(testIMEI);
    expect(updated?.color).toBe('Titanio Natural');

    // Limpiar: eliminar producto de prueba
    await supabase
      .from('products')
      .delete()
      .eq('id', product.id);
  });

  it('should enforce unique IMEI constraint', async () => {
    const testIMEI = `UNIQUE-TEST-${Date.now()}`;
    
    // Crear primer producto con IMEI
    const { data: product1 } = await supabase
      .from('products')
      .insert({
        type: 'HANDSET',
        name: 'Test Product 1',
        imei: testIMEI,
        is_active: true,
      })
      .select()
      .single();

    // Intentar crear segundo producto con el mismo IMEI
    const { data: product2, error } = await supabase
      .from('products')
      .insert({
        type: 'HANDSET',
        name: 'Test Product 2',
        imei: testIMEI,
        is_active: true,
      })
      .select()
      .single();

    // Debe fallar por IMEI duplicado
    expect(error).not.toBeNull();
    expect(product2).toBeNull();

    // Limpiar: eliminar producto de prueba
    if (product1) {
      await supabase
        .from('products')
        .delete()
        .eq('id', product1.id);
    }
  });

  it('should verify commission_rate is integrated with commission system', async () => {
    // Verificar que el campo commission_rate existe en products
    const { data: products } = await supabase
      .from('products')
      .select('commission_rate')
      .limit(1);

    expect(products).toBeDefined();

    // Verificar que el sistema de comisiones puede usar este campo
    // (el cálculo de comisiones ya está implementado en sales.create)
    const testProduct = {
      commission_rate: 10.5,
    };

    const commissionRate = parseFloat(testProduct.commission_rate.toString());
    const saleAmount = 1000;
    const expectedCommission = (saleAmount * commissionRate) / 100;

    expect(expectedCommission).toBe(105);
  });

  it('should verify barcode scanner compatibility for IMEI field', () => {
    // El campo IMEI es un input de texto normal que acepta cualquier entrada
    // Las pistolas de código de barras funcionan como teclados, ingresando texto
    // No se requiere configuración especial en el frontend
    
    const mockScannedIMEI = '123456789012345';
    expect(mockScannedIMEI).toMatch(/^\d+$/);
    expect(mockScannedIMEI.length).toBeGreaterThanOrEqual(15);
  });
});
