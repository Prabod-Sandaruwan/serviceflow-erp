import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Project Lifecycle & State Rules (PROJ-004)', () => {
  let manager: any;
  let client: any;
  let project: any;

  const patch = (body: any) => withCsrf(manager.patch(`/api/v1/projects/${project.id}`), manager).send(body);

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const res = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = res.body.data;
  });

  it('successfully transitions PLANNED to ACTIVE and records PROJECT_STATUS_CHANGED audit', async () => {
    const res = await patch({ status: 'ACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'PROJECT_STATUS_CHANGED', entityId: BigInt(project.id) },
    });
    expect(audit).not.toBeNull();
  });

  it('successfully transitions ACTIVE to COMPLETED when all work is done', async () => {
    await patch({ status: 'ACTIVE' });
    const ms = await prisma.milestone.create({
      data: { projectId: BigInt(project.id), name: 'M1', billingAmount: 1000, status: 'APPROVED' },
    });
    await prisma.task.create({
      data: { projectId: BigInt(project.id), milestoneId: ms.id, title: 'T1', status: 'DONE', createdBy: manager.user.id },
    });

    const res = await patch({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('rejects transition to COMPLETED with 409 when a task is open or milestone is unapproved', async () => {
    await patch({ status: 'ACTIVE' });
    await prisma.task.create({
      data: { projectId: BigInt(project.id), title: 'Open Task', status: 'IN_PROGRESS', createdBy: manager.user.id },
    });
    const resTask = await patch({ status: 'COMPLETED' });
    expect(resTask.status).toBe(409);
    expect(resTask.body.error.code).toBe('PROJECT_HAS_OPEN_WORK');

    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;
    await patch({ status: 'ACTIVE' });
    await prisma.milestone.create({
      data: { projectId: BigInt(project.id), name: 'Pending MS', billingAmount: 1000, status: 'IN_PROGRESS' },
    });
    const resMs = await patch({ status: 'COMPLETED' });
    expect(resMs.status).toBe(409);
    expect(resMs.body.error.code).toBe('PROJECT_HAS_OPEN_WORK');
  });

  it('rejects transition to CANCELLED without a reason with 422', async () => {
    const res = await patch({ status: 'CANCELLED' });
    expect(res.status).toBe(422);

    const resShort = await patch({ status: 'CANCELLED', reason: 'bad' });
    expect(resShort.status).toBe(422);
  });

  it('rejects update with 422 when end_date precedes start_date', async () => {
    const res = await patch({ startDate: '2026-05-10', endDate: '2026-05-01' });
    expect(res.status).toBe(422);
  });
});
