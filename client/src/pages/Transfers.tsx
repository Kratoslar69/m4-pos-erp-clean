import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ArrowRightLeft, CheckCircle, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Transfers() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [items, setItems] = useState<Array<{ productId: string; serialNumber?: string; quantity: number }>>([]);
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    serialNumber: "",
    quantity: "1",
  });
  const [destinationStoreId, setDestinationStoreId] = useState("");

  const { data: transfers, refetch } = trpc.transfers.list.useQuery();
  const { data: products } = trpc.products.list.useQuery({});
  const { data: stores } = trpc.stores.list.useQuery();
  const createMutation = trpc.transfers.create.useMutation({
    onSuccess: () => {
      toast.success("Transferencia creada exitosamente");
      setOpen(false);
      setItems([]);
      setCurrentItem({ productId: "", serialNumber: "", quantity: "1" });
      setDestinationStoreId("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const receiveMutation = trpc.transfers.receive.useMutation({
    onSuccess: () => {
      toast.success("Transferencia recibida exitosamente");
      setReceiveOpen(false);
      setSelectedTransfer(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addItem = () => {
    if (!currentItem.productId) {
      toast.error("Selecciona un producto");
      return;
    }
    setItems([
      ...items,
      {
        productId: currentItem.productId,
        serialNumber: currentItem.serialNumber || undefined,
        quantity: parseInt(currentItem.quantity),
      },
    ]);
    setCurrentItem({ productId: "", serialNumber: "", quantity: "1" });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    if (!destinationStoreId) {
      toast.error("Selecciona una tienda de destino");
      return;
    }
    // Obtener el ID de la tienda CENTRAL
    const centralStore = stores?.find(s => s.name === "CENTRAL");
    if (!centralStore) {
      toast.error("No se encontró la tienda CENTRAL");
      return;
    }
    createMutation.mutate({
      fromStoreId: centralStore.id,
      toStoreId: destinationStoreId,
      items,
    });
  };

  const handleReceive = (transferId: string, accepted: boolean) => {
    // Para simplificar, aceptamos todos los items con la cantidad completa
    const transfer = transfers?.find(t => t.id === transferId);
    if (!transfer || !transfer.transfer_items) return;
    
    receiveMutation.mutate({
      transferId,
      items: transfer.transfer_items.map((item: any) => ({
        itemId: item.id,
        receivedQuantity: accepted ? item.quantity : 0,
      })),
    });
  };

  const pendingTransfers = transfers?.filter((t) => t.status === "EN_TRANSITO") || [];
  const completedTransfers = transfers?.filter((t) => t.status !== "EN_TRANSITO") || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transferencias</h1>
            <p className="text-muted-foreground">
              Movimientos de inventario entre tiendas
            </p>
          </div>
          {user?.role !== "store_user" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Nueva Transferencia
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Transferencia</DialogTitle>
                    <DialogDescription>
                      Transferir inventario de CENTRAL a una tienda
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Destino</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label>Tienda de Destino *</Label>
                          <Select value={destinationStoreId} onValueChange={setDestinationStoreId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una tienda" />
                            </SelectTrigger>
                            <SelectContent>
                              {stores?.filter((s) => s.name !== "CENTRAL").map((store) => (
                                <SelectItem key={store.id} value={store.id}>
                                  {store.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Agregar Producto</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Producto *</Label>
                            <Select
                              value={currentItem.productId}
                              onValueChange={(value) => {
                                setCurrentItem({
                                  ...currentItem,
                                  productId: value,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un producto" />
                              </SelectTrigger>
                              <SelectContent>
                                {products?.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>IMEI/ICCID/SKU (opcional)</Label>
                            <Input
                              value={currentItem.serialNumber}
                              onChange={(e) => setCurrentItem({ ...currentItem, serialNumber: e.target.value })}
                              placeholder="Número de serie"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Cantidad *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={currentItem.quantity}
                              onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button type="button" onClick={addItem} variant="outline" className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar a la transferencia
                        </Button>
                      </CardContent>
                    </Card>

                    {items.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Productos a transferir</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Serie</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item, index) => {
                                const product = products?.find((p) => p.id === item.productId);
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{product?.name}</TableCell>
                                    <TableCell className="font-mono text-xs">
                                      {item.serialNumber || "-"}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItem(index)}
                                      >
                                        Eliminar
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || items.length === 0 || !destinationStoreId}>
                      {createMutation.isPending ? "Procesando..." : "Crear Transferencia"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pendientes ({pendingTransfers.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completadas ({completedTransfers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transferencias Pendientes</CardTitle>
                <CardDescription>
                  Transferencias en tránsito esperando recepción
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTransfers.length > 0 ? (
                      pendingTransfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-mono text-sm">
                            {transfer.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            {new Date(transfer.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {transfer.destination_stores?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            {transfer.transfer_items?.length || 0} items
                          </TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              En Tránsito
                            </span>
                          </TableCell>
                          <TableCell>
                            {user?.role === "store_user" && user?.storeId === transfer.destination_store_id && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReceive(transfer.id, true)}
                                  disabled={receiveMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Aceptar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReceive(transfer.id, false)}
                                  disabled={receiveMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Rechazar
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No hay transferencias pendientes
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transferencias Completadas</CardTitle>
                <CardDescription>
                  Historial de transferencias recibidas o rechazadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedTransfers.length > 0 ? (
                      completedTransfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-mono text-sm">
                            {transfer.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            {new Date(transfer.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {transfer.destination_stores?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            {transfer.transfer_items?.length || 0} items
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              transfer.status === "RECIBIDA" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {transfer.status === "RECIBIDA" ? "Recibida" : "Rechazada"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay transferencias completadas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
