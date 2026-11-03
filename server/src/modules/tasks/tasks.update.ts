import prisma from '../../config/prisma';
import { ApiError } from '../../shared/errors';
import { assertTransition, taskMachine } from '../../shared/state';
import { UpdateTaskInput } from './tasks.schemas';
import { formatTask } from './tasks.formatter';
import { findTaskById } from './tasks.repository';

type Actor = { userId?: bigint | string; role?: string; employeeId?: bigint | string | null };

export async function updateTask(
  id: string,
  data: UpdateTaskInput,
  actor?: Actor
) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Task not found');
  }

  const task = await findTaskById(rawId);
  if (!task) throw new ApiError(404, 'NOT_FOUND', 'Task not found');
  if (task.project.status === 'CANCELLED') {
    throw new ApiError(409, 'PROJECT_CANCELLED', 'Cannot edit tasks on a cancelled project');
  }

  if (data.status && data.status !== task.status) {
    assertTransition(taskMachine, task.status as any, data.status as any, actor?.role as any);
  }

  let rawAssigneeId: bigint | null | undefined = undefined;
  if (data.assigneeId !== undefined) {
    if (data.assigneeId === null) {
      rawAssigneeId = null;
    } else {
      try {
        rawAssigneeId = BigInt(data.assigneeId);
      } catch {
        throw new ApiError(422, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
      }
      const emp = await prisma.employee.findUnique({ where: { id: rawAssigneeId } });
      if (!emp) throw new ApiError(422, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
      if (!emp.is_active) throw new ApiError(422, 'EMPLOYEE_INACTIVE', 'Cannot assign task to an inactive employee');
    }
  }

  let rawMilestoneId: bigint | null | undefined = undefined;
  if (data.milestoneId !== undefined) {
    if (data.milestoneId === null) {
      rawMilestoneId = null;
    } else {
      try {
        rawMilestoneId = BigInt(data.milestoneId);
      } catch {
        throw new ApiError(422, 'FOREIGN_MILESTONE', 'Milestone not found');
      }
      const ms = await prisma.milestone.findUnique({ where: { id: rawMilestoneId } });
      if (!ms || ms.projectId !== task.projectId) {
        throw new ApiError(422, 'FOREIGN_MILESTONE', 'Milestone belongs to a different project');
      }
    }
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (rawAssigneeId !== undefined) updateData.assigneeId = rawAssigneeId;
  if (rawMilestoneId !== undefined) updateData.milestoneId = rawMilestoneId;

  const updated = await prisma.task.update({
    where: { id: rawId },
    data: updateData,
    include: {
      assignee: true,
      milestone: true,
    },
  });

  return formatTask(updated);
}
