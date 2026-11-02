import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

export function createPdfDocument(outStream: Writable): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(outStream);
  return doc;
}

export function drawCompanyHeader(doc: PDFKit.PDFDocument): void {
  const companyName = process.env.COMPANY_NAME || 'ServiceFlow (Pvt) Ltd';
  const companyAddress = process.env.COMPANY_ADDRESS || 'Colombo, Sri Lanka';

  doc.fontSize(16).font('Helvetica-Bold').text(companyName, 50, 50);
  doc.fontSize(9).font('Helvetica').fillColor('#555555').text(companyAddress, 50, 70);
  doc.fillColor('#000000');
  doc.moveTo(50, 90).lineTo(545, 90).strokeColor('#dddddd').lineWidth(1).stroke();
}

