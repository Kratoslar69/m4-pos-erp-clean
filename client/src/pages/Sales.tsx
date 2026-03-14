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
import { Plus, ShoppingCart, WifiOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { offlineDB, PendingSale } from "@/lib/offlineDB";
import { syncService } from "@/lib/syncService";

export default function Sales() {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ productId: string; serialNumber?: string; quantity: number; precioUnitario: number }>>([]);
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    serialNumber: "",
    quantity: "1",
    price: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("CONTADO");
  const [paymentPlan, setPaymentPlan] = useState("");

  const { data: sales, refetch } = trpc.sales.list.useQuery({});
  const { data: products } = trpc.products.list.useQuery({});
  const createMutation = trpc.sales.create.useMutation({
    onSuccess: () => {
      toast.success("Venta registrada exitosamente");
      setOpen(false);
      setItems([]);
      setCurrentItem({ productId: "", serialNumber: "", quantity: "1", price: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addItem = () => {
    if (!currentItem.productId || !currentItem.price) {
      toast.error("Completa todos los campos");
      return;
    }
    setItems([
      ...items,
      {
        productId: currentItem.productId,
        serialNumber: currentItem.serialNumber || undefined,
        quantity: parseInt(currentItem.quantity),
        precioUnitario: parseFloat(currentItem.price),
      },
    ]);
    setCurrentItem({ productId: "", serialNumber: "", quantity: "1", price: "" });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, item) => sum + item.precioUnitario * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    if (!user?.storeId) {
      toast.error("No se pudo determinar la tienda");
      return;
    }

    // Si está offline, guardar en IndexedDB
    if (!isOnline) {
      try {
        const pendingSale: PendingSale = {
          id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          storeId: user.storeId,
          userId: user.id,
          products: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.precioUnitario,
          })),
          total,
          paymentMethod,
          timestamp: Date.now(),
          synced: false,
        };
        
        await offlineDB.savePendingSale(pendingSale);
        toast.success("Venta guardada offline. Se sincronizará automáticamente cuando recuperes la conexión.", {
          icon: <WifiOff className="h-4 w-4" />,
        });
        
        setOpen(false);
        setItems([]);
        setCurrentItem({ productId: "", serialNumber: "", quantity: "1", price: "" });
        refetch();
      } catch (error) {
        toast.error("Error al guardar la venta offline");
        console.error(error);
      }
      return;
    }

    // Si está online, enviar normalmente
    createMutation.mutate({
      storeId: user.storeId,
      paymentPlan: paymentMethod as any,
      msiMonths: paymentMethod === "MSI" && paymentPlan ? parseInt(paymentPlan) : undefined,
      discount: 0,
      items,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
            <p className="text-muted-foreground">
              Punto de venta (POS)
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Nueva Venta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Registrar Nueva Venta</DialogTitle>
                  <DialogDescription>
                    Agrega productos y completa la venta
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
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
                              const product = products?.find((p) => p.id === value);
                              setCurrentItem({
                                ...currentItem,
                                productId: value,
                                price: product?.precio_lista?.toString() || "",
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ${product.precio_lista?.toLocaleString()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>IMEI/ICCID (opcional)</Label>
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
                          <Label>Precio *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={currentItem.price}
                            onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button type="button" onClick={addItem} variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar a la venta
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Lista de productos */}
                  {items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Productos en la venta</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Producto</TableHead>
                              <TableHead>Cantidad</TableHead>
                              <TableHead className="text-right">Precio</TableHead>
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
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell className="text-right">${item.precioUnitario.toLocaleString()}</TableCell>
                                  <TableCell className="text-right">${(item.precioUnitario * item.quantity).toLocaleString()}</TableCell>
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

                  {/* Método de pago */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Método de Pago</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Método *</Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CONTADO">Contado</SelectItem>
                              <SelectItem value="MSI">Meses Sin Intereses</SelectItem>
                              <SelectItem value="PAYJOY">PayJoy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {paymentMethod === "MSI" && (
                          <div className="space-y-2">
                            <Label>Plan *</Label>
                            <Select value={paymentPlan} onValueChange={setPaymentPlan}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona plan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 meses</SelectItem>
                                <SelectItem value="6">6 meses</SelectItem>
                                <SelectItem value="9">9 meses</SelectItem>
                                <SelectItem value="12">12 meses</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || items.length === 0}>
                    {createMutation.isPending ? "Procesando..." : `Completar Venta ($${total.toLocaleString()})`}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Ventas</CardTitle>
            <CardDescription>
              Registro de todas las ventas realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Método de Pago</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales && sales.length > 0 ? (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono text-sm">
                        {sale.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {new Date(sale.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {sale.payment_method}
                        {sale.payment_plan && ` (${sale.payment_plan} meses)`}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${sale.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Completada
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay ventas registradas
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
