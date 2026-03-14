import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Inventory() {
  const [searchSerial, setSearchSerial] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data: stores } = trpc.stores.list.useQuery();
  const { data: items } = trpc.inventory.items.useQuery({
    storeId: selectedStore || undefined,
    status: selectedStatus as any || undefined,
    serialNumber: searchSerial || undefined,
  });
  const { data: stock } = trpc.inventory.stock.useQuery({
    storeId: selectedStore || undefined,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Control de equipos serializados y stock por SKU
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por IMEI, ICCID o SKU..."
                value={searchSerial}
                onChange={(e) => setSearchSerial(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todas las tiendas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas las tiendas</SelectItem>
              {stores?.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              <SelectItem value="EN_ALMACEN">En Almacén</SelectItem>
              <SelectItem value="EN_TRANSITO">En Tránsito</SelectItem>
              <SelectItem value="EN_TIENDA">En Tienda</SelectItem>
              <SelectItem value="RESERVADO">Reservado</SelectItem>
              <SelectItem value="VENDIDO">Vendido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="serialized">
          <TabsList>
            <TabsTrigger value="serialized">Items Serializados</TabsTrigger>
            <TabsTrigger value="stock">Stock por SKU</TabsTrigger>
          </TabsList>

          <TabsContent value="serialized" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventario Serializado</CardTitle>
                <CardDescription>
                  Equipos y SIMs con número de serie único
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número de Serie</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tienda</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items && items.length > 0 ? (
                      items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {item.serial_number}
                          </TableCell>
                          <TableCell>
                            {item.products?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            {item.stores?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                item.status === "EN_TIENDA"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "VENDIDO"
                                  ? "bg-blue-100 text-blue-800"
                                  : item.status === "EN_TRANSITO"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.costo ? `$${item.costo.toLocaleString()}` : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay items en inventario
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock por SKU</CardTitle>
                <CardDescription>
                  Inventario de accesorios y productos no serializados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tienda</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Costo Promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stock && stock.length > 0 ? (
                      stock.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.products?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            {item.stores?.name || "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.costo_promedio ? `$${item.costo_promedio.toLocaleString()}` : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No hay stock registrado
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
