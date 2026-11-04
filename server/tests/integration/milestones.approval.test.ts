import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Milestone Completion & Approval (PROJ-007)', () => {
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
      title: 'Milestone 1',
      billingAmount: '25000',
    });
    milestone = mRes.body.data;
  });

  it('rejects transition to COMPLETED when it has open tasks (409)', async () => {
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    await prisma.task.create({
      data: { projectId: BigInt(project.id), milestoneId: BigInt(milestone.id), title: 'Open Task', status: 'IN_PROGRESS', createdBy: manager.user.id },
    });

    const res = await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('MILESTONE_HAS_OPEN_TASKS');
  });

  it('rejects POST /approve for a milestone that is PENDING or IN_PROGRESS (409)', async () => {
    const resPending = await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});
    expect(resPending.status).toBe(409);
    expect(resPending.body.error.code).toBe('INVALID_STATE_TRANSITION');

    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    const resInProgress = await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});
    expect(resInProgress.status).toBe(409);
    expect(resInProgress.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });

  it('rejects staff attempts to POST /approve with 403', async () => {
    const res = await withCsrf(staff.post(`/api/v1/milestones/${milestone.id}/approve`), staff).send({});
    expect(res.status).toBe(403);
  });

  it('approves completed milestone, sets approved_by and records audit row', async () => {
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    const doneRes = await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });
    expect(doneRes.status).toBe(200);

    const approveRes = await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('APPROVED');
    expect(approveRes.body.data.approvedBy).toBe(manager.user.id.toString());

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'MILESTONE_APPROVED', entityId: BigInt(milestone.id) },
    });
    expect(audit).not.toBeNull();
  });
});
