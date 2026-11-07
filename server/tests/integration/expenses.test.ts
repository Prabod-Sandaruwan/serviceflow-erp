import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Expenses Module Integration Tests (FIN-002)', () => {
  let manager: any;
  let staff: any;
  let project: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    project = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;
  });

  it('Test 1 (Success Create & Audit): creates expense and writes EXPENSE_CREATED audit', async () => {
    const res = await withCsrf(manager.post('/api/v1/expenses'), manager).send({
      projectId: project.id,
      category: 'TRAVEL',
      amount: '150.00',
      expenseDate: '2026-11-05',
      description: 'Site visit travel allowance',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe('150.00');
    expect(res.body.data.category).toBe('TRAVEL');
    expect(res.body.data.status).toBe('ACTIVE');

    const audit = await prisma.auditLog.findFirst({
      where: { entityType: 'EXPENSE', action: 'EXPENSE_CREATED' },
    });
    expect(audit).not.toBeNull();
    expect(audit?.actorUserId).toBe(BigInt(manager.user.id));
  });

  it('Test 2 (Success Edit & Audit): updates expense and writes EXPENSE_UPDATED audit with before/after', async () => {
    const created = (await withCsrf(manager.post('/api/v1/expenses'), manager).send({
      projectId: project.id, category: 'SOFTWARE', amount: '200.00',
      expenseDate: '2026-11-05', description: 'IDE subscription',
    })).body.data;

    const res = await withCsrf(manager.patch(`/api/v1/expenses/${created.id}`), manager).send({
      amount: '250.00', description: 'Updated IDE subscription',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe('250.00');

    const audit = await prisma.auditLog.findFirst({
      where: { entityType: 'EXPENSE', action: 'EXPENSE_UPDATED' },
    });
    expect(audit).not.toBeNull();
    const before = typeof audit?.beforeJson === 'string' ? JSON.parse(audit.beforeJson) : audit?.beforeJson;
    const after = typeof audit?.afterJson === 'string' ? JSON.parse(audit.afterJson) : audit?.afterJson;
    expect(before.amount).toBe('200.00');
    expect(after.amount).toBe('250.00');
  });

  it('Test 3 (Negative - Cancelled Project): rejects expense creation on cancelled project with 409', async () => {
    await withCsrf(manager.patch(`/api/v1/projects/${project.id}`), manager).send({
      status: 'CANCELLED', reason: 'Project cancelled by client',
    });

    const res = await withCsrf(manager.post('/api/v1/expenses'), manager).send({
      projectId: project.id, category: 'OTHER', amount: '50.00',
      expenseDate: '2026-11-05', description: 'Courier charges',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_PROJECT_STATUS');
  });

  it('Test 4 (Negative - Zero Amount): rejects amount 0.00 with validation error', async () => {
    const res = await withCsrf(manager.post('/api/v1/expenses'), manager).send({
      projectId: project.id, category: 'OTHER', amount: '0.00',
      expenseDate: '2026-11-05', description: 'Zero test',
    });

    expect([400, 422]).toContain(res.status);
    expect(res.body).toHaveProperty('error');
  });

  it('Test 5 (Negative - Staff 403): forbids STAFF from creating expenses', async () => {
    const res = await withCsrf(staff.post('/api/v1/expenses'), staff).send({
      projectId: project.id, category: 'OTHER', amount: '100.00',
      expenseDate: '2026-11-05', description: 'Staff test',
    });

    expect(res.status).toBe(403);
  });
});
