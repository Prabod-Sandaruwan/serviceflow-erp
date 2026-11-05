import { PassThrough } from 'stream';
import PDFDocument from 'pdfkit';
import { drawHeader } from './pdf/header';
import { drawCards } from './pdf/cards';
import { drawItemsTable } from './pdf/items';
import { drawSummary } from './pdf/summary';
import { drawFooter } from './pdf/footer';

export function generateInvoicePdf(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    const stream = new PassThrough();
    stream.on('data', (c) => buffers.push(c));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
    stream.on('error', reject);

    const doc = new PDFDocument({ size: 'A4', margin: 38 });
    doc.pipe(stream);

    // Draw core invoice sections matching modern corporate spec
    drawHeader(doc, invoice);
    drawCards(doc, invoice, 110);
    const tableEndY = drawItemsTable(doc, invoice, 196);
    const summaryEndY = drawSummary(doc, invoice, tableEndY + 10);
    drawFooter(doc, invoice, Math.max(summaryEndY + 15, 450));

    // Watermark stamps for non-finalized states
    if (invoice.status === 'DRAFT') {
      doc.save().opacity(0.08).fontSize(80).font('Helvetica-Bold').fillColor('#ef4444');
      doc.rotate(-45, { origin: [297, 420] }).text('DRAFT', 170, 390).restore();
    } else if (invoice.status === 'CANCELLED') {
      doc.save().opacity(0.10).fontSize(70).font('Helvetica-Bold').fillColor('#dc2626');
      doc.rotate(-45, { origin: [297, 420] }).text('CANCELLED', 110, 390).restore();
    }

    doc.end();
  });
}

export default generateInvoicePdf;
