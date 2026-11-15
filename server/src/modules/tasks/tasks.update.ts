import prisma from '../../config/prisma';
import { ApiError } from '../../shared/errors';
import { assertTransition, taskMachine } from '../../shared/state';
import { UpdateTaskInput } from './tasks.schemas';
import { formatTask } from './tasks.formatter';
import { findTaskById } from './tasks.repository';

type Actor = { userId?: bigint | string; role?: string; employeeId?: bigint | string | null };

function assertStaffLimits(task: any, data: UpdateTaskInput, actor?: Actor) {
  if (actor?.role !== 'STAFF') return;
  const { title, description, priority, assigneeId, milestoneId, dueDate } = data;
  if (
    [title, description, priority, assigneeId, milestoneId, dueDate].some((v) => v !== undefined)
  ) {
    throw new ApiError(403, 'FORBIDDEN', 'Staff may only update task status');
  }
  if (
    !task.assigneeId ||
    !actor.employeeId ||
    task.assigneeId.toString() !== actor.employeeId.toString()
  ) {
    throw new ApiError(403, 'FORBIDDEN', 'Cannot update a task not assigned to you');
  }
}

async function resolveRelations(data: UpdateTaskInput, task: any) {
  let assigneeId: bigint | null | undefined;
  if (data.assigneeId !== undefined) {
    if (data.assigneeId === null || data.assigneeId === '') assigneeId = null;
    else {
      let raw: bigint;
      try {
        raw = BigInt(data.assigneeId);
      } catch {
        throw new ApiError(422, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
      }
      const emp = await prisma.employee.findUnique({ where: { id: raw } });
      if (!emp) throw new ApiError(422, 'EMPLOYEE_NOT_FOUND', 'Employee not found');
      if (!emp.is_active)
        throw new ApiError(422, 'EMPLOYEE_INACTIVE', 'Cannot assign task to an inactive employee');
      assigneeId = raw;
    }
  }
  let milestoneId: bigint | null | undefined;
  if (data.milestoneId !== undefined) {
    if (data.milestoneId === null || data.milestoneId === '') milestoneId = null;
    else {
      let raw: bigint;
      try {
        raw = BigInt(data.milestoneId);
      } catch {
        throw new ApiError(422, 'FOREIGN_MILESTONE', 'Milestone not found');
      }
      const ms = await prisma.milestone.findUnique({ where: { id: raw } });
      if (!ms || ms.projectId !== task.projectId) {
        throw new ApiError(422, 'FOREIGN_MILESTONE', 'Milestone belongs to a different project');
      }
      milestoneId = raw;
    }
  }
  return { assigneeId, milestoneId };
}

export async function updateTask(id: string, data: UpdateTaskInput, actor?: Actor) {
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

  assertStaffLimits(task, data, actor);
  if (data.status && data.status !== task.status) {
    assertTransition(taskMachine, task.status as any, data.status as any, actor?.role as any);
  }

  const { assigneeId, milestoneId } = await resolveRelations(data, task);
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
  if (milestoneId !== undefined) updateData.milestoneId = milestoneId;

  const updated = await prisma.task.update({
    where: { id: rawId },
    data: updateData,
    include: { assignee: true, milestone: true },
  });
  return formatTask(updated);
}
