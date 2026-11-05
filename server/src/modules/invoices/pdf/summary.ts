import { numberToWords } from './words';

const fmt = (v: any) => '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function drawSummary(doc: PDFKit.PDFDocument, invoice: any, startY: number): void {
  const y = Math.max(startY, 360);

  // Left Column: AMOUNT IN WORDS & TERMS
  doc.roundedRect(38, y, 252, 42, 5).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#64748b').text('AMOUNT IN WORDS', 46, y + 6);
  const words = numberToWords(invoice.total);
  doc.fontSize(7.5).font('Helvetica-Oblique').fillColor('#0f172a').text(`"${words}"`, 46, y + 17, { width: 236 });

  // Terms & Conditions
  const termY = y + 50;
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#475569').text('TERMS & CONDITIONS', 38, termY);
  doc.fontSize(6.5).font('Helvetica').fillColor('#64748b');
  doc.text('1. Payment is required within 14 calendar days from the date of issuance.', 38, termY + 10);
  const invNum = invoice.invoiceNumber || invoice.invoice_number || 'DRAFT';
  doc.text(`2. Wire transfers must include Invoice #${invNum} as payment reference.`, 38, termY + 20);
  doc.text('3. Overdue accounts are subject to a 1.5% compounding finance charge per month.', 38, termY + 30);

  // Right Column: FINANCIAL TOTALS
  let rY = y;
  doc.fontSize(7).font('Helvetica').fillColor('#475569').text('Subtotal:', 305, rY);
  doc.text(fmt(invoice.subtotal), 430, rY, { width: 127, align: 'right' });
  rY += 13;

  const taxLabel = invoice.taxType ? `Value Added Tax (${invoice.taxType}):` : 'Tax Amount:';
  doc.text(taxLabel, 305, rY);
  doc.text(`+${fmt(invoice.taxAmount)}`, 430, rY, { width: 127, align: 'right' });
  rY += 15;

  doc.moveTo(305, rY).lineTo(557, rY).strokeColor('#e2e8f0').lineWidth(0.75).stroke();
  rY += 6;

  // Total Invoiced
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0f172a').text('Total Invoiced:', 305, rY);
  doc.fontSize(12).text(fmt(invoice.total), 430, rY - 1, { width: 127, align: 'right' });
  rY += 17;

  // Amount Received
  const paid = invoice.status === 'PAID' ? Number(invoice.total || 0) : Number(invoice.paid || 0);
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#16a34a').text('Amount Received (Stripe/Wire Confirmed):', 305, rY);
  doc.text(`-${fmt(paid)}`, 430, rY, { width: 127, align: 'right' });
  rY += 14;

  // Remaining Balance Due Box
  const balance = invoice.status === 'PAID' ? 0 : Number(invoice.balance ?? invoice.total ?? 0);
  const isZero = balance <= 0.001;
  const boxBg = isZero ? '#ecfdf5' : '#eff6ff';
  const boxBorder = isZero ? '#a7f3d0' : '#bfdbfe';
  const boxColor = isZero ? '#065f46' : '#1d4ed8';

  doc.roundedRect(305, rY, 252, 24, 4).fillAndStroke(boxBg, boxBorder);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(boxColor).text('REMAINING BALANCE DUE:', 314, rY + 7);
  doc.fontSize(10).text(`${fmt(balance)} USD`, 415, rY + 5.5, { width: 135, align: 'right' });
}
