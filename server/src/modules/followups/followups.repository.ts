import prisma, { Prisma } from '../../lib/prisma';
import { getColomboToday } from '../../lib/date';

export interface FindManyFollowUpParams {
  skip?: number;
  take?: number;
  leadId?: bigint | bigint[];
  status?: 'PENDING' | 'DONE';
  overdue?: boolean;
}

export async function findMany(params: FindManyFollowUpParams) {
  const where: Prisma.FollowUpWhereInput = {};

  if (params.leadId !== undefined) {
    where.leadId = Array.isArray(params.leadId) ? { in: params.leadId } : params.leadId;
  }

  if (params.overdue) {
    where.status = 'SCHEDULED';
    where.follow_up_date = { lt: getColomboToday() };
  } else if (params.status) {
    where.status = params.status === 'DONE' ? 'COMPLETED' : 'SCHEDULED';
  }

  return Promise.all([
    prisma.followUp.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: { follow_up_date: 'asc' },
      include: { lead: true },
    }),
    prisma.followUp.count({ where }),
  ]);
}

export async function findById(id: bigint) {
  return prisma.followUp.findUnique({
    where: { id },
    include: { lead: true },
  });
}

export async function create(data: {
  leadId: bigint;
  scheduledAt: Date;
  status?: string;
  type?: string;
  createdBy: bigint;
}) {
  const dbStatus = data.status === 'DONE' ? 'COMPLETED' : 'SCHEDULED';
  return prisma.followUp.create({
    data: {
      lead: { connect: { id: data.leadId } },
      follow_up_date: data.scheduledAt,
      status: dbStatus as any,
      type: (data.type as any) || 'CALL',
      creator: { connect: { id: data.createdBy } },
    },
    include: { lead: true },
  });
}

export async function update(
  id: bigint,
  data: {
    scheduledAt?: Date;
    status?: string;
    type?: string;
  }
) {
  const updateData: Prisma.FollowUpUpdateInput = {};
  if (data.scheduledAt !== undefined) updateData.follow_up_date = data.scheduledAt;
  if (data.status !== undefined) {
    updateData.status = data.status === 'DONE' ? 'COMPLETED' : 'SCHEDULED';
  }
  if (data.type !== undefined) updateData.type = data.type as any;

  return prisma.followUp.update({
    where: { id },
    data: updateData,
    include: { lead: true },
  });
}

export const FollowUpRepository = { findMany, findById, create, update };
export default FollowUpRepository;
