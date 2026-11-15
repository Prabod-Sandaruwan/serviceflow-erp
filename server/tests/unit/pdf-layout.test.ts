import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PassThrough } from 'stream';
import {
  createPdfDocument, drawCompanyHeader, drawFooter, formatAmount, PDF_MARGIN,
} from '../../src/shared/pdf/layout';

describe('PDF Layout & Company Configuration (PDF-001)', () => {
  const origEnv = { ...process.env };
  beforeEach(() => { process.env = { ...origEnv }; });
  afterEach(() => { process.env = origEnv; vi.restoreAllMocks(); });

  it('createPdfDocument creates A4 doc with 20mm margins and bufferPages', () => {
    const doc = createPdfDocument();
    expect(doc).toBeDefined();
    expect(doc.options.size).toBe('A4');
    expect(doc.options.margins).toEqual({
      top: PDF_MARGIN, bottom: PDF_MARGIN, left: PDF_MARGIN, right: PDF_MARGIN,
    });
    expect(doc.options.bufferPages).toBe(true);
    doc.end();
  });

  it('createPdfDocument pipes to stream when provided', () => {
    const stream = new PassThrough();
    const doc = createPdfDocument(stream);
    expect(doc).toBeDefined();
    doc.end();
  });

  it('formatAmount formats amounts with thousand separators and 2 decimals', () => {
    expect(formatAmount(1234.56)).toBe('1,234.56');
    expect(formatAmount('1000000')).toBe('1,000,000.00');
    expect(formatAmount(0)).toBe('0.00');
    expect(formatAmount('45.5')).toBe('45.50');
    expect(formatAmount('')).toBe('0.00');
    expect(formatAmount(null as any)).toBe('0.00');
  });

  it('drawCompanyHeader uses environment variables dynamically without hardcoding', () => {
    process.env.COMPANY_NAME = 'Apex Solutions PLC';
    process.env.COMPANY_ADDRESS = '123 Tech City, Colombo';
    process.env.COMPANY_PHONE = '+94 11 2345678';
    process.env.COMPANY_EMAIL = 'billing@apexsolutions.lk';
    process.env.COMPANY_WEBSITE = 'www.apexsolutions.lk';

    const doc = createPdfDocument();
    const textSpy = vi.spyOn(doc, 'text');
    drawCompanyHeader(doc);

    expect(textSpy).toHaveBeenCalledWith('Apex Solutions PLC', PDF_MARGIN, PDF_MARGIN);
    expect(textSpy).toHaveBeenCalledWith(expect.stringContaining('123 Tech City'), PDF_MARGIN, expect.any(Number));
    expect(textSpy).toHaveBeenCalledWith(expect.stringContaining('billing@apex'), PDF_MARGIN, expect.any(Number));
    doc.end();
  });

  it('drawCompanyHeader handles missing environment variables gracefully', () => {
    delete process.env.COMPANY_NAME;
    delete process.env.COMPANY_ADDRESS;
    delete process.env.COMPANY_PHONE;
    delete process.env.COMPANY_EMAIL;
    delete process.env.COMPANY_WEBSITE;

    const doc = createPdfDocument();
    expect(() => drawCompanyHeader(doc)).not.toThrow();
    doc.end();
  });

  it('drawFooter writes document number and page numbers across pages', () => {
    const doc = createPdfDocument();
    doc.text('Page 1 content');
    doc.addPage();
    doc.text('Page 2 content');

    const textSpy = vi.spyOn(doc, 'text');
    drawFooter(doc, 'QT-2026-0001');

    expect(textSpy).toHaveBeenCalledWith('QT-2026-0001', PDF_MARGIN, expect.any(Number), expect.any(Object));
    expect(textSpy).toHaveBeenCalledWith('Page 1 of 2', expect.any(Number), expect.any(Number), expect.any(Object));
    expect(textSpy).toHaveBeenCalledWith('Page 2 of 2', expect.any(Number), expect.any(Number), expect.any(Object));
    doc.end();
  });
});
