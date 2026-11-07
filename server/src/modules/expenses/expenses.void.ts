import prisma from '../../config/prisma';
import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';
import { VoidExpenseInput } from './expenses.schemas';
import { formatExpense } from './expenses.formatter';

export async function voidExpense(id: string, data: VoidExpenseInput, actor: any, ctx?: any) {
  const existing = await prisma.expense.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Expense not found');
  if (existing.status === 'VOIDED') {
    throw new ApiError(409, 'ALREADY_VOIDED', 'Expense is already voided');
  }

  return runInTransaction(async (tx) => {
    const updated = await tx.expense.update({
      where: { id: existing.id },
      data: {
        status: 'VOIDED',
        voidReason: data.reason,
        voidedBy: BigInt(actor?.userId || actor?.id),
        voidedAt: new Date(),
      },
    });

    const beforeFormatted = formatExpense(existing);
    const afterFormatted = formatExpense(updated);

    await AuditService.record(tx, {
      actor,
      action: AUDIT_ACTIONS.EXPENSE_VOIDED,
      entityType: 'EXPENSE',
      entityId: updated.id,
      before: beforeFormatted,
      after: { ...afterFormatted, reason: data.reason },
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });

    return afterFormatted;
  });
}
