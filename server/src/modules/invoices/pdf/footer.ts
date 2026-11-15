export function drawFooter(doc: PDFKit.PDFDocument, invoice: any, startY = 460): void {
  const sigY = Math.max(startY, 450);

  // Verified Stamp Seal
  doc.circle(260, sigY + 18, 17).strokeColor('#818cf8').lineWidth(1).stroke();
  doc.circle(260, sigY + 18, 14).strokeColor('#c7d2fe').lineWidth(0.5).stroke();
  doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#6366f1').text('VERIFIED', 245, sigY + 11, { width: 30, align: 'center' });
  doc.fontSize(5).font('Helvetica').fillColor('#4338ca').text('SECURE', 245, sigY + 20, { width: 30, align: 'center' });

  // Real Dynamic Signatory
  const signerName = invoice.issuerName || invoice.creatorName || 'Authorized Signatory';
  const signerTitle = invoice.issuerTitle || (invoice.issuerName ? 'Authorized Signatory' : 'Account Administrator');

  doc.fontSize(13).font('Helvetica-Oblique').fillColor('#1e40af').text(signerName, 300, sigY + 6);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#0f172a').text(signerName, 300, sigY + 23);
  doc.fontSize(6.5).font('Helvetica').fillColor('#475569').text(signerTitle, 300, sigY + 33);
  const companyName = process.env.COMPANY_NAME || '';
  if (companyName) {
    doc.fontSize(6).fillColor('#64748b').text(companyName, 300, sigY + 42);
  }

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
  const clientName = invoice.project?.client?.displayName || 'CLIENT';
  const clientCode = clientName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const refCode = `SF-INV-${invoice.id || '01'}-${clientCode}`;
  doc.text(`Ref: ${refCode}`, 440, botY + 7.5, { width: 117, align: 'right' });
}
