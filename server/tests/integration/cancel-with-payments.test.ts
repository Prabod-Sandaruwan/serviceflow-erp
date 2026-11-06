import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Invoice Cancellation Interaction with Payments (PAY-007)', () => {
  let manager: any;
  let milestone: any;
  let invoice: any;
  let payment: any;

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
    const p = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;

    const m = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/milestones`), manager).send({
      title: 'Phase 1 Delivery', billingAmount: '50000.00',
    })).body.data;
    await approve(m.id);
    milestone = m;

    const inv = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m.id })).body.data;
    invoice = (await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;

    payment = (await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '20000.00', method: 'CASH', date: '2026-11-05',
    })).body.data;
  });

  it('Test 1 (Block cancel): Rejects invoice cancellation when active payment exists with 409', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({
      reason: 'Attempt cancel with payment',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVOICE_HAS_PAYMENTS');
  });

  it('Test 2 (Success after void): Cancels invoice after payment is voided and rolled back', async () => {
    const voidRes = await withCsrf(manager.post(`/api/v1/payments/${payment.id}/void`), manager).send({
      reason: 'Customer disputed charge',
    });
    expect(voidRes.status).toBe(200);
    expect(voidRes.body.meta.invoiceStatus).toBe('ISSUED');

    const cancelRes = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({
      reason: 'Milestone scope revised after review',
    });
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('CANCELLED');
  });

  it('Test 3 (Recreate invoice): Creates new draft invoice for same milestone after cancellation', async () => {
    await withCsrf(manager.post(`/api/v1/payments/${payment.id}/void`), manager).send({ reason: 'Voiding payment' });
    await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({ reason: 'Cancelled milestone' });

    const newInvRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    expect(newInvRes.status).toBe(201);
    expect(newInvRes.body.data.status).toBe('DRAFT');
    expect(newInvRes.body.data.id).not.toBe(invoice.id);
  });

  it('Test 4 (Block payment on cancelled): Rejects payment on CANCELLED invoice with 409', async () => {
    await withCsrf(manager.post(`/api/v1/payments/${payment.id}/void`), manager).send({ reason: 'Voiding payment' });
    await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({ reason: 'Cancelled milestone' });

    const payRes = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '10000.00', method: 'CASH', date: '2026-11-05',
    });
    expect(payRes.status).toBe(409);
    expect(payRes.body.error.code).toBe('INVALID_INVOICE_STATUS');
  });
});
