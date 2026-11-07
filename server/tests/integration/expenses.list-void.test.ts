import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Expenses List and Void Tests (FIN-003)', () => {
  let manager: any;
  let project: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    project = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;
  });

  const postExp = (date: string, amount: string = '100.00') =>
    withCsrf(manager.post('/api/v1/expenses'), manager).send({
      projectId: project.id, category: 'TRAVEL', amount, expenseDate: date, description: `Exp on ${date}`,
    });

  it('Test 1 (List Filters & Inclusive Dates): filters by date range inclusively', async () => {
    await postExp('2026-01-01');
    await postExp('2026-01-15');
    await postExp('2026-01-31');

    const resAll = await manager.get('/api/v1/expenses?from=2026-01-01&to=2026-01-31');
    expect(resAll.status).toBe(200);
    expect(resAll.body.data).toHaveLength(3);

    const resSingle = await manager.get('/api/v1/expenses?from=2026-01-15&to=2026-01-15');
    expect(resSingle.status).toBe(200);
    expect(resSingle.body.data).toHaveLength(1);
    expect(resSingle.body.data[0].expenseDate).toBe('2026-01-15');
  });

  it('Test 2 (Status Filter): excludes voided by default and includes on status=ALL', async () => {
    const exp1 = (await postExp('2026-02-01')).body.data;
    const exp2 = (await postExp('2026-02-02')).body.data;

    await withCsrf(manager.post(`/api/v1/expenses/${exp1.id}/void`), manager).send({
      reason: 'Entered duplicate expense by mistake',
    });

    const resDefault = await manager.get('/api/v1/expenses');
    expect(resDefault.status).toBe(200);
    expect(resDefault.body.data).toHaveLength(1);
    expect(resDefault.body.data[0].id).toBe(exp2.id);

    const resAll = await manager.get('/api/v1/expenses?status=ALL');
    expect(resAll.status).toBe(200);
    expect(resAll.body.data).toHaveLength(2);
  });

  it('Test 3 (Void Success & Audit): voids expense and creates audit record', async () => {
    const exp = (await postExp('2026-03-01', '250.00')).body.data;
    const voidRes = await withCsrf(manager.post(`/api/v1/expenses/${exp.id}/void`), manager).send({
      reason: 'Reimbursed through payroll instead',
    });

    expect(voidRes.status).toBe(200);
    expect(voidRes.body.data.status).toBe('VOIDED');
    expect(voidRes.body.data.voidReason).toBe('Reimbursed through payroll instead');

    const audit = await prisma.auditLog.findFirst({
      where: { entityType: 'EXPENSE', entityId: BigInt(exp.id), action: 'EXPENSE_VOIDED' },
    });
    expect(audit).toBeTruthy();
    const after = typeof audit?.afterJson === 'string' ? JSON.parse(audit.afterJson) : audit?.afterJson;
    expect(after.status).toBe('VOIDED');
  });

  it('Test 4 (Void Negative): rejects voiding non-existent (404) or already voided expense (409)', async () => {
    const notFound = await withCsrf(manager.post('/api/v1/expenses/9999999/void'), manager).send({
      reason: 'Valid reason here',
    });
    expect(notFound.status).toBe(404);

    const exp = (await postExp('2026-03-02')).body.data;
    await withCsrf(manager.post(`/api/v1/expenses/${exp.id}/void`), manager).send({ reason: 'First voiding' });
    const duplicate = await withCsrf(manager.post(`/api/v1/expenses/${exp.id}/void`), manager).send({
      reason: 'Second voiding',
    });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('ALREADY_VOIDED');
  });
});
