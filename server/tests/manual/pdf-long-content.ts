import fs from 'fs';
import path from 'path';
import { generateInvoicePdf } from '../../src/modules/invoices/invoice.pdf';

const longDesc = 'Comprehensive enterprise infrastructure optimization and modern cloud microservices decoupled orchestration architecture with resilient distributed database clustering, high-throughput real-time telemetry analytics ingestion pipeline, zero-trust cryptographic role-based authorization boundaries, automated disaster recovery failover workflows, and full-spectrum test validation across multi-region deployment nodes.';

export async function generateLongInvoice(): Promise<{ path: string; buffer: Buffer }> {
  const items = Array.from({ length: 60 }, (_, i) => ({
    id: `item-${i + 1}`,
    description: i === 4 ? longDesc : `Deliverable Service Package Milestone Item #${i + 1} - Standard Engineering Execution`,
    quantity: 1,
    unitPrice: 150.0,
    lineAmount: 150.0,
  }));

  const invoice = {
    id: 101,
    invoiceNumber: 'INV-2026-LONG-01',
    status: 'ISSUED',
    subtotal: 9000.0,
    taxType: 'VAT 10%',
    taxAmount: 900.0,
    total: 9900.0,
    paid: 2000.0,
    balance: 7900.0,
    notes: 'Payment terms: Net 30 days. Late payments subject to 1.5% interest.',
    issuerName: 'Jane Doe',
    issuerTitle: 'Chief Financial Officer',
    project: { name: 'Global ERP Modernization', client: { displayName: 'MegaCorp' } },
    items,
  };

  const buffer = await generateInvoicePdf(invoice);
  const outPath = path.resolve('test-long-invoice.pdf');
  fs.writeFileSync(outPath, buffer);
  const rootPath = path.resolve(__dirname, '../../../test-long-invoice.pdf');
  try { fs.writeFileSync(rootPath, buffer); } catch (_) {}
  return { path: outPath, buffer };
}

if (require.main === module) {
  generateLongInvoice().then((res) => console.log('Saved:', res.path)).catch(console.error);
}
