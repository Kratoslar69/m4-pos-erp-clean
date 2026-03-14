import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Products Module - Redesigned Fields', () => {
  let testHandsetId: string;
  let testSimId: string;

  afterAll(async () => {
    // Limpiar productos de prueba
    if (testHandsetId) {
      await supabase.from('products').delete().eq('id', testHandsetId);
    }
    if (testSimId) {
      await supabase.from('products').delete().eq('id', testSimId);
    }
  });

  describe('HANDSET (Equipo) Creation', () => {
    it('should create a handset with all required fields', async () => {
      const handsetData = {
        type: 'HANDSET',
        brand: 'Samsung',
        model: 'Galaxy S24',
        imei: `TEST-IMEI-${Date.now()}`,
        model_nomenclature: 'SM-S921B',
        color: 'Negro',
        ram_capacity: 8,
        storage_capacity: 256,
        purchase_price: 15000.00,
        sale_price: 20000.00,
        payjoy_price: 22000.00,
        commission_rate: 5.5,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('products')
        .insert(handsetData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.type).toBe('HANDSET');
      expect(data.brand).toBe('Samsung');
      expect(data.model).toBe('Galaxy S24');
      expect(data.imei).toBe(handsetData.imei);
      expect(data.ram_capacity).toBe(8);
      expect(data.storage_capacity).toBe(256);
      expect(parseFloat(data.sale_price)).toBe(20000.00);
      expect(parseFloat(data.commission_rate)).toBe(5.5);

      testHandsetId = data.id;
    });

    it('should prevent duplicate IMEI', async () => {
      const duplicateImei = `TEST-IMEI-DUPLICATE-${Date.now()}`;
      
      // Crear primer producto
      const { data: first } = await supabase
        .from('products')
        .insert({
          type: 'HANDSET',
          brand: 'Apple',
          model: 'iPhone 15',
          imei: duplicateImei,
          sale_price: 25000.00,
        })
        .select()
        .single();

      expect(first).toBeDefined();

      // Intentar crear segundo producto con mismo IMEI
      const { error } = await supabase
        .from('products')
        .insert({
          type: 'HANDSET',
          brand: 'Apple',
          model: 'iPhone 15 Pro',
          imei: duplicateImei,
          sale_price: 30000.00,
        });

      expect(error).toBeDefined();
      expect(error?.message).toContain('duplicate');

      // Limpiar
      if (first) {
        await supabase.from('products').delete().eq('id', first.id);
      }
    });

    it('should allow optional fields to be null', async () => {
      const minimalHandset = {
        type: 'HANDSET',
        brand: 'Xiaomi',
        model: 'Redmi Note 13',
        imei: `TEST-IMEI-MINIMAL-${Date.now()}`,
      };

      const { data, error } = await supabase
        .from('products')
        .insert(minimalHandset)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.color).toBeNull();
      expect(data.ram_capacity).toBeNull();
      expect(data.commission_rate).toBeNull();

      // Limpiar
      await supabase.from('products').delete().eq('id', data.id);
    });
  });

  describe('SIM Creation', () => {
    it('should create a SIM with all required fields', async () => {
      const simData = {
        type: 'SIM',
        iccid: `TEST-ICCID-${Date.now()}`,
        carrier: 'Telcel',
        package: 'Plan 500',
        commission_rate: 3.0,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('products')
        .insert(simData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.type).toBe('SIM');
      expect(data.iccid).toBe(simData.iccid);
      expect(data.carrier).toBe('Telcel');
      expect(data.package).toBe('Plan 500');
      expect(parseFloat(data.commission_rate)).toBe(3.0);

      testSimId = data.id;
    });

    it('should prevent duplicate ICCID', async () => {
      const duplicateIccid = `TEST-ICCID-DUPLICATE-${Date.now()}`;
      
      // Crear primer SIM
      const { data: first } = await supabase
        .from('products')
        .insert({
          type: 'SIM',
          iccid: duplicateIccid,
          carrier: 'AT&T',
        })
        .select()
        .single();

      expect(first).toBeDefined();

      // Intentar crear segundo SIM con mismo ICCID
      const { error } = await supabase
        .from('products')
        .insert({
          type: 'SIM',
          iccid: duplicateIccid,
          carrier: 'Movistar',
        });

      expect(error).toBeDefined();
      expect(error?.message).toContain('duplicate');

      // Limpiar
      if (first) {
        await supabase.from('products').delete().eq('id', first.id);
      }
    });

    it('should allow package to be optional', async () => {
      const minimalSim = {
        type: 'SIM',
        iccid: `TEST-ICCID-MINIMAL-${Date.now()}`,
        carrier: 'Movistar',
      };

      const { data, error } = await supabase
        .from('products')
        .insert(minimalSim)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.package).toBeNull();

      // Limpiar
      await supabase.from('products').delete().eq('id', data.id);
    });
  });

  describe('Product Updates', () => {
    it('should update handset fields correctly', async () => {
      // Crear producto de prueba
      const { data: product } = await supabase
        .from('products')
        .insert({
          type: 'HANDSET',
          brand: 'Motorola',
          model: 'Edge 40',
          imei: `TEST-IMEI-UPDATE-${Date.now()}`,
          sale_price: 10000.00,
        })
        .select()
        .single();

      expect(product).toBeDefined();

      // Actualizar campos
      const { data: updated, error } = await supabase
        .from('products')
        .update({
          color: 'Azul',
          ram_capacity: 12,
          storage_capacity: 512,
          sale_price: 11000.00,
          commission_rate: 6.0,
        })
        .eq('id', product.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated.color).toBe('Azul');
      expect(updated.ram_capacity).toBe(12);
      expect(updated.storage_capacity).toBe(512);
      expect(parseFloat(updated.sale_price)).toBe(11000.00);
      expect(parseFloat(updated.commission_rate)).toBe(6.0);

      // Limpiar
      await supabase.from('products').delete().eq('id', product.id);
    });

    it('should update SIM fields correctly', async () => {
      // Crear SIM de prueba
      const { data: sim } = await supabase
        .from('products')
        .insert({
          type: 'SIM',
          iccid: `TEST-ICCID-UPDATE-${Date.now()}`,
          carrier: 'Telcel',
        })
        .select()
        .single();

      expect(sim).toBeDefined();

      // Actualizar campos
      const { data: updated, error } = await supabase
        .from('products')
        .update({
          package: 'Plan 1000',
          commission_rate: 4.5,
        })
        .eq('id', sim.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(updated.package).toBe('Plan 1000');
      expect(parseFloat(updated.commission_rate)).toBe(4.5);

      // Limpiar
      await supabase.from('products').delete().eq('id', sim.id);
    });
  });

  describe('Product Listing and Filtering', () => {
    it('should list products by type', async () => {
      const { data: handsets, error: handsetError } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'HANDSET')
        .limit(5);

      expect(handsetError).toBeNull();
      expect(Array.isArray(handsets)).toBe(true);

      const { data: sims, error: simError } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'SIM')
        .limit(5);

      expect(simError).toBeNull();
      expect(Array.isArray(sims)).toBe(true);
    });

    it('should filter active products only', async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(10);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      data?.forEach(product => {
        expect(product.is_active).toBe(true);
      });
    });
  });
});
