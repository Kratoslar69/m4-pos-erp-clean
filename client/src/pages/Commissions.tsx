import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { DollarSign, TrendingUp, Users, FileText, FileSpreadsheet, Download } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Commissions() {
  const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const [selectedUser, setSelectedUser] = useState<string>("all");

  const { data: users } = trpc.users.list.useQuery();
  const { data: commissions, isLoading } = trpc.commissions.list.useQuery({
    period: selectedPeriod,
    userId: selectedUser === "all" ? undefined : selectedUser,
  });
  const { data: summary } = trpc.commissions.summary.useQuery({
    period: selectedPeriod,
    userId: selectedUser === "all" ? undefined : selectedUser,
  });

  const { toast } = useToast();
  const exportPDFMutation = trpc.commissions.exportPDF.useMutation();
  const exportExcelMutation = trpc.commissions.exportExcel.useMutation();

  const handleExportPDF = async () => {
    try {
      const result = await exportPDFMutation.mutateAsync({
        period: selectedPeriod,
        userId: selectedUser === "all" ? undefined : selectedUser,
      });

      // Descargar el archivo PDF
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${result.data}`;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Reporte exportado",
        description: "El reporte PDF se ha descargado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el reporte a PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const result = await exportExcelMutation.mutateAsync({
        period: selectedPeriod,
        userId: selectedUser === "all" ? undefined : selectedUser,
      });

      // Descargar el archivo Excel
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.data}`;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Reporte exportado",
        description: "El reporte Excel se ha descargado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar el reporte a Excel.",
        variant: "destructive",
      });
    }
  };

  // Generar lista de períodos (últimos 12 meses)
  const periods = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().slice(0, 7);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Comisiones</h1>
            <p className="text-muted-foreground">Gestiona y consulta las comisiones de vendedores</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-48">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona período" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {new Date(period + "-01").toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-64">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los vendedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vendedores</SelectItem>
                {users?.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={exportPDFMutation.isPending || !commissions || commissions.length === 0}
            >
              <FileText className="mr-2 h-4 w-4" />
              {exportPDFMutation.isPending ? "Exportando..." : "Exportar PDF"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exportExcelMutation.isPending || !commissions || commissions.length === 0}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {exportExcelMutation.isPending ? "Exportando..." : "Exportar Excel"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary?.total?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Comisiones generadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${summary?.paid?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Comisiones liquidadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${summary?.pending?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Por pagar</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalle de Comisiones</CardTitle>
            <CardDescription>
              Período: {new Date(selectedPeriod + "-01").toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando comisiones...</div>
            ) : commissions && commissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Venta</TableHead>
                    <TableHead>Monto Venta</TableHead>
                    <TableHead>Tasa</TableHead>
                    <TableHead>Comisión</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission: any) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {commission.profiles?.name || "Usuario"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {commission.sale_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>${Number(commission.sale_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>{Number(commission.commission_rate || 0).toFixed(2)}%</TableCell>
                      <TableCell className="font-semibold">
                        ${Number(commission.commission_amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {commission.is_paid ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Pagada
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                            Pendiente
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(commission.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay comisiones registradas para este período
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
