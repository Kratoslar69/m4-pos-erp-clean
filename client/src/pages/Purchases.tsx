import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Purchases() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ productId: string; serialNumber?: string; quantity: number; costo: number }>>([]);
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    serialNumber: "",
    quantity: "1",
    costo: "",
  });
  const [supplierId, setSupplierId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const { data: purchases, refetch } = trpc.purchases.list.useQuery();
  const { data: products } = trpc.products.list.useQuery({});
  const { data: suppliers } = trpc.suppliers.list.useQuery({ activeOnly: true });
  const { data: stores } = trpc.stores.list.useQuery();
  const createMutation = trpc.purchases.create.useMutation({
    onSuccess: () => {
      toast.success("Compra registrada exitosamente");
      setOpen(false);
      setItems([]);
      setCurrentItem({ productId: "", serialNumber: "", quantity: "1", costo: "" });
      setSupplierId("");
      setStoreId("");
      setInvoiceNumber("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addItem = () => {
    if (!currentItem.productId || !currentItem.costo) {
      toast.error("Completa todos los campos");
      return;
    }
    setItems([
      ...items,
      {
        productId: currentItem.productId,
        serialNumber: currentItem.serialNumber || undefined,
        quantity: parseInt(currentItem.quantity),
        costo: parseFloat(currentItem.costo),
      },
    ]);
    setCurrentItem({ productId: "", serialNumber: "", quantity: "1", costo: "" });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.costo * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    if (!supplierId) {
      toast.error("Selecciona un proveedor");
      return;
    }
    if (!storeId) {
      toast.error("Selecciona una tienda destino");
      return;
    }
    createMutation.mutate({
      supplierId,
      storeId,
      invoiceNumber: invoiceNumber || undefined,
      items,
    });
  };

  // Solo superadmin y admin pueden ver compras
  if (user?.role === "store_user") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">No tienes permisos para acceder a este módulo</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
            <p className="text-muted-foreground">
              Órdenes de compra centralizadas
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Nueva Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Compra</DialogTitle>
                  <DialogDescription>
                    Compra centralizada - inventario se agregará a CENTRAL
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Información de la compra */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Información de la Compra</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Proveedor *</Label>
                          <Select value={supplierId} onValueChange={setSupplierId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers?.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Tienda Destino *</Label>
                          <Select value={storeId} onValueChange={setStoreId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tienda" />
                            </SelectTrigger>
                            <SelectContent>
                              {stores?.map((store) => (
                                <SelectItem key={store.id} value={store.id}>
                                  {store.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Número de Factura (opcional)</Label>
                          <Input
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            placeholder="INV-12345"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Agregar productos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Agregar Producto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                        <div className="space-y-2">
                          <Label>Costo Unitario *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={currentItem.costo}
                            onChange={(e) => setCurrentItem({ ...currentItem, costo: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <Button type="button" onClick={addItem} variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar a la compra
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Lista de productos */}
                  {items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Productos en la compra</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead>Serie</TableHead>
                              <TableHead>Cantidad</TableHead>
                              <TableHead className="text-right">Costo</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
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
                                  <TableCell className="text-right">${item.costo.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">${(item.costo * item.quantity).toLocaleString()}</TableCell>
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
                        <div className="mt-4 flex justify-end">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">${total.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || items.length === 0 || !supplierId}>
                    {createMutation.isPending ? "Procesando..." : `Confirmar Compra ($${total.toLocaleString()})`}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Compras</CardTitle>
            <CardDescription>
              Registro de todas las órdenes de compra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases && purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-mono text-sm">
                        {purchase.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {new Date(purchase.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {purchase.suppliers?.name || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {purchase.invoice_number || "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${purchase.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Confirmada
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No hay compras registradas
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
