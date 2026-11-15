import { describe, it, expect } from 'vitest';
// @ts-ignore
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { PassThrough } from 'stream';
import { generateInvoicePdf } from '../../src/modules/invoices/invoice.pdf';
import { buildQuotationPdf, QuotationPdfViewModel } from '../../src/modules/quotations/quotation.pdf';

const parsePdf = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default;

function quotationBuffer(vm: QuotationPdfViewModel): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const s = new PassThrough();
    const bufs: Buffer[] = [];
    s.on('data', (c) => bufs.push(c));
    s.on('end', () => resolve(Buffer.concat(bufs)));
    s.on('error', reject);
    buildQuotationPdf(vm, s);
  });
}

describe('PDF Content & Financial Assertions (PDF-003)', () => {
  it('Test 1: Invoice Content, manual tax, and DRAFT watermark', async () => {
    const client = { displayName: 'Apex Horizon Corp' };
    const invoice = {
      id: 'INV-1001',
      invoiceNumber: 'INV-2026-0042',
      status: 'DRAFT',
      subtotal: 500.0,
      taxType: 'Special Manual Surcharge',
      taxAmount: 50.0, // Manual tax 50.00 on 500.00 subtotal
      total: 550.0,
      paid: 150.0,
      balance: 400.0,
      issueDate: '2026-11-15',
      dueDate: '2026-12-15',
      issuerName: 'Jane Smith',
      project: { name: 'Core ERP', client },
      items: [
        { description: 'Cloud Architecture Design', quantity: 1, unitPrice: 200.0, lineAmount: 200.0 },
        { description: 'Kubernetes Cluster Setup', quantity: 2, unitPrice: 150.0, lineAmount: 300.0 },
      ],
    };

    const buffer = await generateInvoicePdf(invoice);
    const data = await parsePdf(buffer);
    const text = data.text;

    // Document Number & Client
    expect(text).toContain('INV-2026-0042');
    expect(text).toContain('Apex Horizon Corp');

    // Line items and rates
    expect(text).toContain('Cloud Architecture Design');
    expect(text).toContain('200.00');
    expect(text).toContain('Kubernetes Cluster Setup');
    expect(text).toContain('300.00');

    // Financial totals & manual tax preservation
    expect(text).toContain('Special Manual Surcharge');
    expect(text).toContain('500.00');
    expect(text).toContain('50.00');
    expect(text).toContain('550.00');
    expect(text).toContain('150.00');
    expect(text).toContain('400.00');

    // Watermark
    expect(text).toContain('DRAFT');
  });

  it('Test 2: Quotation Content, items, and totals', async () => {
    const quotation: QuotationPdfViewModel = {
      quotationNumber: 'QT-2026-0099',
      clientName: 'Starlight Dynamics',
      status: 'SENT',
      validUntil: '2026-12-31',
      subtotal: 1250.0,
      taxAmount: 125.0,
      total: 1375.0,
      items: [{ description: 'Enterprise Consultation', quantity: 1, unitPrice: 1250.0, lineAmount: 1250.0 }],
    };

    const buffer = await quotationBuffer(quotation);
    const data = await parsePdf(buffer);
    const text = data.text;

    expect(text).toContain('QT-2026-0099');
    expect(text).toContain('Starlight Dynamics');
    expect(text).toContain('Enterprise Consultation');
    expect(text).toContain('1,250.00');
    expect(text).toContain('125.00');
    expect(text).toContain('1,375.00');
  });
});
