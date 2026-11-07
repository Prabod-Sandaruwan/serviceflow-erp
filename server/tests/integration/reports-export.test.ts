import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/config/prisma';
import { makeAgent, loginAs } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Reports CSV Export Endpoint (FIN-009)', () => {
  let manager: any, staff: any, project: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    project = await prisma.project.create({
      data: {
        projectCode: 'PRJ-EXP', name: 'Export Project', status: 'ACTIVE', budgetAmount: 100000,
        client: { connect: { id: client.id } }, creator: { connect: { id: manager.user.id } },
        quotation: { connect: { id: q.id } },
      },
    });
    const milestone = await prisma.milestone.create({
      data: { name: 'M1', project: { connect: { id: project.id } }, billingAmount: 50000, status: 'APPROVED' },
    });
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-EXP-1', project: { connect: { id: project.id } },
        milestone: { connect: { id: milestone.id } }, creator: { connect: { id: manager.user.id } },
        issuer: { connect: { id: manager.user.id } }, status: 'ISSUED', subtotal: 50000,
        taxAmount: 0, total: 50000, issueDate: new Date(), dueDate: new Date('2026-12-31'),
      },
    });
    await prisma.payment.create({
      data: {
        invoice: { connect: { id: invoice.id } }, amount: 20000, method: 'BANK_TRANSFER',
        paymentDate: new Date(), status: 'ACTIVE', recorder: { connect: { id: manager.user.id } },
      },
    });
    await prisma.expense.create({
      data: {
        project: { connect: { id: project.id } }, amount: 5000, category: 'SOFTWARE_LICENSE',
        description: 'Monthly cloud licenses', expenseDate: new Date(), status: 'ACTIVE',
        recorder: { connect: { id: manager.user.id } },
      },
    });
  });

  it('Test 1 (Finance Export): exports CSV matching reports/finance JSON totals', async () => {
    const jsonRes = await manager.get('/api/v1/reports/finance');
    const csvRes = await manager.get('/api/v1/reports/export.csv?type=finance');
    expect(csvRes.status).toBe(200);
    expect(csvRes.headers['content-type']).toContain('text/csv');
    expect(csvRes.headers['content-disposition']).toContain('attachment; filename="export.csv"');

    const lines = csvRes.text.trim().split(/\r?\n/);
    const headers = lines[0].split(','), values = lines[1].split(',');
    const getVal = (col: string) => values[headers.indexOf(col)].replace(/^'/, '');

    expect(getVal('Revenue')).toBe(jsonRes.body.data.revenue);
    expect(getVal('Payments Received')).toBe(jsonRes.body.data.paymentsReceived);
    expect(getVal('Outstanding')).toBe(jsonRes.body.data.outstanding);
    expect(getVal('Expenses')).toBe(jsonRes.body.data.expenses);
    expect(getVal('Estimated Profitability')).toBe(jsonRes.body.data.estimatedProfitability);
  });

  it('Test 2 (Negative): rejects STAFF with 403 and invalid/missing type with 422', async () => {
    const staffRes = await staff.get('/api/v1/reports/export.csv?type=finance');
    expect(staffRes.status).toBe(403);
    const invalidRes = await manager.get('/api/v1/reports/export.csv?type=invalid');
    expect(invalidRes.status).toBe(422);
    const missingRes = await manager.get('/api/v1/reports/export.csv');
    expect(missingRes.status).toBe(422);
  });

  it('Test 3 (Projects Export): exports project profitability rows with expected columns', async () => {
    const csvRes = await manager.get('/api/v1/reports/export.csv?type=projects');
    expect(csvRes.status).toBe(200);
    expect(csvRes.headers['content-type']).toContain('text/csv');
    expect(csvRes.text).toContain('Project ID,Revenue,Billed,Collected,Expenses,Estimated Profitability');
    expect(csvRes.text).toContain(String(project.id));
  });
});
