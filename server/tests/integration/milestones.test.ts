import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Milestones API (PROJ-006)', () => {
  let manager: any;
  let client: any;
  let project: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const res = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = res.body.data;
  });

  it('creates and edits milestone successfully', async () => {
    const createRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Phase 1 MVP',
      description: 'Initial deliverables',
      billingAmount: '50000',
      dueDate: '2026-06-01',
    });
    expect(createRes.status).toBe(201);
    expect(createRes.headers.location).toBe(`/api/v1/milestones/${createRes.body.data.id}`);
    expect(createRes.body.data.title).toBe('Phase 1 MVP');
    expect(createRes.body.data.status).toBe('PENDING');

    const milestoneId = createRes.body.data.id;
    const updateRes = await withCsrf(manager.patch(`/api/v1/milestones/${milestoneId}`), manager).send({
      title: 'Phase 1 MVP Updated',
      status: 'IN_PROGRESS',
      billingAmount: '60000',
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.title).toBe('Phase 1 MVP Updated');
    expect(updateRes.body.data.status).toBe('IN_PROGRESS');
    expect(updateRes.body.data.billingAmount).toBe('60000');
  });

  it('fails validation for negative billingAmount (422)', async () => {
    const res = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Negative Amount',
      billingAmount: '-500',
    });
    expect(res.status).toBe(422);
  });

  it('rejects milestone creation on a CANCELLED project (409)', async () => {
    await withCsrf(manager.patch(`/api/v1/projects/${project.id}`), manager).send({
      status: 'CANCELLED',
      reason: 'Cancelled by client request',
    });

    const res = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Disallowed Milestone',
      billingAmount: '1000',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PROJECT_CANCELLED');
  });

  it('rejects invalid status transition (409)', async () => {
    const createRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Initial Milestone',
      billingAmount: '10000',
    });
    const milestoneId = createRes.body.data.id;

    const res = await withCsrf(manager.patch(`/api/v1/milestones/${milestoneId}`), manager).send({
      status: 'APPROVED',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });
});
