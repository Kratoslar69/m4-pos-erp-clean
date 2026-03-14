import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [storeId, setStoreId] = useState<string>('all');

  const { data: stores } = trpc.stores.list.useQuery();
  const { data: salesByPeriod } = trpc.reports.salesByPeriod.useQuery({ period, storeId: storeId === 'all' ? undefined : storeId });
  const { data: topProducts } = trpc.reports.topProducts.useQuery({ limit: 10, storeId: storeId === 'all' ? undefined : storeId });
  const { data: storePerformance } = trpc.reports.storePerformance.useQuery();
  const { data: summary } = trpc.reports.summary.useQuery({ storeId: storeId === 'all' ? undefined : storeId });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground">
              Análisis de ventas y rendimiento
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Diario</SelectItem>
                <SelectItem value="week">Semanal</SelectItem>
                <SelectItem value="month">Mensual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={storeId} onValueChange={setStoreId}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tiendas</SelectItem>
                {stores?.map((store) => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary?.totalSales?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {summary?.salesGrowth || 0}% vs período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.productsSold || 0}</div>
              <p className="text-xs text-muted-foreground">
                Unidades totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.transactions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total de ventas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary?.avgTicket?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Por transacción
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas por período */}
          <Card>
            <CardHeader>
              <CardTitle>Ventas por Período</CardTitle>
              <CardDescription>
                Tendencia de ventas en el tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByPeriod || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2} name="Ventas ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Productos más vendidos */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Productos</CardTitle>
              <CardDescription>
                Productos más vendidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#f97316" name="Unidades" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rendimiento por tienda */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Rendimiento por Tienda</CardTitle>
              <CardDescription>
                Comparación de ventas entre tiendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storePerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="store" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#f97316" name="Ventas ($)" />
                  <Bar dataKey="transactions" fill="#3b82f6" name="Transacciones" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
