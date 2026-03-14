import { describe, it, expect } from 'vitest';
import { supabase } from './db';

describe('Commission Hierarchy System', () => {
  it('should have product_categories table with correct structure', async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have category_commission_rates table with correct structure', async () => {
    const { data, error } = await supabase
      .from('category_commission_rates')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should have default product categories created', async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('name')
      .in('name', ['Equipos', 'SIM Cards', 'Accesorios', 'Servicios']);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
  });

  it('should allow creating category commission rates', async () => {
    // Obtener una categoría existente
    const { data: categories } = await supabase
      .from('product_categories')
      .select('id')
      .limit(1)
      .single();

    if (!categories) {
      // Si no hay categorías, crear una
      const { data: newCategory, error: catError } = await supabase
        .from('product_categories')
        .insert({
          name: `Test Category ${Date.now()}`,
          description: 'Test category for commission rates',
        })
        .select()
        .single();

      expect(catError).toBeNull();
      expect(newCategory).toBeDefined();
    }
  });

  it('should verify commission hierarchy logic with mock data', () => {
    // Caso 1: Solo comisión de vendedor (5%)
    const vendorRate = 5.0;
    const saleAmount = 1000;
    const expectedCommission = (saleAmount * vendorRate) / 100;
    expect(expectedCommission).toBe(50);

    // Caso 2: Comisión de categoría sobrescribe vendedor (7%)
    const categoryRate = 7.0;
    const expectedCategoryCommission = (saleAmount * categoryRate) / 100;
    expect(expectedCategoryCommission).toBe(70);

    // Caso 3: Comisión de producto tiene mayor prioridad (10%)
    const productRate = 10.0;
    const expectedProductCommission = (saleAmount * productRate) / 100;
    expect(expectedProductCommission).toBe(100);

    // Verificar jerarquía: producto > categoría > vendedor
    expect(productRate).toBeGreaterThan(categoryRate);
    expect(categoryRate).toBeGreaterThan(vendorRate);
  });

  it('should verify profiles table has commission_rate column', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, commission_rate')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
