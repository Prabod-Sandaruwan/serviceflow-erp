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

  // Brand Titles from Environment / DB
  const companyName = process.env.COMPANY_NAME || '';
  if (companyName) {
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#0f172a').text(companyName, 72, 20);
  }
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#64748b').text('ENTERPRISE CLOUD SOLUTIONS', 72, 34);

  // Invoice Title & Status Badge
  const status = (invoice.status || 'DRAFT').toUpperCase();
  const theme = STATUS_THEMES[status] || { bg: '#f1f5f9', color: '#475569' };
  doc.fontSize(22).font('Helvetica-Bold').fillColor('#0f172a').text('INVOICE', 375, 17);
  doc.roundedRect(485, 20, 72, 16, 8).fill(theme.bg);
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(theme.color).text(status, 485, 24, { width: 72, align: 'center' });

  const num = invoice.invoiceNumber || invoice.invoice_number || 'DRAFT';
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#4338ca').text(`#${num}`, 375, 42, { width: 182, align: 'right' });

  // Metadata Card (Real DB fields only)
  doc.roundedRect(375, 54, 182, 46, 5).fillAndStroke('#f8fafc', '#e2e8f0');
  const rows = [
    ['Issue Date:', invoice.issueDate || '—'],
    ['Due Date:', invoice.dueDate || '—'],
    ['Project Ref:', invoice.project?.projectCode || (invoice.projectId ? `PRJ-${invoice.projectId}` : '—')],
    ['Currency:', 'USD ($)'],
  ];
  rows.forEach(([label, val], idx) => {
    const ry = 58 + idx * 10.5;
    doc.fontSize(6.5).font('Helvetica').fillColor('#64748b').text(label, 382, ry);
    doc.font('Helvetica-Bold').fillColor('#1e293b').text(val, 450, ry, { width: 100, align: 'right' });
  });
}
