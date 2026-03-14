const CACHE_NAME = 'm4pos-v1';
const RUNTIME_CACHE = 'm4pos-runtime';

// Recursos estáticos para cachear en la instalación
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalar Service Worker y cachear recursos estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar Service Worker y limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia de cacheo
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no sean GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requests a dominios externos (excepto APIs conocidas)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Estrategia Cache-First para assets estáticos
  if (
    request.url.includes('/@fs/') ||
    request.url.includes('/node_modules/') ||
    request.url.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Estrategia Network-First para API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear respuestas exitosas de API
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar servir desde caché
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si no hay caché, retornar respuesta de error
            return new Response(
              JSON.stringify({ error: 'No hay conexión a internet' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            );
          });
        })
    );
    return;
  }

  // Para todo lo demás, Network-First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cachedResponse) => {
        return cachedResponse || new Response('Offline');
      });
    })
  );
});

// Background Sync para sincronización de datos offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncSales());
  }
  
  if (event.tag === 'sync-cash-closures') {
    event.waitUntil(syncCashClosures());
  }
});

// Función para sincronizar ventas pendientes
async function syncSales() {
  console.log('[SW] Syncing pending sales...');
  try {
    // Abrir IndexedDB y obtener ventas pendientes
    const db = await openDB();
    const tx = db.transaction('pendingSales', 'readonly');
    const store = tx.objectStore('pendingSales');
    const sales = await store.getAll();
    
    // Enviar cada venta al servidor
    for (const sale of sales) {
      try {
        const response = await fetch('/api/trpc/sales.create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sale),
        });
        
        if (response.ok) {
          // Eliminar venta sincronizada de IndexedDB
          const deleteTx = db.transaction('pendingSales', 'readwrite');
          const deleteStore = deleteTx.objectStore('pendingSales');
          await deleteStore.delete(sale.id);
          console.log('[SW] Sale synced successfully:', sale.id);
        }
      } catch (error) {
        console.error('[SW] Error syncing sale:', error);
      }
    }
    
    db.close();
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Error in syncSales:', error);
    return Promise.reject(error);
  }
}

// Función para sincronizar cortes de caja pendientes
async function syncCashClosures() {
  console.log('[SW] Syncing pending cash closures...');
  // Similar a syncSales pero para cortes de caja
  return Promise.resolve();
}

// Helper para abrir IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('M4POS_DB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Crear object stores si no existen
      if (!db.objectStoreNames.contains('pendingSales')) {
        db.createObjectStore('pendingSales', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingCashClosures')) {
        db.createObjectStore('pendingCashClosures', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('inventory')) {
        db.createObjectStore('inventory', { keyPath: 'id' });
      }
    };
  });
}
