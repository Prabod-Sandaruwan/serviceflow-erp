import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/config/prisma';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Payment History Endpoint (PAY-005)', () => {
  let manager: any;
  let staffAssigned: any;
  let staffUnassigned: any;
  let invoice1: any;
  let invoice2: any;
  let payment1: any;

  const approve = async (mId: string) => {
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${mId}/approve`), manager).send({});
  };

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staffAssigned = await loginAs(makeAgent(), 'STAFF');
    staffUnassigned = await loginAs(makeAgent(), 'STAFF');
    const client = await createClient();

    const q1 = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p1 = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q1.id.toString() })).body.data;
    const m1 = (await withCsrf(manager.post(`/api/v1/projects/${p1.id}/milestones`), manager).send({
      title: 'Milestone 1', billingAmount: '50000.00',
    })).body.data;
    await approve(m1.id);
    const inv1 = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m1.id })).body.data;
    invoice1 = (await withCsrf(manager.post(`/api/v1/invoices/${inv1.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;

    await withCsrf(manager.post(`/api/v1/projects/${p1.id}/tasks`), manager).send({
      title: 'Task on P1', assigneeId: staffAssigned.user.employeeId.toString(),
    });

    const payRes = await withCsrf(manager.post(`/api/v1/invoices/${invoice1.id}/payments`), manager).send({
      amount: '20000.00', method: 'CASH', date: '2026-11-05',
    });
    payment1 = payRes.body.data;

    const q2 = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p2 = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q2.id.toString() })).body.data;
    const m2 = (await withCsrf(manager.post(`/api/v1/projects/${p2.id}/milestones`), manager).send({
      title: 'Milestone 2', billingAmount: '30000.00',
    })).body.data;
    await approve(m2.id);
    const inv2 = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m2.id })).body.data;
    invoice2 = (await withCsrf(manager.post(`/api/v1/invoices/${inv2.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;
  });

  it('Test 1 (Success): Fetches payments history for invoice as Manager', async () => {
    const res = await manager.get(`/api/v1/invoices/${invoice1.id}/payments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(payment1.id);
    expect(res.body.data[0].status).toBe('ACTIVE');
    expect(res.body.data[0].amount).toBe('20000.00');
  });

  it('Test 2 (Staff Access): Assigned staff gets 200, unassigned staff gets 403', async () => {
    const resAssigned = await staffAssigned.get(`/api/v1/invoices/${invoice1.id}/payments`);
    expect(resAssigned.status).toBe(200);
    expect(resAssigned.body.data).toHaveLength(1);

    const resUnassigned = await staffUnassigned.get(`/api/v1/invoices/${invoice1.id}/payments`);
    expect([403, 404]).toContain(resUnassigned.status);
  });

  it('Test 3 (Voided Flag): Returns VOIDED payments with void_reason', async () => {
    await prisma.$executeRawUnsafe(
      "UPDATE payments SET status = 'VOIDED', void_reason = 'Test void', voided_at = NOW() WHERE id = ?",
      payment1.id
    );

    const res = await manager.get(`/api/v1/invoices/${invoice1.id}/payments`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    const p = res.body.data[0];
    expect(p.status).toBe('VOIDED');
    expect(p.void_reason || p.voidReason).toBe('Test void');
    expect(p.voided_at || p.voidedAt).toBeTruthy();
  });
});
