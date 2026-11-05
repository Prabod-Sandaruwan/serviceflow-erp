import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Invoice Audit Coverage Review (INV-009)', () => {
  let manager: any;
  let project: any;
  let milestone: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;
    const mRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Milestone 1', billingAmount: '10000',
    });
    milestone = mRes.body.data;
  });

  const approveMilestone = async (mId: string) => {
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${mId}/approve`), manager).send({});
  };

  it('Test 1 & 2: INVOICE_CREATED logged on success, no audit on failure', async () => {
    const failRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    expect(failRes.status).toBe(409);
    expect(await prisma.auditLog.count({ where: { action: 'INVOICE_CREATED' } })).toBe(0);

    await approveMilestone(milestone.id);
    const successRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    expect(successRes.status).toBe(201);
    const invoiceId = BigInt(successRes.body.data.id);

    const logs = await prisma.auditLog.findMany({ where: { entityType: 'INVOICE', entityId: invoiceId, action: 'INVOICE_CREATED' } });
    expect(logs).toHaveLength(1);
    expect(logs[0].actorUserId).toBe(BigInt(manager.user.id));
  });

  it('Test 3: INVOICE_UPDATED logged exactly once on successful edit', async () => {
    await approveMilestone(milestone.id);
    const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    const invoiceId = BigInt(invRes.body.data.id);

    const editRes = await withCsrf(manager.patch(`/api/v1/invoices/${invoiceId}`), manager).send({
      taxAmount: '500.00', notes: 'Updated notes',
    });
    expect(editRes.status).toBe(200);

    const logs = await prisma.auditLog.findMany({ where: { entityType: 'INVOICE', entityId: invoiceId, action: 'INVOICE_UPDATED' } });
    expect(logs).toHaveLength(1);
    expect(logs[0].actorUserId).toBe(BigInt(manager.user.id));
  });

  it('Test 4: INVOICE_ISSUED logged exactly once on successful issue', async () => {
    await approveMilestone(milestone.id);
    const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    const invoiceId = BigInt(invRes.body.data.id);

    const issueRes = await withCsrf(manager.post(`/api/v1/invoices/${invoiceId}/issue`), manager).send({
      issueDate: '2026-11-05', dueDate: '2026-11-30',
    });
    expect(issueRes.status).toBe(200);

    const logs = await prisma.auditLog.findMany({ where: { entityType: 'INVOICE', entityId: invoiceId, action: 'INVOICE_ISSUED' } });
    expect(logs).toHaveLength(1);
    expect(logs[0].actorUserId).toBe(BigInt(manager.user.id));
  });

  it('Test 5 & 6: INVOICE_CANCELLED logged on success, no audit on cancel failure', async () => {
    await approveMilestone(milestone.id);
    const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    const invoiceId = BigInt(invRes.body.data.id);
    await withCsrf(manager.post(`/api/v1/invoices/${invoiceId}/issue`), manager).send({
      issueDate: '2026-11-05', dueDate: '2026-11-30',
    });

    const failRes = await withCsrf(manager.post(`/api/v1/invoices/${invoiceId}/cancel`), manager).send({ reason: 'bad' });
    expect(failRes.status).toBe(422);
    expect(await prisma.auditLog.count({ where: { entityType: 'INVOICE', entityId: invoiceId, action: 'INVOICE_CANCELLED' } })).toBe(0);

    const cancelRes = await withCsrf(manager.post(`/api/v1/invoices/${invoiceId}/cancel`), manager).send({
      reason: 'Valid cancellation reason for audit test',
    });
    expect(cancelRes.status).toBe(200);

    const logs = await prisma.auditLog.findMany({ where: { entityType: 'INVOICE', entityId: invoiceId, action: 'INVOICE_CANCELLED' } });
    expect(logs).toHaveLength(1);
    expect(logs[0].actorUserId).toBe(BigInt(manager.user.id));

    const failRes2 = await withCsrf(manager.post(`/api/v1/invoices/${invoiceId}/cancel`), manager).send({ reason: 'Already cancelled attempt' });
    expect(failRes2.status).toBe(409);
    expect(await prisma.auditLog.count({ where: { entityType: 'INVOICE', entityId: invoiceId, action: 'INVOICE_CANCELLED' } })).toBe(1);
  });
});

