import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Payment Concurrency and Race Condition Tests (PAY-011)', () => {
  let manager: any;
  let invoice: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;
    const m = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/milestones`), manager).send({
      title: 'Milestone 1', billingAmount: '1000.00',
    })).body.data;
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${m.id}/approve`), manager).send({});
    const inv = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m.id })).body.data;
    invoice = (await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;
  });

  it('Concurrent payments exceeding total balance: exactly one succeeds and one is rejected', async () => {
    const req1 = withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '600.00', method: 'CASH', date: '2026-11-02',
    });
    const req2 = withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '600.00', method: 'CASH', date: '2026-11-02',
    });

    const [res1, res2] = await Promise.all([req1, req2]);
    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 422]);

    const failRes = res1.status === 422 ? res1 : res2;
    expect(failRes.body.error.code).toBe('PAYMENT_EXCEEDS_BALANCE');

    const payments = await prisma.payment.findMany({ where: { invoiceId: BigInt(invoice.id) } });
    expect(payments).toHaveLength(1);
    expect(Number(payments[0].amount).toFixed(2)).toBe('600.00');

    const invInDb = await prisma.invoice.findUnique({ where: { id: BigInt(invoice.id) } });
    expect(invInDb?.status).toBe('PARTIALLY_PAID');
  });

  it('Concurrent payments with same idempotency key: safe replay without duplicate payments', async () => {
    const key = 'concurrency-race-idem-key';
    const req1 = withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager)
      .set('Idempotency-Key', key)
      .send({ amount: '400.00', method: 'CASH', date: '2026-11-02' });
    const req2 = withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager)
      .set('Idempotency-Key', key)
      .send({ amount: '400.00', method: 'CASH', date: '2026-11-02' });

    const [res1, res2] = await Promise.all([req1, req2]);
    expect([200, 201]).toContain(res1.status);
    expect([200, 201]).toContain(res2.status);

    const payments = await prisma.payment.findMany({ where: { invoiceId: BigInt(invoice.id) } });
    expect(payments).toHaveLength(1);
    expect(Number(payments[0].amount).toFixed(2)).toBe('400.00');
  });
});
