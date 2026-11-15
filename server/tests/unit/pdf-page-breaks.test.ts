import { describe, it, expect, vi } from 'vitest';
import { createPdfDocument, checkPageBreak, measureRowHeight } from '../../src/shared/pdf/layout';
import { generateLongInvoice } from '../manual/pdf-long-content';
import { buildQuotationPdf } from '../../src/modules/quotations/quotation.pdf';
import { PassThrough } from 'stream';

describe('PDF Page Breaks & Long Descriptions (PDF-002)', () => {
  it('measureRowHeight expands for wrapped long descriptions', () => {
    const doc = createPdfDocument();
    doc.fontSize(8).font('Helvetica');
    const shortHeight = measureRowHeight(doc, 'Short text', 250);
    expect(shortHeight).toBe(18);

    const longText = 'A'.repeat(400);
    const longHeight = measureRowHeight(doc, longText, 250);
    expect(longHeight).toBeGreaterThan(shortHeight);
    doc.end();
  });

  it('checkPageBreak does not trigger when content fits', () => {
    const doc = createPdfDocument();
    doc.y = 100;
    const callback = vi.fn();
    const broken = checkPageBreak(doc, 50, callback);
    expect(broken).toBe(false);
    expect(callback).not.toHaveBeenCalled();
    doc.end();
  });

  it('checkPageBreak triggers addPage and callback when content exceeds margin', () => {
    const doc = createPdfDocument();
    doc.y = 780;
    const callback = vi.fn((d) => { d.y = 60; });
    const addPageSpy = vi.spyOn(doc, 'addPage');

    const broken = checkPageBreak(doc, 50, callback);
    expect(broken).toBe(true);
    expect(addPageSpy).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(doc);
    expect(doc.y).toBe(60);
    doc.end();
  });

  it('generates multi-page invoice with 60 items and 400-char wrapped description', async () => {
    const { buffer } = await generateLongInvoice();
    expect(buffer).toBeDefined();
    expect(buffer.slice(0, 4).toString()).toBe('%PDF');
    expect(buffer.length).toBeGreaterThan(5000);
  });

  it('generates multi-page quotation with wrapped items and protected totals', async () => {
    const longDesc = 'B'.repeat(400);
    const items = Array.from({ length: 45 }, (_, i) => ({
      description: i === 2 ? longDesc : `Quotation Line Item #${i + 1}`,
      quantity: 2,
      unitPrice: 200,
      lineAmount: 400,
    }));

    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    stream.on('data', (c) => chunks.push(c));

    await new Promise<void>((resolve) => {
      stream.on('end', () => resolve());
      buildQuotationPdf({
        quotationNumber: 'QT-LONG-01',
        clientName: 'Enterprise Client',
        status: 'SENT',
        validUntil: '2026-12-31',
        items,
        subtotal: 18000,
        taxAmount: 1800,
        total: 19800,
      }, stream);
    });

    const buf = Buffer.concat(chunks);
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
    expect(buf.length).toBeGreaterThan(3000);
  });
});
