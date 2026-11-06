export function formatPayment(payment: any) {
  const amountStr = payment.amount != null
    ? (typeof payment.amount === 'object' && typeof payment.amount.toFixed === 'function'
        ? payment.amount.toFixed(2)
        : Number(payment.amount).toFixed(2))
    : '0.00';

  const payDate = payment.paymentDate instanceof Date
    ? payment.paymentDate.toISOString().slice(0, 10)
    : (payment.paymentDate ? String(payment.paymentDate).slice(0, 10) : null);

  const recordedByStr = (payment.recordedBy ?? payment.recorded_by)?.toString() ?? null;
  const voidReasonStr = payment.voidReason ?? payment.void_reason ?? null;
  const voidedAtVal = payment.voidedAt ?? payment.voided_at ?? null;

  return {
    id: payment.id.toString(),
    invoiceId: (payment.invoiceId ?? payment.invoice_id).toString(),
    amount: amountStr,
    method: payment.method,
    paymentDate: payDate,
    reference: payment.reference ?? null,
    note: payment.note ?? null,
    status: payment.status,
    idempotencyKey: payment.idempotencyKey ?? payment.idempotency_key ?? null,
    recordedBy: recordedByStr,
    recorded_by: recordedByStr,
    voidedBy: (payment.voidedBy ?? payment.voided_by)?.toString() ?? null,
    voidedAt: voidedAtVal,
    voided_at: voidedAtVal,
    voidReason: voidReasonStr,
    void_reason: voidReasonStr,
    createdAt: payment.createdAt ?? payment.created_at,
  };
}
