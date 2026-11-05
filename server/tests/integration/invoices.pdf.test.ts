import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Invoice PDF Generation & Scoping (INV-008)', () => {
  let manager: any;
  let staff: any;
  let client: any;
  let project1: any;
  let milestone1: any;
  let invoice1: any;
  let project2: any;
  let milestone2: any;
  let invoice2: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    client = await createClient();

    // Project 1
    const q1 = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p1Res = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q1.id.toString() });
    project1 = p1Res.body.data;

    const m1Res = await withCsrf(manager.post(`/api/v1/projects/${project1.id}/milestones`), manager).send({
      title: 'Milestone 1', billingAmount: '12000',
    });
    milestone1 = m1Res.body.data;

    await withCsrf(manager.patch(`/api/v1/milestones/${milestone1.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone1.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${milestone1.id}/approve`), manager).send({});

    const inv1Res = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone1.id });
    invoice1 = inv1Res.body.data;
    await withCsrf(manager.post(`/api/v1/invoices/${invoice1.id}/issue`), manager).send({
      issueDate: '2026-11-05', dueDate: '2026-11-30',
    });

    // Assign staff to project 1
    await withCsrf(manager.post(`/api/v1/projects/${project1.id}/tasks`), manager).send({
      title: 'Dev Task', assigneeId: staff.user.employeeId.toString(),
    });

    // Project 2 (unassigned for staff)
    const q2 = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p2Res = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q2.id.toString() });
    project2 = p2Res.body.data;

    const m2Res = await withCsrf(manager.post(`/api/v1/projects/${project2.id}/milestones`), manager).send({
      title: 'Milestone 2', billingAmount: '18000',
    });
    milestone2 = m2Res.body.data;

    await withCsrf(manager.patch(`/api/v1/milestones/${milestone2.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone2.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${milestone2.id}/approve`), manager).send({});

    const inv2Res = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone2.id });
    invoice2 = inv2Res.body.data;
  });

  it('Test 1 (Success): Manager fetches PDF for an ISSUED invoice', async () => {
    const res = await manager.get(`/api/v1/invoices/${invoice1.id}/pdf`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toMatch(/inline; filename="Invoice-.*\.pdf"/);
    expect(res.body.slice(0, 4).toString()).toBe('%PDF');
  });

  it('Test 2 (403 Error): Staff attempts to fetch PDF for an unassigned project invoice', async () => {
    const res = await staff.get(`/api/v1/invoices/${invoice2.id}/pdf`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Test 3 (Success): Staff successfully fetches PDF for an assigned project invoice', async () => {
    const res = await staff.get(`/api/v1/invoices/${invoice1.id}/pdf`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });
});

