import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/config/prisma';
import { truncateAll, createUser, createClient, createQuotation } from '../helpers/factories';
import { getFinanceReport } from '../../src/modules/reports/reports.service';
import cases from '../fixtures/finance-cases.json';

const START_DATE = new Date('2026-11-01T00:00:00.000Z');
const END_DATE = new Date('2026-11-30T23:59:59.999Z');
const OP_DATE = new Date('2026-11-05T00:00:00.000Z');

let counter = 100;

describe('Financial Calculations Cross-Check (TEST-004)', () => {
  let user: any, project: any;

  beforeEach(async () => {
    await truncateAll();
    user = await createUser({ role: 'MANAGER' });
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: user.id, status: 'ACCEPTED' });
    project = await prisma.project.create({
      data: {
        projectCode: `PRJ-${Date.now().toString(36)}-${++counter}`,
        quotationId: q.id,
        clientId: client.id,
        name: 'Financial Crosscheck Project',
        budgetAmount: 100000,
        createdBy: user.id,
        status: 'ACTIVE',
      },
    });
  });

  it.each(cases)('$name matches exact hand-calculated financial totals', async (c) => {
    const createdInvoices: any[] = [];

    for (let i = 0; i < c.invoices.length; i++) {
      const inv = c.invoices[i];
      const milestone = await prisma.milestone.create({
        data: { projectId: project.id, name: `M-${i}`, billingAmount: inv.subtotal, status: 'APPROVED' },
      });
      const created = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now().toString(36)}-${++counter}`,
          projectId: project.id,
          milestoneId: milestone.id,
          activeMilestoneKey: inv.status !== 'CANCELLED' ? milestone.id : null,
          status: inv.status as any,
          issueDate: OP_DATE,
          dueDate: new Date('2026-11-25T00:00:00.000Z'),
          subtotal: inv.subtotal,
          total: inv.total,
          createdBy: user.id,
        },
      });
      if ((inv as any).items) {
        for (let j = 0; j < (inv as any).items.length; j++) {
          const item = (inv as any).items[j];
          await prisma.invoiceItem.create({
            data: {
              invoiceId: created.id, lineNo: j + 1, description: 'Line Item',
              quantity: item.quantity, unitPrice: item.unitPrice, lineAmount: item.lineAmount,
            },
          });
        }
      }
      createdInvoices.push(created);
    }

    for (const p of c.payments) {
      await prisma.payment.create({
        data: {
          invoiceId: createdInvoices[p.invoiceIndex].id,
          amount: p.amount, method: 'CASH', paymentDate: OP_DATE,
          status: p.status as any, recordedBy: user.id,
        },
      });
    }

    for (const e of c.expenses) {
      await prisma.expense.create({
        data: {
          projectId: project.id, category: 'OTHER', description: 'Test Expense',
          amount: e.amount, expenseDate: OP_DATE, status: e.status as any, recordedBy: user.id,
        },
      });
    }

    const report = await getFinanceReport(START_DATE, END_DATE);
    expect(report.revenue).toBe(c.expected.revenue);
    expect(report.paymentsReceived).toBe(c.expected.payments);
    expect(report.expenses).toBe(c.expected.expenses);
    expect(report.outstanding).toBe(c.expected.outstanding);
    expect(report.estimatedProfitability).toBe(c.expected.profit);
  });
});
