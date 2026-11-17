import prisma from '../../config/prisma';

export async function getMonthlyTrajectories(endDate?: Date) {
  const ref = endDate instanceof Date && !isNaN(endDate.getTime()) ? endDate : new Date();
  const months: Array<{ m: string; inv: number; col: number; exp: number; isCurrent: boolean }> =
    [];
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  for (let i = 4; i >= 0; i--) {
    const start = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - i, 1, 0, 0, 0, 0));
    const end = new Date(
      Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - i + 1, 0, 23, 59, 59, 999)
    );

    const [invRows, payRows, expRows] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          issueDate: { gte: start, lte: end },
          status: { in: ['ISSUED', 'PARTIALLY_PAID', 'PAID'] },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paymentDate: { gte: start, lte: end }, status: 'ACTIVE' },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { expenseDate: { gte: start, lte: end }, status: 'ACTIVE' },
      }),
    ]);

    const inv = Number(invRows._sum.total || 0);
    const col = Number(payRows._sum.amount || 0);
    const exp = Number(expRows._sum.amount || 0);

    months.push({
      m: monthNames[start.getUTCMonth()],
      inv,
      col,
      exp,
      isCurrent: i === 0,
    });
  }

  const maxVal = Math.max(1, ...months.flatMap((m) => [m.inv, m.col, m.exp]));
  return months.map((m) => ({
    ...m,
    invPct: Math.round((m.inv / maxVal) * 100),
    colPct: Math.round((m.col / maxVal) * 100),
    expPct: Math.round((m.exp / maxVal) * 100),
  }));
}

export async function getFeaturedProject() {
  const p = await prisma.project.findFirst({
    where: { status: 'ACTIVE' },
    include: { client: true, milestones: true, creator: true },
    orderBy: { updatedAt: 'desc' },
  });
  if (!p) return null;
  const validMs = p.milestones.filter((m) => m.status !== 'CANCELLED');
  const compMs = validMs.filter((m) => m.status === 'COMPLETED' || m.status === 'APPROVED');
  return {
    id: p.id.toString(),
    projectCode: p.projectCode,
    name: p.name,
    clientName: p.client?.display_name || 'Client',
    totalMilestones: validMs.length,
    completedMilestones: compMs.length,
    progressPercent: validMs.length ? Math.round((compMs.length / validMs.length) * 100) : 0,
    targetDate: p.endDate ? p.endDate.toISOString().split('T')[0] : null,
    managerEmail: p.creator?.email || null,
  };
}
