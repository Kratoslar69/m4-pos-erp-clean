import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogScrollableContent, DialogFixedHeader, DialogFixedFooter } from "@/components/ui/dialog-scrollable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Upload, FileSpreadsheet, Image as ImageIcon, X, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface HandsetRow {
  MARCA: string;
  SUBMODELO: string;
  IMEI: string | number;
  "NOM MODELO": string;
  COLOR: string;
  "RAM GB": number;
  "MEMORIA GB": number;
  "es PayJoy?": string;
  Costo: number;
  "Precio Contado": number;
  Oferta: string | number;  // Valor calculado por fórmula
  "Des x Oferta": number;
  " Precio PayJoy c/3M ": string | number;  // Nota: tiene espacios
  " Precio PayJoy c/6M ": string | number;  // Nota: tiene espacios
}

interface ProcessedHandset {
  brand: string;
  model: string;
  imei: string;
  model_nomenclature: string;
  color: string;
  ram_capacity: number;
  storage_capacity: number;
  purchase_price: number;
  profit_percentage: number | null;
  sale_price: number;
  payjoy_profit: number | null;
  is_offer: boolean;
  offer_discount: number | null;
  payjoy_price_3m: number | null;
  bait_cost_3m: number | null;
  bait_commission_3m: number | null;
  payjoy_price_6m: number | null;
  bait_cost_6m: number | null;
  bait_commission_6m: number | null;
  commission_rate: number | null;
  image_url: string | null;
}

export default function BulkImportHandsets({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [parsedData, setParsedData] = useState<ProcessedHandset[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const excelInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const bulkImportMutation = trpc.products.bulkImportHandsets.useMutation({
    onSuccess: (result) => {
      toast.success(`Importación completada: ${result.success} exitosos, ${result.failed} fallidos`);
      if (result.errors.length > 0) {
        console.error("Errores de importación:", result.errors);
        toast.error(`${result.errors.length} equipos no se pudieron importar. Ver consola para detalles.`);
      }
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      toast.error(`Error en la importación: ${error.message}`);
      setIsProcessing(false);
    },
  });

  // Contador de tiempo
  useState(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  });

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // Leer como arrays para capturar todas las columnas, incluso vacías
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Saltar la fila de headers (primera fila)
        const dataRows = jsonData.slice(1);
        
        // Filtrar filas vacías (sin IMEI en columna 3)
        const validRows = dataRows.filter(row => {
          const imei = row[2];  // Columna 3 (IMEI)
          return imei && String(imei).trim() !== "";
        });
        
        const processed = validRows.map((row) => processHandsetRow(row));
        setParsedData(processed);
        toast.success(`${processed.length} equipos detectados en el archivo`);
      } catch (error) {
        toast.error("Error al procesar el archivo Excel");
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    toast.success(`${files.length} imágenes seleccionadas`);
  };

  const processHandsetRow = (row: any[] | HandsetRow): ProcessedHandset => {
    // Si es array, convertir a objeto usando índices
    if (Array.isArray(row)) {
      return processArrayRow(row);
    }
    // Mantener compatibilidad con formato anterior
    return processObjectRow(row);
  };
  
  const processArrayRow = (row: any[]): ProcessedHandset => {
    const imei = String(row[2] || "").trim();  // Columna 3 (IMEI)
    
    // Procesar precios PayJoy
    const parsePrice = (value: any): number | null => {
      if (typeof value === "number" && value > 0) return value;
      if (typeof value === "string" && value.toLowerCase() !== "no aplica" && value.trim() !== "") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    };
    
    // Procesar oferta (columna 13)
    const isOffer = row[12] && String(row[12]).toLowerCase() !== "no";
    
    return {
      brand: String(row[0] || "").trim(),  // Columna 1: MARCA
      model: String(row[1] || "").trim(),  // Columna 2: SUBMODELO
      imei: imei,  // Columna 3: IMEI
      model_nomenclature: String(row[3] || "").trim(),  // Columna 4: NOM MODELO
      color: String(row[4] || "").trim(),  // Columna 5: COLOR
      ram_capacity: Number(row[5]) || 0,  // Columna 6: RAM GB
      storage_capacity: Number(row[6]) || 0,  // Columna 7: MEMORIA GB
      purchase_price: Number(row[8]) || 0,  // Columna 9: Costo
      profit_percentage: Number(row[9]) || null,  // Columna 10: %Utilidad
      sale_price: Number(row[10]) || 0,  // Columna 11: Precio Contado
      payjoy_profit: Number(row[11]) || null,  // Columna 12: Utilidad PayJoy
      is_offer: Boolean(isOffer),  // Columna 13: Oferta
      offer_discount: Number(row[13]) || null,  // Columna 14: Des x Oferta
      payjoy_price_3m: parsePrice(row[14]),  // Columna 15: Precio PayJoy c/3M
      bait_cost_3m: Number(row[15]) || null,  // Columna 16: Costo Bait (3M)
      bait_commission_3m: Number(row[16]) || null,  // Columna 17: Comision Bait (3M)
      payjoy_price_6m: parsePrice(row[17]),  // Columna 18: Precio PayJoy c/6M
      bait_cost_6m: Number(row[18]) || null,  // Columna 19: Costo Bait (6M)
      bait_commission_6m: Number(row[19]) || null,  // Columna 20: Comision Bait (6M)
      commission_rate: null,
      image_url: null,
    };
  };
  
  const processObjectRow = (row: HandsetRow): ProcessedHandset => {
    const imei = String(row.IMEI).trim();
    
    // Procesar precios PayJoy
    const parsePrice = (value: string | number): number | null => {
      if (typeof value === "number" && value > 0) return value;
      if (typeof value === "string" && value.toLowerCase() !== "no aplica" && value.trim() !== "") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    };
    
    // Procesar oferta
    const isOffer = row.Oferta && String(row.Oferta).toLowerCase() !== "no";
    
    return {
      brand: row.MARCA?.trim() || "",
      model: row.SUBMODELO?.trim() || "",
      imei: imei,
      model_nomenclature: row["NOM MODELO"]?.trim() || "",
      color: row.COLOR?.trim() || "",
      ram_capacity: Number(row["RAM GB"]) || 0,
      storage_capacity: Number(row["MEMORIA GB"]) || 0,
      purchase_price: Number(row.Costo) || 0,
      profit_percentage: null,  // No existe en Excel
      sale_price: Number(row["Precio Contado"]) || 0,
      payjoy_profit: null,  // No existe en Excel
      is_offer: Boolean(isOffer),
      offer_discount: Number(row["Des x Oferta"]) || null,
      payjoy_price_3m: parsePrice(row[" Precio PayJoy c/3M "]),  // Nota: con espacios
      bait_cost_3m: null,  // No existe en Excel
      bait_commission_3m: null,  // No existe en Excel
      payjoy_price_6m: parsePrice(row[" Precio PayJoy c/6M "]),  // Nota: con espacios
      bait_cost_6m: null,  // No existe en Excel
      bait_commission_6m: null,  // No existe en Excel
      commission_rate: null,
      image_url: null,
    };
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error("No hay datos para importar");
      return;
    }

    setIsProcessing(true);
    setStartTime(Date.now());
    
    // TODO: Subir imágenes a S3 y asociarlas con productos
    // Por ahora, importar sin imágenes
    
    bulkImportMutation.mutate({ handsets: parsedData });
  };

  const handleClose = () => {
    setOpen(false);
    setExcelFile(null);
    setImageFiles([]);
    setParsedData([]);
    setIsProcessing(false);
    setStartTime(null);
    setElapsedTime(0);
    if (excelInputRef.current) excelInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Carga Masiva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogFixedHeader>
          <DialogTitle>Carga Masiva de Equipos</DialogTitle>
          <DialogDescription>
            Sube un archivo Excel con los datos de los equipos y opcionalmente imágenes asociadas
          </DialogDescription>
        </DialogFixedHeader>

        <DialogScrollableContent>
          <div className="space-y-6">
            {/* Subir Excel */}
            <div className="space-y-2">
              <Label htmlFor="excel-file">Archivo Excel *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  ref={excelInputRef}
                  disabled={isProcessing}
                />
                {excelFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileSpreadsheet className="h-4 w-4" />
                    {excelFile.name}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Formato esperado: MARCA, SUBMODELO, IMEI, NOM MODELO, COLOR, RAM GB, MEMORIA GB, Costo, Precio Contado, Precio PayJoy
              </p>
            </div>

            {/* Subir Imágenes (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="image-files">Imágenes (Opcional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image-files"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  ref={imageInputRef}
                  disabled={isProcessing}
                />
                {imageFiles.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <ImageIcon className="h-4 w-4" />
                    {imageFiles.length} imagen(es)
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Las imágenes se asociarán automáticamente con los equipos por orden
              </p>
            </div>

            {/* Preview de datos */}
            {parsedData.length > 0 && (
              <div className="space-y-2">
                <Label>Preview de Datos ({parsedData.length} equipos)</Label>
                <div className="border rounded-md max-h-64 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Marca</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>IMEI</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>RAM</TableHead>
                        <TableHead>Memoria</TableHead>
                        <TableHead>Costo</TableHead>
                        <TableHead>Precio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 10).map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.brand}</TableCell>
                          <TableCell>{item.model}</TableCell>
                          <TableCell className="font-mono text-xs">{item.imei}</TableCell>
                          <TableCell>{item.color}</TableCell>
                          <TableCell>{item.ram_capacity}GB</TableCell>
                          <TableCell>{item.storage_capacity}GB</TableCell>
                          <TableCell>${item.purchase_price}</TableCell>
                          <TableCell>${item.sale_price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {parsedData.length > 10 && (
                    <div className="p-2 text-sm text-center text-muted-foreground border-t">
                      ... y {parsedData.length - 10} equipos más
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Indicador de progreso */}
            {isProcessing && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Procesando importación...</p>
                  <p className="text-sm text-blue-700">
                    Tiempo transcurrido: {formatTime(elapsedTime)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogScrollableContent>

        <DialogFixedFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={parsedData.length === 0 || isProcessing}
          >
            {isProcessing ? "Importando..." : `Importar ${parsedData.length} Equipos`}
          </Button>
        </DialogFixedFooter>
      </DialogContent>
    </Dialog>
  );
}
