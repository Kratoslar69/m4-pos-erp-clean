import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createSuperadminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: "test-superadmin",
    openId: "test-superadmin",
    email: "superadmin@test.com",
    name: "Test Superadmin",
    loginMethod: "manus",
    role: "superadmin",
    storeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createStoreUserContext(storeId: string = "550e8400-e29b-41d4-a716-446655440000"): TrpcContext {
  const user: AuthenticatedUser = {
    id: "test-store-user",
    openId: "test-store-user",
    email: "storeuser@test.com",
    name: "Test Store User",
    loginMethod: "manus",
    role: "store_user",
    storeId,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("ERP Routers", () => {
  describe("stores router", () => {
    it("allows superadmin to list stores", async () => {
      const ctx = createSuperadminContext();
      const caller = appRouter.createCaller(ctx);

      // Esta llamada debería funcionar sin errores
      await expect(caller.stores.list()).resolves.toBeDefined();
    });
  });

  describe("products router", () => {
    it("allows superadmin to list products", async () => {
      const ctx = createSuperadminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.products.list({})).resolves.toBeDefined();
    });
  });

  describe("inventory router", () => {
    it("allows store user to list inventory", async () => {
      const ctx = createStoreUserContext("550e8400-e29b-41d4-a716-446655440000");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.inventory.list({ storeId: "550e8400-e29b-41d4-a716-446655440000" })).resolves.toBeDefined();
    });
  });

  describe("purchases router", () => {
    it("allows superadmin to list purchases", async () => {
      const ctx = createSuperadminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.purchases.list()).resolves.toBeDefined();
    });
  });

  describe("transfers router", () => {
    it("allows superadmin to list transfers", async () => {
      const ctx = createSuperadminContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.transfers.list()).resolves.toBeDefined();
    });
  });

  describe("cashouts router", () => {
    it("allows store user to list cashouts", async () => {
      const ctx = createStoreUserContext("550e8400-e29b-41d4-a716-446655440000");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.cashouts.list({ storeId: "550e8400-e29b-41d4-a716-446655440000" })).resolves.toBeDefined();
    });
  });
});
