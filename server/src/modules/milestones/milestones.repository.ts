import prisma from '../../config/prisma';

export async function hasNonCancelledInvoices(_milestoneId: bigint): Promise<boolean> {
  // Stub for PROJ-008 invoice eligibility / PROJ-006
  return false;
}

export async function findMilestoneById(id: bigint) {
  return prisma.milestone.findUnique({
    where: { id },
    include: { project: true, tasks: true },
  });
}

export const MilestonesRepository = { hasNonCancelledInvoices, findMilestoneById };
export default MilestonesRepository;
