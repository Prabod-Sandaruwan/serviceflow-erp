import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/config/prisma';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Reports Workflow & Mutation Impact (FIN-010)', () => {
  let manager: any, project: any, milestone: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    project = await prisma.project.create({
      data: {
        projectCode: 'PRJ-WF', name: 'Workflow Test', status: 'ACTIVE', budgetAmount: 100000,
        client: { connect: { id: client.id } }, creator: { connect: { id: manager.user.id } },
        quotation: { connect: { id: q.id } },
      },
    });
    milestone = await prisma.milestone.create({
      data: { name: 'M1', project: { connect: { id: project.id } }, billingAmount: 50000, status: 'APPROVED' },
    });
  });

  it('Test 1 (Cancel Invoice Impact): cancelling an issued invoice drops revenue by invoice subtotal', async () => {
    const inv = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-WF-1', project: { connect: { id: project.id } },
        milestone: { connect: { id: milestone.id } }, creator: { connect: { id: manager.user.id } },
        issuer: { connect: { id: manager.user.id } }, status: 'ISSUED', subtotal: 500,
        taxAmount: 0, total: 500, issueDate: new Date(), dueDate: new Date('2026-12-31'),
      },
    });

    const resBefore = await manager.get('/api/v1/reports/finance');
    expect(resBefore.status).toBe(200);
    const revBefore = Number(resBefore.body.data.revenue);

    const cancelRes = await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/cancel`), manager).send({
      reason: 'Billing error cancellation',
    });
    expect(cancelRes.status).toBe(200);

    const resAfter = await manager.get('/api/v1/reports/finance');
    const revAfter = Number(resAfter.body.data.revenue);
    expect(revBefore - revAfter).toBe(500);
  });

  it('Test 2 (Void Expense Impact): voiding an active expense decreases expenses and increases profit', async () => {
    const exp = await prisma.expense.create({
      data: {
        project: { connect: { id: project.id } }, amount: 200, category: 'SOFTWARE_LICENSE',
        description: 'Server license', expenseDate: new Date(), status: 'ACTIVE',
        recorder: { connect: { id: manager.user.id } },
      },
    });

    const resBefore = await manager.get('/api/v1/reports/finance');
    expect(resBefore.status).toBe(200);
    const profitBefore = Number(resBefore.body.data.estimatedProfitability);
    const expBefore = Number(resBefore.body.data.expenses);

    const voidRes = await withCsrf(manager.post(`/api/v1/expenses/${exp.id}/void`), manager).send({
      reason: 'Duplicate billing receipt',
    });
    expect(voidRes.status).toBe(200);

    const resAfter = await manager.get('/api/v1/reports/finance');
    const profitAfter = Number(resAfter.body.data.estimatedProfitability);
    const expAfter = Number(resAfter.body.data.expenses);

    expect(expBefore - expAfter).toBe(200);
    expect(profitAfter - profitBefore).toBe(200);
  });
});
