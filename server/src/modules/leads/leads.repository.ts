import prisma, { Prisma } from '../../lib/prisma';

export interface FindManyLeadParams {
  skip?: number;
  take?: number;
  status?: any;
  ownerId?: bigint;
  orderBy?: Prisma.LeadOrderByWithRelationInput;
}

export async function findMany(params: FindManyLeadParams) {
  const where: Prisma.LeadWhereInput = {};
  if (params.status) where.status = params.status;
  if (params.ownerId) where.ownerId = params.ownerId;

  return Promise.all([
    prisma.lead.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      include: { owner: { include: { employee: true } } },
    }),
    prisma.lead.count({ where }),
  ]);
}

export async function findById(id: bigint) {
  return prisma.lead.findUnique({
    where: { id },
    include: { owner: { include: { employee: true } } },
  });
}

export async function create(data: { ownerId: bigint; expectedValue?: number | null }) {
  return prisma.lead.create({
    data: {
      ownerId: data.ownerId,
      status: 'NEW',
      expected_value:
        data.expectedValue !== undefined && data.expectedValue !== null
          ? new Prisma.Decimal(data.expectedValue)
          : null,
    },
    include: { owner: { include: { employee: true } } },
  });
}

export async function update(
  id: bigint,
  data: {
    status?: any;
    lostReason?: string | null;
    expectedValue?: number | null;
    ownerId?: bigint;
  }
) {
  const updateData: Prisma.LeadUpdateInput = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.lostReason !== undefined) updateData.lost_reason = data.lostReason;
  if (data.expectedValue !== undefined) {
    updateData.expected_value =
      data.expectedValue !== null ? new Prisma.Decimal(data.expectedValue) : null;
  }
  if (data.ownerId !== undefined) {
    updateData.owner = { connect: { id: data.ownerId } };
  }

  return prisma.lead.update({
    where: { id },
    data: updateData,
    include: { owner: { include: { employee: true } } },
  });
}

export const LeadRepository = { findMany, findById, create, update };
export default LeadRepository;
