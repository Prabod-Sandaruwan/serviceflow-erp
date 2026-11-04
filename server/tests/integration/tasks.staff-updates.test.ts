import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation, createEmployee } from '../helpers/factories';

describe('Tasks Staff Updates API (PROJ-010)', () => {
  let manager: any;
  let staff1: any;
  let staff2: any;
  let client: any;
  let project: any;
  let task1: any;
  let task2: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff1 = await loginAs(makeAgent(), 'STAFF');
    staff2 = await loginAs(makeAgent(), 'STAFF');

    client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;

    const t1Res = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Task for Staff 1',
      assigneeId: staff1.user.employeeId.toString(),
    });
    task1 = t1Res.body.data;

    const t2Res = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Task for Staff 2',
      assigneeId: staff2.user.employeeId.toString(),
    });
    task2 = t2Res.body.data;
  });

  it('allows Staff to update only status of their own assigned task', async () => {
    const res = await withCsrf(staff1.patch(`/api/v1/tasks/${task1.id}`), staff1).send({
      status: 'IN_PROGRESS',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('forbids Staff from updating a task assigned to another user (403)', async () => {
    const res = await withCsrf(staff1.patch(`/api/v1/tasks/${task2.id}`), staff1).send({
      status: 'IN_PROGRESS',
    });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('forbids Staff from updating any field other than status (403)', async () => {
    const res = await withCsrf(staff1.patch(`/api/v1/tasks/${task1.id}`), staff1).send({
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('forbids Staff from updating an unassigned task (403)', async () => {
    const unassignedRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Unassigned Task',
    });
    const unassignedTask = unassignedRes.body.data;

    const res = await withCsrf(staff1.patch(`/api/v1/tasks/${unassignedTask.id}`), staff1).send({
      status: 'IN_PROGRESS',
    });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('allows Manager to update status, priority, and title of any task', async () => {
    const res = await withCsrf(manager.patch(`/api/v1/tasks/${task1.id}`), manager).send({
      title: 'Updated Title by Manager',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title by Manager');
    expect(res.body.data.priority).toBe('URGENT');
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });
});

