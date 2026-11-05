import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Invoices Creation & Milestone Eligibility (INV-002)', () => {
  let manager: any;
  let staff: any;
  let client: any;
  let project: any;
  let milestone: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    client = await createClient();

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;

    const mRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Phase 1 Delivery', billingAmount: '15000',
    });
    milestone = mRes.body.data;
  });

  const approveMilestone = async (mId: string) => {
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${mId}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${mId}/approve`), manager).send({});
  };

  it('Test 1: creates an invoice from an APPROVED milestone with default items (201)', async () => {
    await approveMilestone(milestone.id);
    const res = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    expect(res.status).toBe(201);
    expect(res.body.data.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.subtotal).toBe('15000.00');
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].description).toBe('Phase 1 Delivery');
  });

  it('Test 2: returns 409 MILESTONE_NOT_APPROVED for an unapproved milestone', async () => {
    const res = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('MILESTONE_NOT_APPROVED');
  });

  it('Test 3: returns 409 PROJECT_CANCELLED when project is cancelled', async () => {
    await approveMilestone(milestone.id);
    await withCsrf(manager.patch(`/api/v1/projects/${project.id}`), manager).send({
      status: 'CANCELLED', reason: 'Client cancelled contract',
    });
    const res = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PROJECT_CANCELLED');
  });

  it('Test 4 (Race Test): concurrent requests result in exactly one 201 and 409 for the rest', async () => {
    await approveMilestone(milestone.id);
    const requests = [1, 2, 3].map(() =>
      withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id })
    );
    const responses = await Promise.all(requests);
    const success = responses.filter((r) => r.status === 201);
    const conflicts = responses.filter((r) => r.status === 409 && r.body.error?.code === 'INVOICE_ALREADY_EXISTS');

    expect(success).toHaveLength(1);
    expect(conflicts).toHaveLength(2);
  });

  it('Test 5: forbids STAFF from creating invoices (403)', async () => {
    await approveMilestone(milestone.id);
    const res = await withCsrf(staff.post('/api/v1/invoices'), staff).send({ milestoneId: milestone.id });
    expect(res.status).toBe(403);
  });
});
