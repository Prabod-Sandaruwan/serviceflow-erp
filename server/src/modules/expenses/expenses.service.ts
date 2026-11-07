import { Prisma } from '../../generated/prisma';
import prisma from '../../config/prisma';
import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';
import { CreateExpenseInput, UpdateExpenseInput } from './expenses.schemas';
import { formatExpense } from './expenses.formatter';

function toDbCategory(cat: string): any {
  if (cat === 'SOFTWARE') return 'SOFTWARE_LICENSE';
  if (cat === 'MATERIALS') return 'EQUIPMENT';
  return cat;
}

export async function createExpense(data: CreateExpenseInput, actor: any, ctx?: any) {
  const project = await prisma.project.findUnique({ where: { id: BigInt(data.projectId) } });
  if (!project) throw new ApiError(404, 'PROJECT_NOT_FOUND', 'Project not found');
  if (project.status === 'CANCELLED') {
    throw new ApiError(409, 'INVALID_PROJECT_STATUS', 'Cannot add expenses to a cancelled project');
  }

  return runInTransaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        projectId: project.id,
        category: toDbCategory(data.category),
        amount: new Prisma.Decimal(data.amount),
        expenseDate: new Date(data.expenseDate),
        description: data.description,
        supplier: data.supplier,
        status: 'ACTIVE',
        recordedBy: BigInt(actor?.userId || actor?.id),
      },
    });

    const formatted = formatExpense(expense);
    await AuditService.record(tx, {
      actor,
      action: AUDIT_ACTIONS.EXPENSE_CREATED,
      entityType: 'EXPENSE',
      entityId: expense.id,
      after: formatted,
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });

    return formatted;
  });
}

export async function updateExpense(id: string, data: UpdateExpenseInput, actor: any, ctx?: any) {
  const existing = await prisma.expense.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Expense not found');
  if (existing.status !== 'ACTIVE') {
    throw new ApiError(409, 'EXPENSE_NOT_ACTIVE', 'Only active expenses can be edited');
  }

  const updateData: any = {};
  if (data.category !== undefined) updateData.category = toDbCategory(data.category);
  if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount);
  if (data.expenseDate !== undefined) updateData.expenseDate = new Date(data.expenseDate);
  if (data.description !== undefined) updateData.description = data.description;
  if (data.supplier !== undefined) updateData.supplier = data.supplier;

  return runInTransaction(async (tx) => {
    const expense = await tx.expense.update({
      where: { id: existing.id },
      data: updateData,
    });

    const beforeFormatted = formatExpense(existing);
    const afterFormatted = formatExpense(expense);

    await AuditService.record(tx, {
      actor,
      action: AUDIT_ACTIONS.EXPENSE_UPDATED,
      entityType: 'EXPENSE',
      entityId: expense.id,
      before: beforeFormatted,
      after: afterFormatted,
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });

    return afterFormatted;
  });
}
