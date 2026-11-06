import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Payment Audit Coverage Review (PAY-008)', () => {
  let manager: any;
  let invoice: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    const mRes = await withCsrf(manager.post(`/api/v1/projects/${pRes.body.data.id}/milestones`), manager).send({
      title: 'M1', billingAmount: '5000',
    });
    const mId = mRes.body.data.id;
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${mId}/approve`), manager).send({});
    const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: mId });
    const invId = invRes.body.data.id;
    const issueRes = await withCsrf(manager.post(`/api/v1/invoices/${invId}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    });
    invoice = issueRes.body.data;
  });

  it('PAYMENT_RECORDED logged on success, no audit log on failure', async () => {
    const failRes = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '999999.00', method: 'CASH', date: '2026-11-02',
    });
    expect(failRes.status).toBe(422);
    expect(await prisma.auditLog.count({ where: { action: 'PAYMENT_RECORDED' } })).toBe(0);

    const okRes = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '2000.00', method: 'CASH', date: '2026-11-02',
    });
    expect(okRes.status).toBe(201);
    const payId = BigInt(okRes.body.data.id);

    const logs = await prisma.auditLog.findMany({ where: { entityType: 'PAYMENT', entityId: payId, action: 'PAYMENT_RECORDED' } });
    expect(logs).toHaveLength(1);
    expect(logs[0].actorUserId).toBe(BigInt(manager.user.id));
    expect(logs[0].actorRole).toBe('MANAGER');
  });

  it('Replaying idempotent payment does not create duplicate audit log', async () => {
    const idemKey = 'audit-idem-key-1';
    const r1 = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager)
      .set('Idempotency-Key', idemKey)
      .send({ amount: '1000.00', method: 'CASH', date: '2026-11-02' });
    expect(r1.status).toBe(201);

    const r2 = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager)
      .set('Idempotency-Key', idemKey)
      .send({ amount: '1000.00', method: 'CASH', date: '2026-11-02' });
    expect(r2.status).toBe(200);

    const logs = await prisma.auditLog.findMany({ where: { action: 'PAYMENT_RECORDED' } });
    expect(logs).toHaveLength(1);
  });

  it('PAYMENT_VOIDED logged on void, no audit on void failure', async () => {
    const payRes = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '1500.00', method: 'CASH', date: '2026-11-02',
    });
    const payId = payRes.body.data.id;

    const failVoid = await withCsrf(manager.post(`/api/v1/payments/${payId}/void`), manager).send({ reason: 'abc' });
    expect(failVoid.status).toBe(422);
    expect(await prisma.auditLog.count({ where: { action: 'PAYMENT_VOIDED' } })).toBe(0);

    const okVoid = await withCsrf(manager.post(`/api/v1/payments/${payId}/void`), manager).send({
      reason: 'Valid void reason for audit testing',
    });
    expect(okVoid.status).toBe(200);

    const logs = await prisma.auditLog.findMany({ where: { entityType: 'PAYMENT', entityId: BigInt(payId), action: 'PAYMENT_VOIDED' } });
    expect(logs).toHaveLength(1);
    expect(logs[0].actorUserId).toBe(BigInt(manager.user.id));
    expect(logs[0].actorRole).toBe('MANAGER');
  });
});
