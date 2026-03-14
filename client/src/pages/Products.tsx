import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogScrollableContent, DialogFixedHeader, DialogFixedFooter } from "@/components/ui/dialog-scrollable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import BulkImportHandsets from "@/components/BulkImportHandsets";

type ProductType = "HANDSET" | "SIM";

export default function Products() {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<ProductType>("HANDSET");
  
  const [formData, setFormData] = useState({
    type: "HANDSET" as ProductType,
    // Campos para EQUIPOS (HANDSET)
    brand: "", // Marca
    model: "", // Modelo
    imei: "", // IMEI
    model_nomenclature: "", // Nomenclatura del modelo
    color: "", // Color
    ram_capacity: "", // Capacidad de RAM (GB)
    storage_capacity: "", // Capacidad de Memoria (GB)
    purchase_price: "", // Costo
    profit_percentage: "", // %Utilidad
    sale_price: "", // Precio Contado
    payjoy_profit: "", // Utilidad PayJoy
    is_offer: false, // Oferta
    offer_discount: "", // Des x Oferta
    payjoy_price_3m: "", // Precio PayJoy c/3M
    bait_cost_3m: "", // Costo Bait 3M
    bait_commission_3m: "", // Comision Bait 3M
    payjoy_price_6m: "", // Precio PayJoy c/6M
    bait_cost_6m: "", // Costo Bait 6M
    bait_commission_6m: "", // Comision Bait 6M
    // Campos para SIM
    iccid: "", // ICCID
    carrier: "", // Telefonía (operador)
    package: "", // Paquete
    // Campo común
    commission_rate: "", // % Comisión del vendedor
  });

  const { data: products, refetch } = trpc.products.list.useQuery({ type: activeTab });
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Producto creado exitosamente");
      refetch();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error al crear producto: ${error.message}`);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Producto actualizado exitosamente");
      refetch();
      setOpen(false);
      setEditingProduct(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error al actualizar producto: ${error.message}`);
    },
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Producto eliminado exitosamente");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al eliminar producto: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      type: activeTab,
      brand: "",
      model: "",
      imei: "",
      model_nomenclature: "",
      color: "",
      ram_capacity: "",
      storage_capacity: "",
      purchase_price: "",
      profit_percentage: "",
      sale_price: "",
      payjoy_profit: "",
      is_offer: false,
      offer_discount: "",
      payjoy_price_3m: "",
      bait_cost_3m: "",
      bait_commission_3m: "",
      payjoy_price_6m: "",
      bait_cost_6m: "",
      bait_commission_6m: "",
      iccid: "",
      carrier: "",
      package: "",
      commission_rate: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.type === "HANDSET") {
      // Validar campos de equipos
      if (!formData.brand || !formData.model || !formData.imei) {
        toast.error("Por favor completa los campos obligatorios: Marca, Modelo e IMEI");
        return;
      }
    } else if (formData.type === "SIM") {
      // Validar campos de SIM
      if (!formData.iccid || !formData.carrier) {
        toast.error("Por favor completa los campos obligatorios: ICCID y Telefonía");
        return;
      }
    }

    const payload: any = {
      type: formData.type,
    };

    if (formData.type === "HANDSET") {
      payload.brand = formData.brand;
      payload.model = formData.model;
      payload.imei = formData.imei;
      payload.model_nomenclature = formData.model_nomenclature || null;
      payload.color = formData.color || null;
      payload.ram_capacity = formData.ram_capacity ? parseInt(formData.ram_capacity) : null;
      payload.storage_capacity = formData.storage_capacity ? parseInt(formData.storage_capacity) : null;
      payload.purchase_price = formData.purchase_price ? parseFloat(formData.purchase_price) : null;
      payload.profit_percentage = formData.profit_percentage ? parseFloat(formData.profit_percentage) : null;
      payload.sale_price = formData.sale_price ? parseFloat(formData.sale_price) : null;
      payload.payjoy_profit = formData.payjoy_profit ? parseFloat(formData.payjoy_profit) : null;
      payload.is_offer = formData.is_offer;
      payload.offer_discount = formData.offer_discount ? parseFloat(formData.offer_discount) : null;
      payload.payjoy_price_3m = formData.payjoy_price_3m ? parseFloat(formData.payjoy_price_3m) : null;
      payload.bait_cost_3m = formData.bait_cost_3m ? parseFloat(formData.bait_cost_3m) : null;
      payload.bait_commission_3m = formData.bait_commission_3m ? parseFloat(formData.bait_commission_3m) : null;
      payload.payjoy_price_6m = formData.payjoy_price_6m ? parseFloat(formData.payjoy_price_6m) : null;
      payload.bait_cost_6m = formData.bait_cost_6m ? parseFloat(formData.bait_cost_6m) : null;
      payload.bait_commission_6m = formData.bait_commission_6m ? parseFloat(formData.bait_commission_6m) : null;
    } else if (formData.type === "SIM") {
      payload.iccid = formData.iccid;
      payload.carrier = formData.carrier;
      payload.package = formData.package || null;
    }

    payload.commission_rate = formData.commission_rate ? parseFloat(formData.commission_rate) : null;

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      type: product.type,
      brand: product.brand || "",
      model: product.model || "",
      imei: product.imei || "",
      model_nomenclature: product.model_nomenclature || "",
      color: product.color || "",
      ram_capacity: product.ram_capacity?.toString() || "",
      storage_capacity: product.storage_capacity?.toString() || "",
      purchase_price: product.purchase_price?.toString() || "",
      profit_percentage: product.profit_percentage?.toString() || "",
      sale_price: product.sale_price?.toString() || "",
      payjoy_profit: product.payjoy_profit?.toString() || "",
      is_offer: product.is_offer || false,
      offer_discount: product.offer_discount?.toString() || "",
      payjoy_price_3m: product.payjoy_price_3m?.toString() || "",
      bait_cost_3m: product.bait_cost_3m?.toString() || "",
      bait_commission_3m: product.bait_commission_3m?.toString() || "",
      payjoy_price_6m: product.payjoy_price_6m?.toString() || "",
      bait_cost_6m: product.bait_cost_6m?.toString() || "",
      bait_commission_6m: product.bait_commission_6m?.toString() || "",
      iccid: product.iccid || "",
      carrier: product.carrier || "",
      package: product.package || "",
      commission_rate: product.commission_rate?.toString() || "",
    });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredProducts = products?.filter((product: any) => {
    const searchLower = searchTerm.toLowerCase();
    if (product.type === "HANDSET") {
      return (
        product.brand?.toLowerCase().includes(searchLower) ||
        product.model?.toLowerCase().includes(searchLower) ||
        product.imei?.toLowerCase().includes(searchLower)
      );
    } else {
      return (
        product.iccid?.toLowerCase().includes(searchLower) ||
        product.carrier?.toLowerCase().includes(searchLower)
      );
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona el catálogo de equipos y SIMs
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as ProductType);
          resetForm();
          setFormData({ ...formData, type: value as ProductType });
        }}>
          <TabsList>
            <TabsTrigger value="HANDSET">Equipos</TabsTrigger>
            <TabsTrigger value="SIM">SIMs</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{activeTab === "HANDSET" ? "Equipos" : "SIMs"}</CardTitle>
                    <CardDescription>
                      {activeTab === "HANDSET" 
                        ? "Lista de equipos móviles registrados"
                        : "Lista de tarjetas SIM registradas"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {activeTab === "HANDSET" && (
                      <BulkImportHandsets onSuccess={() => refetch()} />
                    )}
                    <Dialog open={open} onOpenChange={(isOpen) => {
                      setOpen(isOpen);
                      if (!isOpen) {
                        setEditingProduct(null);
                        resetForm();
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo {activeTab === "HANDSET" ? "Equipo" : "SIM"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                      <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <DialogFixedHeader>
                          <DialogHeader>
                            <DialogTitle>
                              {editingProduct ? "Editar" : "Crear Nuevo"} {activeTab === "HANDSET" ? "Equipo" : "SIM"}
                            </DialogTitle>
                            <DialogDescription>
                              Ingresa los datos del {activeTab === "HANDSET" ? "equipo" : "SIM"}
                            </DialogDescription>
                          </DialogHeader>
                        </DialogFixedHeader>
                        <DialogScrollableContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* FORMULARIO PARA EQUIPOS */}
                            {formData.type === "HANDSET" && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="brand">Marca *</Label>
                                  <Input
                                    id="brand"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="model">Modelo *</Label>
                                  <Input
                                    id="model"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label htmlFor="imei">IMEI *</Label>
                                  <Input
                                    id="imei"
                                    value={formData.imei}
                                    onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                                    placeholder="Escanear o ingresar manualmente"
                                    required
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label htmlFor="model_nomenclature">Nomenclatura del Modelo</Label>
                                  <Input
                                    id="model_nomenclature"
                                    value={formData.model_nomenclature}
                                    onChange={(e) => setFormData({ ...formData, model_nomenclature: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="color">Color</Label>
                                  <Input
                                    id="color"
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    placeholder="Ej: Negro, Blanco, Azul"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="ram_capacity">Capacidad de RAM (GB)</Label>
                                  <Input
                                    id="ram_capacity"
                                    type="number"
                                    value={formData.ram_capacity}
                                    onChange={(e) => setFormData({ ...formData, ram_capacity: e.target.value })}
                                    placeholder="Ej: 8"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="storage_capacity">Capacidad de Memoria (GB)</Label>
                                  <Input
                                    id="storage_capacity"
                                    type="number"
                                    value={formData.storage_capacity}
                                    onChange={(e) => setFormData({ ...formData, storage_capacity: e.target.value })}
                                    placeholder="Ej: 128"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="purchase_price">Costo</Label>
                                  <Input
                                    id="purchase_price"
                                    type="number"
                                    step="0.01"
                                    value={formData.purchase_price}
                                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="profit_percentage">%Utilidad</Label>
                                  <Input
                                    id="profit_percentage"
                                    type="number"
                                    step="0.01"
                                    value={formData.profit_percentage}
                                    onChange={(e) => setFormData({ ...formData, profit_percentage: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="sale_price">Precio Contado</Label>
                                  <Input
                                    id="sale_price"
                                    type="number"
                                    step="0.01"
                                    value={formData.sale_price}
                                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="payjoy_profit">Utilidad PayJoy</Label>
                                  <Input
                                    id="payjoy_profit"
                                    type="number"
                                    step="0.01"
                                    value={formData.payjoy_profit}
                                    onChange={(e) => setFormData({ ...formData, payjoy_profit: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="is_offer">Oferta</Label>
                                  <Select
                                    value={formData.is_offer ? "true" : "false"}
                                    onValueChange={(value) => setFormData({ ...formData, is_offer: value === "true" })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="false">No</SelectItem>
                                      <SelectItem value="true">Sí</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="offer_discount">Des x Oferta</Label>
                                  <Input
                                    id="offer_discount"
                                    type="number"
                                    step="0.01"
                                    value={formData.offer_discount}
                                    onChange={(e) => setFormData({ ...formData, offer_discount: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="payjoy_price_3m">Precio PayJoy c/3M</Label>
                                  <Input
                                    id="payjoy_price_3m"
                                    type="number"
                                    step="0.01"
                                    value={formData.payjoy_price_3m}
                                    onChange={(e) => setFormData({ ...formData, payjoy_price_3m: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="bait_cost_3m">Costo Bait 3M</Label>
                                  <Input
                                    id="bait_cost_3m"
                                    type="number"
                                    step="0.01"
                                    value={formData.bait_cost_3m}
                                    onChange={(e) => setFormData({ ...formData, bait_cost_3m: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="bait_commission_3m">Comisión Bait 3M</Label>
                                  <Input
                                    id="bait_commission_3m"
                                    type="number"
                                    step="0.01"
                                    value={formData.bait_commission_3m}
                                    onChange={(e) => setFormData({ ...formData, bait_commission_3m: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="payjoy_price_6m">Precio PayJoy c/6M</Label>
                                  <Input
                                    id="payjoy_price_6m"
                                    type="number"
                                    step="0.01"
                                    value={formData.payjoy_price_6m}
                                    onChange={(e) => setFormData({ ...formData, payjoy_price_6m: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="bait_cost_6m">Costo Bait 6M</Label>
                                  <Input
                                    id="bait_cost_6m"
                                    type="number"
                                    step="0.01"
                                    value={formData.bait_cost_6m}
                                    onChange={(e) => setFormData({ ...formData, bait_cost_6m: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="bait_commission_6m">Comisión Bait 6M</Label>
                                  <Input
                                    id="bait_commission_6m"
                                    type="number"
                                    step="0.01"
                                    value={formData.bait_commission_6m}
                                    onChange={(e) => setFormData({ ...formData, bait_commission_6m: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="commission_rate">% Comisión del Vendedor</Label>
                                  <Input
                                    id="commission_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.commission_rate}
                                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                                    placeholder="Ej: 5.5"
                                  />
                                </div>
                              </>
                            )}

                            {/* FORMULARIO PARA SIM */}
                            {formData.type === "SIM" && (
                              <>
                                <div className="space-y-2 col-span-2">
                                  <Label htmlFor="iccid">ICCID *</Label>
                                  <Input
                                    id="iccid"
                                    value={formData.iccid}
                                    onChange={(e) => setFormData({ ...formData, iccid: e.target.value })}
                                    placeholder="Número ICCID de la SIM"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="carrier">Telefonía (Operador) *</Label>
                                  <Input
                                    id="carrier"
                                    value={formData.carrier}
                                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                                    placeholder="Ej: Telcel, AT&T, Movistar"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="package">Paquete</Label>
                                  <Input
                                    id="package"
                                    value={formData.package}
                                    onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                                    placeholder="Ej: Plan 500, Amigo Kit"
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label htmlFor="commission_rate">% Comisión del Vendedor</Label>
                                  <Input
                                    id="commission_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.commission_rate}
                                    onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                                    placeholder="Ej: 5.5"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </DialogScrollableContent>
                        <DialogFixedFooter>
                          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                            {editingProduct ? "Actualizar" : "Crear"}
                          </Button>
                        </DialogFixedFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={activeTab === "HANDSET" ? "Buscar por marca, modelo o IMEI..." : "Buscar por ICCID o telefonía..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      {activeTab === "HANDSET" ? (
                        <>
                          <TableHead>Marca</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead>IMEI</TableHead>
                          <TableHead>Color</TableHead>
                          <TableHead>RAM</TableHead>
                          <TableHead>Memoria</TableHead>
                          <TableHead>Precio Venta</TableHead>
                          <TableHead>Comisión</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>ICCID</TableHead>
                          <TableHead>Telefonía</TableHead>
                          <TableHead>Paquete</TableHead>
                          <TableHead>Comisión</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts?.map((product: any) => (
                      <TableRow key={product.id}>
                        {activeTab === "HANDSET" ? (
                          <>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>{product.model}</TableCell>
                            <TableCell className="font-mono text-sm">{product.imei}</TableCell>
                            <TableCell>{product.color || "-"}</TableCell>
                            <TableCell>{product.ram_capacity ? `${product.ram_capacity} GB` : "-"}</TableCell>
                            <TableCell>{product.storage_capacity ? `${product.storage_capacity} GB` : "-"}</TableCell>
                            <TableCell>${product.sale_price || "0.00"}</TableCell>
                            <TableCell>{product.commission_rate ? `${product.commission_rate}%` : "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-mono text-sm">{product.iccid}</TableCell>
                            <TableCell>{product.carrier}</TableCell>
                            <TableCell>{product.package || "-"}</TableCell>
                            <TableCell>{product.commission_rate ? `${product.commission_rate}%` : "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredProducts?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron {activeTab === "HANDSET" ? "equipos" : "SIMs"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
