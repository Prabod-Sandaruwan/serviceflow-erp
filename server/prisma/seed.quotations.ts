import { PrismaClient } from '../src/generated/prisma';

export async function seedQuotations(
  prisma: PrismaClient,
  clients: any[],
  users: { admin: any; manager1: any; manager2: any; staff1: any; staff2: any },
  today: Date,
) {
  const v30 = new Date(today.getTime() + 30 * 86400000);
  const past30 = new Date(today.getTime() - 40 * 86400000);
  const past10 = new Date(today.getTime() - 10 * 86400000);

  const qs = [
    { num: 'QT-2026-0001', cid: clients[0].id, title: 'Website Redesign', status: 'DRAFT' as const, sub: 600000, taxA: 0, tot: 600000, uid: users.staff1.id, vUntil: v30, qDate: today, items: [{ desc: 'UI/UX & Frontend', qty: 1, price: 600000, amt: 600000 }] },
    { num: 'QT-2026-0002', cid: clients[1].id, title: 'IT Maintenance', status: 'PENDING_APPROVAL' as const, sub: 420000, taxA: 0, tot: 420000, uid: users.staff1.id, subAt: today, vUntil: v30, qDate: today, items: [{ desc: 'Server Support', qty: 12, price: 35000, amt: 420000 }] },
    { num: 'QT-2026-0003', cid: clients[2].id, title: 'Cloud Setup', status: 'APPROVED' as const, sub: 500000, taxA: 0, tot: 500000, uid: users.staff2.id, appBy: users.manager1.id, decAt: today, vUntil: v30, qDate: today, items: [{ desc: 'AWS Infrastructure', qty: 1, price: 500000, amt: 500000 }] },
    { num: 'QT-2026-0004', cid: clients[0].id, title: 'ERP Phase 1', status: 'SENT' as const, sub: 1000000, taxA: 180000, tot: 1180000, uid: users.staff1.id, appBy: users.manager2.id, decAt: today, sentAt: today, taxT: 'VAT', taxR: 18, vUntil: v30, qDate: today, items: [{ desc: 'ERP Implementation', qty: 1, price: 1000000, amt: 1000000 }] },
    { num: 'QT-2026-0005', cid: clients[2].id, title: 'Mobile App', status: 'REJECTED' as const, sub: 350000, taxA: 0, tot: 350000, uid: users.staff1.id, appBy: users.manager1.id, decAt: today, rej: 'Exceeds budget cap.', vUntil: v30, qDate: today, items: [{ desc: 'Flutter App', qty: 1, price: 350000, amt: 350000 }] },
    { num: 'QT-2026-0006', cid: clients[1].id, title: 'Payment Gateway', status: 'ACCEPTED' as const, sub: 250000, taxA: 0, tot: 250000, uid: users.staff1.id, appBy: users.manager1.id, decAt: today, sentAt: today, resAt: today, resNote: 'Client accepted formal quote via PO.', vUntil: v30, qDate: today, items: [{ desc: 'Gateway Integration', qty: 1, price: 250000, amt: 250000 }] },
    { num: 'QT-2026-0007', cid: clients[0].id, title: 'Security Audit', status: 'DECLINED' as const, sub: 180000, taxA: 0, tot: 180000, uid: users.staff2.id, appBy: users.manager2.id, decAt: today, sentAt: today, resAt: today, resNote: 'Postponed to next fiscal year.', vUntil: v30, qDate: today, items: [{ desc: 'Penetration Testing', qty: 1, price: 180000, amt: 180000 }] },
    { num: 'QT-2026-0008', cid: clients[1].id, title: 'Legacy Migration (Expired)', status: 'SENT' as const, sub: 450000, taxA: 0, tot: 450000, uid: users.staff1.id, appBy: users.manager1.id, decAt: past30, sentAt: past30, vUntil: past10, qDate: past30, items: [{ desc: 'Data Pipeline Migration', qty: 1, price: 450000, amt: 450000 }] },
  ];

  for (const q of qs) {
    const existing = await prisma.quotation.findUnique({ where: { quotationNumber: q.num } });
    if (!existing) {
      await prisma.quotation.create({
        data: {
          quotationNumber: q.num, clientId: q.cid, title: q.title, status: q.status,
          quotationDate: q.qDate, validUntil: q.vUntil, subtotal: q.sub, taxType: q.taxT ?? 'NONE',
          taxRate: q.taxR ?? 0, taxAmount: q.taxA, total: q.tot, createdBy: q.uid,
          submittedAt: q.subAt ?? (q.status !== 'DRAFT' ? q.qDate : null),
          approvedBy: q.appBy ?? null, decidedAt: q.decAt ?? null,
          sentAt: q.sentAt ?? null, rejectionReason: q.rej ?? null,
          respondedAt: q.resAt ?? null, responseNote: q.resNote ?? null,
          items: {
            create: q.items.map((it, idx) => ({
              lineNo: idx + 1, description: it.desc, quantity: it.qty, unitPrice: it.price, lineAmount: it.amt,
            })),
          },
        },
      });
    }
  }
}
