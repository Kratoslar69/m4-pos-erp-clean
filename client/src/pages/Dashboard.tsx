import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Building2, DollarSign, Package, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stores } = trpc.stores.list.useQuery();
  const { data: sales } = trpc.sales.list.useQuery({});
  const { data: inventory } = trpc.inventory.items.useQuery({});

  const totalStores = stores?.length || 0;
  const totalSales = sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
  const totalInventory = inventory?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {user?.name || "Usuario"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiendas Activas
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStores}</div>
              <p className="text-xs text-muted-foreground">
                Puntos de venta operando
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ventas Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalSales.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Total acumulado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inventario
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInventory}</div>
              <p className="text-xs text-muted-foreground">
                Items en stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rendimiento
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">
                vs. mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
              <CardDescription>
                Últimas transacciones registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sales && sales.length > 0 ? (
                <div className="space-y-3">
                  {sales.slice(0, 5).map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Venta #{sale.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        ${sale.total.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay ventas registradas
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tiendas</CardTitle>
              <CardDescription>
                Estado de puntos de venta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stores && stores.length > 0 ? (
                <div className="space-y-3">
                  {stores.slice(0, 5).map((store) => (
                    <div
                      key={store.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{store.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {store.code}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          store.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {store.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay tiendas registradas
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
