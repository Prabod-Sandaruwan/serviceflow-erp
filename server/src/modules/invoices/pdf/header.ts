const STATUS_THEMES: Record<string, { bg: string; color: string }> = {
  PAID: { bg: '#dcfce7', color: '#15803d' },
  DRAFT: { bg: '#fef3c7', color: '#b45309' },
  ISSUED: { bg: '#e0f2fe', color: '#0369a1' },
  CANCELLED: { bg: '#fee2e2', color: '#b91c1c' },
  PARTIALLY_PAID: { bg: '#fef3c7', color: '#b45309' },
};

export function drawHeader(doc: PDFKit.PDFDocument, invoice: any): void {
  // Top purple accent stripe
  doc.rect(0, 0, 595.28, 4).fill('#4f46e5');

  // Brand Logo icon
  doc.roundedRect(38, 20, 26, 26, 6).fill('#4f46e5');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#ffffff').text('S', 38, 25, { width: 26, align: 'center' });

  // Brand Titles
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a').text('ServiceFlow ERP', 72, 20);
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#64748b').text('ENTERPRISE CLOUD SOLUTIONS LTD', 72, 34);

  // Company Details
  doc.fontSize(7).font('Helvetica').fillColor('#475569');
  doc.text('104 Innovation Way, Tech City, Colombo 03, Sri Lanka', 38, 52);
  doc.text('info@serviceflow.lk  •  finance@serviceflow.lk', 38, 62);
  doc.text('+94 11 234 5678  •  +94 77 987 6543', 38, 72);
  doc.fontSize(6.5).fillColor('#64748b').text('Business Reg: PV-109283-LK   •   VAT/TIN: LK-992144810-V', 38, 82);

  // Invoice Title & Status Badge
  const status = (invoice.status || 'DRAFT').toUpperCase();
  const theme = STATUS_THEMES[status] || { bg: '#f1f5f9', color: '#475569' };
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a').text('INVOICE', 375, 17);
  doc.roundedRect(485, 20, 72, 16, 8).fill(theme.bg);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(theme.color).text(status, 485, 24, { width: 72, align: 'center' });

  const num = invoice.invoiceNumber || invoice.invoice_number || 'DRAFT';
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#4338ca').text(`#${num}`, 375, 42, { width: 182, align: 'right' });

  // Metadata Card
  doc.roundedRect(375, 54, 182, 46, 5).fillAndStroke('#f8fafc', '#e2e8f0');
  const rows = [
    ['Issue Date:', invoice.issueDate || 'On Receipt'],
    ['Due Date:', invoice.dueDate || 'On Receipt'],
    ['PO / Ref:', invoice.project?.projectCode || `PRJ-${invoice.projectId || '001'}`],
    ['Currency:', 'USD ($)'],
  ];
  rows.forEach(([label, val], idx) => {
    const ry = 58 + idx * 10.5;
    doc.fontSize(6.5).font('Helvetica').fillColor('#64748b').text(label, 382, ry);
    doc.font('Helvetica-Bold').fillColor('#1e293b').text(val, 450, ry, { width: 100, align: 'right' });
  });
}
