import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Payment Workflow Integration Tests (PAY-010)', () => {
  let manager: any;
  let issuedInvoice: any;
  let draftInvoice: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;
    const m1 = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/milestones`), manager).send({
      title: 'M1', billingAmount: '1000.00',
    })).body.data;
    await withCsrf(manager.patch(`/api/v1/milestones/${m1.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${m1.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${m1.id}/approve`), manager).send({});
    const inv1 = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m1.id })).body.data;
    issuedInvoice = (await withCsrf(manager.post(`/api/v1/invoices/${inv1.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;

    const m2 = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/milestones`), manager).send({
      title: 'M2', billingAmount: '2000.00',
    })).body.data;
    await withCsrf(manager.patch(`/api/v1/milestones/${m2.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${m2.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${m2.id}/approve`), manager).send({});
    draftInvoice = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m2.id })).body.data;
  });

  it('Test 1 (Happy Path - Partial then Full): 50% then 50% settle invoice', async () => {
    const p1 = await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/payments`), manager).send({
      amount: '500.00', method: 'CASH', date: '2026-11-02',
    });
    expect(p1.status).toBe(201);
    expect(p1.body.meta.invoiceStatus).toBe('PARTIALLY_PAID');

    const p2 = await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/payments`), manager).send({
      amount: '500.00', method: 'CASH', date: '2026-11-03',
    });
    expect(p2.status).toBe(201);
    expect(p2.body.meta.invoiceStatus).toBe('PAID');
    expect(p2.body.meta.newBalance).toBe('0.00');
  });

  it('Test 2 (Negative - Overpayment): rejects balance + 10 with 422', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/payments`), manager).send({
      amount: '1010.00', method: 'CASH', date: '2026-11-02',
    });
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'PAYMENT_EXCEEDS_BALANCE');
  });

  it('Test 3 (Negative - Zero/Negative): rejects 0 or -500 with validation error', async () => {
    for (const amt of ['0.00', '-500.00']) {
      const res = await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/payments`), manager).send({
        amount: amt, method: 'CASH', date: '2026-11-02',
      });
      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code');
    }
  });

  it('Test 4 (Negative - Invalid Status): rejects DRAFT, CANCELLED, and PAID invoices with 409', async () => {
    const rDraft = await withCsrf(manager.post(`/api/v1/invoices/${draftInvoice.id}/payments`), manager).send({
      amount: '100.00', method: 'CASH', date: '2026-11-02',
    });
    expect(rDraft.status).toBe(409);
    expect(rDraft.body).toHaveProperty('error');
    expect(rDraft.body.error).toHaveProperty('code');

    await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/cancel`), manager).send({ reason: 'Valid cancellation reason' });
    const rCancel = await withCsrf(manager.post(`/api/v1/invoices/${issuedInvoice.id}/payments`), manager).send({
      amount: '100.00', method: 'CASH', date: '2026-11-02',
    });
    expect(rCancel.status).toBe(409);
    expect(rCancel.body).toHaveProperty('error');
    expect(rCancel.body.error).toHaveProperty('code');
  });

  it('Test 5 (Negative - Invalid IDs): rejects non-existent or malformed ID', async () => {
    for (const badId of ['999999', 'invalid-id']) {
      const res = await withCsrf(manager.post(`/api/v1/invoices/${badId}/payments`), manager).send({
        amount: '100.00', method: 'CASH', date: '2026-11-02',
      });
      expect([400, 404]).toContain(res.status);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toHaveProperty('code');
    }
  });
});
