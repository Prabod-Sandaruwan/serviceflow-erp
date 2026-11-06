export function buildInvoiceSeedList(
  project: any,
  m: any[],
  users: { manager1: any },
  today: Date,
) {
  const dAgo = (days: number) => new Date(today.getTime() - days * 86400000);
  const dAhead = (days: number) => new Date(today.getTime() + days * 86400000);

  return [
    {
      num: 'INV-2026-0001', pid: project.id, mid: m[0].id, key: m[0].id, status: 'DRAFT' as const,
      sub: '100000.00', taxT: 'NONE', taxA: '0.00', tot: '100000.00', due: dAhead(15), issue: null,
      issuedBy: null, issuedAt: null, canBy: null, canAt: null, reason: null, payments: [],
      items: [{ description: m[0].name, amount: '100000.00', qty: 1, rate: '100000.00' }],
    },
    {
      num: 'INV-2026-0002', pid: project.id, mid: m[1].id, key: m[1].id, status: 'ISSUED' as const,
      sub: '100000.00', taxT: 'VAT', taxR: 18, taxA: '18000.00', tot: '118000.00', due: dAgo(10), issue: dAgo(30),
      issuedBy: users.manager1.id, issuedAt: dAgo(30), canBy: null, canAt: null, reason: null, payments: [],
      items: [{ description: m[1].name, amount: '100000.00', qty: 1, rate: '100000.00' }],
    },
    {
      num: 'INV-2026-0003', pid: project.id, mid: m[0].id, key: null, status: 'CANCELLED' as const,
      sub: '50000.00', taxT: 'NONE', taxA: '0.00', tot: '50000.00', due: dAgo(10), issue: dAgo(30),
      issuedBy: users.manager1.id, issuedAt: dAgo(30), canBy: users.manager1.id, canAt: dAgo(10),
      reason: 'Milestone scope revised after architectural review.', payments: [],
      items: [{ description: 'Initial Architecture Scoping (Deprecated)', amount: '50000.00', qty: 1, rate: '50000.00' }],
    },
    {
      num: 'INV-2026-0004', pid: project.id, mid: m[2].id, key: m[2].id, status: 'PARTIALLY_PAID' as const,
      sub: '50000.00', taxT: 'NONE', taxA: '0.00', tot: '50000.00', due: dAhead(10), issue: dAgo(20),
      issuedBy: users.manager1.id, issuedAt: dAgo(20), canBy: null, canAt: null, reason: null,
      items: [{ description: 'Phase 3 - Deployment Deliverables', amount: '50000.00', qty: 1, rate: '50000.00' }],
      payments: [
        { amount: 20000, method: 'BANK_TRANSFER' as const, ref: 'TRX-PARTIAL-881', date: dAgo(15), status: 'ACTIVE' },
        { amount: 5000, method: 'CASH' as const, ref: 'CASH-VOIDED-001', date: dAgo(18), status: 'VOIDED', voidReason: 'Cheque returned unpaid', voidedBy: users.manager1.id, voidedAt: dAgo(17) },
      ],
    },
    {
      num: 'INV-2026-0042', pid: project.id, mid: m[3].id, key: m[3].id, status: 'PAID' as const,
      sub: '18382.50', taxT: 'VAT', taxR: 0.367, taxA: '67.50', tot: '18450.00', due: dAgo(5), issue: dAgo(25),
      issuedBy: users.manager1.id, issuedAt: dAgo(25), canBy: null, canAt: null, reason: null,
      items: [
        { description: 'Cloud Architecture & ERP Migration', amount: '6930.00', qty: 42, rate: '165.00' },
        { description: 'Frontend Dashboard UI Implementation', amount: '7560.00', qty: 56, rate: '135.00' },
        { description: 'API Integration & Webhook Setup', amount: '3360.00', qty: 24, rate: '140.00' },
        { description: 'Maintenance & SLA Support (Q4 Baseline)', amount: '1500.00', qty: 1, rate: '1500.00' },
      ],
      payments: [{ amount: 18450, method: 'CARD' as const, ref: 'STRIPE-PAY-88219', date: dAgo(24), status: 'ACTIVE' }],
    },
  ];
}
