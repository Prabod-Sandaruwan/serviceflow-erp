import prisma from '../../config/prisma';

export async function hasNonCancelledInvoices(milestoneId: bigint): Promise<boolean> {
  const count = await prisma.invoice.count({
    where: {
      milestoneId,
      status: { not: 'CANCELLED' },
    },
  });
  return count > 0;
}

export async function findMilestoneById(id: bigint) {
  return prisma.milestone.findUnique({
    where: { id },
    include: { project: true, tasks: true },
  });
}

export const MilestonesRepository = { hasNonCancelledInvoices, findMilestoneById };
export default MilestonesRepository;
