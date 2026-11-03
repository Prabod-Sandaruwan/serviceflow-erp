import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation, createEmployee } from '../helpers/factories';

describe('Tasks Workflows, Limits & Blockers (PROJ-011)', () => {
  let manager: any;
  let staff: any;
  let otherStaff: any;
  let project: any;
  let task: any;
  let otherTask: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    otherStaff = await loginAs(makeAgent(), 'STAFF');
    const client = await createClient();

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;
    project = p;

    task = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/tasks`), manager).send({
      title: 'Staff Task',
      assigneeId: staff.user.employeeId.toString(),
    })).body.data;

    otherTask = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/tasks`), manager).send({
      title: 'Other Task',
      assigneeId: otherStaff.user.employeeId.toString(),
    })).body.data;
  });

  it('allows Staff to update own task status (200)', async () => {
    const res = await withCsrf(staff.patch(`/api/v1/tasks/${task.id}`), staff).send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('forbids Staff from updating another user task or changing priority (403)', async () => {
    const resOther = await withCsrf(staff.patch(`/api/v1/tasks/${otherTask.id}`), staff).send({ status: 'IN_PROGRESS' });
    expect(resOther.status).toBe(403);

    const resPriority = await withCsrf(staff.patch(`/api/v1/tasks/${task.id}`), staff).send({ priority: 'URGENT' });
    expect(resPriority.status).toBe(403);
  });

  it('fails validation when assigning inactive employee or foreign milestone (422)', async () => {
    const inactive = await createEmployee({ is_active: false });
    const resEmp = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Task Inactive',
      assigneeId: inactive.id.toString(),
    });
    expect(resEmp.status).toBe(422);
    expect(resEmp.body.error.code).toBe('EMPLOYEE_INACTIVE');

    const client2 = await createClient();
    const otherQ = await createQuotation({ clientId: client2.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const otherP = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: otherQ.id.toString() })).body.data;
    const ms = (await withCsrf(manager.post(`/api/v1/projects/${otherP.id}/milestones`), manager).send({
      title: 'Other MS',
      billingAmount: '1000',
    })).body.data;

    const resMs = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Cross project',
      milestoneId: ms.id.toString(),
    });
    expect(resMs.status).toBe(422);
    expect(resMs.body.error.code).toBe('FOREIGN_MILESTONE');
  });

  it('cannot create or edit a task on a CANCELLED project (409)', async () => {
    await withCsrf(manager.patch(`/api/v1/projects/${project.id}`), manager).send({
      status: 'CANCELLED',
      reason: 'Cancelled before execution',
    });
    const resCreate = await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({ title: 'Task after cancel' });
    expect(resCreate.status).toBe(409);
    expect(resCreate.body.error.code).toBe('PROJECT_CANCELLED');

    const resEdit = await withCsrf(manager.patch(`/api/v1/tasks/${task.id}`), manager).send({ title: 'Edit after cancel' });
    expect(resEdit.status).toBe(409);
    expect(resEdit.body.error.code).toBe('PROJECT_CANCELLED');
  });
});
