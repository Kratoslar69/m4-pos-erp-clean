import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tskihgbxsxkwvfmoiffs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTc1OTIsImV4cCI6MjA4NDc5MzU5Mn0.m00U2l-A1ZcbxqiWTdQAW1Wkf3wtDiWF5fL9lE9436w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para el schema baitinv
export type UserRole = 'superadmin' | 'admin' | 'store_user';
export type InventoryStatus = 'EN_ALMACEN' | 'EN_TRANSITO' | 'EN_TIENDA' | 'RESERVADO' | 'VENDIDO' | 'DEVUELTO' | 'MERMA';
export type ProductType = 'HANDSET' | 'SIM' | 'ACCESSORY';
export type PaymentPlan = 'CONTADO' | 'MSI' | 'PAYJOY';
export type TransferStatus = 'PENDIENTE' | 'EN_TRANSITO' | 'PARCIAL' | 'COMPLETADA';
export type EventType = 'COMPRA' | 'TRANSFERENCIA' | 'RECEPCION' | 'VENTA' | 'DEVOLUCION' | 'MERMA' | 'AJUSTE';

export interface Store {
  id: string;
  name: string;
  is_warehouse: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  store_id: string | null;
  role: UserRole;
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  type: ProductType;
  sku_code: string | null;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  cost_price: number | null;
  list_price: number | null;
  min_price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  serial_number: string;
  status: InventoryStatus;
  location_store_id: string;
  cost: number | null;
  reserved_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  store_id: string;
  user_id: string;
  payment_plan: PaymentPlan | null;
  msi_months: number | null;
  discount: number;
  subtotal: number;
  total: number;
  notes: string | null;
  created_at: string;
}
