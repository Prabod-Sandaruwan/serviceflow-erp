import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation, createEmployee } from '../helpers/factories';

describe('Tasks API (PROJ-009)', () => {
  let manager: any;
  let client: any;
  let project: any;
  let employee: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    client = await createClient();
    employee = await createEmployee({ is_active: true });

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;
  });

  it('successfully creates and assigns a task, then updates it', async () => {
    const res = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Build login page',
      description: 'Implement auth form',
      priority: 'HIGH',
      assigneeId: employee.id.toString(),
    });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Build login page');
    expect(res.body.data.status).toBe('TODO');
    expect(res.body.data.priority).toBe('HIGH');
    expect(res.body.data.assigneeId).toBe(employee.id.toString());
    expect(res.headers.location).toBe(`/api/v1/tasks/${res.body.data.id}`);

    const taskId = res.body.data.id;
    const updateRes = await withCsrf(manager.patch(`/api/v1/tasks/${taskId}`), manager).send({
      status: 'IN_PROGRESS',
      priority: 'URGENT',
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('IN_PROGRESS');
    expect(updateRes.body.data.priority).toBe('URGENT');
  });

  it('fails validation when assigning an INACTIVE employee (422)', async () => {
    const inactiveEmp = await createEmployee({ is_active: false });
    const res = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Task for inactive',
      assigneeId: inactiveEmp.id.toString(),
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('EMPLOYEE_INACTIVE');
  });

  it('fails validation when linking to a milestone from a DIFFERENT project (422)', async () => {
    const otherQ = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const otherP = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: otherQ.id.toString() })).body.data;

    const msRes = await withCsrf(manager.post(`/api/v1/projects/${otherP.id}/milestones`), manager).send({
      title: 'Other Milestone',
      billingAmount: '1000',
    });
    const otherMilestone = msRes.body.data;

    const res = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Cross project task',
      milestoneId: otherMilestone.id.toString(),
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('FOREIGN_MILESTONE');
  });

  it('cannot create a task on a CANCELLED project (409)', async () => {
    await withCsrf(manager.patch(`/api/v1/projects/${project.id}`), manager).send({
      status: 'CANCELLED',
      reason: 'Cancelled before execution',
    });

    const res = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Task after cancel',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PROJECT_CANCELLED');
  });
});
