import { PrismaClient } from '../src/generated/prisma';
import { buildInvoiceSeedList } from './seed.invoices.data';

export async function seedInvoices(
  prisma: PrismaClient,
  users: { admin: any; manager1: any; manager2: any; staff1: any; staff2: any },
  today: Date,
) {
  const project = await prisma.project.findFirst({
    where: { projectCode: 'PRJ-2026-0001' },
    include: { milestones: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!project) return;

  let m3 = project.milestones.find((m) => m.sortOrder === 3);
  if (m3 && m3.status !== 'APPROVED') {
    m3 = await prisma.milestone.update({ where: { id: m3.id }, data: { status: 'APPROVED', approvedBy: users.manager1.id, approvedAt: today } });
  }

  let m4 = project.milestones.find((m) => m.sortOrder === 4);
  if (!m4) {
    m4 = await prisma.milestone.create({
      data: {
        projectId: project.id, name: 'Phase 4 - Maintenance & SLA Support', sortOrder: 4,
        status: 'APPROVED', billingAmount: 18450, dueDate: today,
        approvedBy: users.manager1.id, approvedAt: today,
      },
    });
  }

  const milestones = [project.milestones[0], project.milestones[1], m3, m4];
  const invoices = buildInvoiceSeedList(project, milestones, users, today);

  for (const inv of invoices) {
    let invRecord = await prisma.invoice.findUnique({ where: { invoiceNumber: inv.num } });
    if (!invRecord) {
      invRecord = await prisma.invoice.create({
        data: {
          invoiceNumber: inv.num, projectId: inv.pid, milestoneId: inv.mid,
          activeMilestoneKey: inv.key, status: inv.status, subtotal: inv.sub,
          taxType: inv.taxT, taxRate: (inv as any).taxR ?? null, taxAmount: inv.taxA,
          total: inv.tot, dueDate: inv.due, issueDate: inv.issue, createdBy: users.manager1.id,
          issuedBy: inv.issuedBy, issuedAt: inv.issuedAt, cancelledBy: inv.canBy,
          cancelledAt: inv.canAt, cancelReason: inv.reason,
          items: {
            create: inv.items.map((it, idx) => ({
              lineNo: idx + 1, description: it.description, quantity: it.qty,
              unitPrice: it.rate, lineAmount: it.amount,
            })),
          },
        },
      });
    } else if (invRecord.status !== inv.status) {
      invRecord = await prisma.invoice.update({ where: { id: invRecord.id }, data: { status: inv.status } });
    }

    for (const p of inv.payments) {
      const existingPay = await prisma.payment.findFirst({
        where: { OR: [{ invoiceId: invRecord.id, reference: p.ref }, { idempotencyKey: p.idempotencyKey }] },
      });
      if (!existingPay) {
        await prisma.payment.create({
          data: {
            invoiceId: invRecord.id, amount: p.amount, method: p.method,
            paymentDate: p.date, reference: p.ref, status: (p as any).status || 'ACTIVE',
            voidReason: (p as any).voidReason || null, voidedBy: (p as any).voidedBy || null,
            voidedAt: (p as any).voidedAt || null, idempotencyKey: p.idempotencyKey, recordedBy: users.manager1.id,
          },
        });
      }
    }
  }
}
