import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

const CONCURRENCY_COUNT = process.env.CONCURRENCY_COUNT ? parseInt(process.env.CONCURRENCY_COUNT, 10) : 5;

describe('Payment Concurrency and Race Condition Tests (PAY-011)', () => {
  let manager: any, project: any;

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

  it('Test 1 (Parallel Overpayment Invariant): sum of successful payments never exceeds invoice total', async () => {
    const inv = await setupInvoice('100.00');
    const reqs = Array.from({ length: CONCURRENCY_COUNT }, () =>
      withCsrf(manager.post(`/api/v1/invoices/${inv.id}/payments`), manager).send({ amount: '60.00', method: 'CASH', date: '2026-11-02' })
    );
    const results = await Promise.all(reqs);
    const successes = results.filter((r) => r.status === 201);
    const rejected = results.filter((r) => [409, 422].includes(r.status));

    expect(successes.length + rejected.length).toBe(CONCURRENCY_COUNT);
    expect(successes).toHaveLength(1);
    const payments = await prisma.payment.findMany({ where: { invoiceId: BigInt(inv.id), status: 'ACTIVE' } });
    const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    expect(totalPaid).toBeLessThanOrEqual(100.00);
    expect(payments).toHaveLength(1);
  });

  it('Test 2 (Parallel Exhaustion Invariant): concurrent payments settle invoice without overpayment', async () => {
    const inv = await setupInvoice('100.00');
    const reqs = Array.from({ length: CONCURRENCY_COUNT }, () =>
      withCsrf(manager.post(`/api/v1/invoices/${inv.id}/payments`), manager).send({ amount: '20.00', method: 'CASH', date: '2026-11-02' })
    );
    const results = await Promise.all(reqs);
    const successes = results.filter((r) => r.status === 201);
    expect(successes).toHaveLength(CONCURRENCY_COUNT);

    const overflow = await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/payments`), manager).send({
      amount: '20.00', method: 'CASH', date: '2026-11-02',
    });
    expect([409, 422]).toContain(overflow.status);
    const payments = await prisma.payment.findMany({ where: { invoiceId: BigInt(inv.id), status: 'ACTIVE' } });
    const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    expect(totalPaid).toBe(100.00);
  });

  it('Test 3 (Parallel Idempotency Invariant): concurrent requests with same key yield exactly 1 creation', async () => {
    const inv = await setupInvoice('100.00');
    const key = `idem-race-${Date.now()}`;
    const count = CONCURRENCY_COUNT * 2;
    const reqs = Array.from({ length: count }, () =>
      withCsrf(manager.post(`/api/v1/invoices/${inv.id}/payments`), manager)
        .set('Idempotency-Key', key)
        .send({ amount: '50.00', method: 'CASH', date: '2026-11-02' })
    );
    const results = await Promise.all(reqs);
    const created = results.filter((r) => r.status === 201);
    const replayed = results.filter((r) => r.status === 200);
    expect(created.length + replayed.length).toBe(count);
    expect(created).toHaveLength(1);
    expect(replayed).toHaveLength(count - 1);
    expect(await prisma.payment.count({ where: { invoiceId: BigInt(inv.id) } })).toBe(1);
  });
});
