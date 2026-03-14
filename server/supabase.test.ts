import { describe, expect, it } from "vitest";
import { supabase, getStores, getProducts } from "./db";

describe("Supabase Connection", () => {
  it("should connect to Supabase successfully", async () => {
    // Test basic connection by querying stores
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it("should fetch stores from baitinv schema", async () => {
    const stores = await getStores(false); // Get all stores including inactive

    expect(Array.isArray(stores)).toBe(true);
    expect(stores.length).toBeGreaterThan(0);
    
    // Verify CENTRAL warehouse exists
    const central = stores.find(s => s.name === "CENTRAL");
    expect(central).toBeDefined();
    expect(central?.is_warehouse).toBe(true);
  });

  it("should verify all 5 seed stores exist", async () => {
    const stores = await getStores(false);

    const expectedStores = [
      "CENTRAL",
      "BAIT M4 PENSIONES",
      "BAIT M4 PROGRESO",
      "BAIT M4 PLAZA DORADA",
      "BAIT M4 TICUL"
    ];

    expectedStores.forEach(storeName => {
      const store = stores.find(s => s.name === storeName);
      expect(store).toBeDefined();
      expect(store?.is_active).toBe(true);
    });

    expect(stores.length).toBeGreaterThanOrEqual(5);
  });

  it("should handle products table (empty initially)", async () => {
    const products = await getProducts(false);

    expect(Array.isArray(products)).toBe(true);
    // Products table should exist even if empty
  });
});
