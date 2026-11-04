import prisma from '../../config/prisma';
import { ApiError } from '../../shared/errors';
import { formatMilestone } from './milestones.formatter';
import { findMilestoneById } from './milestones.repository';

export async function isInvoiceEligible(tx: any, milestoneId: bigint | string): Promise<boolean> {
  let rawId: bigint;
  try {
    rawId = typeof milestoneId === 'bigint' ? milestoneId : BigInt(milestoneId);
  } catch {
    return false;
  }

  const client = tx || prisma;
  const milestone = await client.milestone.findUnique({
    where: { id: rawId },
    select: { status: true },
  });

  if (!milestone || milestone.status !== 'APPROVED') {
    return false;
  }

  const count = await client.invoice.count({
    where: {
      milestoneId: rawId,
      status: { not: 'CANCELLED' },
    },
  });

  return count === 0;
}

export async function getMilestones(projectId: string) {
  let rawProjectId: bigint;
  try {
    rawProjectId = BigInt(projectId);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found');
  }

  const milestones = await prisma.milestone.findMany({
    where: { projectId: rawProjectId },
    orderBy: { sortOrder: 'asc' },
  });

  return Promise.all(
    milestones.map(async (m) => {
      const eligible = await isInvoiceEligible(prisma, m.id);
      return {
        ...formatMilestone(m),
        eligibleForInvoice: eligible,
      };
    })
  );
}

export async function getMilestoneById(id: string) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Milestone not found');
  }

  const milestone = await findMilestoneById(rawId);
  if (!milestone) {
    throw new ApiError(404, 'NOT_FOUND', 'Milestone not found');
  }

  const eligible = await isInvoiceEligible(prisma, milestone.id);
  return {
    ...formatMilestone(milestone),
    eligibleForInvoice: eligible,
  };
}
