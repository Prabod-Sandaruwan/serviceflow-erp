export function drawItemsTable(doc: PDFKit.PDFDocument, invoice: any, startY: number): number {
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#4f46e5').text('ITEMIZED DELIVERABLES & SERVICES', 38, startY);

  const headerY = startY + 11;
  doc.roundedRect(38, headerY, 519, 16, 3).fill('#f1f5f9');

  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#475569');
  doc.text('#', 46, headerY + 4.5);
  doc.text('ITEM DESCRIPTION', 74, headerY + 4.5);
  doc.text('QTY', 330, headerY + 4.5, { width: 50, align: 'right' });
  doc.text('RATE ($)', 390, headerY + 4.5, { width: 75, align: 'right' });
  doc.text('AMOUNT ($)', 475, headerY + 4.5, { width: 75, align: 'right' });

  let y = headerY + 20;
  const items = invoice.items || [];

  items.forEach((item: any, idx: number) => {
    const num = String(idx + 1).padStart(2, '0');
    const desc = item.description || 'Deliverable Item';
    const qty = item.quantity != null ? String(item.quantity) : '1';
    const rate = Number(item.unitPrice ?? item.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const amount = Number(item.lineAmount ?? item.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    doc.fontSize(7.5).font('Helvetica').fillColor('#64748b').text(num, 46, y);
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(desc, 74, y, { width: 250 });
    doc.font('Helvetica').fillColor('#334155').text(qty, 330, y, { width: 50, align: 'right' });
    doc.text(`$${rate}`, 390, y, { width: 75, align: 'right' });
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(`$${amount}`, 475, y, { width: 75, align: 'right' });

    y += 18;
    doc.moveTo(38, y).lineTo(557, y).strokeColor('#f1f5f9').lineWidth(0.5).stroke();
    y += 4;
  });

  return y;
}
