import prisma from '../../config/prisma';

export async function findTaskById(id: bigint) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      project: true,
      assignee: true,
      milestone: true,
    },
  });
}

export const TasksRepository = { findTaskById };
export default TasksRepository;
