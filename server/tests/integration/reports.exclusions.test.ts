import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/config/prisma';
import { makeAgent, loginAs } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Reports Exclusions & Masking (FIN-010)', () => {
  let manager: any, staff: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const prj = await prisma.project.create({
      data: {
        projectCode: 'PRJ-EXC', name: 'Exclusions Test', status: 'ACTIVE', budgetAmount: 100000,
        client: { connect: { id: client.id } }, creator: { connect: { id: manager.user.id } },
        quotation: { connect: { id: q.id } },
      },
    });
    const ms = await prisma.milestone.create({
      data: { name: 'M1', project: { connect: { id: prj.id } }, billingAmount: 100000, status: 'APPROVED' },
    });
    const now = new Date();
    const mkInv = (num: string, status: any, sub: number) =>
      prisma.invoice.create({
        data: {
          invoiceNumber: num, project: { connect: { id: prj.id } }, milestone: { connect: { id: ms.id } },
          creator: { connect: { id: manager.user.id } }, issuer: { connect: { id: manager.user.id } },
          status, subtotal: sub, taxAmount: 0, total: sub, issueDate: now, dueDate: now,
        },
      });

    await mkInv('INV-DRF', 'DRAFT', 1000);
    await mkInv('INV-CNC', 'CANCELLED', 2000);
    const invIssued = await mkInv('INV-ISU', 'ISSUED', 1000);

    await prisma.payment.create({
      data: { invoice: { connect: { id: invIssued.id } }, amount: 500, method: 'CASH', paymentDate: now,
        status: 'ACTIVE', recorder: { connect: { id: manager.user.id } } },
    });
    await prisma.payment.create({
      data: { invoice: { connect: { id: invIssued.id } }, amount: 200, method: 'CASH', paymentDate: now,
        status: 'VOIDED', recorder: { connect: { id: manager.user.id } }, voidedAt: now, voidReason: 'Err' },
    });

    await prisma.expense.create({
      data: { project: { connect: { id: prj.id } }, amount: 300, category: 'SOFTWARE_LICENSE',
        description: 'Active', expenseDate: now, status: 'ACTIVE', recorder: { connect: { id: manager.user.id } } },
    });
    await prisma.expense.create({
      data: { project: { connect: { id: prj.id } }, amount: 100, category: 'SOFTWARE_LICENSE',
        description: 'Voided', expenseDate: now, status: 'VOIDED', recorder: { connect: { id: manager.user.id } },
        voidedAt: now, voidReason: 'Err' },
    });
  });

  it('Test 1 (Invoice Exclusions): revenue strictly includes only ISSUED (excludes DRAFT/CANCELLED)', async () => {
    const res = await manager.get('/api/v1/reports/finance');
    expect(res.status).toBe(200);
    expect(res.body.data.revenue).toBe('1000.00');
  });

  it('Test 2 (Payment/Expense Exclusions): strictly excludes VOIDED payments and expenses', async () => {
    const res = await manager.get('/api/v1/reports/finance');
    expect(res.status).toBe(200);
    expect(res.body.data.paymentsReceived).toBe('500.00');
    expect(res.body.data.expenses).toBe('300.00');
  });

  it('Test 3 (Staff Auth/Masking): rejects reports/finance with 403 and masks financials in dashboard', async () => {
    const repRes = await staff.get('/api/v1/reports/finance');
    expect(repRes.status).toBe(403);

    const dashRes = await staff.get('/api/v1/dashboard/summary');
    expect(dashRes.status).toBe(200);
    expect(dashRes.body.data.financials).toBeUndefined();
    expect(dashRes.body.data.role).toBe('STAFF');
  });
});
