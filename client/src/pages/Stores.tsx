import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Stores() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    is_warehouse: false,
  });

  const { data: stores, refetch } = trpc.stores.list.useQuery();
  const createMutation = trpc.stores.create.useMutation({
    onSuccess: () => {
      toast.success("Tienda creada exitosamente");
      setOpen(false);
      setFormData({ name: "", code: "", address: "", phone: "", is_warehouse: false });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tiendas</h1>
            <p className="text-muted-foreground">
              Gestiona los puntos de venta del sistema
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tienda
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Tienda</DialogTitle>
                  <DialogDescription>
                    Ingresa los datos de la nueva tienda
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Código *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_warehouse"
                      checked={formData.is_warehouse}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_warehouse: checked })}
                    />
                    <Label htmlFor="is_warehouse">Es almacén central</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creando..." : "Crear Tienda"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stores?.map((store) => (
            <Card key={store.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {store.name}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      store.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {store.is_active ? "Activa" : "Inactiva"}
                  </span>
                </CardTitle>
                <CardDescription>{store.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {store.address && (
                    <p className="text-muted-foreground">{store.address}</p>
                  )}
                  {store.phone && (
                    <p className="text-muted-foreground">{store.phone}</p>
                  )}
                  {store.is_warehouse && (
                    <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                      Almacén Central
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
