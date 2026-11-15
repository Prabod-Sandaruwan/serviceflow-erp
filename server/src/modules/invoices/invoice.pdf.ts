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

    const doc = new PDFDocument({ size: 'A4', margin: 38, bufferPages: true });
    doc.pipe(stream);

    // Draw core invoice sections matching modern corporate spec
    drawHeader(doc, invoice);
    drawCards(doc, invoice, 110);
    const tableEndY = drawItemsTable(doc, invoice, 196);
    const summaryEndY = drawSummary(doc, invoice, tableEndY + 10);
    drawFooter(doc, invoice, Math.max(summaryEndY + 15, 450));

    // Watermark stamps for non-finalized states across all pages
    if (invoice.status === 'DRAFT' || invoice.status === 'CANCELLED') {
      const text = invoice.status === 'DRAFT' ? 'DRAFT' : 'CANCELLED';
      const color = invoice.status === 'DRAFT' ? '#ef4444' : '#dc2626';
      const xPos = invoice.status === 'DRAFT' ? 170 : 110;
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.save().opacity(0.08).fontSize(80).font('Helvetica-Bold').fillColor(color);
        doc
          .rotate(-45, { origin: [297, 420] })
          .text(text, xPos, 390)
          .restore();
      }
    }

    doc.end();
  });
}

export default generateInvoicePdf;
