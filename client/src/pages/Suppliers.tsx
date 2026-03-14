import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Suppliers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: suppliers, isLoading } = trpc.suppliers.list.useQuery({ activeOnly: showActiveOnly });

  // Filtrar proveedores por búsqueda
  const filteredSuppliers = suppliers?.filter((supplier) => {
    const search = searchTerm.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(search) ||
      supplier.contact_person?.toLowerCase().includes(search) ||
      supplier.email?.toLowerCase().includes(search) ||
      supplier.phone?.toLowerCase().includes(search)
    );
  }) || [];

  const createMutation = trpc.suppliers.create.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
      alert("Proveedor creado exitosamente");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateMutation = trpc.suppliers.update.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
      alert("Proveedor actualizado exitosamente");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      utils.suppliers.list.invalidate();
      alert("Proveedor eliminado exitosamente");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    });
    setEditingSupplier(null);
  };

  const handleOpenDialog = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || "",
        contactPerson: supplier.contact_person || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        notes: supplier.notes || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("El nombre del proveedor es requerido");
      return;
    }

    if (editingSupplier) {
      updateMutation.mutate({
        id: editingSupplier.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este proveedor?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
            <p className="text-muted-foreground">
              Administrar proveedores del sistema
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, contacto, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            variant={showActiveOnly ? "default" : "outline"}
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={showActiveOnly ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            {showActiveOnly ? "Solo Activos" : "Todos"}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Cargando proveedores...</div>
        ) : !filteredSuppliers || filteredSuppliers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No se encontraron proveedores con ese criterio" : "No hay proveedores registrados"}
          </div>
        ) : (
          <div className="bg-card rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Nombre</th>
                  <th className="text-left p-4 font-medium">Contacto</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Teléfono</th>
                  <th className="text-left p-4 font-medium">Dirección</th>
                  <th className="text-right p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4 font-medium">{supplier.name}</td>
                    <td className="p-4">{supplier.contact_person || "-"}</td>
                    <td className="p-4">{supplier.email || "-"}</td>
                    <td className="p-4">{supplier.phone || "-"}</td>
                    <td className="p-4">{supplier.address || "-"}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(supplier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
              </DialogTitle>
              <DialogDescription>
                {editingSupplier
                  ? "Modifica la información del proveedor"
                  : "Completa los datos del nuevo proveedor"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Nombre del Proveedor <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Distribuidora Tech"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact_person">Persona de Contacto</Label>
                  <Input
                    id="contact_person"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="contacto@proveedor.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="555-1234"
                    />
                  </div>
                </div>
                {/* Campos address y notes temporalmente deshabilitados */}
                {/*
                <div className="grid gap-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Calle, número, ciudad"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Información adicional sobre el proveedor"
                    rows={3}
                  />
                </div>
                */}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingSupplier ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
