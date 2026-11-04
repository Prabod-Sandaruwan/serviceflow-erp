import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Milestones Workflow, Approval & Blockers (PROJ-011)', () => {
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
      title: 'Milestone Alpha',
      billingAmount: '35000',
    });
    milestone = mRes.body.data;
  });

  it('allows Manager to approve completed milestone and records MILESTONE_APPROVED audit log', async () => {
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

  it('forbids Staff from approving milestone with 403', async () => {
    const res = await withCsrf(staff.post(`/api/v1/milestones/${milestone.id}/approve`), staff).send({});
    expect(res.status).toBe(403);
  });

  it('rejects milestone creation and editing on a CANCELLED project with 409 PROJECT_CANCELLED', async () => {
    await withCsrf(manager.patch(`/api/v1/projects/${project.id}`), manager).send({
      status: 'CANCELLED',
      reason: 'Cancelled before execution',
    });

    const createRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Disallowed Milestone',
      billingAmount: '5000',
    });
    expect(createRes.status).toBe(409);
    expect(createRes.body.error.code).toBe('PROJECT_CANCELLED');

    const editRes = await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({
      title: 'Cannot Edit',
    });
    expect(editRes.status).toBe(409);
    expect(editRes.body.error.code).toBe('PROJECT_CANCELLED');
  });

  it('rejects approval of non-completed milestone with 409 INVALID_STATE_TRANSITION', async () => {
    const res = await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });
});
