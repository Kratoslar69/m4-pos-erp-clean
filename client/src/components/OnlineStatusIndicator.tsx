import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { offlineDB } from '@/lib/offlineDB';
import { syncService } from '@/lib/syncService';

export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Actualizar contador de operaciones pendientes
  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await offlineDB.getPendingCount();
      setPendingCount(count);
    };

    updatePendingCount();
    
    // Actualizar cada 5 segundos
    const interval = setInterval(updatePendingCount, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Sincronizar cuando se recupera la conexión
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync();
    }
  }, [isOnline]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncService.syncNow();
      if (result.success) {
        setPendingCount(0);
      } else {
        // Actualizar contador después de intentar sincronizar
        const count = await offlineDB.getPendingCount();
        setPendingCount(count);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          isOnline
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-red-100 text-red-800 hover:bg-red-200'
        }`}
        title={isOnline ? 'Conectado' : 'Sin conexión'}
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        
        <span className="hidden sm:inline">
          {isOnline ? 'En línea' : 'Offline'}
        </span>
        
        {pendingCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-orange-600 text-white text-xs font-bold">
            {pendingCount}
          </span>
        )}
      </button>

      {/* Detalles del estado */}
      {showDetails && (
        <div className="absolute right-0 mt-2 w-72 bg-card border rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Estado de Conexión</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Cloud className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Conectado a internet</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Sin conexión</span>
                  </>
                )}
              </div>

              {pendingCount > 0 && (
                <div className="mt-3 p-3 bg-orange-50 rounded-md">
                  <p className="text-sm text-orange-800">
                    <strong>{pendingCount}</strong> operación{pendingCount > 1 ? 'es' : ''} pendiente{pendingCount > 1 ? 's' : ''} de sincronización
                  </p>
                  {isOnline && (
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="mt-2 w-full px-3 py-1.5 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        'Sincronizar ahora'
                      )}
                    </button>
                  )}
                </div>
              )}

              {!isOnline && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    Puedes seguir trabajando. Los datos se sincronizarán automáticamente cuando recuperes la conexión.
                  </p>
                </div>
              )}

              {isOnline && pendingCount === 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    ✓ Todos los datos están sincronizados
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
