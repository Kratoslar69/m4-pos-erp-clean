import { drizzle } from "drizzle-orm/mysql2";
import { stores, profiles, products, suppliers, pricingPlans } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // 1. Crear almacén central y tiendas
    console.log("Creating stores...");
    const centralStore = await db.insert(stores).values({
      name: "CENTRAL",
      isWarehouse: true,
      isActive: true,
    });

    await db.insert(stores).values([
      { name: "BAIT M4 PENSIONES", isWarehouse: false, isActive: true },
      { name: "BAIT M4 PROGRESO", isWarehouse: false, isActive: true },
      { name: "BAIT M4 PLAZA DORADA", isWarehouse: false, isActive: true },
      { name: "BAIT M4 TICUL", isWarehouse: false, isActive: true },
    ]);

    console.log("✅ Stores created");

    // 2. Crear proveedores de ejemplo
    console.log("Creating suppliers...");
    await db.insert(suppliers).values([
      {
        name: "Proveedor Samsung",
        contact: "Juan Pérez",
        phone: "9991234567",
        email: "samsung@proveedor.com",
        isActive: true,
      },
      {
        name: "Proveedor Apple",
        contact: "María González",
        phone: "9997654321",
        email: "apple@proveedor.com",
        isActive: true,
      },
      {
        name: "Proveedor Telcel",
        contact: "Carlos López",
        phone: "9995551234",
        email: "telcel@proveedor.com",
        isActive: true,
      },
    ]);

    console.log("✅ Suppliers created");

    // 3. Crear productos de ejemplo
    console.log("Creating products...");
    
    // Equipos
    const samsungA54 = await db.insert(products).values({
      type: "HANDSET",
      name: "Samsung Galaxy A54",
      brand: "Samsung",
      model: "A54",
      category: null,
      costPrice: "4500.00",
      listPrice: "6500.00",
      minPrice: "5500.00",
      isActive: true,
    });

    const iphone13 = await db.insert(products).values({
      type: "HANDSET",
      name: "iPhone 13",
      brand: "Apple",
      model: "13",
      category: null,
      costPrice: "12000.00",
      listPrice: "16000.00",
      minPrice: "14000.00",
      isActive: true,
    });

    // SIMs
    await db.insert(products).values([
      {
        type: "SIM",
        name: "SIM Telcel Prepago",
        brand: "Telcel",
        model: null,
        category: "Prepago",
        costPrice: "50.00",
        listPrice: "100.00",
        minPrice: "80.00",
        isActive: true,
      },
      {
        type: "SIM",
        name: "SIM AT&T Prepago",
        brand: "AT&T",
        model: null,
        category: "Prepago",
        costPrice: "50.00",
        listPrice: "100.00",
        minPrice: "80.00",
        isActive: true,
      },
    ]);

    // Accesorios
    await db.insert(products).values([
      {
        type: "ACCESSORY",
        skuCode: "ACC-MICA-001",
        name: "Mica de vidrio templado",
        brand: null,
        model: null,
        category: "Protección",
        costPrice: "30.00",
        listPrice: "80.00",
        minPrice: "50.00",
        isActive: true,
      },
      {
        type: "ACCESSORY",
        skuCode: "ACC-FUNDA-001",
        name: "Funda de silicona",
        brand: null,
        model: null,
        category: "Protección",
        costPrice: "40.00",
        listPrice: "120.00",
        minPrice: "80.00",
        isActive: true,
      },
      {
        type: "ACCESSORY",
        skuCode: "ACC-CARG-001",
        name: "Cargador rápido USB-C",
        brand: null,
        model: null,
        category: "Carga",
        costPrice: "80.00",
        listPrice: "200.00",
        minPrice: "150.00",
        isActive: true,
      },
    ]);

    console.log("✅ Products created");

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
