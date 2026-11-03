import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Projects API (PROJ-003)', () => {
  let manager: any;
  let staff: any;
  let client: any;
  let project: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    client = await createClient();

    const q = await createQuotation({
      clientId: client.id,
      createdBy: manager.user.id,
      status: 'ACCEPTED',
    });
    const res = await withCsrf(manager.post('/api/v1/projects'), manager).send({
      quotationId: q.id.toString(),
    });
    project = res.body.data;
  });

  it('lists projects with pagination', async () => {
    const res = await manager.get('/api/v1/projects?page=1&pageSize=10');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(project.id);
    expect(res.body.data[0].progressPercent).toBe(0);
    expect(res.body.meta).toMatchObject({ page: 1, pageSize: 10, total: 1 });
  });

  it('scoping: staff gets empty list when no tasks assigned, and sees project when assigned', async () => {
    const res1 = await staff.get('/api/v1/projects');
    expect(res1.status).toBe(200);
    expect(res1.body.data).toHaveLength(0);

    await prisma.task.create({
      data: {
        projectId: BigInt(project.id),
        title: 'Task 1',
        assigneeId: staff.user.employeeId,
        createdBy: manager.user.id,
      },
    });

    const res2 = await staff.get('/api/v1/projects');
    expect(res2.status).toBe(200);
    expect(res2.body.data).toHaveLength(1);
    expect(res2.body.data[0].id).toBe(project.id);
  });

  it('staff requests project detail without tasks returns 404, with task returns details', async () => {
    const res404 = await staff.get(`/api/v1/projects/${project.id}`);
    expect(res404.status).toBe(404);

    await prisma.task.create({
      data: {
        projectId: BigInt(project.id),
        title: 'Task 1',
        assigneeId: staff.user.employeeId,
        createdBy: manager.user.id,
      },
    });

    const resStaff = await staff.get(`/api/v1/projects/${project.id}`);
    expect(resStaff.status).toBe(200);
    expect(resStaff.body.data.progressPercent).toBe(0);
    expect(resStaff.body.data.invoices).toBeUndefined();
    expect(resStaff.body.data.expenses).toBeUndefined();

    const resMgr = await manager.get(`/api/v1/projects/${project.id}`);
    expect(resMgr.status).toBe(200);
    expect(resMgr.body.data.invoices).toEqual([]);
    expect(resMgr.body.data.expenses).toEqual([]);
  });
});
