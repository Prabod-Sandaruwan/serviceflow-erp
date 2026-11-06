import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Payment Concurrency and Race Condition Tests (PAY-011)', () => {
  let manager: any;
  let project: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    project = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;
  });

  const setupInvoice = async (amount = '100.00') => {
    const m = (await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'M', billingAmount: amount,
    })).body.data;
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${m.id}/approve`), manager).send({});
    const inv = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m.id })).body.data;
    return (await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;
  };

  it('Test 1 (Parallel Overpayment Block): exactly one 201 and one 422/409 across 5 runs', async () => {
    for (let i = 0; i < 5; i++) {
      const inv = await setupInvoice('100.00');
      const [r1, r2] = await Promise.all([
        withCsrf(manager.post(`/api/v1/invoices/${inv.id}/payments`), manager).send({ amount: '60.00', method: 'CASH', date: '2026-11-02' }),
        withCsrf(manager.post(`/api/v1/invoices/${inv.id}/payments`), manager).send({ amount: '60.00', method: 'CASH', date: '2026-11-02' }),
      ]);
      const codes = [r1.status, r2.status].sort();
      expect(codes[0]).toBe(201);
      expect([409, 422]).toContain(codes[1]);
      expect(await prisma.payment.count({ where: { invoiceId: BigInt(inv.id) } })).toBe(1);
    }
  });

  it('Test 2 (Parallel Exhaustion): 5 parallel 20.00 payments succeed, 6th fails', async () => {
    const inv = await setupInvoice('100.00');
    const reqs = Array.from({ length: 5 }, () =>
      withCsrf(manager.post(`/api/v1/invoices/${inv.id}/payments`), manager).send({ amount: '20.00', method: 'CASH', date: '2026-11-02' })
    );
    const results = await Promise.all(reqs);
    for (const r of results) expect(r.status).toBe(201);

    const r6 = await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/payments`), manager).send({
      amount: '20.00', method: 'CASH', date: '2026-11-02',
    });
    expect([409, 422]).toContain(r6.status);
    expect(await prisma.payment.count({ where: { invoiceId: BigInt(inv.id) } })).toBe(5);
  });

  it('Test 3 (Parallel Idempotency): 10 parallel requests with same key -> 1x 201, 9x 200', async () => {
    const inv = await setupInvoice('100.00');
    const key = `idem-race-${Date.now()}`;
    const reqs = Array.from({ length: 10 }, () =>
      withCsrf(manager.post(`/api/v1/invoices/${inv.id}/payments`), manager)
        .set('Idempotency-Key', key)
        .send({ amount: '50.00', method: 'CASH', date: '2026-11-02' })
    );
    const results = await Promise.all(reqs);
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 200)).toHaveLength(9);
    expect(await prisma.payment.count({ where: { invoiceId: BigInt(inv.id) } })).toBe(1);
  });
});
