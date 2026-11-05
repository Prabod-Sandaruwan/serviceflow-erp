import { PrismaClient } from '../src/generated/prisma';
import { calculateSubtotal, calculateTotal } from '../src/modules/invoices/totals';

export async function seedInvoices(
  prisma: PrismaClient,
  users: { admin: any; manager1: any; manager2: any; staff1: any; staff2: any },
  today: Date,
) {
  const project = await prisma.project.findFirst({
    where: { projectCode: 'PRJ-2026-0001' },
    include: { milestones: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!project || project.milestones.length < 2) return;

  const [m1, m2] = project.milestones;
  const past30 = new Date(today.getTime() - 30 * 86400000);
  const past10 = new Date(today.getTime() - 10 * 86400000);
  const future15 = new Date(today.getTime() + 15 * 86400000);

  const inv1Items = [{ amount: m1.billingAmount, description: m1.name }];
  const inv1Sub = calculateSubtotal(inv1Items);
  const inv1Tot = calculateTotal(inv1Sub, '0.00');

  const inv2Items = [{ amount: m2.billingAmount, description: m2.name }];
  const inv2Sub = calculateSubtotal(inv2Items);
  const inv2Tax = '18000.00';
  const inv2Tot = calculateTotal(inv2Sub, inv2Tax);

  const inv3Items = [{ amount: '50000.00', description: 'Initial Architecture Scoping (Deprecated)' }];
  const inv3Sub = calculateSubtotal(inv3Items);
  const inv3Tot = calculateTotal(inv3Sub, '0.00');

  const invoices = [
    {
      num: 'INV-2026-0001', pid: project.id, mid: m1.id, key: m1.id, status: 'DRAFT' as const,
      sub: inv1Sub, taxT: 'NONE', taxA: '0.00', tot: inv1Tot, due: future15, issue: null,
      issuedBy: null, issuedAt: null, canBy: null, canAt: null, reason: null, items: inv1Items,
    },
    {
      num: 'INV-2026-0002', pid: project.id, mid: m2.id, key: m2.id, status: 'ISSUED' as const,
      sub: inv2Sub, taxT: 'VAT', taxR: 18, taxA: inv2Tax, tot: inv2Tot, due: past10, issue: past30,
      issuedBy: users.manager1.id, issuedAt: past30, canBy: null, canAt: null, reason: null, items: inv2Items,
    },
    {
      num: 'INV-2026-0003', pid: project.id, mid: m1.id, key: null, status: 'CANCELLED' as const,
      sub: inv3Sub, taxT: 'NONE', taxA: '0.00', tot: inv3Tot, due: past10, issue: past30,
      issuedBy: users.manager1.id, issuedAt: past30, canBy: users.manager1.id, canAt: past10,
      reason: 'Milestone scope revised after architectural review.', items: inv3Items,
    },
  ];

  for (const inv of invoices) {
    const existing = await prisma.invoice.findUnique({ where: { invoiceNumber: inv.num } });
    if (!existing) {
      await prisma.invoice.create({
        data: {
          invoiceNumber: inv.num, projectId: inv.pid, milestoneId: inv.mid,
          activeMilestoneKey: inv.key, status: inv.status, subtotal: inv.sub,
          taxType: inv.taxT, taxRate: (inv as any).taxR ?? null, taxAmount: inv.taxA,
          total: inv.tot, dueDate: inv.due, issueDate: inv.issue, createdBy: users.manager1.id,
          issuedBy: inv.issuedBy, issuedAt: inv.issuedAt, cancelledBy: inv.canBy,
          cancelledAt: inv.canAt, cancelReason: inv.reason,
          items: {
            create: inv.items.map((it, idx) => ({
              lineNo: idx + 1, description: it.description, quantity: 1,
              unitPrice: it.amount, lineAmount: it.amount,
            })),
          },
        },
      });
    }
  }
}
