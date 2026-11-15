import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

export const PDF_MARGIN = 56.7; // ~20mm in points (1mm = 2.83465pt)
export const PDF_PAGE_WIDTH = 595.28;
export const PDF_PAGE_HEIGHT = 841.89;
export const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - 2 * PDF_MARGIN;

export function createPdfDocument(outStream?: Writable): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: PDF_MARGIN, bottom: PDF_MARGIN, left: PDF_MARGIN, right: PDF_MARGIN },
    bufferPages: true,
  });
  if (outStream) doc.pipe(outStream);
  return doc;
}

export function formatAmount(amount: string | number): string {
  const num = Number(amount || 0);
  const safe = Number.isFinite(num) ? num : 0;
  return safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function drawCompanyHeader(doc: PDFKit.PDFDocument): void {
  const name = process.env.COMPANY_NAME || '';
  const address = process.env.COMPANY_ADDRESS || '';
  const phone = process.env.COMPANY_PHONE || '';
  const email = process.env.COMPANY_EMAIL || '';
  const website = process.env.COMPANY_WEBSITE || '';

  doc.fillColor('#0f172a');
  if (name) {
    doc.fontSize(16).font('Helvetica-Bold').text(name, PDF_MARGIN, PDF_MARGIN);
  }
  const contacts = [phone, email, website].filter(Boolean).join(' • ');
  const lines = [address, contacts].filter(Boolean);
  if (lines.length) {
    doc
      .fontSize(8.5)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(lines.join('\n'), PDF_MARGIN, doc.y + 2);
  }
  doc.fillColor('#000000');
  const sepY = Math.max(doc.y + 8, 100);
  doc
    .moveTo(PDF_MARGIN, sepY)
    .lineTo(PDF_MARGIN + PDF_CONTENT_WIDTH, sepY)
    .strokeColor('#e2e8f0')
    .lineWidth(1)
    .stroke();
  doc.y = sepY + 12;
}

export function drawFooter(doc: PDFKit.PDFDocument, documentNumber: string): void {
  const range = doc.bufferedPageRange();
  const footerY = PDF_PAGE_HEIGHT - PDF_MARGIN + 8;
  const lineY = PDF_PAGE_HEIGHT - PDF_MARGIN;

  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .moveTo(PDF_MARGIN, lineY)
      .lineTo(PDF_MARGIN + PDF_CONTENT_WIDTH, lineY)
      .strokeColor('#e2e8f0')
      .lineWidth(0.75)
      .stroke();
    doc.fontSize(8).font('Helvetica').fillColor('#64748b');
    doc.text(documentNumber || '', PDF_MARGIN, footerY, { width: 250, align: 'left' });
    const pageText = `Page ${i + 1 - range.start} of ${range.count}`;
    doc.text(pageText, PDF_MARGIN + 250, footerY, {
      width: PDF_CONTENT_WIDTH - 250,
      align: 'right',
    });
  }
}

export function checkPageBreak(
  doc: PDFKit.PDFDocument,
  requiredHeight: number,
  drawHeaderCallback?: (doc: PDFKit.PDFDocument) => void
): boolean {
  const bottomMargin = doc.page?.margins?.bottom ?? PDF_MARGIN;
  const pageHeight = doc.page?.height ?? PDF_PAGE_HEIGHT;
  if (doc.y + requiredHeight > pageHeight - bottomMargin) {
    doc.addPage();
    if (drawHeaderCallback) drawHeaderCallback(doc);
    return true;
  }
  return false;
}

export function measureRowHeight(
  doc: PDFKit.PDFDocument,
  text: string,
  columnWidth: number,
  padding = 6,
  minHeight = 18
): number {
  const textHeight = doc.heightOfString(text || '', { width: columnWidth });
  return Math.max(minHeight, Math.ceil(textHeight + padding));
}
