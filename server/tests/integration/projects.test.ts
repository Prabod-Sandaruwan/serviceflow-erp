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

  it('successfully transitions from PLANNED to ACTIVE', async () => {
    const res = await patch({ status: 'ACTIVE' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
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

  it('rejects transition ACTIVE to COMPLETED with 409 PROJECT_HAS_OPEN_WORK when a task is not DONE', async () => {
    await patch({ status: 'ACTIVE' });
    await prisma.task.create({
      data: { projectId: BigInt(project.id), title: 'Open Task', status: 'IN_PROGRESS', createdBy: manager.user.id },
    });

    const res = await patch({ status: 'COMPLETED' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PROJECT_HAS_OPEN_WORK');
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
