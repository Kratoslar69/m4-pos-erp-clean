import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function InventoryDashboard() {
  const [, setLocation] = useLocation();

  // Obtener alertas activas
  const { data: alerts } = trpc.stockAlerts.list.useQuery({
    resolvedOnly: false,
    limit: 100,
  });

  // Obtener rotación de inventario
  const { data: rotationResponse } = trpc.reports.inventoryRotation.useQuery({
    days: 30,
    page: 1,
    pageSize: 10,
  });
  const rotation = rotationResponse?.data || [];

  // Obtener proyección de reabastecimiento
  const { data: restockResponse } = trpc.reports.restockProjection.useQuery({
    days: 30,
    page: 1,
    pageSize: 50,
  });
  const restock = restockResponse?.data || [];

  const activeAlerts = alerts?.filter((a: any) => !a.is_resolved) || [];
  const criticalAlerts = activeAlerts.filter(
    (a: any) => a.products.stock_actual === 0
  );
  const urgentAlerts = activeAlerts.filter(
    (a: any) => a.products.stock_actual > 0 && 
    a.products.stock_actual <= (a.products.stock_minimo || 0) * 0.5
  );

  const topRotation = rotation;
  const urgentRestock = restock.filter((r: any) => r.urgency === 'ALTA').slice(0, 5);

  const getRotationColor = (category: string) => {
    switch (category) {
      case 'ALTA':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'BAJA':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard de Inventario</h1>
        <p className="text-muted-foreground">
          Vista centralizada de alertas, rotación y sugerencias de reabastecimiento
        </p>
      </div>

      {/* Resumen de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card 
          className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setLocation('/stock-alerts')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Alertas Críticas</p>
              <p className="text-3xl font-bold text-red-900">{criticalAlerts.length}</p>
              <p className="text-xs text-red-700 mt-1">Stock agotado</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </Card>

        <Card 
          className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setLocation('/stock-alerts')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Alertas Urgentes</p>
              <p className="text-3xl font-bold text-orange-900">{urgentAlerts.length}</p>
              <p className="text-xs text-orange-700 mt-1">Stock ≤ 50% mínimo</p>
            </div>
            <Package className="h-12 w-12 text-orange-500" />
          </div>
        </Card>

        <Card 
          className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setLocation('/stock-alerts')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Total Alertas</p>
              <p className="text-3xl font-bold text-yellow-900">{activeAlerts.length}</p>
              <p className="text-xs text-yellow-700 mt-1">Requieren atención</p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Productos con Mayor Rotación */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Top 10 Rotación
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Productos con mayor movimiento (últimos 30 días)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {topRotation.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay datos de rotación disponibles
              </p>
            )}
            {topRotation.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.brand} {item.model}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold">{item.rotationRate}x</p>
                    <p className="text-xs text-muted-foreground">{item.totalSold} vendidos</p>
                  </div>
                  <Badge className={getRotationColor(item.category)}>
                    {item.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Productos Próximos a Agotarse */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <RefreshCw className="h-6 w-6 text-orange-600" />
                Reabastecimiento Urgente
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Productos que se agotarán en menos de 7 días
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {urgentRestock.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  ¡Todo en orden! No hay productos próximos a agotarse
                </p>
              </div>
            )}
            {urgentRestock.map((item: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.brand} {item.model}
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    {item.urgency}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Stock Actual</p>
                    <p className="font-bold text-red-700">{item.stockActual}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Días hasta agotarse</p>
                    <p className="font-bold text-red-700">{item.daysUntilStockout}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Promedio diario</p>
                    <p className="font-medium">{item.avgDailySales}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cantidad sugerida</p>
                    <p className="font-bold text-green-700">{item.suggestedQuantity}</p>
                  </div>
                </div>

                {item.stockoutDate !== 'N/A' && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs text-red-700">
                      <strong>Fecha estimada de agotamiento:</strong> {item.stockoutDate}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-20 flex items-center justify-between"
          onClick={() => setLocation('/stock-alerts')}
        >
          <div className="text-left">
            <p className="font-semibold">Ver Todas las Alertas</p>
            <p className="text-xs text-muted-foreground">Gestionar alertas de stock</p>
          </div>
          <ArrowRight className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          className="h-20 flex items-center justify-between"
          onClick={() => setLocation('/movement-history')}
        >
          <div className="text-left">
            <p className="font-semibold">Historial de Movimientos</p>
            <p className="text-xs text-muted-foreground">Consultar por IMEI</p>
          </div>
          <ArrowRight className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          className="h-20 flex items-center justify-between"
          onClick={() => setLocation('/products')}
        >
          <div className="text-left">
            <p className="font-semibold">Gestionar Productos</p>
            <p className="text-xs text-muted-foreground">Actualizar stock y precios</p>
          </div>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
