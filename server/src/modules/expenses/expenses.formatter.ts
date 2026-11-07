export function formatExpense(e: any) {
  const amountStr = e.amount != null
    ? (typeof e.amount === 'object' && typeof e.amount.toFixed === 'function'
        ? e.amount.toFixed(2)
        : Number(e.amount).toFixed(2))
    : '0.00';

  const expDate = e.expenseDate instanceof Date
    ? e.expenseDate.toISOString().slice(0, 10)
    : (e.expenseDate ? String(e.expenseDate).slice(0, 10) : null);

  const recBy = (e.recordedBy ?? e.recorded_by)?.toString() ?? null;
  const pId = (e.projectId ?? e.project_id)?.toString() ?? null;

  return {
    id: e.id.toString(),
    projectId: pId,
    project_id: pId,
    category: e.category,
    amount: amountStr,
    expenseDate: expDate,
    expense_date: expDate,
    description: e.description,
    supplier: e.supplier ?? null,
    status: e.status,
    recordedBy: recBy,
    recorded_by: recBy,
    voidedBy: (e.voidedBy ?? e.voided_by)?.toString() ?? null,
    voidedAt: e.voidedAt ?? e.voided_at ?? null,
    void_reason: e.voidReason ?? e.void_reason ?? null,
    createdAt: e.createdAt ?? e.created_at,
    updatedAt: e.updatedAt ?? e.updated_at,
  };
}
