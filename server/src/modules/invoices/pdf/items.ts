import { checkPageBreak, measureRowHeight } from '../../../shared/pdf/layout';

export function drawInvoiceTableHeader(doc: PDFKit.PDFDocument, y: number): void {
  doc.roundedRect(38, y, 519, 16, 3).fill('#f1f5f9');
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#475569');
  doc.text('#', 46, y + 4.5);
  doc.text('ITEM DESCRIPTION', 74, y + 4.5);
  doc.text('QTY', 330, y + 4.5, { width: 50, align: 'right' });
  doc.text('RATE ($)', 390, y + 4.5, { width: 75, align: 'right' });
  doc.text('AMOUNT ($)', 475, y + 4.5, { width: 75, align: 'right' });
}

export function drawItemsTable(doc: PDFKit.PDFDocument, invoice: any, startY: number): number {
  doc
    .fontSize(7)
    .font('Helvetica-Bold')
    .fillColor('#4f46e5')
    .text('ITEMIZED DELIVERABLES & SERVICES', 38, startY);
  const headerY = startY + 11;
  drawInvoiceTableHeader(doc, headerY);
  doc.y = headerY + 20;

  const items = invoice.items || [];
  const descWidth = 250;

  items.forEach((item: any, idx: number) => {
    const num = String(idx + 1).padStart(2, '0');
    const desc = item.description || 'Deliverable Item';
    const qty = item.quantity != null ? String(item.quantity) : '1';
    const rate = Number(item.unitPrice ?? item.amount ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const amount = Number(item.lineAmount ?? item.amount ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    doc.fontSize(7.5).font('Helvetica-Bold');
    const rowHeight = measureRowHeight(doc, desc, descWidth, 6, 18);

    checkPageBreak(doc, rowHeight + 6, (d) => {
      drawInvoiceTableHeader(d, 40);
      d.y = 62;
    });

    const currentY = doc.y;
    doc.fontSize(7.5).font('Helvetica').fillColor('#64748b').text(num, 46, currentY);
    doc
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(desc, 74, currentY, { width: descWidth, align: 'left' });
    doc
      .font('Helvetica')
      .fillColor('#334155')
      .text(qty, 330, currentY, { width: 50, align: 'right' });
    doc.text(`$${rate}`, 390, currentY, { width: 75, align: 'right' });
    doc
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(`$${amount}`, 475, currentY, { width: 75, align: 'right' });

    const nextY = currentY + rowHeight;
    doc.moveTo(38, nextY).lineTo(557, nextY).strokeColor('#f1f5f9').lineWidth(0.5).stroke();
    doc.y = nextY + 4;
  });

  return doc.y;
}
