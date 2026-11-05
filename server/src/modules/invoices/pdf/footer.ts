export function drawFooter(doc: PDFKit.PDFDocument, invoice: any, startY = 490): void {
  const sigY = Math.max(startY, 485);

  // Verified Stamp Seal
  doc.circle(260, sigY + 18, 17).strokeColor('#818cf8').lineWidth(1).stroke();
  doc.circle(260, sigY + 18, 14).strokeColor('#c7d2fe').lineWidth(0.5).stroke();
  doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#6366f1').text('VERIFIED', 245, sigY + 11, { width: 30, align: 'center' });
  doc.fontSize(5).font('Helvetica').fillColor('#4338ca').text('SECURE', 245, sigY + 20, { width: 30, align: 'center' });

  // Signature
  doc.fontSize(14).font('Helvetica-Oblique').fillColor('#1e40af').text('Nalinda Ranasinghe', 300, sigY + 6);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0f172a').text('Nalinda Ranasinghe, FCMA', 300, sigY + 23);
  doc.fontSize(6.5).font('Helvetica').fillColor('#475569').text('Chief Financial Officer', 300, sigY + 33);
  doc.fontSize(6).fillColor('#64748b').text('ServiceFlow Enterprise Suite', 300, sigY + 41);

  // Wire & Remittance Details
  const remY = sigY + 56;
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#4f46e5').text('ELECTRONIC WIRE & REMITTANCE DETAILS', 38, remY);
  doc.fontSize(6.5).font('Helvetica').fillColor('#64748b').text(
    'Bank: Commercial Bank of Ceylon PLC   •   Account Name: ServiceFlow (Pvt) Ltd   •   A/C: 1000234567   •   Swift: CCEYLKLX',
    38,
    remY + 10
  );

  // Bottom Audit Bar
  const botY = 780;
  doc.moveTo(38, botY).lineTo(557, botY).strokeColor('#e2e8f0').lineWidth(0.75).stroke();
  doc.circle(41, botY + 10, 2.5).fill('#16a34a');
  doc.fontSize(6).font('Helvetica').fillColor('#64748b').text(
    'Document generated via ServiceFlow Cloud API  •  Tamper-evident Ledger Registered',
    47,
    botY + 7.5
  );
  doc.text('Page 1 of 1', 340, botY + 7.5);
  const refCode = `SF-2026-INV${invoice.id || '01'}-${invoice.project?.client?.displayName?.slice(0, 4)?.toUpperCase() || 'APEX'}`;
  doc.text(`Ref: ${refCode}`, 440, botY + 7.5, { width: 117, align: 'right' });
}
