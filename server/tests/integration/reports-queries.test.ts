import { describe, it, expect, beforeEach } from 'vitest';
import prisma from '../../src/config/prisma';
import { truncateAll, createUser, createClient, createQuotation } from '../helpers/factories';
import { getRevenue, getPaymentsReceived, getOutstanding } from '../../src/modules/reports/reports.repository';
import { calculateRevenue, calculatePaymentsReceived, calculateOutstanding } from '../../src/modules/reports/formulas';

describe('Reports Repository Queries (FIN-005)', () => {
  let user: any, inv1: any, inv2: any;
  const start = new Date('2026-01-01T00:00:00.000Z'), end = new Date('2026-01-31T23:59:59.999Z');

  beforeEach(async () => {
    await truncateAll();
    user = await createUser({ role: 'ADMIN' });
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: user.id, status: 'ACCEPTED' });
    const p = await prisma.project.create({
      data: { projectCode: 'PRJ-101', name: 'P1', status: 'ACTIVE', budgetAmount: 500000,
        client: { connect: { id: client.id } }, creator: { connect: { id: user.id } }, quotation: { connect: { id: q.id } } },
    });
    const m = await prisma.milestone.create({
      data: { name: 'M1', project: { connect: { id: p.id } }, billingAmount: 500000, status: 'APPROVED' },
    });

    const createInv = (invoiceNumber: string, status: any, subtotal: number, tax: number, total: number, date?: string) =>
      prisma.invoice.create({
        data: { invoiceNumber, project: { connect: { id: p.id } }, milestone: { connect: { id: m.id } },
          creator: { connect: { id: user.id } }, issuer: date ? { connect: { id: user.id } } : undefined,
          status, subtotal, taxAmount: tax, total,
          issueDate: date ? new Date(date) : undefined, dueDate: date ? new Date('2026-01-30') : undefined },
      });

    inv1 = await createInv('INV-101', 'ISSUED', 200000, 36000, 236000, '2026-01-10');
    inv2 = await createInv('INV-102', 'PARTIALLY_PAID', 150000, 27000, 177000, '2026-01-15');
    await createInv('INV-103', 'DRAFT', 80000, 14400, 94400);
    await createInv('INV-104', 'CANCELLED', 50000, 9000, 59000, '2026-01-20');

    const createPay = (invId: bigint, amt: number, date: string, status: any) =>
      prisma.payment.create({
        data: { invoice: { connect: { id: invId } }, amount: amt, method: 'CASH', paymentDate: new Date(date),
          status, recorder: { connect: { id: user.id } } },
      });

    await createPay(inv2.id, 50000, '2026-01-18', 'ACTIVE');
    await createPay(inv1.id, 30000, '2026-02-10', 'ACTIVE');
    await createPay(inv1.id, 20000, '2026-01-16', 'VOIDED');
  });

  it('Test 1 (Revenue): matches formula output for active issued/partially paid invoices', async () => {
    const dbRevenue = await getRevenue(start, end);
    const rawInvoices = await prisma.invoice.findMany({ where: { issueDate: { gte: start, lte: end } } });
    expect(dbRevenue).toBe(calculateRevenue(rawInvoices));
    expect(dbRevenue).toBe('350000.00');
  });

  it('Test 2 (Payments): matches formula output for active payments within date range', async () => {
    const dbPayments = await getPaymentsReceived(start, end);
    const rawPayments = await prisma.payment.findMany({ where: { paymentDate: { gte: start, lte: end } } });
    expect(dbPayments).toBe(calculatePaymentsReceived(rawPayments));
    expect(dbPayments).toBe('50000.00');
  });

  it('Test 3 (Outstanding): matches formula output for receivables as of date', async () => {
    const dbOutstanding = await getOutstanding(end);
    const rawInvoices = await prisma.invoice.findMany();
    const activePayments = await prisma.payment.findMany({ where: { status: 'ACTIVE' } });
    const paidMap: Record<string, string> = {};
    for (const p of activePayments) {
      paidMap[p.invoiceId.toString()] = (Number(paidMap[p.invoiceId.toString()] || 0) + Number(p.amount)).toFixed(2);
    }
    expect(dbOutstanding).toBe(calculateOutstanding(rawInvoices, paidMap, end));
    expect(dbOutstanding).toBe('333000.00');
  });

  it('Test 4 (Exclusions): ensures DRAFT, CANCELLED and VOIDED records are excluded', async () => {
    const rev = await getRevenue(start, end);
    const expAll = await prisma.invoice.aggregate({ _sum: { subtotal: true }, where: { issueDate: { gte: start, lte: end } } });
    expect(Number(rev)).toBeLessThan(Number(expAll._sum.subtotal));

    const payments = await getPaymentsReceived(start, end);
    expect(payments).toBe('50000.00');
  });
});
