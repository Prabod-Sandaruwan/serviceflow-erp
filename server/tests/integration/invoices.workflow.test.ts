import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Invoice Workflow Integration (INV-011)', () => {
  let manager: any, client: any, project: any, milestone: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;
    const mRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Milestone Alpha', billingAmount: '20000.00',
    });
    milestone = mRes.body.data;
  });

  const approveMilestone = async (id: string) => {
    await withCsrf(manager.patch(`/api/v1/milestones/${id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${id}/approve`), manager).send({});
  };

  it('Test 1 (Happy Path): Create invoice -> Edit draft -> Issue invoice', async () => {
    await approveMilestone(milestone.id);
    const createRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.status).toBe('DRAFT');
    const invId = createRes.body.data.id;

    const editRes = await withCsrf(manager.patch(`/api/v1/invoices/${invId}`), manager).send({
      taxAmount: '2000.00', dueDate: '2026-11-20',
      items: [{ description: 'Custom Item', amount: '20000.00' }],
    });
    expect(editRes.status).toBe(200);
    expect(editRes.body.data.total).toBe('22000.00');

    const issueRes = await withCsrf(manager.post(`/api/v1/invoices/${invId}/issue`), manager).send({
      issueDate: '2026-11-05', dueDate: '2026-11-20',
    });
    expect(issueRes.status).toBe(200);
    expect(issueRes.body.data.status).toBe('ISSUED');
    expect(issueRes.body.data.issueDate).toBe('2026-11-05');
  });

  it('Test 2 (Negative): 409 when creating invoice for unapproved milestone', async () => {
    const res = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('MILESTONE_NOT_APPROVED');
  });

  it('Test 3 (Negative): 409 when creating duplicate active invoice for milestone', async () => {
    await approveMilestone(milestone.id);
    await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    const dupRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('INVOICE_ALREADY_EXISTS');
  });

  it('Test 4 (Negative): 409 when attempting to PATCH an ISSUED invoice', async () => {
    await approveMilestone(milestone.id);
    const inv = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id })).body.data;
    await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
      issueDate: '2026-11-05', dueDate: '2026-11-20',
    });
    const patchRes = await withCsrf(manager.patch(`/api/v1/invoices/${inv.id}`), manager).send({ taxAmount: '500.00' });
    expect(patchRes.status).toBe(409);
    expect(patchRes.body.error.code).toBe('INVOICE_IMMUTABLE');
  });

  it('Test 5 (Negative): 409 when attempting to issue an already ISSUED invoice', async () => {
    await approveMilestone(milestone.id);
    const inv = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id })).body.data;
    await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
      issueDate: '2026-11-05', dueDate: '2026-11-20',
    });
    const issueTwiceRes = await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
      issueDate: '2026-11-05', dueDate: '2026-11-20',
    });
    expect(issueTwiceRes.status).toBe(409);
    expect(issueTwiceRes.body.error.code).toBe('INVOICE_IMMUTABLE');
  });
});
