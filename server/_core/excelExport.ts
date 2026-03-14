import * as XLSX from 'xlsx';

interface CommissionReportData {
  period: string;
  userName?: string;
  commissions: Array<{
    id: string;
    user_name: string;
    sale_id: string;
    sale_amount: number;
    commission_rate: number;
    commission_amount: number;
    is_paid: boolean;
    created_at: string;
  }>;
  summary: {
    total: number;
    paid: number;
    pending: number;
  };
}

/**
 * Genera un reporte de comisiones en formato Excel
 * @param data Datos del reporte de comisiones
 * @returns Buffer del archivo Excel generado
 */
export function generateCommissionExcel(data: CommissionReportData): Buffer {
  // Crear un nuevo workbook
  const workbook = XLSX.utils.book_new();

  // Preparar datos del resumen
  const periodDate = new Date(data.period + '-01');
  const periodText = periodDate.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
  });

  const summaryData = [
    ['REPORTE DE COMISIONES - M4 POS/ERP'],
    [],
    ['Período:', periodText],
    ...(data.userName ? [['Vendedor:', data.userName]] : []),
    [],
    ['RESUMEN'],
    ['Total Comisiones:', `$${data.summary.total.toFixed(2)}`],
    ['Comisiones Pagadas:', `$${data.summary.paid.toFixed(2)}`],
    ['Comisiones Pendientes:', `$${data.summary.pending.toFixed(2)}`],
    [],
    [],
  ];

  // Preparar datos de la tabla de comisiones
  const tableHeaders = [
    'Fecha',
    'Vendedor',
    'ID Venta',
    'Monto Venta',
    'Tasa (%)',
    'Comisión',
    'Estado',
  ];

  const tableData = data.commissions.map((comm) => [
    new Date(comm.created_at).toLocaleDateString('es-MX'),
    comm.user_name,
    comm.sale_id.slice(0, 8),
    comm.sale_amount,
    comm.commission_rate,
    comm.commission_amount,
    comm.is_paid ? 'Pagada' : 'Pendiente',
  ]);

  // Combinar todos los datos
  const worksheetData = [
    ...summaryData,
    ['DETALLE DE COMISIONES'],
    tableHeaders,
    ...tableData,
    [],
    [],
    [`Generado el ${new Date().toLocaleString('es-MX')}`],
  ];

  // Crear worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Aplicar estilos y anchos de columna
  const columnWidths = [
    { wch: 12 }, // Fecha
    { wch: 20 }, // Vendedor
    { wch: 12 }, // ID Venta
    { wch: 12 }, // Monto Venta
    { wch: 10 }, // Tasa
    { wch: 12 }, // Comisión
    { wch: 12 }, // Estado
  ];
  worksheet['!cols'] = columnWidths;

  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Comisiones');

  // Generar buffer del archivo Excel
  const excelBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  });

  return excelBuffer as Buffer;
}
