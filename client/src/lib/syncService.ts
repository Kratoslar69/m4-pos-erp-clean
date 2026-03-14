import { offlineDB } from './offlineDB';

/**
 * Servicio de sincronización para operaciones offline
 * Maneja la sincronización automática cuando se recupera la conexión
 */

class SyncService {
  private isSyncing = false;
  private syncCallbacks: Array<(success: boolean) => void> = [];

  /**
   * Registrar Service Worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('[SyncService] Service Worker registered:', registration.scope);
        
        // Registrar Background Sync si está disponible
        if ('sync' in registration) {
          console.log('[SyncService] Background Sync API available');
        }
        
        return registration;
      } catch (error) {
        console.error('[SyncService] Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Iniciar sincronización manual
   */
  async syncNow(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.isSyncing) {
      console.log('[SyncService] Sync already in progress');
      return { success: false, synced: 0, failed: 0 };
    }

    if (!navigator.onLine) {
      console.log('[SyncService] Cannot sync: offline');
      return { success: false, synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let syncedCount = 0;
    let failedCount = 0;

    try {
      // Sincronizar ventas pendientes
      const salesResult = await this.syncPendingSales();
      syncedCount += salesResult.synced;
      failedCount += salesResult.failed;

      // Sincronizar cortes de caja pendientes
      const closuresResult = await this.syncPendingCashClosures();
      syncedCount += closuresResult.synced;
      failedCount += closuresResult.failed;

      console.log(`[SyncService] Sync completed: ${syncedCount} synced, ${failedCount} failed`);
      
      // Notificar callbacks
      this.syncCallbacks.forEach((callback) => callback(failedCount === 0));
      
      return {
        success: failedCount === 0,
        synced: syncedCount,
        failed: failedCount,
      };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sincronizar ventas pendientes
   */
  private async syncPendingSales(): Promise<{ synced: number; failed: number }> {
    const pendingSales = await offlineDB.getPendingSales();
    console.log(`[SyncService] Syncing ${pendingSales.length} pending sales`);

    let synced = 0;
    let failed = 0;

    for (const sale of pendingSales) {
      try {
        // Enviar venta al servidor mediante tRPC
        const response = await fetch('/api/trpc/sales.create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            storeId: sale.storeId,
            products: sale.products,
            total: sale.total,
            paymentMethod: sale.paymentMethod,
          }),
        });

        if (response.ok) {
          // Marcar como sincronizada
          await offlineDB.markSaleSynced(sale.id);
          synced++;
          console.log(`[SyncService] Sale synced: ${sale.id}`);
        } else {
          failed++;
          console.error(`[SyncService] Failed to sync sale: ${sale.id}`, response.statusText);
        }
      } catch (error) {
        failed++;
        console.error(`[SyncService] Error syncing sale: ${sale.id}`, error);
      }
    }

    return { synced, failed };
  }

  /**
   * Sincronizar cortes de caja pendientes
   */
  private async syncPendingCashClosures(): Promise<{ synced: number; failed: number }> {
    const pendingClosures = await offlineDB.getPendingCashClosures();
    console.log(`[SyncService] Syncing ${pendingClosures.length} pending cash closures`);

    let synced = 0;
    let failed = 0;

    for (const closure of pendingClosures) {
      try {
        // Enviar corte al servidor mediante tRPC
        const response = await fetch('/api/trpc/cashClosures.create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            storeId: closure.storeId,
            openingAmount: closure.openingAmount,
            closingAmount: closure.closingAmount,
            sales: closure.sales,
            expenses: closure.expenses,
          }),
        });

        if (response.ok) {
          // Eliminar de IndexedDB
          synced++;
          console.log(`[SyncService] Cash closure synced: ${closure.id}`);
        } else {
          failed++;
          console.error(`[SyncService] Failed to sync closure: ${closure.id}`, response.statusText);
        }
      } catch (error) {
        failed++;
        console.error(`[SyncService] Error syncing closure: ${closure.id}`, error);
      }
    }

    return { synced, failed };
  }

  /**
   * Registrar callback para notificaciones de sincronización
   */
  onSyncComplete(callback: (success: boolean) => void): () => void {
    this.syncCallbacks.push(callback);
    
    // Retornar función para cancelar suscripción
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Registrar Background Sync (si está disponible)
   */
  async registerBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore - Background Sync API no está en tipos de TypeScript aún
        await registration.sync.register(tag);
        console.log(`[SyncService] Background sync registered: ${tag}`);
      } catch (error) {
        console.error('[SyncService] Background sync registration failed:', error);
      }
    }
  }

  /**
   * Cachear datos para uso offline
   */
  async cacheDataForOffline(storeId: string): Promise<void> {
    console.log('[SyncService] Caching data for offline use...');

    try {
      // Cachear productos
      const productsResponse = await fetch('/api/trpc/products.list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (productsResponse.ok) {
        const products = await productsResponse.json();
        await offlineDB.cacheProducts(products.result?.data || []);
      }

      // Cachear inventario de la tienda
      const inventoryResponse = await fetch(`/api/trpc/inventory.list?storeId=${storeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (inventoryResponse.ok) {
        const inventory = await inventoryResponse.json();
        await offlineDB.cacheInventory(inventory.result?.data || []);
      }

      console.log('[SyncService] Data cached successfully');
    } catch (error) {
      console.error('[SyncService] Error caching data:', error);
    }
  }
}

// Exportar instancia singleton
export const syncService = new SyncService();
