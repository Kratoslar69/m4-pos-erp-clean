import { mysqlTable, varchar, text, boolean, int, timestamp, decimal, mysqlEnum, index, serial, primaryKey } from "drizzle-orm/mysql-core";

// Enums
export const userRoleEnum = mysqlEnum("user_role", ["superadmin", "admin", "store_user"]);
export const inventoryStatusEnum = mysqlEnum("inventory_status", [
  "EN_ALMACEN",
  "EN_TRANSITO",
  "EN_TIENDA",
  "RESERVADO",
  "VENDIDO",
  "DEVUELTO",
  "MERMA",
]);
export const productTypeEnum = mysqlEnum("product_type", ["HANDSET", "SIM", "ACCESSORY"]);
export const paymentPlanEnum = mysqlEnum("payment_plan", ["CONTADO", "MSI", "PAYJOY"]);
export const transferStatusEnum = mysqlEnum("transfer_status", ["PENDIENTE", "EN_TRANSITO", "PARCIAL", "COMPLETADA"]);
export const eventTypeEnum = mysqlEnum("event_type", [
  "COMPRA",
  "TRANSFERENCIA",
  "RECEPCION",
  "VENTA",
  "DEVOLUCION",
  "MERMA",
  "AJUSTE",
]);

// Tabla de tiendas
export const stores = mysqlTable("stores", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  isWarehouse: boolean("is_warehouse").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("stores_name_idx").on(table.name),
}));

// Tabla de perfiles de usuario
export const profiles = mysqlTable("profiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  username: varchar("username", { length: 50 }).unique(),
  passwordHash: text("password_hash"),
  storeId: varchar("store_id", { length: 36 }).references(() => stores.id),
  role: userRoleEnum.notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  storeIdx: index("profiles_store_idx").on(table.storeId),
  roleIdx: index("profiles_role_idx").on(table.role),
  usernameIdx: index("profiles_username_idx").on(table.username),
}));

// Tabla de proveedores
export const suppliers = mysqlTable("suppliers", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla de productos (catálogo)
export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: productTypeEnum.notNull(),
  
  // Campos para EQUIPOS (HANDSET)
  brand: text("brand"), // Marca
  model: text("model"), // Modelo
  imei: varchar("imei", { length: 20 }).unique(), // IMEI del equipo
  modelNomenclature: text("model_nomenclature"), // Nomenclatura del modelo
  color: text("color"), // Color
  ramCapacity: int("ram_capacity"), // Capacidad de RAM en GB
  storageCapacity: int("storage_capacity"), // Capacidad de Memoria en GB
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }), // Costo
  profitPercentage: decimal("profit_percentage", { precision: 5, scale: 2 }), // %Utilidad
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }), // Precio Contado
  payjoyProfit: decimal("payjoy_profit", { precision: 10, scale: 2 }), // Utilidad PayJoy
  isOffer: boolean("is_offer").default(false), // Oferta
  offerDiscount: decimal("offer_discount", { precision: 10, scale: 2 }), // Des x Oferta
  payjoyPrice3m: decimal("payjoy_price_3m", { precision: 10, scale: 2 }), // Precio PayJoy c/3M
  baitCost3m: decimal("bait_cost_3m", { precision: 10, scale: 2 }), // Costo Bait 3M
  baitCommission3m: decimal("bait_commission_3m", { precision: 10, scale: 2 }), // Comision Bait 3M
  payjoyPrice6m: decimal("payjoy_price_6m", { precision: 10, scale: 2 }), // Precio PayJoy c/6M
  baitCost6m: decimal("bait_cost_6m", { precision: 10, scale: 2 }), // Costo Bait 6M
  baitCommission6m: decimal("bait_commission_6m", { precision: 10, scale: 2 }), // Comision Bait 6M
  
  // Campos para SIM
  iccid: varchar("iccid", { length: 25 }).unique(), // ICCID de la SIM
  carrier: text("carrier"), // Telefonía (operador)
  package: text("package"), // Paquete
  
  // Campos comunes
  imageUrl: text("image_url"), // URL de la imagen del producto
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }), // % Comisión del vendedor
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("products_type_idx").on(table.type),
  imeiIdx: index("products_imei_idx").on(table.imei),
  iccidIdx: index("products_iccid_idx").on(table.iccid),
  brandIdx: index("products_brand_idx").on(table.brand),
  modelIdx: index("products_model_idx").on(table.model),
}));

// Tabla de items de inventario serializado (equipos y SIMs)
export const inventoryItems = mysqlTable("inventory_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().unique(),
  status: inventoryStatusEnum.notNull(),
  locationStoreId: varchar("location_store_id", { length: 36 }).notNull().references(() => stores.id),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  reservedUntil: timestamp("reserved_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  serialIdx: index("inventory_items_serial_idx").on(table.serialNumber),
  statusIdx: index("inventory_items_status_idx").on(table.status),
  locationIdx: index("inventory_items_location_idx").on(table.locationStoreId),
}));

// Tabla de stock de accesorios (por SKU y tienda)
export const inventoryStock = mysqlTable("inventory_stock", {
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  storeId: varchar("store_id", { length: 36 }).notNull().references(() => stores.id),
  quantity: int("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.storeId] }),
}));

// Tabla de órdenes de compra
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  supplierId: varchar("supplier_id", { length: 36 }).references(() => suppliers.id),
  invoiceFolio: text("invoice_folio"),
  notes: text("notes"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  createdBy: varchar("created_by", { length: 64 }).notNull().references(() => profiles.id),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index("purchase_orders_created_at_idx").on(table.createdAt),
}));

// Tabla de items de compra
export const purchaseItems = mysqlTable("purchase_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  purchaseOrderId: varchar("purchase_order_id", { length: 36 }).notNull().references(() => purchaseOrders.id),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  serialNumber: varchar("serial_number", { length: 100 }),
  quantity: int("quantity"),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla de órdenes de transferencia
export const transferOrders = mysqlTable("transfer_orders", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  originStoreId: varchar("origin_store_id", { length: 36 }).notNull().references(() => stores.id),
  destinationStoreId: varchar("destination_store_id", { length: 36 }).notNull().references(() => stores.id),
  status: transferStatusEnum.notNull().default("PENDIENTE"),
  notes: text("notes"),
  createdBy: varchar("created_by", { length: 64 }).notNull().references(() => profiles.id),
  receivedBy: varchar("received_by", { length: 64 }).references(() => profiles.id),
  receivedAt: timestamp("received_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  destinationIdx: index("transfer_orders_destination_idx").on(table.destinationStoreId),
  statusIdx: index("transfer_orders_status_idx").on(table.status),
}));

// Tabla de items de transferencia
export const transferItems = mysqlTable("transfer_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  transferOrderId: varchar("transfer_order_id", { length: 36 }).notNull().references(() => transferOrders.id),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  inventoryItemId: varchar("inventory_item_id", { length: 36 }).references(() => inventoryItems.id),
  quantity: int("quantity"),
  receivedQuantity: int("received_quantity"),
  notes: text("notes"),
  evidenceUrl: text("evidence_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla de ventas
export const sales = mysqlTable("sales", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  storeId: varchar("store_id", { length: 36 }).notNull().references(() => stores.id),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => profiles.id),
  customerId: varchar("customer_id", { length: 36 }).references(() => customers.id),
  paymentPlan: paymentPlanEnum,
  msiMonths: int("msi_months"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  storeIdx: index("sales_store_idx").on(table.storeId),
  createdAtIdx: index("sales_created_at_idx").on(table.createdAt),
}));

// Tabla de items de venta
export const saleItems = mysqlTable("sale_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  saleId: varchar("sale_id", { length: 36 }).notNull().references(() => sales.id),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  inventoryItemId: varchar("inventory_item_id", { length: 36 }).references(() => inventoryItems.id),
  quantity: int("quantity"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla de precios por plan
export const pricingPlans = mysqlTable("pricing_plans", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  paymentPlan: paymentPlanEnum.notNull(),
  msiMonths: int("msi_months"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productPlanIdx: index("pricing_plans_product_plan_idx").on(table.productId, table.paymentPlan),
}));

// Tabla de cortes diarios
export const dailyCashouts = mysqlTable("daily_cashouts", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  storeId: varchar("store_id", { length: 36 }).notNull().references(() => stores.id),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => profiles.id),
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).default("0"),
  cardAmount: decimal("card_amount", { precision: 10, scale: 2 }).default("0"),
  transferAmount: decimal("transfer_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  isClosed: boolean("is_closed").notNull().default(false),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  storeIdx: index("daily_cashouts_store_idx").on(table.storeId),
  createdAtIdx: index("daily_cashouts_created_at_idx").on(table.createdAt),
}));

// Tabla de clientes
export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  loyaltyPoints: int("loyalty_points").default(0),
  totalPurchases: decimal("total_purchases", { precision: 10, scale: 2 }).default("0"),
  lastPurchaseAt: timestamp("last_purchase_at"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  phoneIdx: index("customers_phone_idx").on(table.phone),
  emailIdx: index("customers_email_idx").on(table.email),
}));

// Tabla de comisiones
export const commissions = mysqlTable("commissions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => profiles.id),
  saleId: varchar("sale_id", { length: 36 }).notNull().references(() => sales.id),
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
  period: varchar("period", { length: 7 }).notNull(), // YYYY-MM
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("commissions_user_idx").on(table.userId),
  periodIdx: index("commissions_period_idx").on(table.period),
  isPaidIdx: index("commissions_is_paid_idx").on(table.isPaid),
}));

// Tabla de reservas
export const reservations = mysqlTable("reservations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  storeId: varchar("store_id", { length: 36 }).notNull().references(() => stores.id),
  userId: varchar("user_id", { length: 64 }).notNull().references(() => profiles.id),
  inventoryItemId: varchar("inventory_item_id", { length: 36 }).references(() => inventoryItems.id),
  productId: varchar("product_id", { length: 36 }).references(() => products.id),
  quantity: int("quantity"),
  customerName: text("customer_name").notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  expiresAtIdx: index("reservations_expires_at_idx").on(table.expiresAt),
  isActiveIdx: index("reservations_is_active_idx").on(table.isActive),
}));

// Tabla de auditoría (ledger)
export const inventoryLedger = mysqlTable("inventory_ledger", {
  id: int("id").primaryKey().autoincrement(),
  inventoryItemId: varchar("inventory_item_id", { length: 36 }).references(() => inventoryItems.id),
  productId: varchar("product_id", { length: 36 }).references(() => products.id),
  storeId: varchar("store_id", { length: 36 }).references(() => stores.id),
  quantityChange: int("quantity_change").notNull(),
  eventType: eventTypeEnum.notNull(),
  referenceId: varchar("reference_id", { length: 36 }),
  userId: varchar("user_id", { length: 64 }).references(() => profiles.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  eventTypeIdx: index("inventory_ledger_event_type_idx").on(table.eventType),
  createdAtIdx: index("inventory_ledger_created_at_idx").on(table.createdAt),
  storeIdx: index("inventory_ledger_store_idx").on(table.storeId),
}));

// Tipos exportados
export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;

export type InventoryStock = typeof inventoryStock.$inferSelect;
export type InsertInventoryStock = typeof inventoryStock.$inferInsert;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type InsertPurchaseItem = typeof purchaseItems.$inferInsert;

export type TransferOrder = typeof transferOrders.$inferSelect;
export type InsertTransferOrder = typeof transferOrders.$inferInsert;

export type TransferItem = typeof transferItems.$inferSelect;
export type InsertTransferItem = typeof transferItems.$inferInsert;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

export type SaleItem = typeof saleItems.$inferSelect;
export type InsertSaleItem = typeof saleItems.$inferInsert;

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = typeof pricingPlans.$inferInsert;

export type DailyCashout = typeof dailyCashouts.$inferSelect;
export type InsertDailyCashout = typeof dailyCashouts.$inferInsert;

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

export type InventoryLedger = typeof inventoryLedger.$inferSelect;
export type InsertInventoryLedger = typeof inventoryLedger.$inferInsert;
