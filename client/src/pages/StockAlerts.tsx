import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw, Package, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StockAlerts() {
  const [showResolved, setShowResolved] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: alerts, isLoading, refetch } = trpc.stockAlerts.list.useQuery({
    resolvedOnly: showResolved,
    limit: 100,
  });

  const checkLowStockMutation = trpc.stockAlerts.checkLowStock.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Verificación completada',
        description: `Se crearon ${data.alertsCreated} nuevas alertas de ${data.lowStockProducts} productos con stock bajo`,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resolveMutation = trpc.stockAlerts.resolve.useMutation({
    onSuccess: () => {
      toast({
        title: 'Alerta resuelta',
        description: 'La alerta se marcó como resuelta exitosamente',
      });
      utils.stockAlerts.list.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getUrgencyLevel = (stockActual: number, stockMinimo: number) => {
    const percentage = (stockActual / stockMinimo) * 100;
    if (percentage === 0) return 'critical';
    if (percentage <= 50) return 'high';
    return 'medium';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'critical':
        return 'CRÍTICO';
      case 'high':
        return 'URGENTE';
      case 'medium':
        return 'ADVERTENCIA';
      default:
        return 'NORMAL';
    }
  };

  const activeAlerts = alerts?.filter((a: any) => !a.is_resolved) || [];
  const criticalCount = activeAlerts.filter(
    (a: any) => getUrgencyLevel(a.products.stock_actual, a.products.stock_minimo) === 'critical'
  ).length;
  const highCount = activeAlerts.filter(
    (a: any) => getUrgencyLevel(a.products.stock_actual, a.products.stock_minimo) === 'high'
  ).length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Alertas de Stock Bajo</h1>
        <p className="text-muted-foreground">
          Monitorea y gestiona productos con niveles de inventario por debajo del mínimo
        </p>
      </div>

      {/* Resumen de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Alertas</p>
              <p className="text-3xl font-bold text-orange-900">{activeAlerts.length}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Críticas</p>
              <p className="text-3xl font-bold text-red-900">{criticalCount}</p>
            </div>
            <TrendingDown className="h-12 w-12 text-red-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Urgentes</p>
              <p className="text-3xl font-bold text-yellow-900">{highCount}</p>
            </div>
            <Package className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Resueltas</p>
              <p className="text-3xl font-bold text-green-900">
                {alerts?.filter((a: any) => a.is_resolved).length || 0}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Acciones */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => checkLowStockMutation.mutate()}
          disabled={checkLowStockMutation.isPending}
          size="lg"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${checkLowStockMutation.isPending ? 'animate-spin' : ''}`} />
          Verificar Stock Bajo
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowResolved(!showResolved)}
          size="lg"
        >
          {showResolved ? 'Ver Activas' : 'Ver Resueltas'}
        </Button>
      </div>

      {/* Lista de Alertas */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-muted-foreground">Cargando alertas...</p>
        </div>
      )}

      {!isLoading && alerts && alerts.length === 0 && (
        <Card className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {showResolved ? 'No hay alertas resueltas' : '¡Todo en orden!'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {showResolved
              ? 'No se han resuelto alertas recientemente'
              : 'Todos los productos tienen stock suficiente'}
          </p>
        </Card>
      )}

      {!isLoading && alerts && alerts.length > 0 && (
        <div className="space-y-4">
          {alerts.map((alert: any) => {
            const urgencyLevel = getUrgencyLevel(
              alert.products.stock_actual,
              alert.products.stock_minimo
            );
            const percentage = Math.round(
              (alert.products.stock_actual / alert.products.stock_minimo) * 100
            );

            return (
              <Card
                key={alert.id}
                className={`p-6 ${
                  urgencyLevel === 'critical'
                    ? 'border-red-300 bg-red-50'
                    : urgencyLevel === 'high'
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-yellow-300 bg-yellow-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Indicador de urgencia */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`p-3 rounded-full ${
                        urgencyLevel === 'critical'
                          ? 'bg-red-200'
                          : urgencyLevel === 'high'
                          ? 'bg-orange-200'
                          : 'bg-yellow-200'
                      }`}
                    >
                      <AlertTriangle
                        className={`h-6 w-6 ${
                          urgencyLevel === 'critical'
                            ? 'text-red-700'
                            : urgencyLevel === 'high'
                            ? 'text-orange-700'
                            : 'text-yellow-700'
                        }`}
                      />
                    </div>
                    <Badge className={`mt-2 ${getUrgencyColor(urgencyLevel)}`}>
                      {getUrgencyLabel(urgencyLevel)}
                    </Badge>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {alert.products.name}
                        </h3>
                        <div className="flex gap-3 text-sm text-gray-600 mt-1">
                          {alert.products.brand && (
                            <span><strong>Marca:</strong> {alert.products.brand}</span>
                          )}
                          {alert.products.model && (
                            <span><strong>Modelo:</strong> {alert.products.model}</span>
                          )}
                          {alert.products.imei && (
                            <span><strong>IMEI:</strong> {alert.products.imei}</span>
                          )}
                        </div>
                      </div>
                      {!alert.is_resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveMutation.mutate({ alertId: alert.id })}
                          disabled={resolveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar Resuelta
                        </Button>
                      )}
                    </div>

                    {/* Barra de progreso de stock */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">
                          Stock Actual: <span className="text-lg font-bold">{alert.products.stock_actual}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Mínimo: {alert.products.stock_minimo}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            urgencyLevel === 'critical'
                              ? 'bg-red-600'
                              : urgencyLevel === 'high'
                              ? 'bg-orange-600'
                              : 'bg-yellow-600'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {percentage}% del stock mínimo
                      </p>
                    </div>

                    {/* Fecha de alerta */}
                    <p className="text-xs text-muted-foreground mt-3">
                      Alerta creada: {new Date(alert.created_at).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    {alert.is_resolved && alert.resolved_at && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Resuelta: {new Date(alert.resolved_at).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
