import prisma from '../../config/prisma';
import { ApiError } from '../../shared/errors';
import { CreateTaskInput } from './tasks.schemas';
import { formatTask } from './tasks.formatter';

type Actor = { userId?: bigint | string; role?: string; employeeId?: bigint | string | null };

export async function createTask(
  projectId: string,
  data: CreateTaskInput,
  actor?: Actor
) {
  let rawProjectId: bigint;
  try {
    rawProjectId = BigInt(projectId);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found');
  }

  const project = await prisma.project.findUnique({ where: { id: rawProjectId } });
  if (!project) throw new ApiError(404, 'NOT_FOUND', 'Project not found');
  if (project.status === 'CANCELLED') {
    throw new ApiError(409, 'PROJECT_CANCELLED', 'Cannot create tasks on a cancelled project');
  }

  let rawAssigneeId: bigint | null = null;
  if (data.assigneeId != null) {
    try {
      rawAssigneeId = BigInt(data.assigneeId);
    } catch {
      throw new ApiError(422, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
    }
    const emp = await prisma.employee.findUnique({ where: { id: rawAssigneeId } });
    if (!emp) throw new ApiError(422, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
    if (!emp.is_active) throw new ApiError(422, 'EMPLOYEE_INACTIVE', 'Cannot assign task to an inactive employee');
  }

  let rawMilestoneId: bigint | null = null;
  if (data.milestoneId != null) {
    try {
      rawMilestoneId = BigInt(data.milestoneId);
    } catch {
      throw new ApiError(422, 'FOREIGN_MILESTONE', 'Milestone not found');
    }
    const ms = await prisma.milestone.findUnique({ where: { id: rawMilestoneId } });
    if (!ms || ms.projectId !== rawProjectId) {
      throw new ApiError(422, 'FOREIGN_MILESTONE', 'Milestone belongs to a different project');
    }
  }

  const createdBy = actor?.userId ? BigInt(actor.userId) : 1n;

  const task = await prisma.task.create({
    data: {
      projectId: rawProjectId,
      milestoneId: rawMilestoneId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? 'MEDIUM',
      status: 'TODO',
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assigneeId: rawAssigneeId,
      createdBy,
    },
    include: {
      assignee: true,
      milestone: true,
    },
  });

  return formatTask(task);
}
