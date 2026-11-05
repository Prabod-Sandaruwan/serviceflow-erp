import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Invoice Listing, Details, Derived Overdue & Staff Scoping (INV-007)', () => {
  let manager: any;
  let staff: any;
  let client: any;
  let project: any;
  let milestone: any;
  let invoice: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    client = await createClient();

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;

    const mRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Milestone 1', billingAmount: '10000',
    });
    milestone = mRes.body.data;

    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});

    const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    invoice = invRes.body.data;
  });

  it('Test 1: derives isOverdue dynamically (true for past due ISSUED, false for past due PAID)', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    await prisma.invoice.update({
      where: { id: BigInt(invoice.id) },
      data: { status: 'ISSUED', dueDate: new Date(yesterday) },
    });

    const res1 = await manager.get(`/api/v1/invoices/${invoice.id}`);
    expect(res1.status).toBe(200);
    expect(res1.body.data.isOverdue).toBe(true);

    await prisma.invoice.update({
      where: { id: BigInt(invoice.id) },
      data: { status: 'PAID' },
    });

    const res2 = await manager.get(`/api/v1/invoices/${invoice.id}`);
    expect(res2.status).toBe(200);
    expect(res2.body.data.isOverdue).toBe(false);
  });

  it('Test 2: scopes Staff queries to projects where they have assigned tasks', async () => {
    // Project 2 where staff is NOT assigned
    const q2 = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p2Res = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q2.id.toString() });
    const p2 = p2Res.body.data;

    const m2Res = await withCsrf(manager.post(`/api/v1/projects/${p2.id}/milestones`), manager).send({
      title: 'Milestone 2', billingAmount: '20000',
    });
    const m2 = m2Res.body.data;
    await withCsrf(manager.patch(`/api/v1/milestones/${m2.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${m2.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${m2.id}/approve`), manager).send({});

    const inv2Res = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m2.id });
    const invoice2 = inv2Res.body.data;

    // Initially staff has NO tasks assigned on project 1 or 2
    const listRes1 = await staff.get('/api/v1/invoices');
    expect(listRes1.status).toBe(200);
    expect(listRes1.body.data).toHaveLength(0);

    // Assign staff a task on project 1
    await withCsrf(manager.post(`/api/v1/projects/${project.id}/tasks`), manager).send({
      title: 'Staff task', assigneeId: staff.user.employeeId.toString(),
    });

    // Now staff sees invoice 1 but not invoice 2
    const listRes2 = await staff.get('/api/v1/invoices');
    expect(listRes2.status).toBe(200);
    expect(listRes2.body.data).toHaveLength(1);
    expect(listRes2.body.data[0].id).toBe(invoice.id);

    // Staff fetching invoice 1 succeeds
    const detRes1 = await staff.get(`/api/v1/invoices/${invoice.id}`);
    expect(detRes1.status).toBe(200);

    // Staff fetching invoice 2 returns 403
    const detRes2 = await staff.get(`/api/v1/invoices/${invoice2.id}`);
    expect(detRes2.status).toBe(403);
  });

  it('Test 3: filters invoices by overdue=true correctly', async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    await prisma.invoice.update({
      where: { id: BigInt(invoice.id) },
      data: { status: 'ISSUED', dueDate: new Date(yesterday) },
    });

    const res = await manager.get('/api/v1/invoices?overdue=true');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(invoice.id);
    expect(res.body.data[0].isOverdue).toBe(true);
  });
});

