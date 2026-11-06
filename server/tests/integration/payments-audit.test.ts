import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';
import { recordPayment } from '../../src/modules/payments/payments.service';
import { AuditService } from '../../src/modules/audit/audit.service';

describe('Payment Audit Coverage Review (PAY-008)', () => {
  let manager: any;
  let invoice: any;

  beforeEach(async () => {
    vi.restoreAllMocks();
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;
    const m = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/milestones`), manager).send({
      title: 'M1', billingAmount: '5000.00',
    })).body.data;
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${m.id}/approve`), manager).send({});
    const inv = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m.id })).body.data;
    invoice = (await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;
  });

  it('Test 1 (PAYMENT_RECORDED): creates exactly one audit entry on successful record', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '2000.00', method: 'CASH', date: '2026-11-02',
    });
    expect(res.status).toBe(201);
    const payId = BigInt(res.body.data.id);
    const logs = await prisma.auditLog.findMany({ where: { entityType: 'PAYMENT', entityId: payId, action: 'PAYMENT_RECORDED' } });
    expect(logs).toHaveLength(1);
    expect(logs[0].actorUserId).toBe(BigInt(manager.user.id));
    expect((logs[0].afterJson as any)?.amount).toBe('2000.00');
  });

  it('Test 2 (PAYMENT_VOIDED): creates exactly one audit entry on void with before/after amounts', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '2000.00', method: 'CASH', date: '2026-11-02',
    });
    const payId = BigInt(res.body.data.id);
    const voidRes = await withCsrf(manager.post(`/api/v1/payments/${payId}/void`), manager).send({
      reason: 'Valid void reason for audit testing',
    });
    expect(voidRes.status).toBe(200);
    const logs = await prisma.auditLog.findMany({ where: { entityType: 'PAYMENT', entityId: payId, action: 'PAYMENT_VOIDED' } });
    expect(logs).toHaveLength(1);
    expect(logs[0].actorUserId).toBe(BigInt(manager.user.id));
    expect((logs[0].afterJson as any)?.voidReason).toBe('Valid void reason for audit testing');
  });

  it('Test 3 (Validation Failure): rejects overpayment and generates NO audit log', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '999999.00', method: 'CASH', date: '2026-11-02',
    });
    expect(res.status).toBe(422);
    expect(await prisma.auditLog.count({ where: { action: 'PAYMENT_RECORDED' } })).toBe(0);
  });

  it('Test 4 (Rollback / Atomicity): transaction error rolls back payment and audit insert', async () => {
    vi.spyOn(AuditService, 'record').mockRejectedValueOnce(new Error('Simulated audit failure'));
    await expect(
      recordPayment(invoice.id, { amount: '500.00', method: 'CASH', date: '2026-11-02' }, { userId: manager.user.id, role: 'MANAGER' })
    ).rejects.toThrow('Simulated audit failure');
    expect(await prisma.payment.count({ where: { invoiceId: BigInt(invoice.id) } })).toBe(0);
    expect(await prisma.auditLog.count({ where: { action: 'PAYMENT_RECORDED' } })).toBe(0);
  });
});
