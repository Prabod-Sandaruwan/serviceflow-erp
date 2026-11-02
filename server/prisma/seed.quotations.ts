import { PrismaClient } from '../src/generated/prisma';

export async function seedQuotations(
  prisma: PrismaClient,
  clients: any[],
  users: { admin: any; manager1: any; manager2: any; staff1: any; staff2: any },
  today: Date,
) {
  if (await prisma.quotation.findFirst()) return;
  const v30 = new Date(today.getTime() + 30 * 86400000);

  const qs = [
    {
      num: 'QT-2026-0001', cid: clients[0].id, title: 'Website Redesign & E-Commerce', status: 'DRAFT' as const,
      sub: 675000, taxA: 0, tot: 675000, uid: users.staff1.id,
      items: [
        { desc: 'UI/UX Design & Prototyping', qty: 1, price: 150000, amt: 150000 },
        { desc: 'Frontend & Backend Development', qty: 1, price: 450000, amt: 450000 },
        { desc: 'Payment Gateway Integration', qty: 1, price: 75000, amt: 75000 },
      ],
    },
    {
      num: 'QT-2026-0002', cid: clients[1].id, title: 'Annual IT Maintenance', status: 'PENDING_APPROVAL' as const,
      sub: 495000, taxA: 0, tot: 495000, uid: users.staff1.id, subAt: today,
      items: [
        { desc: 'Server Maintenance (12 Mos)', qty: 12, price: 35000, amt: 420000 },
        { desc: 'Emergency Incident Support', qty: 5, price: 15000, amt: 75000 },
      ],
    },
    {
      num: 'QT-2026-0003', cid: clients[2].id, title: 'Cloud Migration & Hardening', status: 'APPROVED' as const,
      sub: 500000, taxA: 0, tot: 500000, uid: users.staff2.id, appBy: users.manager1.id, decAt: today,
      items: [
        { desc: 'AWS Infrastructure Setup', qty: 1, price: 300000, amt: 300000 },
        { desc: 'Data Migration & Pen-Testing', qty: 1, price: 200000, amt: 200000 },
      ],
    },
    {
      num: 'QT-2026-0004', cid: clients[0].id, title: 'Custom ERP - Phase 1', status: 'SENT' as const,
      sub: 1750000, taxA: 315000, tot: 2065000, uid: users.staff1.id, appBy: users.manager2.id, decAt: today, sentAt: today,
      taxT: 'VAT', taxR: 18,
      items: [
        { desc: 'Core ERP Modules Setup', qty: 1, price: 1500000, amt: 1500000 },
        { desc: 'Staff Training & Manuals', qty: 2, price: 125000, amt: 250000 },
      ],
    },
    {
      num: 'QT-2026-0005', cid: clients[2].id, title: 'Warehouse Mobile App', status: 'REJECTED' as const,
      sub: 350000, taxA: 0, tot: 350000, uid: users.staff1.id, appBy: users.manager1.id, decAt: today,
      rej: 'Exceeds budget cap specified by client in initial discovery.',
      items: [{ desc: 'Flutter Mobile App Development', qty: 1, price: 350000, amt: 350000 }],
    },
  ];

  for (const q of qs) {
    await prisma.quotation.create({
      data: {
        quotationNumber: q.num, clientId: q.cid, title: q.title, status: q.status,
        quotationDate: today, validUntil: v30, subtotal: q.sub, taxType: q.taxT ?? 'NONE',
        taxRate: q.taxR ?? 0, taxAmount: q.taxA, total: q.tot, createdBy: q.uid,
        submittedAt: q.subAt ?? null, approvedBy: q.appBy ?? null, decidedAt: q.decAt ?? null,
        sentAt: q.sentAt ?? null, rejectionReason: q.rej ?? null,
        items: {
          create: q.items.map((it, idx) => ({
            lineNo: idx + 1, description: it.desc, quantity: it.qty, unitPrice: it.price, lineAmount: it.amt,
          })),
        },
      },
    });
  }
}

