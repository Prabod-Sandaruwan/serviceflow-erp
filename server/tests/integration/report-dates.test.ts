import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../src/config/prisma';
import { makeAgent, loginAs } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

const DATES = [
  { key: 'A', date: new Date('2026-10-01T00:00:00.000Z'), amount: 10 },
  { key: 'B', date: new Date('2026-10-31T23:59:59.000Z'), amount: 20 },
  { key: 'C', date: new Date('2026-09-30T23:59:59.000Z'), amount: 100 },
  { key: 'D', date: new Date('2026-11-01T00:00:00.000Z'), amount: 200 },
  { key: 'E', date: new Date('2026-10-31T18:00:00.000Z'), amount: 30 },
];

describe('Date Filtering and Report Exclusions at Boundaries (TEST-006)', () => {
  let admin: any;

  beforeAll(async () => {
    await truncateAll();
    admin = await loginAs(makeAgent(), 'ADMIN');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: admin.user.id, status: 'ACCEPTED' });
    const project = await prisma.project.create({
      data: {
        projectCode: `PRJ-D-${Date.now().toString(36)}`,
        quotationId: q.id,
        clientId: client.id,
        name: 'Report Dates Project',
        budgetAmount: 100000,
        createdBy: admin.user.id,
        status: 'ACTIVE',
      },
    });

    for (let i = 0; i < DATES.length; i++) {
      const d = DATES[i];
      const m = await prisma.milestone.create({
        data: { projectId: project.id, name: `M-${d.key}`, billingAmount: d.amount, status: 'APPROVED' },
      });
      const inv = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-D-${Date.now().toString(36)}-${i}`,
          projectId: project.id,
          milestoneId: m.id,
          activeMilestoneKey: m.id,
          status: 'ISSUED',
          issueDate: d.date,
          issuedAt: d.date,
          dueDate: new Date('2026-11-30T00:00:00.000Z'),
          subtotal: d.amount,
          total: d.amount,
          createdBy: admin.user.id,
        },
      });
      await prisma.payment.create({
        data: {
          invoiceId: inv.id,
          amount: d.amount,
          method: 'CASH',
          paymentDate: d.date,
          status: 'ACTIVE',
          recordedBy: admin.user.id,
        },
      });
      await prisma.expense.create({
        data: {
          projectId: project.id,
          category: 'OTHER',
          description: `Expense ${d.key}`,
          amount: d.amount,
          expenseDate: d.date,
          status: 'ACTIVE',
          recordedBy: admin.user.id,
        },
      });
    }
  });

  afterAll(async () => {
    await truncateAll();
  });

  it('Test 1 (Date Boundary Inclusivity): includes exact start/end and Colombo edge (23:30), excludes boundaries outside month', async () => {
    const res = await admin.get('/api/v1/reports/finance?from=2026-10-01&to=2026-10-31');
    expect(res.status).toBe(200);
    expect(res.body.data.revenue).toBe('60.00');
    expect(res.body.data.paymentsReceived).toBe('60.00');
    expect(res.body.data.expenses).toBe('60.00');
  });

  it('Test 2 (Invalid Span): rejects date range exceeding 5 years with 422', async () => {
    const res = await admin.get('/api/v1/reports/finance?from=2020-01-01&to=2026-01-01');
    expect(res.status).toBe(422);
  });
});
