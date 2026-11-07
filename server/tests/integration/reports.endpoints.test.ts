import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/config/prisma';
import { makeAgent, loginAs } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Financial Report Endpoints (FIN-007)', () => {
  let manager: any, staff: any, project: any, milestone: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    project = await prisma.project.create({
      data: {
        projectCode: 'PRJ-REP', name: 'R1', status: 'ACTIVE', budgetAmount: 100000,
        client: { connect: { id: client.id } }, creator: { connect: { id: manager.user.id } },
        quotation: { connect: { id: q.id } },
      },
    });
    milestone = await prisma.milestone.create({
      data: { name: 'M1', project: { connect: { id: project.id } }, billingAmount: 100000, status: 'APPROVED' },
    });
  });

  const createInv = (invoiceNumber: string, date: string, subtotal: number) =>
    prisma.invoice.create({
      data: {
        invoiceNumber, project: { connect: { id: project.id } }, milestone: { connect: { id: milestone.id } },
        creator: { connect: { id: manager.user.id } }, issuer: { connect: { id: manager.user.id } },
        status: 'ISSUED', subtotal, taxAmount: 0, total: subtotal,
        issueDate: new Date(date), dueDate: new Date('2026-12-31'),
      },
    });

  it('Test 1 (Inclusive Boundaries): includes invoice issued on the last day of range', async () => {
    await createInv('INV-OCT31', '2026-10-31T12:00:00.000Z', 50000);
    await createInv('INV-NOV01', '2026-11-01T00:00:00.000Z', 25000);

    const res = await manager.get('/api/v1/reports/finance?from=2026-10-01&to=2026-10-31');
    expect(res.status).toBe(200);
    expect(res.body.data.revenue).toBe('50000.00');
  });

  it('Test 2 (Default to Current Month): returns successful financial report when dates omitted', async () => {
    const res = await manager.get('/api/v1/reports/finance');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('revenue');
    expect(res.body.data).toHaveProperty('paymentsReceived');
    expect(res.body.data).toHaveProperty('expenses');
    expect(res.body.data).toHaveProperty('outstanding');
    expect(res.body.data).toHaveProperty('estimatedProfitability');
    expect(res.body.data).toHaveProperty('from');
    expect(res.body.data).toHaveProperty('to');
  });

  it('Test 3 (Negative - Invalid Span): rejects date ranges exceeding 5 years with 422', async () => {
    const res = await manager.get('/api/v1/reports/finance?from=2020-01-01&to=2026-01-01');
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('Test 4 (Negative - Reversed Dates): rejects from > to with 422', async () => {
    const res = await manager.get('/api/v1/reports/finance?from=2026-10-31&to=2026-10-01');
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('Test 5 (Negative - Authorization): forbids STAFF role with 403', async () => {
    const res = await staff.get('/api/v1/reports/finance');
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
