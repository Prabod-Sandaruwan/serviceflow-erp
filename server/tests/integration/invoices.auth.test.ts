import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Invoice Authorization Integration (INV-011)', () => {
  let manager: any, staff: any, client: any, project: any, milestone: any, invoice: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    client = await createClient();

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;

    const mRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Milestone 1', billingAmount: '10000.00',
    });
    milestone = mRes.body.data;

    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});

    const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    invoice = invRes.body.data;
  });

  it('Test 1: STAFF receives 403 FORBIDDEN on create, edit, issue and cancel mutations', async () => {
    // 1. POST /invoices (Create)
    const createRes = await withCsrf(staff.post('/api/v1/invoices'), staff).send({ milestoneId: milestone.id });
    expect(createRes.status).toBe(403);

    // 2. PATCH /invoices/:id (Edit)
    const editRes = await withCsrf(staff.patch(`/api/v1/invoices/${invoice.id}`), staff).send({ taxAmount: '500.00' });
    expect(editRes.status).toBe(403);

    // 3. POST /invoices/:id/issue (Issue)
    const issueRes = await withCsrf(staff.post(`/api/v1/invoices/${invoice.id}/issue`), staff).send({
      issueDate: '2026-11-05', dueDate: '2026-11-20',
    });
    expect(issueRes.status).toBe(403);

    // 4. POST /invoices/:id/cancel (Cancel)
    const cancelRes = await withCsrf(staff.post(`/api/v1/invoices/${invoice.id}/cancel`), staff).send({
      reason: 'Unauthorized staff cancellation attempt',
    });
    expect(cancelRes.status).toBe(403);
  });
});
