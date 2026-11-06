import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Voiding Payments & Status Rollback (PAY-006)', () => {
  let manager: any;
  let staff: any;
  let invoice1: any;
  let invoice2: any;
  let payment1: any;
  let payment2B: any;

  const approve = async (mId: string) => {
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${mId}/approve`), manager).send({});
  };

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    const client = await createClient();

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;

    const m1 = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/milestones`), manager).send({
      title: 'Milestone 1', billingAmount: '50000.00',
    })).body.data;
    await approve(m1.id);
    const inv1 = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m1.id })).body.data;
    invoice1 = (await withCsrf(manager.post(`/api/v1/invoices/${inv1.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;
    payment1 = (await withCsrf(manager.post(`/api/v1/invoices/${invoice1.id}/payments`), manager).send({
      amount: '50000.00', method: 'CASH', date: '2026-11-05',
    })).body.data;

    const m2 = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/milestones`), manager).send({
      title: 'Milestone 2', billingAmount: '50000.00',
    })).body.data;
    await approve(m2.id);
    const inv2 = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m2.id })).body.data;
    invoice2 = (await withCsrf(manager.post(`/api/v1/invoices/${inv2.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;
    await withCsrf(manager.post(`/api/v1/invoices/${invoice2.id}/payments`), manager).send({
      amount: '30000.00', method: 'CASH', date: '2026-11-05',
    });
    payment2B = (await withCsrf(manager.post(`/api/v1/invoices/${invoice2.id}/payments`), manager).send({
      amount: '20000.00', method: 'CASH', date: '2026-11-06',
    })).body.data;
  });

  it('Test 1 (Success Rollback): Voids single full payment and rolls back invoice status to ISSUED', async () => {
    const res = await withCsrf(manager.post(`/api/v1/payments/${payment1.id}/void`), manager).send({
      reason: 'Erroneous duplicate entry',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('VOIDED');
    expect(res.body.data.voidReason || res.body.data.void_reason).toBe('Erroneous duplicate entry');
    expect(res.body.meta.invoiceStatus).toBe('ISSUED');
    expect(res.body.meta.newBalance).toBe('50000.00');
  });

  it('Test 2 (Partial Rollback): Voids one of two payments and rolls back status to PARTIALLY_PAID', async () => {
    const res = await withCsrf(manager.post(`/api/v1/payments/${payment2B.id}/void`), manager).send({
      reason: 'Payment chargeback dispute',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('VOIDED');
    expect(res.body.meta.invoiceStatus).toBe('PARTIALLY_PAID');
    expect(res.body.meta.newBalance).toBe('20000.00');
  });

  it('Test 3 (Negative - Void Twice): Rejects voiding an already VOIDED payment with 409', async () => {
    await withCsrf(manager.post(`/api/v1/payments/${payment1.id}/void`), manager).send({
      reason: 'First void request',
    });
    const res = await withCsrf(manager.post(`/api/v1/payments/${payment1.id}/void`), manager).send({
      reason: 'Duplicate void attempt',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_VOIDED');
  });

  it('Test 4 (Negative - Staff 403): Forbids STAFF from voiding payments', async () => {
    const res = await withCsrf(staff.post(`/api/v1/payments/${payment1.id}/void`), staff).send({
      reason: 'Unauthorized staff void',
    });
    expect(res.status).toBe(403);
  });
});

