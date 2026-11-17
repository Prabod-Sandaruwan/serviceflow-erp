import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Invoices Dunning Notices (POST /api/v1/invoices/dunning-notices)', () => {
  let manager: any;
  let staff: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');

    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    const project = pRes.body.data;

    const mRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Milestone 1', billingAmount: '5000',
    });
    const milestone = mRes.body.data;
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});

    const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    const invoice = invRes.body.data;

    await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/issue`), manager).send({
      issueDate: '2024-01-01', dueDate: '2024-01-15',
    });
  });

  it('MANAGER dispatches overdue dunning notices and records audit log', async () => {
    const res = await withCsrf(manager.post('/api/v1/invoices/dunning-notices'), manager).send({});
    expect(res.status).toBe(200);
    expect(res.body.data.dispatchedCount).toBe(1);
    expect(res.body.data.totalOverdue).toBe('5000.00');

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'INVOICE_DUNNING_SENT' },
    });
    expect(audit).not.toBeNull();
  });

  it('STAFF cannot dispatch dunning notices (403)', async () => {
    const res = await withCsrf(staff.post('/api/v1/invoices/dunning-notices'), staff).send({});
    expect(res.status).toBe(403);
  });
});
