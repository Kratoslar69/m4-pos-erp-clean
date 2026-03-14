import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";
import { UserRole, hasPermission, canAccessStore } from "../shared/erp-types";

/**
 * Middleware para verificar que el usuario esté autenticado
 */
export function isAuthenticated(ctx: TrpcContext) {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Debes iniciar sesión para acceder a este recurso",
    });
  }
  return ctx;
}

/**
 * Middleware para verificar que el usuario tenga un rol específico
 */
export function hasRole(ctx: TrpcContext, allowedRoles: UserRole[]) {
  isAuthenticated(ctx);
  
  const userRole = ctx.user!.role as UserRole;
  
  if (!allowedRoles.includes(userRole)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tienes permisos para realizar esta acción",
    });
  }
  
  return ctx;
}

/**
 * Middleware para verificar que el usuario sea superadmin
 */
export function isSuperAdmin(ctx: TrpcContext) {
  return hasRole(ctx, ['superadmin']);
}

/**
 * Middleware para verificar que el usuario sea superadmin o admin
 */
export function isAdminOrAbove(ctx: TrpcContext) {
  return hasRole(ctx, ['superadmin', 'admin']);
}

/**
 * Middleware para verificar que el usuario tenga un permiso específico
 */
export function requirePermission(
  ctx: TrpcContext,
  permission: keyof typeof import("../shared/erp-types").ROLE_PERMISSIONS.superadmin
) {
  isAuthenticated(ctx);
  
  const userRole = ctx.user!.role as UserRole;
  
  if (!hasPermission(userRole, permission)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `No tienes el permiso necesario: ${permission}`,
    });
  }
  
  return ctx;
}

/**
 * Middleware para verificar acceso a una tienda específica
 */
export function requireStoreAccess(ctx: TrpcContext, storeId: string) {
  isAuthenticated(ctx);
  
  const userRole = ctx.user!.role as UserRole;
  const userStoreId = ctx.user!.storeId;
  
  if (!canAccessStore(userRole, userStoreId, storeId)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tienes acceso a esta tienda",
    });
  }
  
  return ctx;
}

/**
 * Helper para obtener el rol del usuario actual
 */
export function getUserRole(ctx: TrpcContext): UserRole {
  isAuthenticated(ctx);
  return ctx.user!.role as UserRole;
}

/**
 * Helper para obtener la tienda del usuario actual
 */
export function getUserStoreId(ctx: TrpcContext): string | null {
  isAuthenticated(ctx);
  return ctx.user!.storeId;
}
