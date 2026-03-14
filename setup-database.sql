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

CREATE TYPE baitinv.user_role AS ENUM ('superadmin', 'admin', 'store_user');
CREATE TYPE baitinv.inventory_status AS ENUM ('EN_ALMACEN', 'EN_TRANSITO', 'EN_TIENDA', 'RESERVADO', 'VENDIDO', 'DEVUELTO', 'MERMA');
CREATE TYPE baitinv.product_type AS ENUM ('HANDSET', 'SIM', 'ACCESSORY');
CREATE TYPE baitinv.payment_plan AS ENUM ('CONTADO', 'MSI', 'PAYJOY');
CREATE TYPE baitinv.transfer_status AS ENUM ('PENDIENTE', 'EN_TRANSITO', 'PARCIAL', 'COMPLETADA');
CREATE TYPE baitinv.event_type AS ENUM ('COMPRA', 'TRANSFERENCIA', 'RECEPCION', 'VENTA', 'DEVOLUCION', 'MERMA', 'AJUSTE');

-- ============================================
-- TABLAS
-- ============================================

-- Tabla de tiendas
CREATE TABLE baitinv.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_warehouse BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de perfiles de usuario (vinculada a auth.users)
CREATE TABLE baitinv.profiles (
    id UUID PRIMARY KEY,
    store_id UUID REFERENCES baitinv.stores(id),
    role baitinv.user_role NOT NULL,
    name TEXT,
    email VARCHAR(320),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de proveedores
CREATE TABLE baitinv.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact TEXT,
    phone VARCHAR(20),
    email VARCHAR(320),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de productos (catálogo)
CREATE TABLE baitinv.products (
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
CREATE TABLE baitinv.inventory_items (
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
CREATE TABLE baitinv.inventory_stock (
    product_id UUID NOT NULL REFERENCES baitinv.products(id),
    store_id UUID NOT NULL REFERENCES baitinv.stores(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (product_id, store_id)
);

-- Tabla de órdenes de compra
CREATE TABLE baitinv.purchase_orders (
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
CREATE TABLE baitinv.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES baitinv.purchase_orders(id),
    product_id UUID NOT NULL REFERENCES baitinv.products(id),
    serial_number VARCHAR(100),
    quantity INTEGER,
    unit_cost NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de órdenes de transferencia
CREATE TABLE baitinv.transfer_orders (
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
CREATE TABLE baitinv.transfer_items (
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
CREATE TABLE baitinv.sales (
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
CREATE TABLE baitinv.sale_items (
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
CREATE TABLE baitinv.pricing_plans (
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
CREATE TABLE baitinv.daily_cashouts (
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
CREATE TABLE baitinv.reservations (
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
CREATE TABLE baitinv.inventory_ledger (
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

CREATE INDEX idx_products_sku ON baitinv.products(sku_code);
CREATE INDEX idx_products_type ON baitinv.products(type);
CREATE INDEX idx_inventory_items_serial ON baitinv.inventory_items(serial_number);
CREATE INDEX idx_inventory_items_status ON baitinv.inventory_items(status);
CREATE INDEX idx_inventory_items_location ON baitinv.inventory_items(location_store_id);
CREATE INDEX idx_purchase_orders_created_at ON baitinv.purchase_orders(created_at);
CREATE INDEX idx_transfer_orders_destination ON baitinv.transfer_orders(destination_store_id);
CREATE INDEX idx_transfer_orders_status ON baitinv.transfer_orders(status);
CREATE INDEX idx_sales_store ON baitinv.sales(store_id);
CREATE INDEX idx_sales_created_at ON baitinv.sales(created_at);
CREATE INDEX idx_pricing_plans_product_plan ON baitinv.pricing_plans(product_id, payment_plan);
CREATE INDEX idx_daily_cashouts_store ON baitinv.daily_cashouts(store_id);
CREATE INDEX idx_daily_cashouts_created_at ON baitinv.daily_cashouts(created_at);
CREATE INDEX idx_reservations_expires_at ON baitinv.reservations(expires_at);
CREATE INDEX idx_reservations_is_active ON baitinv.reservations(is_active);
CREATE INDEX idx_inventory_ledger_event_type ON baitinv.inventory_ledger(event_type);
CREATE INDEX idx_inventory_ledger_created_at ON baitinv.inventory_ledger(created_at);
CREATE INDEX idx_inventory_ledger_store ON baitinv.inventory_ledger(store_id);

-- ============================================
-- DATOS SEED
-- ============================================

-- Insertar almacén central y 4 tiendas
INSERT INTO baitinv.stores (name, is_warehouse) VALUES ('CENTRAL', true);
INSERT INTO baitinv.stores (name) VALUES ('BAIT M4 PENSIONES');
INSERT INTO baitinv.stores (name) VALUES ('BAIT M4 PROGRESO');
INSERT INTO baitinv.stores (name) VALUES ('BAIT M4 PLAZA DORADA');
INSERT INTO baitinv.stores (name) VALUES ('BAIT M4 TICUL');

-- ============================================
-- RLS (Row Level Security) - POLÍTICAS
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE baitinv.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.transfer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.daily_cashouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE baitinv.inventory_ledger ENABLE ROW LEVEL SECURITY;

-- Políticas para superadmin (acceso total)
CREATE POLICY "superadmin_all_stores" ON baitinv.stores FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_profiles" ON baitinv.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_suppliers" ON baitinv.suppliers FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_products" ON baitinv.products FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_inventory_items" ON baitinv.inventory_items FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_inventory_stock" ON baitinv.inventory_stock FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_purchase_orders" ON baitinv.purchase_orders FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_purchase_items" ON baitinv.purchase_items FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_transfer_orders" ON baitinv.transfer_orders FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_transfer_items" ON baitinv.transfer_items FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_sales" ON baitinv.sales FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_sale_items" ON baitinv.sale_items FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_pricing_plans" ON baitinv.pricing_plans FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_daily_cashouts" ON baitinv.daily_cashouts FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_reservations" ON baitinv.reservations FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

CREATE POLICY "superadmin_all_inventory_ledger" ON baitinv.inventory_ledger FOR ALL USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'superadmin')
);

-- Políticas para store_user (solo su tienda)
CREATE POLICY "store_user_read_own_store" ON baitinv.stores FOR SELECT USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = baitinv.stores.id)
);

CREATE POLICY "store_user_read_own_profile" ON baitinv.profiles FOR SELECT USING (
    id = auth.uid()
);

CREATE POLICY "store_user_read_products" ON baitinv.products FOR SELECT USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'store_user')
);

CREATE POLICY "store_user_read_own_inventory_items" ON baitinv.inventory_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = location_store_id)
);

CREATE POLICY "store_user_read_own_inventory_stock" ON baitinv.inventory_stock FOR SELECT USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = baitinv.inventory_stock.store_id)
);

CREATE POLICY "store_user_read_own_transfer_orders" ON baitinv.transfer_orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = destination_store_id)
);

CREATE POLICY "store_user_update_own_transfer_orders" ON baitinv.transfer_orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = destination_store_id)
);

CREATE POLICY "store_user_read_own_sales" ON baitinv.sales FOR SELECT USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = baitinv.sales.store_id)
);

CREATE POLICY "store_user_insert_own_sales" ON baitinv.sales FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = baitinv.sales.store_id)
);

CREATE POLICY "store_user_read_pricing_plans" ON baitinv.pricing_plans FOR SELECT USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND role = 'store_user')
);

CREATE POLICY "store_user_read_own_daily_cashouts" ON baitinv.daily_cashouts FOR SELECT USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = baitinv.daily_cashouts.store_id)
);

CREATE POLICY "store_user_insert_own_daily_cashouts" ON baitinv.daily_cashouts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = baitinv.daily_cashouts.store_id)
);

CREATE POLICY "store_user_read_own_reservations" ON baitinv.reservations FOR SELECT USING (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = baitinv.reservations.store_id)
);

CREATE POLICY "store_user_insert_own_reservations" ON baitinv.reservations FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM baitinv.profiles WHERE id = auth.uid() AND store_id = baitinv.reservations.store_id)
);

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
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON baitinv.stores
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON baitinv.profiles
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON baitinv.products
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON baitinv.inventory_items
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

CREATE TRIGGER update_inventory_stock_updated_at BEFORE UPDATE ON baitinv.inventory_stock
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON baitinv.pricing_plans
    FOR EACH ROW EXECUTE FUNCTION baitinv.update_updated_at_column();

-- ============================================
-- COMPLETADO
-- ============================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos M4 POS/ERP creada exitosamente en schema baitinv';
END $$;
