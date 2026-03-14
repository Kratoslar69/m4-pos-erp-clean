import { supabase } from './db';

export interface HandsetRow {
  MARCA: string;
  SUBMODELO: string;
  IMEI: string | number;
  'NOM MODELO': string;
  COLOR: string;
  'RAM GB': number;
  'MEMORIA GB': number;
  'es PayJoy?': string;
  Costo: number;
  'Precio Contado': number;
  'Precio PayJoy c/3M': string | number;
  'Precio PayJoy c/6M': string | number;
}

export interface ProcessedHandset {
  type: 'HANDSET';
  brand: string;
  model: string;
  imei: string;
  model_nomenclature: string;
  color: string;
  ram_capacity: number;
  storage_capacity: number;
  purchase_price: number;
  sale_price: number;
  payjoy_price: number | null;
  commission_rate: number | null;
  image_url: string | null;
  is_active: boolean;
}

export function processHandsetRow(row: HandsetRow, imageUrl?: string): ProcessedHandset {
  // Convertir IMEI a string
  const imei = String(row.IMEI).trim();
  
  // Determinar precio PayJoy (priorizar 6M, luego 3M)
  let payjoyPrice: number | null = null;
  const payjoy6M = row['Precio PayJoy c/6M'];
  const payjoy3M = row['Precio PayJoy c/3M'];
  
  if (typeof payjoy6M === 'number' && payjoy6M > 0) {
    payjoyPrice = payjoy6M;
  } else if (typeof payjoy3M === 'number' && payjoy3M > 0) {
    payjoyPrice = payjoy3M;
  }
  
  return {
    type: 'HANDSET',
    brand: row.MARCA?.trim() || '',
    model: row.SUBMODELO?.trim() || '',
    imei: imei,
    model_nomenclature: row['NOM MODELO']?.trim() || '',
    color: row.COLOR?.trim() || '',
    ram_capacity: Number(row['RAM GB']) || 0,
    storage_capacity: Number(row['MEMORIA GB']) || 0,
    purchase_price: Number(row.Costo) || 0,
    sale_price: Number(row['Precio Contado']) || 0,
    payjoy_price: payjoyPrice,
    commission_rate: null, // Se puede calcular después
    image_url: imageUrl || null,
    is_active: true,
  };
}

export async function bulkInsertHandsets(handsets: ProcessedHandset[]): Promise<{
  success: number;
  failed: number;
  errors: Array<{ imei: string; error: string }>;
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ imei: string; error: string }>,
  };

  // Supabase tiene límite de 1000 registros por inserción
  const BATCH_SIZE = 1000;
  
  for (let i = 0; i < handsets.length; i += BATCH_SIZE) {
    const batch = handsets.slice(i, i + BATCH_SIZE);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select();
      
      if (error) {
        // Si hay error, intentar insertar uno por uno para identificar duplicados
        for (const handset of batch) {
          try {
            const { error: singleError } = await supabase
              .from('products')
              .insert(handset);
            
            if (singleError) {
              results.failed++;
              results.errors.push({
                imei: handset.imei,
                error: singleError.message,
              });
            } else {
              results.success++;
            }
          } catch (err) {
            results.failed++;
            results.errors.push({
              imei: handset.imei,
              error: err instanceof Error ? err.message : 'Error desconocido',
            });
          }
        }
      } else {
        results.success += data?.length || 0;
      }
    } catch (err) {
      // Si falla el batch completo, intentar uno por uno
      for (const handset of batch) {
        try {
          const { error: singleError } = await supabase
            .from('products')
            .insert(handset);
          
          if (singleError) {
            results.failed++;
            results.errors.push({
              imei: handset.imei,
              error: singleError.message,
            });
          } else {
            results.success++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({
            imei: handset.imei,
            error: err instanceof Error ? err.message : 'Error desconocido',
          });
        }
      }
    }
  }
  
  return results;
}

export async function checkDuplicateIMEIs(imeis: string[]): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('imei')
    .in('imei', imeis);
  
  if (error) {
    console.error('Error checking duplicate IMEIs:', error);
    return [];
  }
  
  return data?.map(p => p.imei).filter(Boolean) || [];
}
