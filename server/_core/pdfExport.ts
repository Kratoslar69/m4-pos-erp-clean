import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

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
 * Genera un reporte de comisiones en formato PDF
 * @param data Datos del reporte de comisiones
 * @returns Buffer del PDF generado
 */
export async function generateCommissionPDF(data: CommissionReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
      const chunks: Buffer[] = [];

      // Capturar el stream en un buffer
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header con logo y título
      doc
        .fontSize(24)
        .fillColor('#FF6B00')
        .text('M4 POS/ERP System', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(18)
        .fillColor('#333333')
        .text('Reporte de Comisiones', { align: 'center' })
        .moveDown(0.3);

      // Información del período
      const periodDate = new Date(data.period + '-01');
      const periodText = periodDate.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
      });

      doc
        .fontSize(12)
        .fillColor('#666666')
        .text(`Período: ${periodText}`, { align: 'center' });

      if (data.userName) {
        doc.text(`Vendedor: ${data.userName}`, { align: 'center' });
      }

      doc.moveDown(1);

      // Línea separadora
      doc
        .strokeColor('#FF6B00')
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(562, doc.y)
        .stroke()
        .moveDown(1);

      // Resumen
      doc
        .fontSize(14)
        .fillColor('#333333')
        .text('Resumen', { underline: true })
        .moveDown(0.5);

      const summaryY = doc.y;
      
      // Columna 1: Total Comisiones
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('Total Comisiones:', 50, summaryY)
        .fontSize(16)
        .fillColor('#FF6B00')
        .text(`$${data.summary.total.toFixed(2)}`, 50, summaryY + 15);

      // Columna 2: Pagadas
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('Pagadas:', 220, summaryY)
        .fontSize(16)
        .fillColor('#22C55E')
        .text(`$${data.summary.paid.toFixed(2)}`, 220, summaryY + 15);

      // Columna 3: Pendientes
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('Pendientes:', 390, summaryY)
        .fontSize(16)
        .fillColor('#EF4444')
        .text(`$${data.summary.pending.toFixed(2)}`, 390, summaryY + 15);

      doc.y = summaryY + 50;
      doc.moveDown(1);

      // Tabla de comisiones
      doc
        .fontSize(14)
        .fillColor('#333333')
        .text('Detalle de Comisiones', { underline: true })
        .moveDown(0.5);

      if (data.commissions.length === 0) {
        doc
          .fontSize(10)
          .fillColor('#999999')
          .text('No hay comisiones registradas para este período', { align: 'center' });
      } else {
        // Header de la tabla
        const tableTop = doc.y;
        const colWidths = {
          date: 80,
          vendor: 100,
          sale: 80,
          amount: 70,
          rate: 50,
          commission: 70,
          status: 60,
        };

        doc
          .fontSize(9)
          .fillColor('#FFFFFF')
          .rect(50, tableTop, 512, 20)
          .fill('#FF6B00');

        doc
          .fillColor('#FFFFFF')
          .text('Fecha', 55, tableTop + 6, { width: colWidths.date })
          .text('Vendedor', 135, tableTop + 6, { width: colWidths.vendor })
          .text('Venta', 235, tableTop + 6, { width: colWidths.sale })
          .text('Monto', 315, tableTop + 6, { width: colWidths.amount })
          .text('Tasa', 385, tableTop + 6, { width: colWidths.rate })
          .text('Comisión', 435, tableTop + 6, { width: colWidths.commission })
          .text('Estado', 505, tableTop + 6, { width: colWidths.status });

        let yPos = tableTop + 25;

        // Filas de la tabla
        data.commissions.forEach((comm, index) => {
          // Verificar si necesitamos una nueva página
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const bgColor = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
          doc.rect(50, yPos, 512, 20).fill(bgColor);

          const date = new Date(comm.created_at).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });

          doc
            .fontSize(8)
            .fillColor('#333333')
            .text(date, 55, yPos + 6, { width: colWidths.date })
            .text(comm.user_name, 135, yPos + 6, { width: colWidths.vendor, ellipsis: true })
            .text(comm.sale_id.slice(0, 8), 235, yPos + 6, { width: colWidths.sale })
            .text(`$${comm.sale_amount.toFixed(2)}`, 315, yPos + 6, { width: colWidths.amount })
            .text(`${comm.commission_rate}%`, 385, yPos + 6, { width: colWidths.rate })
            .text(`$${comm.commission_amount.toFixed(2)}`, 435, yPos + 6, { width: colWidths.commission });

          doc
            .fillColor(comm.is_paid ? '#22C55E' : '#EF4444')
            .text(comm.is_paid ? 'Pagada' : 'Pendiente', 505, yPos + 6, { width: colWidths.status });

          yPos += 20;
        });
      }

      // Footer
      const pageCount = (doc as any).bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .fillColor('#999999')
          .text(
            `Página ${i + 1} de ${pageCount} - Generado el ${new Date().toLocaleString('es-MX')}`,
            50,
            750,
            { align: 'center' }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
