/**
 * Tipos específicos del sistema M4 POS/ERP
 */

// Roles de usuario
export type UserRole = 'superadmin' | 'admin' | 'store_user';

// Estados de inventario
export type InventoryStatus = 
  | 'EN_ALMACEN'
  | 'EN_TRANSITO'
  | 'EN_TIENDA'
  | 'RESERVADO'
  | 'VENDIDO'
  | 'DEVUELTO'
  | 'MERMA';

// Tipos de producto
export type ProductType = 'HANDSET' | 'SIM' | 'ACCESSORY';

// Planes de pago
export type PaymentPlan = 'CONTADO' | 'MSI' | 'PAYJOY';

// Estados de transferencia
export type TransferStatus = 'PENDIENTE' | 'EN_TRANSITO' | 'PARCIAL' | 'COMPLETADA';

// Tipos de eventos en el ledger
export type EventType = 
  | 'COMPRA'
  | 'TRANSFERENCIA'
  | 'RECEPCION'
  | 'VENTA'
  | 'DEVOLUCION'
  | 'MERMA'
  | 'AJUSTE';

// Permisos por rol
export const ROLE_PERMISSIONS = {
  superadmin: {
    canManageStores: true,
    canManageProducts: true,
    canManageSuppliers: true,
    canViewAllStores: true,
    canViewCosts: true,
    canCreatePurchases: true,
    canCreateTransfers: true,
    canReceiveTransfers: true,
    canMakeSales: true,
    canViewReports: true,
    canManageUsers: true,
    canAdjustInventory: true,
    maxDiscountPercent: 100,
  },
  admin: {
    canManageStores: false,
    canManageProducts: true,
    canManageSuppliers: true,
    canViewAllStores: true,
    canViewCosts: false,
    canCreatePurchases: true,
    canCreateTransfers: true,
    canReceiveTransfers: true,
    canMakeSales: true,
    canViewReports: true,
    canManageUsers: false,
    canAdjustInventory: false,
    maxDiscountPercent: 20,
  },
  store_user: {
    canManageStores: false,
    canManageProducts: false,
    canManageSuppliers: false,
    canViewAllStores: false,
    canViewCosts: false,
    canCreatePurchases: false,
    canCreateTransfers: false,
    canReceiveTransfers: true,
    canMakeSales: true,
    canViewReports: false,
    canManageUsers: false,
    canAdjustInventory: false,
    maxDiscountPercent: 10,
  },
} as const;

// Helper para verificar permisos
export function hasPermission(
  role: UserRole,
  permission: keyof typeof ROLE_PERMISSIONS.superadmin
): boolean {
  return ROLE_PERMISSIONS[role][permission] as boolean;
}

// Helper para obtener descuento máximo
export function getMaxDiscount(role: UserRole): number {
  return ROLE_PERMISSIONS[role].maxDiscountPercent;
}

// Helper para verificar si el usuario puede acceder a una tienda
export function canAccessStore(
  role: UserRole,
  userStoreId: string | null,
  targetStoreId: string
): boolean {
  // Superadmin y admin pueden ver todas las tiendas
  if (role === 'superadmin' || role === 'admin') {
    return true;
  }
  
  // Store user solo puede ver su propia tienda
  return userStoreId === targetStoreId;
}
