/**
 * Wrapper para IndexedDB - Almacenamiento offline
 * Gestiona el almacenamiento local de datos para funcionalidad offline
 */

const DB_NAME = 'M4POS_DB';
const DB_VERSION = 1;

export interface PendingSale {
  id: string;
  storeId: string;
  userId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  timestamp: number;
  synced: boolean;
}

export interface PendingCashClosure {
  id: string;
  storeId: string;
  userId: string;
  openingAmount: number;
  closingAmount: number;
  sales: number;
  expenses: number;
  timestamp: number;
  synced: boolean;
}

export interface CachedProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  precio_lista: number;
  precio_minimo: number;
  costo: number;
  is_active: boolean;
  lastSync: number;
}

export interface CachedInventory {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  lastSync: number;
}

class OfflineDB {
  private db: IDBDatabase | null = null;

  /**
   * Inicializar la base de datos
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[OfflineDB] Error opening database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineDB] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('[OfflineDB] Upgrading database schema...');

        // Object store para ventas pendientes
        if (!db.objectStoreNames.contains('pendingSales')) {
          const salesStore = db.createObjectStore('pendingSales', { keyPath: 'id' });
          salesStore.createIndex('storeId', 'storeId', { unique: false });
          salesStore.createIndex('synced', 'synced', { unique: false });
          salesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Object store para cortes de caja pendientes
        if (!db.objectStoreNames.contains('pendingCashClosures')) {
          const closuresStore = db.createObjectStore('pendingCashClosures', { keyPath: 'id' });
          closuresStore.createIndex('storeId', 'storeId', { unique: false });
          closuresStore.createIndex('synced', 'synced', { unique: false });
          closuresStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Object store para productos (caché)
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('is_active', 'is_active', { unique: false });
          productsStore.createIndex('lastSync', 'lastSync', { unique: false });
        }

        // Object store para inventario (caché)
        if (!db.objectStoreNames.contains('inventory')) {
          const inventoryStore = db.createObjectStore('inventory', { keyPath: 'id' });
          inventoryStore.createIndex('storeId', 'storeId', { unique: false });
          inventoryStore.createIndex('productId', 'productId', { unique: false });
          inventoryStore.createIndex('lastSync', 'lastSync', { unique: false });
        }

        // Object store para configuración
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Guardar venta pendiente
   */
  async savePendingSale(sale: PendingSale): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingSales', 'readwrite');
      const store = tx.objectStore('pendingSales');
      const request = store.put(sale);

      request.onsuccess = () => {
        console.log('[OfflineDB] Sale saved:', sale.id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener ventas pendientes de sincronización
   */
  async getPendingSales(storeId?: string): Promise<PendingSale[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingSales', 'readonly');
      const store = tx.objectStore('pendingSales');
      
      let request: IDBRequest;
      if (storeId) {
        const index = store.index('storeId');
        request = index.getAll(storeId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const sales = request.result.filter((s: PendingSale) => !s.synced);
        resolve(sales);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Marcar venta como sincronizada
   */
  async markSaleSynced(saleId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingSales', 'readwrite');
      const store = tx.objectStore('pendingSales');
      const request = store.delete(saleId);

      request.onsuccess = () => {
        console.log('[OfflineDB] Sale marked as synced:', saleId);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Guardar corte de caja pendiente
   */
  async savePendingCashClosure(closure: PendingCashClosure): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingCashClosures', 'readwrite');
      const store = tx.objectStore('pendingCashClosures');
      const request = store.put(closure);

      request.onsuccess = () => {
        console.log('[OfflineDB] Cash closure saved:', closure.id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener cortes de caja pendientes
   */
  async getPendingCashClosures(storeId?: string): Promise<PendingCashClosure[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('pendingCashClosures', 'readonly');
      const store = tx.objectStore('pendingCashClosures');
      
      let request: IDBRequest;
      if (storeId) {
        const index = store.index('storeId');
        request = index.getAll(storeId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const closures = request.result.filter((c: PendingCashClosure) => !c.synced);
        resolve(closures);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cachear productos
   */
  async cacheProducts(products: CachedProduct[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('products', 'readwrite');
      const store = tx.objectStore('products');

      // Limpiar productos antiguos
      store.clear();

      // Agregar productos nuevos
      products.forEach((product) => {
        store.put({ ...product, lastSync: Date.now() });
      });

      tx.oncomplete = () => {
        console.log('[OfflineDB] Products cached:', products.length);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Obtener productos cacheados
   */
  async getCachedProducts(): Promise<CachedProduct[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cachear inventario
   */
  async cacheInventory(inventory: CachedInventory[]): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('inventory', 'readwrite');
      const store = tx.objectStore('inventory');

      // Limpiar inventario antiguo
      store.clear();

      // Agregar inventario nuevo
      inventory.forEach((item) => {
        store.put({ ...item, lastSync: Date.now() });
      });

      tx.oncomplete = () => {
        console.log('[OfflineDB] Inventory cached:', inventory.length);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Obtener inventario cacheado
   */
  async getCachedInventory(storeId?: string): Promise<CachedInventory[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('inventory', 'readonly');
      const store = tx.objectStore('inventory');
      
      let request: IDBRequest;
      if (storeId) {
        const index = store.index('storeId');
        request = index.getAll(storeId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Guardar configuración
   */
  async setConfig(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('config', 'readwrite');
      const store = tx.objectStore('config');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Obtener configuración
   */
  async getConfig(key: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('config', 'readonly');
      const store = tx.objectStore('config');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Contar operaciones pendientes
   */
  async getPendingCount(): Promise<number> {
    if (!this.db) await this.init();

    const sales = await this.getPendingSales();
    const closures = await this.getPendingCashClosures();
    return sales.length + closures.length;
  }
}

// Exportar instancia singleton
export const offlineDB = new OfflineDB();
