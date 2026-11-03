import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Tasks Query and Filters API (PROJ-010)', () => {
  let manager: any;
  let staff1: any;
  let staff2: any;
  let project: any;
  let task1: any;
  let task2: any;
  let task3: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff1 = await loginAs(makeAgent(), 'STAFF');
    staff2 = await loginAs(makeAgent(), 'STAFF');

    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;

    task1 = (await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Overdue high task',
      priority: 'HIGH',
      assigneeId: staff1.user.employeeId.toString(),
      dueDate: '2020-01-01',
    })).body.data;

    task2 = (await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Done past task',
      priority: 'LOW',
      assigneeId: staff2.user.employeeId.toString(),
      dueDate: '2020-01-01',
    })).body.data;
    await withCsrf(manager.patch(`/api/v1/tasks/${task2.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/tasks/${task2.id}`), manager).send({ status: 'DONE' });

    task3 = (await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Future medium task',
      priority: 'MEDIUM',
      assigneeId: staff1.user.employeeId.toString(),
      dueDate: '2099-12-31',
    })).body.data;
  });

  it('filters tasks by priority and exposes isOverdue correctly', async () => {
    const res = await manager.get('/api/v1/tasks?priority=HIGH');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(task1.id);
    expect(res.body.data[0].isOverdue).toBe(true);
  });

  it('filters overdue tasks correctly (excludes DONE and future tasks)', async () => {
    const res = await manager.get('/api/v1/tasks?overdue=true');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(task1.id);
  });

  it('scopes Staff queries to their employee ID by default', async () => {
    const res = await staff1.get('/api/v1/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    const ids = res.body.data.map((t: any) => t.id);
    expect(ids).toContain(task1.id);
    expect(ids).toContain(task3.id);
    expect(ids).not.toContain(task2.id);
  });

  it('lists tasks by project endpoint with pagination meta', async () => {
    const res = await manager.get(`/api/v1/projects/${project.id}/tasks?pageSize=2`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(3);
    expect(res.body.meta.pageSize).toBe(2);
  });
});

