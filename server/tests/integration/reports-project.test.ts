import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/config/prisma';
import { truncateAll, createUser, createClient, createQuotation } from '../helpers/factories';
import { getProjectProfitabilityReport, getOverdueInvoicesReport } from '../../src/modules/reports/reports.service';

describe('Project Profitability and Overdue Reports (FIN-006)', () => {
  let user: any, project: any, inv1: any, inv2: any;

  beforeEach(async () => {
    await truncateAll();
    user = await createUser({ role: 'ADMIN' });
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: user.id, status: 'ACCEPTED' });
    project = await prisma.project.create({
      data: { projectCode: 'PRJ-PROFIT', name: 'Profit Project', status: 'ACTIVE', budgetAmount: 50000,
        client: { connect: { id: client.id } }, creator: { connect: { id: user.id } }, quotation: { connect: { id: q.id } } },
    });
    const m = await prisma.milestone.create({
      data: { name: 'M1', project: { connect: { id: project.id } }, billingAmount: 50000, status: 'APPROVED' },
    });

    inv1 = await prisma.invoice.create({
      data: { invoiceNumber: 'INV-P1', project: { connect: { id: project.id } }, milestone: { connect: { id: m.id } },
        creator: { connect: { id: user.id } }, status: 'PAID', subtotal: 900, taxAmount: 100, total: 1000,
        issueDate: new Date('2026-01-10'), dueDate: new Date('2026-01-20') },
    });
    inv2 = await prisma.invoice.create({
      data: { invoiceNumber: 'INV-P2', project: { connect: { id: project.id } }, milestone: { connect: { id: m.id } },
        creator: { connect: { id: user.id } }, status: 'PARTIALLY_PAID', subtotal: 400, taxAmount: 100, total: 500,
        issueDate: new Date('2026-01-15'), dueDate: new Date('2026-01-25') },
    });

    await prisma.payment.create({
      data: { invoice: { connect: { id: inv1.id } }, amount: 1000, method: 'CASH', paymentDate: new Date('2026-01-15'),
        status: 'ACTIVE', recorder: { connect: { id: user.id } } },
    });
    await prisma.payment.create({
      data: { invoice: { connect: { id: inv2.id } }, amount: 200, method: 'CASH', paymentDate: new Date('2026-01-22'),
        status: 'ACTIVE', recorder: { connect: { id: user.id } } },
    });

    await prisma.expense.create({
      data: { project: { connect: { id: project.id } }, amount: 300, category: 'TRAVEL', description: 'Site travel',
        expenseDate: new Date('2026-01-10'), status: 'ACTIVE', recorder: { connect: { id: user.id } } },
    });
  });

  it('Test 1 (Project Profitability): aggregates financials and calculates estimatedProfitability', async () => {
    const report = await getProjectProfitabilityReport(project.id.toString());
    expect(report.projectId).toBe(project.id.toString());
    expect(report.revenue).toBe('1300.00');
    expect(report.billed).toBe('1500.00');
    expect(report.collected).toBe('1200.00');
    expect(report.expenses).toBe('300.00');
    expect(report.estimatedProfitability).toBe('1000.00');
    expect(report.margin).toBe(76.92);
    expect(report.progress).toBe(80);
  });

  it('Test 2 (Overdue List): returns only overdue invoices with outstanding balances', async () => {
    const overdue = await getOverdueInvoicesReport(new Date('2026-02-01'));
    expect(overdue).toHaveLength(1);
    expect(overdue[0].id).toBe(inv2.id.toString());
    expect(overdue[0].balance).toBe('300.00');
    expect(overdue[0].paidAmount).toBe('200.00');
    expect(overdue[0].total).toBe('500.00');
  });
});
