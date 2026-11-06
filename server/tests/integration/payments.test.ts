import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Payment Recording in Locked Transaction (PAY-003)', () => {
  let manager: any;
  let issuedInvoice: any;
  let draftInvoice: any;

  const approve = async (mId: string) => {
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${mId}/approve`), manager).send({});
  };

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    const project = pRes.body.data;

    const m1 = (await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Milestone 1', billingAmount: '590000.00',
    })).body.data;
    await approve(m1.id);

    const inv1 = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m1.id })).body.data;
    issuedInvoice = (await withCsrf(manager.post(`/api/v1/invoices/${inv1.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;

    const m2 = (await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Milestone 2', billingAmount: '100000.00',
    })).body.data;
    await approve(m2.id);
    draftInvoice = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m2.id })).body.data;
  });

  it('Test 1 (Success & Math Workflow): Records payments and updates balance/status', async () => {
    const pay1 = await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/payments`), manager).send({
      amount: '200000.00', method: 'BANK_TRANSFER', date: '2026-11-05', reference: 'TRX-200K',
    });
    expect(pay1.status).toBe(201);
    expect(pay1.body.meta.newBalance).toBe('390000.00');
    expect(pay1.body.meta.invoiceStatus).toBe('PARTIALLY_PAID');

    const pay2 = await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/payments`), manager).send({
      amount: '150000.00', method: 'CASH', date: '2026-11-06',
    });
    expect(pay2.status).toBe(201);
    expect(pay2.body.meta.newBalance).toBe('240000.00');
    expect(pay2.body.meta.invoiceStatus).toBe('PARTIALLY_PAID');
  });

  it('Test 2 (Negative - Status): Rejects payment on DRAFT or CANCELLED invoices with 409', async () => {
    const resDraft = await withCsrf(manager.post(`/api/v1/invoices/${draftInvoice.id}/payments`), manager).send({
      amount: '10000.00', method: 'CASH', date: '2026-11-05',
    });
    expect(resDraft.status).toBe(409);
    expect(resDraft.body.error.code).toBe('INVALID_INVOICE_STATUS');

    await withCsrf(manager.post(`/api/v1/invoices/${draftInvoice.id}/cancel`), manager).send({
      reason: 'Cancelled by client request',
    });
    const resCancelled = await withCsrf(manager.post(`/api/v1/invoices/${draftInvoice.id}/payments`), manager).send({
      amount: '10000.00', method: 'CASH', date: '2026-11-05',
    });
    expect(resCancelled.status).toBe(409);
  });

  it('Test 3 (Negative - Overpay): Rejects amount exceeding current balance with 422', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/payments`), manager).send({
      amount: '600000.00', method: 'CASH', date: '2026-11-05',
    });
    expect(res.status).toBe(422);
    expect(['PAYMENT_EXCEEDS_BALANCE', 'AMOUNT_EXCEEDS_BALANCE']).toContain(res.body.error.code);
  });

  it('Test 4 (Negative - Reference): Rejects BANK_TRANSFER without reference with 422', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/payments`), manager).send({
      amount: '50000.00', method: 'BANK_TRANSFER', date: '2026-11-05',
    });
    expect([400, 422]).toContain(res.status);
  });
});
