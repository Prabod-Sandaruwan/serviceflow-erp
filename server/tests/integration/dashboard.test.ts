import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/config/prisma';
import { makeAgent, loginAs } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Dashboard Summary Endpoints (FIN-008)', () => {
  let manager: any, staff: any, project: any, milestone: any;
  const now = new Date();

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    project = await prisma.project.create({
      data: { projectCode: 'PRJ-DASH', name: 'D1', status: 'ACTIVE', budgetAmount: 100000,
        client: { connect: { id: client.id } }, creator: { connect: { id: manager.user.id } }, quotation: { connect: { id: q.id } } },
    });
    milestone = await prisma.milestone.create({
      data: { name: 'M1', project: { connect: { id: project.id } }, billingAmount: 100000, status: 'APPROVED' },
    });

    const inv = await prisma.invoice.create({
      data: { invoiceNumber: 'INV-D1', project: { connect: { id: project.id } }, milestone: { connect: { id: milestone.id } },
        creator: { connect: { id: manager.user.id } }, issuer: { connect: { id: manager.user.id } },
        status: 'PARTIALLY_PAID', subtotal: 100000, taxAmount: 0, total: 100000,
        issueDate: now, dueDate: new Date(now.getTime() + 86400000) },
    });
    await prisma.payment.create({
      data: { invoice: { connect: { id: inv.id } }, amount: 40000, method: 'CASH', paymentDate: now,
        status: 'ACTIVE', recorder: { connect: { id: manager.user.id } } },
    });
    await prisma.expense.create({
      data: { project: { connect: { id: project.id } }, amount: 20000, category: 'SOFTWARE_LICENSE', description: 'License',
        expenseDate: now, status: 'ACTIVE', recorder: { connect: { id: manager.user.id } } },
    });

    await prisma.task.create({
      data: { title: 'T1', project: { connect: { id: project.id } }, creator: { connect: { id: manager.user.id } },
        assignee: { connect: { id: staff.user.employeeId } }, status: 'TODO' },
    });
    await prisma.lead.create({ data: { owner: { connect: { id: staff.user.id } } } });
    await createQuotation({ clientId: client.id, createdBy: staff.user.id, status: 'DRAFT' });
  });

  it('Test 1 (Manager/Admin): returns distinct financials matching reports/finance', async () => {
    const res = await manager.get('/api/v1/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.financials).toBeDefined();

    const { revenue, paymentsReceived } = res.body.data.financials;
    expect(revenue).toBe('100000.00');
    expect(paymentsReceived).toBe('40000.00');
    expect(revenue).not.toBe('140000.00');

    const repRes = await manager.get('/api/v1/reports/finance');
    expect(res.body.data.financials.revenue).toBe(repRes.body.data.revenue);
    expect(res.body.data.financials.paymentsReceived).toBe(repRes.body.data.paymentsReceived);
    expect(res.body.data.financials.expenses).toBe(repRes.body.data.expenses);
    expect(res.body.data.financials.outstanding).toBe(repRes.body.data.outstanding);
  });

  it('Test 2 (Staff Masking): hides financials and returns only task/lead/quotation counts', async () => {
    const res = await staff.get('/api/v1/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.data.financials).toBeUndefined();
    expect(res.body.data.role).toBe('STAFF');
    expect(res.body.data.tasks.total).toBe(1);
    expect(res.body.data.leadsCount).toBe(1);
    expect(res.body.data.quotationsCount).toBe(1);
  });

  it('Test 3 (Date Filtering): returns metrics strictly matching specified date range', async () => {
    const res = await manager.get('/api/v1/dashboard/summary?from=2024-01-01&to=2024-01-31');
    expect(res.status).toBe(200);
    expect(res.body.data.financials.revenue).toBe('0.00');
    expect(res.body.data.financials.expenses).toBe('0.00');
  });
});
