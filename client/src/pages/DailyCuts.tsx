import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Download, FileText, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DailyCuts() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedCut, setSelectedCut] = useState<any>(null);

  const { data: cuts, refetch } = trpc.cashouts.list.useQuery({ storeId: user?.storeId || undefined });
  const createMutation = trpc.cashouts.create.useMutation({
    onSuccess: () => {
      toast.success("Corte generado exitosamente");
      setOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const closeMutation = trpc.cashouts.close.useMutation({
    onSuccess: () => {
      toast.success("Corte cerrado exitosamente");
      setSelectedCut(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleCreateCut = () => {
    if (!user?.storeId) {
      toast.error("No tienes una tienda asignada");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    createMutation.mutate({
      storeId: user.storeId,
      date: today,
      totalCash: 0,
      totalCard: 0,
      totalTransfer: 0,
    });
  };

  const handleCloseCut = (cutId: string) => {
    closeMutation.mutate({ id: cutId });
  };

  const handleExport = (cut: any) => {
    // Generar CSV simple
    const headers = ["Método de Pago", "Cantidad", "Total"];
    const rows = cut.cut_details?.map((detail: any) => [
      detail.payment_method,
      detail.transaction_count,
      `$${detail.total_amount.toLocaleString()}`,
    ]) || [];
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row: string[]) => row.join(",")),
      "",
      `Total General,$${cut.total_amount.toLocaleString()}`,
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `corte-${cut.id.slice(0, 8)}-${new Date(cut.cut_date).toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Corte exportado");
  };

  const openCuts = cuts?.filter((c: any) => c.status === "ABIERTO") || [];
  const closedCuts = cuts?.filter((c: any) => c.status === "CERRADO") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cortes Diarios</h1>
            <p className="text-muted-foreground">
              Registro de ventas y cierres de caja
            </p>
          </div>
          {user?.role === "store_user" && (
            <Button onClick={handleCreateCut} disabled={createMutation.isPending}>
              <FileText className="h-4 w-4 mr-2" />
              {createMutation.isPending ? "Generando..." : "Generar Corte"}
            </Button>
          )}
        </div>

        {/* Cortes Abiertos */}
        {openCuts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cortes Abiertos</CardTitle>
              <CardDescription>
                Cortes pendientes de cierre
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openCuts.map((cut: any) => (
                  <Card key={cut.id} className="border-orange-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Corte del {new Date(cut.cut_date).toLocaleDateString()}
                          </CardTitle>
                          <CardDescription>
                            {cut.stores?.name} • ID: {cut.id.slice(0, 8)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {user?.role === "store_user" && user?.storeId === cut.store_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCloseCut(cut.id)}
                              disabled={closeMutation.isPending}
                            >
                              <Lock className="h-4 w-4 mr-1" />
                              Cerrar Corte
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Método de Pago</TableHead>
                            <TableHead className="text-right">Transacciones</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cut.cut_details?.map((detail: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">
                                {detail.payment_method}
                              </TableCell>
                              <TableCell className="text-right">
                                {detail.transaction_count}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                ${detail.total_amount.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={2} className="font-bold">
                              Total General
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg">
                              ${cut.total_amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historial de Cortes Cerrados */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Cortes</CardTitle>
            <CardDescription>
              Cortes cerrados y finalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tienda</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {closedCuts && closedCuts.length > 0 ? (
                  closedCuts.map((cut: any) => (
                    <TableRow key={cut.id}>
                      <TableCell className="font-mono text-sm">
                        {cut.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {new Date(cut.cut_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {cut.stores?.name || "N/A"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${cut.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                          <Lock className="h-3 w-3" />
                          Cerrado
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExport(cut)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Exportar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No hay cortes cerrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
