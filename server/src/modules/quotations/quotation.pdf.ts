import { Writable } from 'stream';
import { createPdfDocument, drawCompanyHeader } from '../../shared/pdf/layout';
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

export function buildQuotationPdf(vm: QuotationPdfViewModel, outStream: Writable): void {
  const doc = createPdfDocument(outStream);
  drawCompanyHeader(doc);

  if (vm.status === 'DRAFT' || vm.status === 'PENDING_APPROVAL') {
    doc.save().opacity(0.12).fontSize(80).font('Helvetica-Bold').fillColor('#ff0000');
    doc.rotate(-45, { origin: [300, 450] }).text('DRAFT', 180, 420).restore();
  }

  doc.fontSize(14).font('Helvetica-Bold').fillColor('#222222').text(`QUOTATION ${vm.quotationNumber}`, 50, 105);
  doc.fontSize(9).font('Helvetica').fillColor('#444444');
  doc.text(`Client: ${vm.clientName}`, 50, 125);
  doc.text(`Valid Until: ${formatDate(vm.validUntil)}`, 50, 138);
  doc.text(`Status: ${vm.status}`, 400, 125, { align: 'right' });

  let y = 165;
  doc.rect(50, y, 495, 20).fill('#f3f4f6');
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827');
  doc.text('Description', 60, y + 5);
  doc.text('Qty', 320, y + 5, { width: 40, align: 'right' });
  doc.text('Unit Price', 370, y + 5, { width: 75, align: 'right' });
  doc.text('Amount', 455, y + 5, { width: 80, align: 'right' });
  y += 24;

  doc.font('Helvetica').fontSize(9).fillColor('#374151');
  for (const item of vm.items) {
    doc.text(item.description, 60, y);
    doc.text(String(item.quantity), 320, y, { width: 40, align: 'right' });
    doc.text(item.unitPrice.toFixed(2), 370, y, { width: 75, align: 'right' });
    doc.text(item.lineAmount.toFixed(2), 455, y, { width: 80, align: 'right' });
    y += 18;
  }

  y += 10;
  doc.moveTo(350, y).lineTo(545, y).strokeColor('#e5e7eb').lineWidth(1).stroke();
  y += 8;
  doc.font('Helvetica').text('Subtotal:', 350, y);
  doc.text(vm.subtotal.toFixed(2), 455, y, { width: 80, align: 'right' });
  y += 15;
  doc.text('Tax:', 350, y);
  doc.text(vm.taxAmount.toFixed(2), 455, y, { width: 80, align: 'right' });
  y += 15;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Total:', 350, y);
  doc.text(vm.total.toFixed(2), 455, y, { width: 80, align: 'right' });

  doc.end();
}

