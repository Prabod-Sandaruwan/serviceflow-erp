import prisma from '../../config/prisma';

export async function getStaffSummary(actor: any) {
  const whereTasks = {
    OR: [
      ...(actor.employeeId ? [{ assigneeId: BigInt(actor.employeeId) }] : []),
      ...(actor.userId
        ? [{ assigneeId: BigInt(actor.userId) }, { createdBy: BigInt(actor.userId) }]
        : []),
    ],
  };
  const [todo, inProgress, done, leadsCount, quotationsCount] = await Promise.all([
    prisma.task.count({ where: { ...whereTasks, status: 'TODO' } }),
    prisma.task.count({ where: { ...whereTasks, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { ...whereTasks, status: 'DONE' } }),
    prisma.lead.count({ where: { ownerId: BigInt(actor.userId) } }),
    prisma.quotation.count({ where: { createdBy: BigInt(actor.userId) } }),
  ]);

  return {
    role: 'STAFF',
    tasks: { total: todo + inProgress + done, todo, inProgress, done },
    leadsCount,
    quotationsCount,
  };
}
