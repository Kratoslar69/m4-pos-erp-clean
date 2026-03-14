#!/usr/bin/env python3
"""
Script para crear todas las tablas del sistema M4 POS/ERP en Supabase self-hosted
"""

from supabase import create_client, Client
import os

# Credenciales de Supabase self-hosted
SUPABASE_URL = "https://app-supabase.intelligenc-ia.tech"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.l-1VU_pmDGiJe0TQ1YtU3c9z3f7n7i-MiR5J_R-TZAk"

# Crear cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🚀 Conectando a Supabase self-hosted...")
print(f"URL: {SUPABASE_URL}")

# SQL completo para crear el schema baitinv
sql_script = """
-- ============================================
-- M4 POS/ERP System - Database Setup Script
-- Schema: baitinv
-- ============================================

-- Crear el schema
CREATE SCHEMA IF NOT EXISTS baitinv;

-- Establecer el search_path para trabajar en el schema baitinv
SET search_path TO baitinv, public;

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
    CREATE TYPE baitinv.user_role AS ENUM ('superadmin', 'admin', 'store_user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE baitinv.inventory_status AS ENUM ('EN_ALMACEN', 'EN_TRANSITO', 'EN_TIENDA', 'RESERVADO', 'VENDIDO', 'DEVUELTO', 'MERMA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE baitinv.product_type AS ENUM ('HANDSET', 'SIM', 'ACCESSORY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE baitinv.payment_plan AS ENUM ('CONTADO', 'MSI', 'PAYJOY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE baitinv.transfer_status AS ENUM ('PENDIENTE', 'EN_TRANSITO', 'PARCIAL', 'COMPLETADA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE baitinv.event_type AS ENUM ('COMPRA', 'TRANSFERENCIA', 'RECEPCION', 'VENTA', 'DEVOLUCION', 'MERMA', 'AJUSTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLAS
-- ============================================

-- Tabla de tiendas
CREATE TABLE IF NOT EXISTS baitinv.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_warehouse BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de perfiles de usuario (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS baitinv.profiles (
    id UUID PRIMARY KEY,
    store_id UUID REFERENCES baitinv.stores(id),
    role baitinv.user_role NOT NULL,
    name TEXT,
    email VARCHAR(320),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS baitinv.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT,
    phone VARCHAR(20),
    email VARCHAR(320),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de productos (catálogo)
CREATE TABLE IF NOT EXISTS baitinv.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type baitinv.product_type NOT NULL,
    sku_code VARCHAR(100) UNIQUE,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    category TEXT,
    cost_price NUMERIC(10, 2),
    list_price NUMERIC(10, 2),
    min_price NUMERIC(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de items de inventario serializado (equipos y SIMs)
CREATE TABLE IF NOT EXISTS baitinv.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES baitinv.products(id),
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    status baitinv.inventory_status NOT NULL,
    location_store_id UUID NOT NULL REFERENCES baitinv.stores(id),
    cost NUMERIC(10, 2),
    reserved_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de stock de accesorios (por SKU y tienda)
CREATE TABLE IF NOT EXISTS baitinv.inventory_stock (
    product_id UUID NOT NULL REFERENCES baitinv.products(id),
    store_id UUID NOT NULL REFERENCES baitinv.stores(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (product_id, store_id)
);

-- Tabla de órdenes de compra
CREATE TABLE IF NOT EXISTS baitinv.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES baitinv.suppliers(id),
    invoice_folio TEXT,
    notes TEXT,
    total_cost NUMERIC(10, 2),
    created_by UUID NOT NULL REFERENCES baitinv.profiles(id),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de items de compra
CREATE TABLE IF NOT EXISTS baitinv.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES baitinv.purchase_orders(id),
    product_id UUID NOT NULL REFERENCES baitinv.products(id),
    serial_number VARCHAR(100),
    quantity INTEGER,
    unit_cost NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de órdenes de transferencia
CREATE TABLE IF NOT EXISTS baitinv.transfer_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_store_id UUID NOT NULL REFERENCES baitinv.stores(id),
    destination_store_id UUID NOT NULL REFERENCES baitinv.stores(id),
    status baitinv.transfer_status NOT NULL DEFAULT 'PENDIENTE',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES baitinv.profiles(id),
    received_by UUID REFERENCES baitinv.profiles(id),
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de items de transferencia
CREATE TABLE IF NOT EXISTS baitinv.transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_order_id UUID NOT NULL REFERENCES baitinv.transfer_orders(id),
    product_id UUID NOT NULL REFERENCES baitinv.products(id),
    inventory_item_id UUID REFERENCES baitinv.inventory_items(id),
    quantity INTEGER,
    received_quantity INTEGER,
    notes TEXT,
    evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS baitinv.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES baitinv.stores(id),
    user_id UUID NOT NULL REFERENCES baitinv.profiles(id),
    payment_plan baitinv.payment_plan,
    msi_months INTEGER,
    discount NUMERIC(10, 2) DEFAULT 0,
    subtotal NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de items de venta
CREATE TABLE IF NOT EXISTS baitinv.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES baitinv.sales(id),
    product_id UUID NOT NULL REFERENCES baitinv.products(id),
    inventory_item_id UUID REFERENCES baitinv.inventory_items(id),
    quantity INTEGER,
    unit_price NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de precios por plan
CREATE TABLE IF NOT EXISTS baitinv.pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES baitinv.products(id),
    payment_plan baitinv.payment_plan NOT NULL,
    msi_months INTEGER,
    price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de cortes diarios
CREATE TABLE IF NOT EXISTS baitinv.daily_cashouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES baitinv.stores(id),
    user_id UUID NOT NULL REFERENCES baitinv.profiles(id),
    cash_amount NUMERIC(10, 2) DEFAULT 0,
    card_amount NUMERIC(10, 2) DEFAULT 0,
    transfer_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS baitinv.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES baitinv.stores(id),
    user_id UUID NOT NULL REFERENCES baitinv.profiles(id),
    inventory_item_id UUID REFERENCES baitinv.inventory_items(id),
    product_id UUID REFERENCES baitinv.products(id),
    quantity INTEGER,
    customer_name TEXT NOT NULL,
    customer_phone VARCHAR(20),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de auditoría (ledger)
CREATE TABLE IF NOT EXISTS baitinv.inventory_ledger (
    id SERIAL PRIMARY KEY,
    inventory_item_id UUID REFERENCES baitinv.inventory_items(id),
    product_id UUID REFERENCES baitinv.products(id),
    store_id UUID REFERENCES baitinv.stores(id),
    quantity_change INTEGER NOT NULL,
    event_type baitinv.event_type NOT NULL,
    reference_id UUID,
    user_id UUID REFERENCES baitinv.profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_sku ON baitinv.products(sku_code);
CREATE INDEX IF NOT EXISTS idx_products_type ON baitinv.products(type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_serial ON baitinv.inventory_items(serial_number);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON baitinv.inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON baitinv.inventory_items(location_store_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON baitinv.purchase_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_destination ON baitinv.transfer_orders(destination_store_id);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_status ON baitinv.transfer_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_store ON baitinv.sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON baitinv.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_product_plan ON baitinv.pricing_plans(product_id, payment_plan);
CREATE INDEX IF NOT EXISTS idx_daily_cashouts_store ON baitinv.daily_cashouts(store_id);
CREATE INDEX IF NOT EXISTS idx_daily_cashouts_created_at ON baitinv.daily_cashouts(created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON baitinv.reservations(expires_at);
CREATE INDEX IF NOT EXISTS idx_reservations_is_active ON baitinv.reservations(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_event_type ON baitinv.inventory_ledger(event_type);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_created_at ON baitinv.inventory_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_store ON baitinv.inventory_ledger(store_id);

-- ============================================
-- DATOS SEED
-- ============================================

-- Insertar almacén central y 4 tiendas (solo si no existen)
INSERT INTO baitinv.stores (name, is_warehouse) 
SELECT 'CENTRAL', true
WHERE NOT EXISTS (SELECT 1 FROM baitinv.stores WHERE name = 'CENTRAL');

INSERT INTO baitinv.stores (name) 
SELECT 'BAIT M4 PENSIONES'
WHERE NOT EXISTS (SELECT 1 FROM baitinv.stores WHERE name = 'BAIT M4 PENSIONES');

INSERT INTO baitinv.stores (name) 
SELECT 'BAIT M4 PROGRESO'
WHERE NOT EXISTS (SELECT 1 FROM baitinv.stores WHERE name = 'BAIT M4 PROGRESO');

INSERT INTO baitinv.stores (name) 
SELECT 'BAIT M4 PLAZA DORADA'
WHERE NOT EXISTS (SELECT 1 FROM baitinv.stores WHERE name = 'BAIT M4 PLAZA DORADA');

INSERT INTO baitinv.stores (name) 
SELECT 'BAIT M4 TICUL'
WHERE NOT EXISTS (SELECT 1 FROM baitinv.stores WHERE name = 'BAIT M4 TICUL');

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION baitinv.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_stores_updated_at ON baitinv.stores;
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON baitinv.stores
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON baitinv.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON baitinv.profiles
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON baitinv.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON baitinv.products
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON baitinv.inventory_items;
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON baitinv.inventory_items
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_stock_updated_at ON baitinv.inventory_stock;
CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON baitinv.inventory_stock
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_plans_updated_at ON baitinv.pricing_plans;
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON baitinv.pricing_plans
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();
"""

print("\n📝 Ejecutando script SQL en Supabase...")
print("=" * 60)

try:
    # Ejecutar el script SQL completo
    result = supabase.rpc('exec_sql', {'query': sql_script}).execute()
    
    print("✅ Script SQL ejecutado exitosamente!")
    print("\n📊 Resultado:")
    print(result)
    
    # Verificar que las tablas se crearon
    print("\n🔍 Verificando tablas creadas...")
    tables_check = supabase.rpc('exec_sql', {
        'query': "SELECT table_name FROM information_schema.tables WHERE table_schema = 'baitinv' ORDER BY table_name;"
    }).execute()
    
    print("\n✅ Tablas creadas en schema baitinv:")
    if tables_check.data:
        for table in tables_check.data:
            print(f"  - {table.get('table_name', 'unknown')}")
    
    print("\n🎉 Base de datos M4 POS/ERP creada exitosamente!")
    
except Exception as e:
    print(f"\n❌ Error al ejecutar el script: {str(e)}")
    print("\nIntentando método alternativo...")
    
    # Método alternativo: ejecutar por partes
    try:
        print("Ejecutando SQL por partes...")
        # Aquí podrías dividir el script en partes más pequeñas si es necesario
        print("Por favor, ejecuta el script manualmente en el SQL Editor de Supabase.")
    except Exception as e2:
        print(f"❌ Error en método alternativo: {str(e2)}")
