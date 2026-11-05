import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Draft Invoice Editing (INV-004)', () => {
  let manager: any;
  let client: any;
  let project: any;
  let milestone: any;
  let invoice: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    client = await createClient();

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;

    const mRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Phase 1 Delivery', billingAmount: '15000',
    });
    milestone = mRes.body.data;

    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});

    const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    invoice = invRes.body.data;
  });

  it('Test 1 (Success): edits a DRAFT invoice with items, tax, and due date and recomputes totals', async () => {
    const updatePayload = {
      items: [
        { description: 'Design Phase', amount: '20000.00' },
        { description: 'Development Phase', amount: '30000.00' },
      ],
      taxType: 'VAT',
      taxRate: 18,
      taxAmount: '9000.00',
      taxReference: 'TAX-REF-001',
      dueDate: '2026-12-31',
    };

    const res = await withCsrf(manager.patch(`/api/v1/invoices/${invoice.id}`), manager).send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.data.subtotal).toBe('50000.00');
    expect(res.body.data.taxAmount).toBe('9000.00');
    expect(res.body.data.total).toBe('59000.00');
    expect(res.body.data.taxType).toBe('VAT');
    expect(res.body.data.taxReference).toBe('TAX-REF-001');
    expect(res.body.data.dueDate).toBe('2026-12-31');
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.items[0].description).toBe('Design Phase');
    expect(res.body.data.items[1].description).toBe('Development Phase');
  });

  it('Test 2 (409 Error): Attempt to edit an invoice in ISSUED status (Assert 409 INVOICE_IMMUTABLE)', async () => {
    await prisma.invoice.update({ where: { id: BigInt(invoice.id) }, data: { status: 'ISSUED' } });

    const res = await withCsrf(manager.patch(`/api/v1/invoices/${invoice.id}`), manager).send({
      taxAmount: '1000.00',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVOICE_IMMUTABLE');
  });

  it('Test 3 (409 Error): Attempt to edit an invoice in PAID status (Assert 409)', async () => {
    await prisma.invoice.update({ where: { id: BigInt(invoice.id) }, data: { status: 'PAID' } });

    const res = await withCsrf(manager.patch(`/api/v1/invoices/${invoice.id}`), manager).send({
      taxAmount: '1000.00',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVOICE_IMMUTABLE');
  });

  it('Test 4 (409 Error): Attempt to edit an invoice in CANCELLED status (Assert 409)', async () => {
    await prisma.invoice.update({ where: { id: BigInt(invoice.id) }, data: { status: 'CANCELLED' } });

    const res = await withCsrf(manager.patch(`/api/v1/invoices/${invoice.id}`), manager).send({
      taxAmount: '1000.00',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVOICE_IMMUTABLE');
  });
});

