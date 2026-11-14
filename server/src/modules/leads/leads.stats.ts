import prisma from '../../lib/prisma';

export async function getLeadStats(user?: any) {
  const isStaff = user?.role === 'STAFF';
  const where: any = {};
  if (isStaff) {
    const callerId = BigInt(user.userId ?? user.id);
    where.ownerId = callerId;
  }
  const leads = await prisma.lead.findMany({
    where,
    select: { status: true, expected_value: true },
  });

  let totalValue = 0;
  let convertedValue = 0;
  let activeValue = 0;
  let lostValue = 0;
  let convertedCount = 0;
  let activeCount = 0;
  let lostCount = 0;

  for (const l of leads) {
    const v = l.expected_value ? Number(l.expected_value) : 0;
    totalValue += v;
    if (l.status === 'CONVERTED' || l.status === 'WON') {
      convertedValue += v;
      convertedCount++;
    } else if (l.status === 'LOST') {
      lostValue += v;
      lostCount++;
    } else {
      activeValue += v;
      activeCount++;
    }
  }

  return {
    totalValue,
    totalCount: leads.length,
    convertedValue,
    convertedCount,
    activeValue,
    activeCount,
    lostValue,
    lostCount,
  };
}

export default getLeadStats;

