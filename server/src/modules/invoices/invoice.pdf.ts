import { PassThrough } from 'stream';
import { createPdfDocument, drawCompanyHeader } from '../../shared/pdf/layout';
import { formatDate } from '../../shared/dates';

export function generateInvoicePdf(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    const stream = new PassThrough();
    stream.on('data', (chunk) => buffers.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
    stream.on('error', reject);

    const doc = createPdfDocument(stream);
    drawCompanyHeader(doc);

    if (invoice.status === 'DRAFT') {
      doc.save().opacity(0.12).fontSize(80).font('Helvetica-Bold').fillColor('#ff0000');
      doc.rotate(-45, { origin: [300, 450] }).text('DRAFT', 180, 420).restore();
    } else if (invoice.status === 'CANCELLED') {
      doc.save().opacity(0.15).fontSize(70).font('Helvetica-Bold').fillColor('#dc2626');
      doc.rotate(-45, { origin: [300, 450] }).text('CANCELLED', 120, 420).restore();
    }

    const invNum = invoice.invoiceNumber || invoice.invoice_number || 'DRAFT';
    const clientName = invoice.project?.client?.displayName || invoice.clientName || 'Valued Client';
    const projectName = invoice.project?.name || 'Project';

    doc.fontSize(14).font('Helvetica-Bold').fillColor('#222222').text(`INVOICE ${invNum}`, 50, 105);
    doc.fontSize(9).font('Helvetica').fillColor('#444444');
    doc.text(`Client: ${clientName}`, 50, 125);
    doc.text(`Project: ${projectName}`, 50, 138);
    doc.text(`Due Date: ${invoice.dueDate ? formatDate(invoice.dueDate) : 'On Receipt'}`, 50, 151);
    doc.text(`Status: ${invoice.status}`, 400, 125, { align: 'right' });

    let y = 175;
    doc.rect(50, y, 495, 20).fill('#f3f4f6');
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#111827');
    doc.text('Description', 60, y + 5);
    doc.text('Qty', 320, y + 5, { width: 40, align: 'right' });
    doc.text('Unit Price', 370, y + 5, { width: 75, align: 'right' });
    doc.text('Amount', 455, y + 5, { width: 80, align: 'right' });
    y += 24;

    doc.font('Helvetica').fontSize(9).fillColor('#374151');
    const items = invoice.items || [];
    for (const item of items) {
      doc.text(item.description, 60, y);
      doc.text(String(item.quantity ?? 1), 320, y, { width: 40, align: 'right' });
      doc.text(Number(item.unitPrice ?? item.amount ?? 0).toFixed(2), 370, y, { width: 75, align: 'right' });
      doc.text(Number(item.lineAmount ?? item.amount ?? 0).toFixed(2), 455, y, { width: 80, align: 'right' });
      y += 18;
    }

    y += 10;
    doc.moveTo(350, y).lineTo(545, y).strokeColor('#e5e7eb').lineWidth(1).stroke();
    y += 8;
    doc.font('Helvetica').text('Subtotal:', 350, y);
    doc.text(Number(invoice.subtotal || 0).toFixed(2), 455, y, { width: 80, align: 'right' });
    y += 15;
    doc.text('Tax:', 350, y);
    doc.text(Number(invoice.taxAmount || 0).toFixed(2), 455, y, { width: 80, align: 'right' });
    y += 15;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Total:', 350, y);
    doc.text(Number(invoice.total || 0).toFixed(2), 455, y, { width: 80, align: 'right' });
    y += 15;
    doc.font('Helvetica').fontSize(9).fillColor('#444444').text('Balance Due:', 350, y);
    doc.text(Number(invoice.balance ?? invoice.total ?? 0).toFixed(2), 455, y, { width: 80, align: 'right' });

    doc.fontSize(8).fillColor('#6b7280').text('Payment Instructions: Bank Transfer to Commercial Bank, A/C: 1000234567, Colombo.', 50, y + 35);
    doc.end();
  });
}

