import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Package, TrendingUp, TrendingDown, RefreshCw, ArrowLeftRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MovementHistory() {
  const [imei, setImei] = useState('');
  const [searchImei, setSearchImei] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: historyData, isLoading, error, refetch } = trpc.productMovements.listByIMEI.useQuery(
    { imei: searchImei, limit: 100 },
    { enabled: searchImei.length > 0 }
  );

  useEffect(() => {
    // Auto-focus en el input para pistola de código de barras
    inputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    if (imei.trim().length === 0) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un IMEI',
        variant: 'destructive',
      });
      return;
    }
    setSearchImei(imei.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'ENTRADA':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'VENTA':
        return <TrendingDown className="h-5 w-5 text-blue-500" />;
      case 'DEVOLUCION':
        return <RefreshCw className="h-5 w-5 text-orange-500" />;
      case 'AJUSTE':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'TRANSFERENCIA':
        return <ArrowLeftRight className="h-5 w-5 text-purple-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'ENTRADA':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'VENTA':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DEVOLUCION':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'AJUSTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'TRANSFERENCIA':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Historial de Movimientos</h1>
        <p className="text-muted-foreground">
          Consulta el historial completo de movimientos de un producto por IMEI
        </p>
      </div>

      {/* Búsqueda */}
      <Card className="p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              ref={inputRef}
              placeholder="Escanea o ingresa el IMEI del equipo..."
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-lg"
            />
          </div>
          <Button onClick={handleSearch} size="lg">
            <Search className="h-5 w-5 mr-2" />
            Buscar
          </Button>
        </div>
      </Card>

      {/* Información del Producto */}
      {historyData && historyData.product && (
        <Card className="p-6 mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-lg">
              <Package className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {historyData.product.name}
              </h2>
              <div className="flex gap-4 text-sm text-gray-600">
                <span><strong>Marca:</strong> {historyData.product.brand}</span>
                <span><strong>Modelo:</strong> {historyData.product.model}</span>
                <span><strong>IMEI:</strong> {historyData.product.imei}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {historyData.movements.length} movimientos
            </Badge>
          </div>
        </Card>
      )}

      {/* Timeline de Movimientos */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-muted-foreground">Cargando historial...</p>
        </div>
      )}

      {error && (
        <Card className="p-8 text-center border-red-200 bg-red-50">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Producto no encontrado</h3>
          <p className="text-red-700">No se encontró ningún producto con el IMEI: {searchImei}</p>
        </Card>
      )}

      {historyData && historyData.movements.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin movimientos registrados</h3>
          <p className="text-muted-foreground">
            Este producto aún no tiene movimientos en el sistema
          </p>
        </Card>
      )}

      {historyData && historyData.movements.length > 0 && (
        <div className="space-y-4">
          {historyData.movements.map((movement: any, index: number) => (
            <Card key={movement.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Icono y línea de timeline */}
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-white border-2 rounded-full">
                    {getMovementIcon(movement.movement_type)}
                  </div>
                  {index < historyData.movements.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge className={getMovementColor(movement.movement_type)}>
                        {movement.movement_type}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(movement.created_at).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Cantidad: {movement.quantity}</p>
                      {movement.profiles && (
                        <p className="text-sm text-muted-foreground">
                          Por: {movement.profiles.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {movement.notes && (
                    <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded-md">
                      {movement.notes}
                    </p>
                  )}

                  {movement.reference_type && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Referencia: {movement.reference_type} - {movement.reference_id}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!searchImei && (
        <Card className="p-12 text-center">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Busca un producto por IMEI
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Escanea el código de barras del equipo con la pistola o ingresa el IMEI manualmente
            para ver su historial completo de movimientos
          </p>
        </Card>
      )}
    </div>
  );
}
