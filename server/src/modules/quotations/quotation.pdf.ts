import { Writable } from 'stream';
import {
  createPdfDocument,
  drawCompanyHeader,
  drawFooter,
  formatAmount,
  checkPageBreak,
  measureRowHeight,
} from '../../shared/pdf/layout';
import { formatDate } from '../../shared/dates';

export interface QuotationPdfItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface QuotationPdfViewModel {
  quotationNumber: string;
  clientName: string;
  items: QuotationPdfItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: string;
  validUntil: string | Date;
}

function drawQuotationTableHeader(doc: PDFKit.PDFDocument, y: number): void {
  doc.rect(50, y, 495, 20).fill('#f3f4f6');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827');
  doc.text('Description', 60, y + 5);
  doc.text('Qty', 320, y + 5, { width: 40, align: 'right' });
  doc.text('Unit Price', 370, y + 5, { width: 75, align: 'right' });
  doc.text('Amount', 455, y + 5, { width: 80, align: 'right' });
}

export function buildQuotationPdf(vm: QuotationPdfViewModel, outStream: Writable): void {
  const doc = createPdfDocument(outStream);
  drawCompanyHeader(doc);

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#222222')
    .text(`QUOTATION ${vm.quotationNumber}`, 50, 105);
  doc.fontSize(9).font('Helvetica').fillColor('#444444');
  doc.text(`Client: ${vm.clientName}`, 50, 125);
  doc.text(`Valid Until: ${formatDate(vm.validUntil)}`, 50, 138);
  doc.text(`Status: ${vm.status}`, 400, 125, { align: 'right' });

  drawQuotationTableHeader(doc, 165);
  doc.y = 189;

  for (const item of vm.items) {
    doc.font('Helvetica').fontSize(9);
    const rowHeight = measureRowHeight(doc, item.description, 250, 6, 18);
    checkPageBreak(doc, rowHeight + 4, (d) => {
      drawQuotationTableHeader(d, 56.7);
      d.y = 56.7 + 24;
    });
    const curY = doc.y;
    doc.font('Helvetica').fontSize(9).fillColor('#374151');
    doc.text(item.description, 60, curY, { width: 250, align: 'left' });
    doc.text(String(item.quantity), 320, curY, { width: 40, align: 'right' });
    doc.text(formatAmount(item.unitPrice), 370, curY, { width: 75, align: 'right' });
    doc.text(formatAmount(item.lineAmount), 455, curY, { width: 80, align: 'right' });
    doc.y = curY + rowHeight;
  }

  checkPageBreak(doc, 70, (d) => {
    drawQuotationTableHeader(d, 56.7);
    d.y = 56.7 + 24;
  });
  let y = doc.y + 10;
  doc.moveTo(350, y).lineTo(545, y).strokeColor('#e5e7eb').lineWidth(1).stroke();
  y += 8;
  doc.font('Helvetica').fontSize(9).fillColor('#374151').text('Subtotal:', 350, y);
  doc.text(formatAmount(vm.subtotal), 455, y, { width: 80, align: 'right' });
  y += 15;
  doc.text('Tax:', 350, y);
  doc.text(formatAmount(vm.taxAmount), 455, y, { width: 80, align: 'right' });
  y += 15;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Total:', 350, y);
  doc.text(formatAmount(vm.total), 455, y, { width: 80, align: 'right' });

  if (vm.status === 'DRAFT' || vm.status === 'PENDING_APPROVAL') {
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.save().opacity(0.12).fontSize(80).font('Helvetica-Bold').fillColor('#ff0000');
      doc
        .rotate(-45, { origin: [300, 450] })
        .text('DRAFT', 180, 420)
        .restore();
    }
  }

  drawFooter(doc, vm.quotationNumber);
  doc.end();
}
