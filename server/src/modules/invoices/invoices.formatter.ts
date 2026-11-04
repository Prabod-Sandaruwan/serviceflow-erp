const toMoney = (v: any) => {
  if (v == null) return '0.00';
  if (typeof v === 'object' && typeof v.toFixed === 'function') return v.toFixed(2);
  const n = Number(v);
  return isNaN(n) ? '0.00' : n.toFixed(2);
};

export const formatInvoiceItem = (item: any) => ({
  id: item.id.toString(),
  invoiceId: item.invoiceId?.toString() ?? item.invoice_id?.toString(),
  lineNo: item.lineNo ?? item.line_no,
  description: item.description,
  quantity: item.quantity != null ? item.quantity.toString() : '1',
  unitPrice: toMoney(item.unitPrice ?? item.unit_price),
  lineAmount: toMoney(item.lineAmount ?? item.line_amount),
});

export const formatInvoice = (inv: any) => ({
  id: inv.id.toString(),
  invoiceNumber: inv.invoiceNumber ?? inv.invoice_number,
  projectId: inv.projectId?.toString() ?? inv.project_id?.toString(),
  milestoneId: inv.milestoneId?.toString() ?? inv.milestone_id?.toString(),
  status: inv.status,
  issueDate: inv.issueDate ? (inv.issueDate instanceof Date ? inv.issueDate.toISOString().slice(0, 10) : String(inv.issueDate).slice(0, 10)) : null,
  dueDate: inv.dueDate ? (inv.dueDate instanceof Date ? inv.dueDate.toISOString().slice(0, 10) : String(inv.dueDate).slice(0, 10)) : null,
  subtotal: toMoney(inv.subtotal),
  taxType: inv.taxType ?? inv.tax_type ?? null,
  taxRate: inv.taxRate != null ? toMoney(inv.taxRate) : null,
  taxAmount: toMoney(inv.taxAmount ?? inv.tax_amount),
  taxReference: inv.taxReference ?? inv.tax_reference ?? null,
  total: toMoney(inv.total),
  notes: inv.notes ?? null,
  createdBy: inv.createdBy?.toString() ?? inv.created_by?.toString(),
  issuedBy: inv.issuedBy?.toString() ?? inv.issued_by?.toString() ?? null,
  issuedAt: inv.issuedAt ?? inv.issued_at ?? null,
  cancelledBy: inv.cancelledBy?.toString() ?? inv.cancelled_by?.toString() ?? null,
  cancelledAt: inv.cancelledAt ?? inv.cancelled_at ?? null,
  cancelReason: inv.cancelReason ?? inv.cancel_reason ?? null,
  createdAt: inv.createdAt ?? inv.created_at,
  updatedAt: inv.updatedAt ?? inv.updated_at,
  items: Array.isArray(inv.items) ? inv.items.map(formatInvoiceItem) : undefined,
});

export default formatInvoice;
