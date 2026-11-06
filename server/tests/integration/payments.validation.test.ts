import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Payment Validation, Overpayment Prevention & Idempotency (PAY-004)', () => {
  let manager: any;
  let invoice1: any;
  let invoice2: any;

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
      title: 'Phase 1', billingAmount: '50000.00',
    })).body.data;
    await approve(m1.id);
    const inv1 = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m1.id })).body.data;
    invoice1 = (await withCsrf(manager.post(`/api/v1/invoices/${inv1.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;

    const m2 = (await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Phase 2', billingAmount: '30000.00',
    })).body.data;
    await approve(m2.id);
    const inv2 = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m2.id })).body.data;
    invoice2 = (await withCsrf(manager.post(`/api/v1/invoices/${inv2.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;
  });

  it('Test 1 (Exact Balance): Pays the exact remaining balance and transitions to PAID', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice1.id}/payments`), manager).send({
      amount: '50000.00', method: 'CASH', date: '2026-11-05',
    });
    expect(res.status).toBe(201);
    expect(res.body.meta.newBalance).toBe('0.00');
    expect(res.body.meta.invoiceStatus).toBe('PAID');
  });

  it('Test 2 (Overpayment 422): Rejects exact balance + 0.01 with PAYMENT_EXCEEDS_BALANCE', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice1.id}/payments`), manager).send({
      amount: '50000.01', method: 'CASH', date: '2026-11-05',
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('PAYMENT_EXCEEDS_BALANCE');
    expect(res.body.error.details.max).toBe('50000.00');
  });

  it('Test 3 (Idempotency Success): Replays duplicate request with 200 and returns identical payment', async () => {
    const req1 = withCsrf(manager.post(`/api/v1/invoices/${invoice1.id}/payments`), manager)
      .set('Idempotency-Key', 'test-key-123');
    const res1 = await req1.send({ amount: '15000.00', method: 'CASH', date: '2026-11-05' });
    expect(res1.status).toBe(201);
    const paymentId1 = res1.body.data.id;

    const req2 = withCsrf(manager.post(`/api/v1/invoices/${invoice1.id}/payments`), manager)
      .set('Idempotency-Key', 'test-key-123');
    const res2 = await req2.send({ amount: '15000.00', method: 'CASH', date: '2026-11-05' });
    expect(res2.status).toBe(200);
    expect(res2.body.data.id).toBe(paymentId1);
  });

  it('Test 4 (Idempotency Conflict): Rejects using same key for a different invoice with 409', async () => {
    const req1 = withCsrf(manager.post(`/api/v1/invoices/${invoice1.id}/payments`), manager)
      .set('Idempotency-Key', 'unique-key-456');
    const res1 = await req1.send({ amount: '10000.00', method: 'CASH', date: '2026-11-05' });
    expect(res1.status).toBe(201);

    const req2 = withCsrf(manager.post(`/api/v1/invoices/${invoice2.id}/payments`), manager)
      .set('Idempotency-Key', 'unique-key-456');
    const res2 = await req2.send({ amount: '10000.00', method: 'CASH', date: '2026-11-05' });
    expect(res2.status).toBe(409);
    expect(res2.body.error.code).toBe('IDEMPOTENCY_KEY_IN_USE');
  });
});

