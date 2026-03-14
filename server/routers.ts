import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { supabase } from "./db";
import { 
  isAuthenticated, 
  isSuperAdmin, 
  isAdminOrAbove,
  requirePermission,
  requireStoreAccess,
  getUserRole,
  getUserStoreId
} from "./middleware";
import { notifyOwner } from "./_core/notification";
import { generateCommissionPDF } from "./_core/pdfExport";
import { generateCommissionExcel } from "./_core/excelExport";
import { UserRole } from "../shared/erp-types";
import { authRouter, usersRouter } from "./auth-router";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  users: usersRouter,

  // Módulo de Tiendas
  stores: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      isAuthenticated(ctx);
      const role = getUserRole(ctx);
      const userStoreId = getUserStoreId(ctx);

      let query = supabase.from('stores').select('*');
      
      // Store users solo ven su tienda
      if (role === 'store_user' && userStoreId) {
        query = query.eq('id', userStoreId);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw new Error(error.message);
      return data || [];
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        requireStoreAccess(ctx, input.id);
        
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('id', input.id)
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        address: z.string().optional(),
        phone: z.string().optional(),
        is_warehouse: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        isSuperAdmin(ctx);
        
        const { data, error } = await supabase
          .from('stores')
          .insert({
            ...input,
            is_active: true,
          })
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        code: z.string().min(1).optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        isSuperAdmin(ctx);
        
        const { id, ...updates } = input;
        const { data, error } = await supabase
          .from('stores')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),
  }),

  // Módulo de Productos
  products: router({
    list: protectedProcedure
      .input(z.object({
        type: z.enum(['HANDSET', 'SIM', 'ACCESSORY']).optional(),
        activeOnly: z.boolean().default(true),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        let query = supabase.from('products').select('*');
        
        if (input.type) {
          query = query.eq('type', input.type);
        }
        
        if (input.activeOnly) {
          query = query.eq('is_active', true);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) throw new Error(error.message);
        return data || [];
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', input.id)
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    create: protectedProcedure
      .input(z.object({
        type: z.enum(['HANDSET', 'SIM']),
        // Campos para EQUIPOS (HANDSET)
        brand: z.string().optional(),
        model: z.string().optional(),
        imei: z.string().optional(),
        model_nomenclature: z.string().optional(),
        color: z.string().optional(),
        ram_capacity: z.number().int().optional(),
        storage_capacity: z.number().int().optional(),
        purchase_price: z.number().optional(),
        profit_percentage: z.number().optional(),
        sale_price: z.number().optional(),
        payjoy_profit: z.number().optional(),
        is_offer: z.boolean().optional(),
        offer_discount: z.number().optional(),
        payjoy_price_3m: z.number().optional(),
        bait_cost_3m: z.number().optional(),
        bait_commission_3m: z.number().optional(),
        payjoy_price_6m: z.number().optional(),
        bait_cost_6m: z.number().optional(),
        bait_commission_6m: z.number().optional(),
        // Campos para SIM
        iccid: z.string().optional(),
        carrier: z.string().optional(),
        package: z.string().optional(),
        // Campo común
        commission_rate: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageProducts');
        
        // Validar que IMEI sea único si se proporciona (para HANDSET)
        if (input.imei) {
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('imei', input.imei)
            .single();
          
          if (existing) {
            throw new Error('Ya existe un producto con este IMEI');
          }
        }
        
        // Validar que ICCID sea único si se proporciona (para SIM)
        if (input.iccid) {
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('iccid', input.iccid)
            .single();
          
          if (existing) {
            throw new Error('Ya existe un producto con este ICCID');
          }
        }
        
        const { data, error } = await supabase
          .from('products')
          .insert({
            ...input,
            is_active: true,
          })
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        type: z.enum(['HANDSET', 'SIM']).optional(),
        // Campos para EQUIPOS (HANDSET)
        brand: z.string().optional(),
        model: z.string().optional(),
        imei: z.string().optional(),
        model_nomenclature: z.string().optional(),
        color: z.string().optional(),
        ram_capacity: z.number().int().optional(),
        storage_capacity: z.number().int().optional(),
        purchase_price: z.number().optional(),
        profit_percentage: z.number().optional(),
        sale_price: z.number().optional(),
        payjoy_profit: z.number().optional(),
        is_offer: z.boolean().optional(),
        offer_discount: z.number().optional(),
        payjoy_price_3m: z.number().optional(),
        bait_cost_3m: z.number().optional(),
        bait_commission_3m: z.number().optional(),
        payjoy_price_6m: z.number().optional(),
        bait_cost_6m: z.number().optional(),
        bait_commission_6m: z.number().optional(),
        // Campos para SIM
        iccid: z.string().optional(),
        carrier: z.string().optional(),
        package: z.string().optional(),
        // Campo común
        commission_rate: z.number().min(0).max(100).optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageProducts');
        
        // Validar que IMEI sea único si se proporciona y es diferente al actual
        if (input.imei) {
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('imei', input.imei)
            .neq('id', input.id)
            .single();
          
          if (existing) {
            throw new Error('Ya existe un producto con este IMEI');
          }
        }
        
        // Validar que ICCID sea único si se proporciona y es diferente al actual
        if (input.iccid) {
          const { data: existing } = await supabase
            .from('products')
            .select('id')
            .eq('iccid', input.iccid)
            .neq('id', input.id)
            .single();
          
          if (existing) {
            throw new Error('Ya existe un producto con este ICCID');
          }
        }
        
        const { id, ...updates } = input;
        const { data, error } = await supabase
          .from('products')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageProducts');
        
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', input.id);
        
        if (error) throw new Error(error.message);
        return { success: true };
      }),

    bulkImportHandsets: protectedProcedure
      .input(z.object({
        handsets: z.array(z.object({
          brand: z.string(),
          model: z.string(),
          imei: z.string(),
          model_nomenclature: z.string(),
          color: z.string(),
          ram_capacity: z.number().int(),
          storage_capacity: z.number().int(),
          purchase_price: z.number(),
          profit_percentage: z.number().nullable(),
          sale_price: z.number(),
          payjoy_profit: z.number().nullable(),
          is_offer: z.boolean(),
          offer_discount: z.number().nullable(),
          payjoy_price_3m: z.number().nullable(),
          bait_cost_3m: z.number().nullable(),
          bait_commission_3m: z.number().nullable(),
          payjoy_price_6m: z.number().nullable(),
          bait_cost_6m: z.number().nullable(),
          bait_commission_6m: z.number().nullable(),
          commission_rate: z.number().nullable(),
          image_url: z.string().nullable(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageProducts');
        
        console.log(`[BULK IMPORT] Iniciando importación de ${input.handsets.length} equipos`);
        
        const results = {
          total: input.handsets.length,
          success: 0,
          failed: 0,
          errors: [] as Array<{ imei: string; error: string }>,
        };

        // Validar IMEIs únicos en el lote
        const imeis = input.handsets.map(h => h.imei);
        const duplicateIMEIs = new Set<string>();
        const seenIMEIs = new Set<string>();
        
        for (const imei of imeis) {
          if (seenIMEIs.has(imei)) {
            duplicateIMEIs.add(imei);
          }
          seenIMEIs.add(imei);
        }

        if (duplicateIMEIs.size > 0) {
          console.log(`[BULK IMPORT] ERROR: IMEIs duplicados encontrados:`, Array.from(duplicateIMEIs));
          throw new Error(`IMEIs duplicados en el archivo: ${Array.from(duplicateIMEIs).join(', ')}`);
        }

        console.log(`[BULK IMPORT] Validación de IMEIs únicos en lote: OK`);

        // Verificar IMEIs existentes en la base de datos
        const { data: existingIMEIs } = await supabase
          .from('products')
          .select('imei')
          .in('imei', imeis);

        if (existingIMEIs && existingIMEIs.length > 0) {
          const existing = existingIMEIs.map(e => e.imei).join(', ');
          console.log(`[BULK IMPORT] ERROR: IMEIs ya existen en BD:`, existing);
          throw new Error(`Los siguientes IMEIs ya existen en la base de datos: ${existing}`);
        }

        console.log(`[BULK IMPORT] Validación de IMEIs existentes en BD: OK`);

        // Procesar equipos en lotes de 1000 (límite de Supabase)
        const batchSize = 1000;
        for (let i = 0; i < input.handsets.length; i += batchSize) {
          const batch = input.handsets.slice(i, i + batchSize);
          console.log(`[BULK IMPORT] Procesando lote ${Math.floor(i/batchSize) + 1}: ${batch.length} equipos (${i + 1} - ${i + batch.length})`);
          
          // Mapear campos de snake_case a camelCase para Drizzle/Supabase
          const handsetsToInsert = batch.map(handset => ({
            type: 'HANDSET' as const,
            brand: handset.brand,
            model: handset.model,
            imei: handset.imei,
            model_nomenclature: handset.model_nomenclature,
            color: handset.color,
            ram_capacity: handset.ram_capacity,
            storage_capacity: handset.storage_capacity,
            purchase_price: handset.purchase_price,
            profit_percentage: handset.profit_percentage,
            sale_price: handset.sale_price,
            payjoy_profit: handset.payjoy_profit,
            is_offer: handset.is_offer,
            offer_discount: handset.offer_discount,
            payjoy_price_3m: handset.payjoy_price_3m,
            bait_cost_3m: handset.bait_cost_3m,
            bait_commission_3m: handset.bait_commission_3m,
            payjoy_price_6m: handset.payjoy_price_6m,
            bait_cost_6m: handset.bait_cost_6m,
            bait_commission_6m: handset.bait_commission_6m,
            commission_rate: handset.commission_rate,
            image_url: handset.image_url,
            is_active: true,
          }));

          console.log(`[BULK IMPORT] Insertando ${handsetsToInsert.length} registros en Supabase...`);

          const { data, error } = await supabase
            .from('products')
            .insert(handsetsToInsert)
            .select();

          if (error) {
            console.log(`[BULK IMPORT] Error en lote, intentando uno por uno. Error:`, error.message);
            // Si falla el lote, intentar uno por uno
            for (const handset of batch) {
              const { error: singleError } = await supabase
                .from('products')
                .insert({
                  type: 'HANDSET' as const,
                  brand: handset.brand,
                  model: handset.model,
                  imei: handset.imei,
                  model_nomenclature: handset.model_nomenclature,
                  color: handset.color,
                  ram_capacity: handset.ram_capacity,
                  storage_capacity: handset.storage_capacity,
                  purchase_price: handset.purchase_price,
                  profit_percentage: handset.profit_percentage,
                  sale_price: handset.sale_price,
                  payjoy_profit: handset.payjoy_profit,
                  is_offer: handset.is_offer,
                  offer_discount: handset.offer_discount,
                  payjoy_price_3m: handset.payjoy_price_3m,
                  bait_cost_3m: handset.bait_cost_3m,
                  bait_commission_3m: handset.bait_commission_3m,
                  payjoy_price_6m: handset.payjoy_price_6m,
                  bait_cost_6m: handset.bait_cost_6m,
                  bait_commission_6m: handset.bait_commission_6m,
                  commission_rate: handset.commission_rate,
                  image_url: handset.image_url,
                  is_active: true,
                });
              
              if (singleError) {
                results.failed++;
                results.errors.push({
                  imei: handset.imei,
                  error: singleError.message,
                });
                console.log(`[BULK IMPORT] ❌ Error en IMEI ${handset.imei}:`, singleError.message);
              } else {
                results.success++;
                console.log(`[BULK IMPORT] ✅ IMEI ${handset.imei} insertado correctamente`);
              }
            }
          } else {
            results.success += data?.length || 0;
            console.log(`[BULK IMPORT] ✅ Lote insertado correctamente: ${data?.length || 0} registros`);
          }
        }

        console.log(`[BULK IMPORT] RESUMEN FINAL:`, results);
        return results;
      }),
  }),

  // Módulo de Movimientos de Productos
  productMovements: router({
    // Listar movimientos de un producto
    listByProduct: protectedProcedure
      .input(z.object({
        productId: z.string().uuid(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        const { data, error } = await supabase
          .from('product_movements')
          .select('*, profiles(name)')
          .eq('product_id', input.productId)
          .order('created_at', { ascending: false })
          .limit(input.limit);
        
        if (error) throw new Error(error.message);
        return data || [];
      }),

    // Listar movimientos por IMEI
    listByIMEI: protectedProcedure
      .input(z.object({
        imei: z.string(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        // Primero buscar el producto por IMEI
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, name, brand, model, imei')
          .eq('imei', input.imei)
          .single();
        
        if (productError) throw new Error('Producto no encontrado con ese IMEI');
        
        // Luego obtener los movimientos
        const { data, error } = await supabase
          .from('product_movements')
          .select('*, profiles(name)')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false })
          .limit(input.limit);
        
        if (error) throw new Error(error.message);
        
        return {
          product,
          movements: data || [],
        };
      }),

    // Registrar movimiento
    create: protectedProcedure
      .input(z.object({
        productId: z.string().uuid(),
        movementType: z.enum(['ENTRADA', 'VENTA', 'DEVOLUCION', 'AJUSTE', 'TRANSFERENCIA']),
        quantity: z.number().default(1),
        referenceId: z.string().uuid().optional(),
        referenceType: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageProducts');
        
        const { data, error } = await supabase
          .from('product_movements')
          .insert({
            product_id: input.productId,
            movement_type: input.movementType,
            quantity: input.quantity,
            reference_id: input.referenceId,
            reference_type: input.referenceType,
            notes: input.notes,
            user_id: ctx.user?.id,
          })
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),
  }),

  // Módulo de Proveedores
  suppliers: router({
    list: protectedProcedure
      .input(z.object({
        activeOnly: z.boolean().default(true),
      }))
      .query(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageSuppliers');
        
        let query = supabase.from('suppliers').select('*');
        
        if (input.activeOnly) {
          query = query.eq('is_active', true);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) throw new Error(error.message);
        return data || [];
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageSuppliers');
        
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        
        // Insertar solo el nombre por ahora debido al schema cache de Supabase
        const { error } = await supabase
          .from('suppliers')
          .insert({
            id,
            name: input.name,
            is_active: true,
            created_at: createdAt
          });
        
        if (error) throw new Error(error.message);
        
        // Retornar el objeto completo (los campos adicionales se agregarán cuando se actualice)
        return {
          id,
          name: input.name,
          contact_person: null,
          phone: null,
          email: null,
          address: null,
          notes: null,
          is_active: true,
          created_at: createdAt
        };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageSuppliers');
        
        const { id, contactPerson, address, notes, ...rest } = input;
        // Solo actualizar campos que Supabase reconoce en su schema cache
        const updates: any = {};
        if (rest.name !== undefined) updates.name = rest.name;
        if (rest.phone !== undefined) updates.phone = rest.phone;
        if (rest.email !== undefined) updates.email = rest.email || null;
        if (contactPerson !== undefined) updates.contact_person = contactPerson;
        // Omitir address y notes por ahora debido al schema cache de Supabase
        
        const { data, error } = await supabase
          .from('suppliers')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageSuppliers');
        
        const { error } = await supabase
          .from('suppliers')
          .delete()
          .eq('id', input.id);
        
        if (error) throw new Error(error.message);
        return { success: true };
      }),
  }),

  // Módulo de Inventario
  inventory: router({
    // Inventario serializado (IMEI/ICCID)
    items: protectedProcedure
      .input(z.object({
        storeId: z.string().uuid().optional(),
        status: z.enum(['EN_ALMACEN', 'EN_TRANSITO', 'EN_TIENDA', 'RESERVADO', 'VENDIDO', 'DEVUELTO', 'MERMA']).optional(),
        serialNumber: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const role = getUserRole(ctx);
        const userStoreId = getUserStoreId(ctx);

        let query = supabase
          .from('inventory_items')
          .select('*, products(*)');
        
        // Filtrar por tienda si es store_user
        if (role === 'store_user' && userStoreId) {
          query = query.eq('store_id', userStoreId);
        } else if (input.storeId) {
          query = query.eq('store_id', input.storeId);
        }
        
        if (input.status) {
          query = query.eq('status', input.status);
        }
        
        if (input.serialNumber) {
          query = query.ilike('serial_number', `%${input.serialNumber}%`);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw new Error(error.message);
        return data || [];
      }),

    // Stock por SKU
    stock: protectedProcedure
      .input(z.object({
        storeId: z.string().uuid().optional(),
        productId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const role = getUserRole(ctx);
        const userStoreId = getUserStoreId(ctx);

        let query = supabase
          .from('inventory_stock')
          .select('*, products(*), stores(*)');
        
        // Filtrar por tienda si es store_user
        if (role === 'store_user' && userStoreId) {
          query = query.eq('store_id', userStoreId);
        } else if (input.storeId) {
          query = query.eq('store_id', input.storeId);
        }
        
        if (input.productId) {
          query = query.eq('product_id', input.productId);
        }
        
        const { data, error } = await query;
        
        if (error) throw new Error(error.message);
        return data || [];
      }),

    // Agregar item serializado
    addItem: protectedProcedure
      .input(z.object({
        productId: z.string().uuid(),
        serialNumber: z.string().min(1),
        storeId: z.string().uuid(),
        costo: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canCreatePurchases');
        
        const { data, error } = await supabase
          .from('inventory_items')
          .insert({
            product_id: input.productId,
            serial_number: input.serialNumber,
            store_id: input.storeId,
            status: 'EN_ALMACEN',
            costo: input.costo,
          })
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),
  }),

  // Módulo de Compras
  purchases: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      requirePermission(ctx, 'canCreatePurchases');
      
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, suppliers(*)')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        requirePermission(ctx, 'canCreatePurchases');
        
        const { data, error } = await supabase
          .from('purchase_orders')
          .select('*, suppliers(*), purchase_items(*, products(*))')
          .eq('id', input.id)
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    create: protectedProcedure
      .input(z.object({
        supplierId: z.string().uuid(),
        storeId: z.string().uuid(),
        invoiceNumber: z.string().optional(),
        items: z.array(z.object({
          productId: z.string().uuid(),
          serialNumber: z.string().optional(),
          quantity: z.number().int().positive(),
          costo: z.number().positive(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canCreatePurchases');
        
        const total = input.items.reduce((sum, item) => sum + (item.costo * item.quantity), 0);
        
        // Crear orden de compra
        const { data: order, error: orderError } = await supabase
          .from('purchase_orders')
          .insert({
            supplier_id: input.supplierId,
            invoice_number: input.invoiceNumber,
            total,
            created_by: ctx.user!.id,
          })
          .select()
          .single();
        
        if (orderError) throw new Error(orderError.message);
        
        // Agregar items de compra
        const purchaseItems = input.items.map(item => ({
          purchase_order_id: order.id,
          product_id: item.productId,
          serial_number: item.serialNumber,
          quantity: item.quantity,
          costo: item.costo,
        }));
        
        const { error: itemsError } = await supabase
          .from('purchase_items')
          .insert(purchaseItems);
        
        if (itemsError) throw new Error(itemsError.message);
        
        // Actualizar inventario: agregar productos comprados a la tienda
        for (const item of input.items) {
          // Aumentar stock_actual
          const { data: product } = await supabase
            .from('products')
            .select('stock_actual, stock_minimo')
            .eq('id', item.productId)
            .single();
          
          if (product) {
            const newStock = (product.stock_actual || 0) + item.quantity;
            
            await supabase
              .from('products')
              .update({ stock_actual: newStock })
              .eq('id', item.productId);
            
            // Registrar movimiento de entrada
            await supabase
              .from('product_movements')
              .insert({
                product_id: item.productId,
                movement_type: 'ENTRADA',
                quantity: item.quantity,
                reference_id: order.id,
                reference_type: 'purchase',
                user_id: ctx.user!.id,
              });
            
            // Resolver alertas automáticamente si el stock superó el mínimo
            if (newStock > (product.stock_minimo || 0)) {
              await supabase
                .from('stock_alerts')
                .update({
                  is_resolved: true,
                  resolved_at: new Date().toISOString(),
                })
                .eq('product_id', item.productId)
                .eq('is_resolved', false);
            }
          }
          
          // Si el producto tiene número de serie, crear un registro por cada unidad
          if (item.serialNumber) {
            const { error: invError } = await supabase
              .from('inventory_items')
              .insert({
                product_id: item.productId,
                store_id: input.storeId,
                serial_number: item.serialNumber,
                status: 'DISPONIBLE',
              });
            
            if (invError) throw new Error(invError.message);
          } else {
            // Para productos sin serie, verificar si ya existe en inventario
            const { data: existing } = await supabase
              .from('inventory_items')
              .select('*')
              .eq('product_id', item.productId)
              .eq('store_id', input.storeId)
              .is('serial_number', null)
              .single();
            
            if (existing) {
              // Actualizar cantidad existente
              const { error: updateError } = await supabase
                .from('inventory_items')
                .update({ quantity: (existing.quantity || 0) + item.quantity })
                .eq('id', existing.id);
              
              if (updateError) throw new Error(updateError.message);
            } else {
              // Crear nuevo registro de inventario
              const { error: insertError } = await supabase
                .from('inventory_items')
                .insert({
                  product_id: item.productId,
                  store_id: input.storeId,
                  quantity: item.quantity,
                  status: 'DISPONIBLE',
                });
              
              if (insertError) throw new Error(insertError.message);
            }
          }
        }
        
        return order;
      }),
  }),

  // Módulo de Transferencias
  transfers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      isAuthenticated(ctx);
      const role = getUserRole(ctx);
      const userStoreId = getUserStoreId(ctx);

      let query = supabase
        .from('transfer_orders')
        .select('*, from_store:stores!from_store_id(*), to_store:stores!to_store_id(*)');
      
      // Store users solo ven transferencias de/hacia su tienda
      if (role === 'store_user' && userStoreId) {
        query = query.or(`from_store_id.eq.${userStoreId},to_store_id.eq.${userStoreId}`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        const { data, error } = await supabase
          .from('transfer_orders')
          .select('*, from_store:stores!from_store_id(*), to_store:stores!to_store_id(*), transfer_items(*, products(*))')
          .eq('id', input.id)
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    create: protectedProcedure
      .input(z.object({
        fromStoreId: z.string().uuid(),
        toStoreId: z.string().uuid(),
        items: z.array(z.object({
          productId: z.string().uuid(),
          serialNumber: z.string().optional(),
          quantity: z.number().int().positive(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canCreateTransfers');
        
        // Crear orden de transferencia
        const { data: order, error: orderError } = await supabase
          .from('transfer_orders')
          .insert({
            from_store_id: input.fromStoreId,
            to_store_id: input.toStoreId,
            status: 'PENDIENTE',
            created_by: ctx.user!.id,
          })
          .select()
          .single();
        
        if (orderError) throw new Error(orderError.message);
        
        // Agregar items de transferencia
        const transferItems = input.items.map(item => ({
          transfer_order_id: order.id,
          product_id: item.productId,
          serial_number: item.serialNumber,
          quantity: item.quantity,
          received_quantity: 0,
        }));
        
        const { error: itemsError } = await supabase
          .from('transfer_items')
          .insert(transferItems);
        
        if (itemsError) throw new Error(itemsError.message);
        
        return order;
      }),

    receive: protectedProcedure
      .input(z.object({
        transferId: z.string().uuid(),
        items: z.array(z.object({
          itemId: z.string().uuid(),
          receivedQuantity: z.number().int().min(0),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canReceiveTransfers');
        
        // Actualizar cantidades recibidas
        for (const item of input.items) {
          const { error } = await supabase
            .from('transfer_items')
            .update({ received_quantity: item.receivedQuantity })
            .eq('id', item.itemId);
          
          if (error) throw new Error(error.message);
        }
        
        // Actualizar estado de la transferencia
        const { data, error } = await supabase
          .from('transfer_orders')
          .update({
            status: 'COMPLETADA',
            received_at: new Date().toISOString(),
            received_by: ctx.user!.id,
          })
          .eq('id', input.transferId)
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),
  }),

  // Módulo de Ventas
  sales: router({
    list: protectedProcedure
      .input(z.object({
        storeId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const role = getUserRole(ctx);
        const userStoreId = getUserStoreId(ctx);

        let query = supabase
          .from('sales')
          .select('*, stores(*)');
        
        // Store users solo ven ventas de su tienda
        if (role === 'store_user' && userStoreId) {
          query = query.eq('store_id', userStoreId);
        } else if (input.storeId) {
          query = query.eq('store_id', input.storeId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw new Error(error.message);
        return data || [];
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        const { data, error } = await supabase
          .from('sales')
          .select('*, stores(*), sale_items(*, products(*))')
          .eq('id', input.id)
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    create: protectedProcedure
      .input(z.object({
        storeId: z.string().uuid(),
        paymentPlan: z.enum(['CONTADO', 'MSI', 'PAYJOY']),
        msiMonths: z.number().int().optional(),
        discount: z.number().min(0).default(0),
        items: z.array(z.object({
          productId: z.string().uuid(),
          serialNumber: z.string().optional(),
          quantity: z.number().int().positive(),
          precioUnitario: z.number().positive(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canMakeSales');
        requireStoreAccess(ctx, input.storeId);
        
        const total = input.items.reduce((sum, item) => sum + (item.precioUnitario * item.quantity), 0) - input.discount;
        
        // Crear venta
        const { data: sale, error: saleError } = await supabase
          .from('sales')
          .insert({
            store_id: input.storeId,
            total,
            discount: input.discount,
            payment_plan: input.paymentPlan,
            msi_months: input.msiMonths,
            created_by: ctx.user!.id,
          })
          .select()
          .single();
        
        if (saleError) throw new Error(saleError.message);
        
        // Agregar items de venta
        const saleItems = input.items.map(item => ({
          sale_id: sale.id,
          product_id: item.productId,
          serial_number: item.serialNumber,
          quantity: item.quantity,
          precio_unitario: item.precioUnitario,
        }));
        
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);
        
        if (itemsError) throw new Error(itemsError.message);
        
        // Calcular y registrar comisión automáticamente con jerarquía: producto > categoría > vendedor
        let commissionRate: number | null = null;
        
        // 1. Intentar obtener comisión promedio de los productos vendidos
        for (const item of input.items) {
          const { data: product } = await supabase
            .from('products')
            .select('commission_rate, category_id')
            .eq('id', item.productId)
            .single();
          
          if (product?.commission_rate) {
            // Si el producto tiene comisión específica, usarla
            commissionRate = parseFloat(product.commission_rate);
            break;
          } else if (product?.category_id && !commissionRate) {
            // 2. Si no tiene comisión de producto, buscar comisión de categoría para este vendedor
            const { data: categoryRate } = await supabase
              .from('category_commission_rates')
              .select('commission_rate')
              .eq('category_id', product.category_id)
              .eq('user_id', ctx.user!.id)
              .single();
            
            if (categoryRate) {
              commissionRate = parseFloat(categoryRate.commission_rate);
            }
          }
        }
        
        // 3. Si no se encontró comisión de producto ni categoría, usar comisión del vendedor
        if (!commissionRate) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('commission_rate')
            .eq('id', ctx.user!.id)
            .single();
          
          if (userProfile?.commission_rate) {
            commissionRate = parseFloat(userProfile.commission_rate);
          }
        }
        
        // Registrar comisión si se encontró una tasa
        if (commissionRate) {
          const commissionAmount = (total * commissionRate) / 100;
          
          // Obtener período actual (YYYY-MM)
          const now = new Date();
          const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          
          await supabase
            .from('commissions')
            .insert({
              id: crypto.randomUUID(),
              user_id: ctx.user!.id,
              sale_id: sale.id,
              sale_amount: total,
              commission_rate: commissionRate,
              commission_amount: commissionAmount,
              is_paid: false,
              period,
            });
        }
        
        // Actualizar stock automáticamente y registrar movimientos
        for (const item of input.items) {
          // Reducir stock_actual
          const { data: product } = await supabase
            .from('products')
            .select('stock_actual, stock_minimo')
            .eq('id', item.productId)
            .single();
          
          if (product) {
            const newStock = (product.stock_actual || 0) - item.quantity;
            
            await supabase
              .from('products')
              .update({ stock_actual: newStock })
              .eq('id', item.productId);
            
            // Registrar movimiento de venta
            await supabase
              .from('product_movements')
              .insert({
                product_id: item.productId,
                movement_type: 'VENTA',
                quantity: item.quantity,
                reference_id: sale.id,
                reference_type: 'sale',
                user_id: ctx.user!.id,
              });
            
            // Verificar si se debe crear alerta de stock bajo
            if (newStock <= (product.stock_minimo || 0)) {
              // Verificar si ya existe una alerta activa
              const { data: existingAlert } = await supabase
                .from('stock_alerts')
                .select('id')
                .eq('product_id', item.productId)
                .eq('is_resolved', false)
                .single();
              
              if (!existingAlert) {
                // Crear nueva alerta
                await supabase
                  .from('stock_alerts')
                  .insert({
                    product_id: item.productId,
                    alert_type: 'LOW_STOCK',
                    stock_actual: newStock,
                    stock_minimo: product.stock_minimo || 0,
                  });
                
                // Obtener info del producto para notificación
                const { data: productInfo } = await supabase
                  .from('products')
                  .select('name')
                  .eq('id', item.productId)
                  .single();
                
                // Enviar notificación al propietario
                if (productInfo) {
                  try {
                    await notifyOwner({
                      title: `⚠️ Stock Bajo: ${productInfo.name}`,
                      content: `El producto "${productInfo.name}" tiene stock bajo después de una venta.\n\nStock actual: ${newStock}\nStock mínimo: ${product.stock_minimo || 0}\n\nEs necesario reabastecer.`,
                    });
                  } catch (notifyError) {
                    console.error('Error enviando notificación:', notifyError);
                  }
                }
              }
            }
          }
        }
        
        return sale;
      }),
  }),

  // Módulo de Cortes Diarios
  cashouts: router({
    list: protectedProcedure
      .input(z.object({
        storeId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const role = getUserRole(ctx);
        const userStoreId = getUserStoreId(ctx);

        let query = supabase
          .from('daily_cashouts')
          .select('*, stores(*)');
        
        // Store users solo ven cortes de su tienda
        if (role === 'store_user' && userStoreId) {
          query = query.eq('store_id', userStoreId);
        } else if (input.storeId) {
          query = query.eq('store_id', input.storeId);
        }
        
        const { data, error } = await query.order('date', { ascending: false });
        
        if (error) throw new Error(error.message);
        return data || [];
      }),

    create: protectedProcedure
      .input(z.object({
        storeId: z.string().uuid(),
        date: z.string(),
        totalCash: z.number().min(0),
        totalCard: z.number().min(0),
        totalTransfer: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        requireStoreAccess(ctx, input.storeId);
        
        const total = input.totalCash + input.totalCard + input.totalTransfer;
        
        const { data, error } = await supabase
          .from('daily_cashouts')
          .insert({
            store_id: input.storeId,
            date: input.date,
            total_cash: input.totalCash,
            total_card: input.totalCard,
            total_transfer: input.totalTransfer,
            total,
            created_by: ctx.user!.id,
            is_closed: false,
          })
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    close: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        isAdminOrAbove(ctx);
        
        const { data, error } = await supabase
          .from('daily_cashouts')
          .update({ is_closed: true })
          .eq('id', input.id)
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
       }),
  }),

  // Módulo de Reportes
  reports: router({
    summary: protectedProcedure
      .input(z.object({ storeId: z.string().uuid().optional() }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        let salesQuery = supabase
          .from('sales')
          .select('total, created_at');
        
        if (input.storeId) {
          salesQuery = salesQuery.eq('store_id', input.storeId);
        }
        
        const { data: sales, error } = await salesQuery;
        if (error) throw new Error(error.message);
        
        const totalSales = sales?.reduce((sum, s) => sum + (s.total || 0), 0) || 0;
        const transactions = sales?.length || 0;
        const avgTicket = transactions > 0 ? totalSales / transactions : 0;
        
        return {
          totalSales,
          transactions,
          avgTicket,
          productsSold: 0, // TODO: calcular desde sale_items
          salesGrowth: 0, // TODO: calcular vs período anterior
        };
      }),

    salesByPeriod: protectedProcedure
      .input(z.object({ 
        period: z.enum(['day', 'week', 'month']),
        storeId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        // Simplificado: retornar datos mock por ahora
        // TODO: implementar agregación real por período
        return [
          { period: 'Ene', sales: 12000 },
          { period: 'Feb', sales: 15000 },
          { period: 'Mar', sales: 18000 },
          { period: 'Abr', sales: 16000 },
          { period: 'May', sales: 20000 },
        ];
      }),

    topProducts: protectedProcedure
      .input(z.object({ 
        limit: z.number().default(10),
        storeId: z.string().uuid().optional(),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        // Simplificado: retornar datos mock por ahora
        // TODO: implementar agregación real desde sale_items
        return [
          { name: 'iPhone 15 Pro', quantity: 45 },
          { name: 'Samsung S24', quantity: 38 },
          { name: 'Xiaomi 13', quantity: 32 },
          { name: 'Moto G84', quantity: 28 },
          { name: 'iPhone 14', quantity: 25 },
        ];
      }),

    storePerformance: protectedProcedure
      .query(async ({ ctx }) => {
        isAuthenticated(ctx);
        
        const { data: stores, error: storesError } = await supabase
          .from('stores')
          .select('id, name');
        
        if (storesError) throw new Error(storesError.message);
        
        const performance = await Promise.all(
          (stores || []).map(async (store) => {
            const { data: sales } = await supabase
              .from('sales')
              .select('total')
              .eq('store_id', store.id);
            
            const totalSales = sales?.reduce((sum, s) => sum + (s.total || 0), 0) || 0;
            const transactions = sales?.length || 0;
            
            return {
              store: store.name,
              sales: totalSales,
              transactions,
            };
          })
        );
        
        return performance;
      }),

    // Reporte de rotación de inventario
    inventoryRotation: protectedProcedure
      .input(z.object({
        storeId: z.string().uuid().optional(),
        days: z.number().default(30),
        page: z.number().default(1),
        pageSize: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        // Obtener productos con ventas en el período
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);
        
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, name, brand, model, stock_actual, stock_minimo')
          .eq('is_active', true);
        
        if (productsError) throw new Error(productsError.message);
        
        const rotation = await Promise.all(
          (products || []).map(async (product) => {
            // Obtener ventas del producto en el período
            const { data: saleItems } = await supabase
              .from('sale_items')
              .select('quantity, sales!inner(created_at)')
              .eq('product_id', product.id)
              .gte('sales.created_at', startDate.toISOString());
            
            const totalSold = saleItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            const avgStock = (product.stock_actual || 0) + (totalSold / 2); // Aproximación
            const rotationRate = avgStock > 0 ? (totalSold / avgStock) * (365 / input.days) : 0;
            const daysInInventory = rotationRate > 0 ? 365 / rotationRate : 0;
            
            let category = 'BAJA';
            if (rotationRate > 12) category = 'ALTA';
            else if (rotationRate > 4) category = 'MEDIA';
            
            return {
              product: product.name,
              brand: product.brand,
              model: product.model,
              stockActual: product.stock_actual || 0,
              stockMinimo: product.stock_minimo || 0,
              totalSold,
              rotationRate: parseFloat(rotationRate.toFixed(2)),
              daysInInventory: Math.round(daysInInventory),
              category,
            };
          })
        );
        
        // Ordenar por rotación descendente
        const sorted = rotation.sort((a, b) => b.rotationRate - a.rotationRate);
        
        // Aplicar paginación
        const total = sorted.length;
        const totalPages = Math.ceil(total / input.pageSize);
        const start = (input.page - 1) * input.pageSize;
        const end = start + input.pageSize;
        const data = sorted.slice(start, end);
        
        return {
          data,
          pagination: {
            page: input.page,
            pageSize: input.pageSize,
            total,
            totalPages,
          },
        };
      }),

    // Análisis de alertas frecuentes
    frequentAlerts: protectedProcedure
      .input(z.object({
        days: z.number().default(90),
        minAlerts: z.number().default(2),
        page: z.number().default(1),
        pageSize: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);
        
        // Obtener alertas del período
        const { data: alerts, error: alertsError } = await supabase
          .from('stock_alerts')
          .select('product_id, created_at, products(name, brand, model, stock_minimo)')
          .gte('created_at', startDate.toISOString());
        
        if (alertsError) throw new Error(alertsError.message);
        
        // Agrupar por producto y contar alertas
        const alertsByProduct = (alerts || []).reduce((acc: any, alert) => {
          const productId = alert.product_id;
          const productData = Array.isArray(alert.products) ? alert.products[0] : alert.products;
          if (!acc[productId]) {
            acc[productId] = {
              product: productData?.name || 'Desconocido',
              brand: productData?.brand || '',
              model: productData?.model || '',
              stockMinimo: productData?.stock_minimo || 0,
              alertCount: 0,
              lastAlert: alert.created_at,
            };
          }
          acc[productId].alertCount++;
          if (new Date(alert.created_at) > new Date(acc[productId].lastAlert)) {
            acc[productId].lastAlert = alert.created_at;
          }
          return acc;
        }, {});
        
        // Filtrar productos con mínimo de alertas y ordenar
        const frequentAlerts = Object.values(alertsByProduct)
          .filter((item: any) => item.alertCount >= input.minAlerts)
          .sort((a: any, b: any) => b.alertCount - a.alertCount);
        
        const enriched = frequentAlerts.map((item: any) => ({
          ...item,
          suggestedMinStock: Math.ceil(item.stockMinimo * 1.5), // Sugerencia: aumentar 50%
        }));
        
        // Aplicar paginación
        const total = enriched.length;
        const totalPages = Math.ceil(total / input.pageSize);
        const start = (input.page - 1) * input.pageSize;
        const end = start + input.pageSize;
        const data = enriched.slice(start, end);
        
        return {
          data,
          pagination: {
            page: input.page,
            pageSize: input.pageSize,
            total,
            totalPages,
          },
        };
      }),

    // Proyección de reabastecimiento
    restockProjection: protectedProcedure
      .input(z.object({
        productId: z.string().uuid().optional(),
        days: z.number().default(30),
        page: z.number().default(1),
        pageSize: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - input.days);
        
        let productsQuery = supabase
          .from('products')
          .select('id, name, brand, model, stock_actual, stock_minimo')
          .eq('is_active', true);
        
        if (input.productId) {
          productsQuery = productsQuery.eq('id', input.productId);
        }
        
        const { data: products, error: productsError } = await productsQuery;
        
        if (productsError) throw new Error(productsError.message);
        
        const projections = await Promise.all(
          (products || []).map(async (product) => {
            // Obtener ventas del período
            const { data: saleItems } = await supabase
              .from('sale_items')
              .select('quantity, sales!inner(created_at)')
              .eq('product_id', product.id)
              .gte('sales.created_at', startDate.toISOString());
            
            const totalSold = saleItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            const avgDailySales = totalSold / input.days;
            const daysUntilStockout = avgDailySales > 0 ? (product.stock_actual || 0) / avgDailySales : 999;
            
            // Calcular fecha estimada de agotamiento
            const stockoutDate = new Date();
            stockoutDate.setDate(stockoutDate.getDate() + Math.floor(daysUntilStockout));
            
            // Calcular cantidad sugerida (para 60 días de inventario)
            const suggestedQuantity = Math.max(
              Math.ceil(avgDailySales * 60),
              product.stock_minimo || 0
            );
            
            return {
              product: product.name,
              brand: product.brand,
              model: product.model,
              stockActual: product.stock_actual || 0,
              stockMinimo: product.stock_minimo || 0,
              avgDailySales: parseFloat(avgDailySales.toFixed(2)),
              daysUntilStockout: Math.round(daysUntilStockout),
              stockoutDate: daysUntilStockout < 999 ? stockoutDate.toISOString().split('T')[0] : 'N/A',
              suggestedQuantity,
              urgency: daysUntilStockout < 7 ? 'ALTA' : daysUntilStockout < 30 ? 'MEDIA' : 'BAJA',
            };
          })
        );
        
        // Ordenar por urgencia (días hasta agotamiento)
        const sorted = projections.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
        
        // Aplicar paginación
        const total = sorted.length;
        const totalPages = Math.ceil(total / input.pageSize);
        const start = (input.page - 1) * input.pageSize;
        const end = start + input.pageSize;
        const data = sorted.slice(start, end);
        
        return {
          data,
          pagination: {
            page: input.page,
            pageSize: input.pageSize,
            total,
            totalPages,
          },
        };
      }),
  }),

  // Módulo de Clientes
  customers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      isAuthenticated(ctx);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw new Error(error.message);
      return data || [];
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const id = crypto.randomUUID();
        
        const { data, error } = await supabase
          .from('customers')
          .insert({
            id,
            name: input.name,
            phone: input.phone || null,
            email: input.email || null,
            address: input.address || null,
            notes: input.notes || null,
          })
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        const { data, error } = await supabase
          .from('customers')
          .update({
            name: input.name,
            phone: input.phone || null,
            email: input.email || null,
            address: input.address || null,
            notes: input.notes || null,
          })
          .eq('id', input.id)
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),
  }),

  // Módulo de Comisiones
  commissions: router({
    list: protectedProcedure
      .input(z.object({
        userId: z.string().optional(),
        period: z.string().optional(),
        isPaid: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const role = getUserRole(ctx);
        
        let query = supabase
          .from('commissions')
          .select('*, profiles(name), sales(total)');
        
        // Store users solo ven sus propias comisiones
        if (role === 'store_user') {
          query = query.eq('user_id', ctx.user!.id);
        } else if (input.userId) {
          query = query.eq('user_id', input.userId);
        }
        
        if (input.period) {
          query = query.eq('period', input.period);
        }
        
        if (input.isPaid !== undefined) {
          query = query.eq('is_paid', input.isPaid);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw new Error(error.message);
        return data || [];
      }),

    summary: protectedProcedure
      .input(z.object({
        userId: z.string().optional(),
        period: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const role = getUserRole(ctx);
        const userId = role === 'store_user' ? ctx.user!.id : input.userId;
        
        let query = supabase
          .from('commissions')
          .select('commission_amount, is_paid');
        
        if (userId) {
          query = query.eq('user_id', userId);
        }
        
        if (input.period) {
          query = query.eq('period', input.period);
        }
        
        const { data, error } = await query;
        
        if (error) throw new Error(error.message);
        
        const total = data?.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0) || 0;
        const paid = data?.filter(c => c.is_paid).reduce((sum, c) => sum + Number(c.commission_amount || 0), 0) || 0;
        const pending = total - paid;
        
        return { total, paid, pending };
      }),


    exportPDF: protectedProcedure
      .input(z.object({
        userId: z.string().optional(),
        period: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const role = getUserRole(ctx);
        const userId = role === 'store_user' ? ctx.user!.id : input.userId;
        
        let query = supabase
          .from('commissions')
          .select('*, profiles(name, username)');
        
        if (userId) query = query.eq('user_id', userId);
        query = query.eq('period', input.period);
        
        const { data: commissions, error } = await query.order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        
        const total = commissions?.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0) || 0;
        const paid = commissions?.filter(c => c.is_paid).reduce((sum, c) => sum + Number(c.commission_amount || 0), 0) || 0;
        const pending = total - paid;
        
        let userName: string | undefined;
        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, username')
            .eq('id', userId)
            .single();
          userName = profile?.name || profile?.username;
        }
        
        const reportData = {
          period: input.period,
          userName,
          commissions: commissions?.map(c => ({
            id: c.id,
            user_name: (c.profiles as any)?.name || (c.profiles as any)?.username || 'N/A',
            sale_id: c.sale_id,
            sale_amount: Number(c.sale_amount),
            commission_rate: Number(c.commission_rate),
            commission_amount: Number(c.commission_amount),
            is_paid: c.is_paid,
            created_at: c.created_at,
          })) || [],
          summary: { total, paid, pending },
        };
        
        const pdfBuffer = await generateCommissionPDF(reportData);
        return {
          data: pdfBuffer.toString('base64'),
          filename: `comisiones_${input.period}${userName ? '_' + userName.replace(/\s+/g, '_') : ''}.pdf`,
        };
      }),

    exportExcel: protectedProcedure
      .input(z.object({
        userId: z.string().optional(),
        period: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const role = getUserRole(ctx);
        const userId = role === 'store_user' ? ctx.user!.id : input.userId;
        
        let query = supabase
          .from('commissions')
          .select('*, profiles(name, username)');
        
        if (userId) query = query.eq('user_id', userId);
        query = query.eq('period', input.period);
        
        const { data: commissions, error } = await query.order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        
        const total = commissions?.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0) || 0;
        const paid = commissions?.filter(c => c.is_paid).reduce((sum, c) => sum + Number(c.commission_amount || 0), 0) || 0;
        const pending = total - paid;
        
        let userName: string | undefined;
        if (userId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, username')
            .eq('id', userId)
            .single();
          userName = profile?.name || profile?.username;
        }
        
        const reportData = {
          period: input.period,
          userName,
          commissions: commissions?.map(c => ({
            id: c.id,
            user_name: (c.profiles as any)?.name || (c.profiles as any)?.username || 'N/A',
            sale_id: c.sale_id,
            sale_amount: Number(c.sale_amount),
            commission_rate: Number(c.commission_rate),
            commission_amount: Number(c.commission_amount),
            is_paid: c.is_paid,
            created_at: c.created_at,
          })) || [],
          summary: { total, paid, pending },
        };
        
        const excelBuffer = generateCommissionExcel(reportData);
        return {
          data: excelBuffer.toString('base64'),
          filename: `comisiones_${input.period}${userName ? '_' + userName.replace(/\s+/g, '_') : ''}.xlsx`,
        };
      }),
  }),

  // Módulo de Alertas de Stock
  stockAlerts: router({
    // Listar alertas activas
    list: protectedProcedure
      .input(z.object({
        resolvedOnly: z.boolean().default(false),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        
        let query = supabase
          .from('stock_alerts')
          .select('*, products(name, brand, model, imei, stock_actual, stock_minimo)')
          .order('created_at', { ascending: false })
          .limit(input.limit);
        
        if (!input.resolvedOnly) {
          query = query.eq('is_resolved', false);
        }
        
        const { data, error } = await query;
        
        if (error) throw new Error(error.message);
        return data || [];
      }),

    // Verificar y crear alertas para productos con stock bajo
    checkLowStock: protectedProcedure
      .mutation(async ({ ctx }) => {
        requirePermission(ctx, 'canManageProducts');
        
        // Buscar productos con stock bajo que no tengan alerta activa
        const { data: lowStockProducts, error: queryError } = await supabase
          .from('products')
          .select('id, name, stock_actual, stock_minimo')
          .filter('stock_actual', 'lte', 'stock_minimo')
          .eq('is_active', true);
        
        if (queryError) throw new Error(queryError.message);
        
        const alertsCreated = [];
        
        for (const product of lowStockProducts || []) {
          // Verificar si ya existe una alerta activa para este producto
          const { data: existingAlert } = await supabase
            .from('stock_alerts')
            .select('id')
            .eq('product_id', product.id)
            .eq('is_resolved', false)
            .single();
          
          if (!existingAlert) {
            // Crear nueva alerta
            const { data: newAlert, error: insertError } = await supabase
              .from('stock_alerts')
              .insert({
                product_id: product.id,
                alert_type: 'LOW_STOCK',
                stock_actual: product.stock_actual,
                stock_minimo: product.stock_minimo,
              })
              .select()
              .single();
            
            if (!insertError && newAlert) {
              alertsCreated.push(newAlert);
              
              // Enviar notificación al propietario
              try {
                await notifyOwner({
                  title: `⚠️ Stock Bajo: ${product.name}`,
                  content: `El producto "${product.name}" tiene stock bajo.\n\nStock actual: ${product.stock_actual}\nStock mínimo: ${product.stock_minimo}\n\nEs necesario reabastecer.`,
                });
              } catch (notifyError) {
                console.error('Error enviando notificación:', notifyError);
              }
            }
          }
        }
        
        return {
          alertsCreated: alertsCreated.length,
          lowStockProducts: lowStockProducts?.length || 0,
        };
      }),

    // Resolver alerta
    resolve: protectedProcedure
      .input(z.object({
        alertId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, 'canManageProducts');
        
        const { data, error } = await supabase
          .from('stock_alerts')
          .update({
            is_resolved: true,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', input.alertId)
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        return data;
      }),
  }),

  // Módulo de Categorías de Productos
  productCategories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      isAuthenticated(ctx);
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("name");
      if (error) throw new Error(error.message);
      return data || [];
    }),

    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, "canManageProducts");
        const id = crypto.randomUUID();
        const { data, error } = await supabase
          .from("product_categories")
          .insert({ id, name: input.name, description: input.description || null })
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }),

    update: protectedProcedure
      .input(z.object({ id: z.string().uuid(), name: z.string().min(1), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, "canManageProducts");
        const { data, error } = await supabase
          .from("product_categories")
          .update({ name: input.name, description: input.description || null })
          .eq("id", input.id)
          .select()
          .single();
        if (error) throw new Error(error.message);
        return data;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, "canManageProducts");
        const { error } = await supabase.from("product_categories").delete().eq("id", input.id);
        if (error) throw new Error(error.message);
        return { success: true };
      }),
  }),

  // Módulo de Comisiones por Categoría
  categoryCommissionRates: router({
    list: protectedProcedure
      .input(z.object({ categoryId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        isAuthenticated(ctx);
        const { data, error } = await supabase
          .from("category_commission_rates")
          .select("*, profiles(name, username)")
          .eq("category_id", input.categoryId)
          .order("created_at", { ascending: false });
        if (error) throw new Error(error.message);
        return data || [];
      }),

    set: protectedProcedure
      .input(z.object({ categoryId: z.string().uuid(), userId: z.string().uuid(), commissionRate: z.number().min(0).max(100) }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, "canManageProducts");
        const { data: existing } = await supabase
          .from("category_commission_rates")
          .select("id")
          .eq("category_id", input.categoryId)
          .eq("user_id", input.userId)
          .single();
        if (existing) {
          const { data, error } = await supabase
            .from("category_commission_rates")
            .update({ commission_rate: input.commissionRate })
            .eq("id", existing.id)
            .select()
            .single();
          if (error) throw new Error(error.message);
          return data;
        } else {
          const id = crypto.randomUUID();
          const { data, error } = await supabase
            .from("category_commission_rates")
            .insert({ id, category_id: input.categoryId, user_id: input.userId, commission_rate: input.commissionRate })
            .select()
            .single();
          if (error) throw new Error(error.message);
          return data;
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        requirePermission(ctx, "canManageProducts");
        const { error } = await supabase.from("category_commission_rates").delete().eq("id", input.id);
        if (error) throw new Error(error.message);
        return { success: true };
      }),
  }),

});
export type AppRouter = typeof appRouter;
