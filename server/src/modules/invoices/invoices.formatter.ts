import { isOverdueInvoice } from '../../shared/dates';

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

export const formatInvoice = (inv: any) => {
  const paid = '0.00';
  const totalStr = toMoney(inv.total);
  const balance = (Number(totalStr) - Number(paid)).toFixed(2);
  const dueDateStr = inv.dueDate ? (inv.dueDate instanceof Date ? inv.dueDate.toISOString().slice(0, 10) : String(inv.dueDate).slice(0, 10)) : null;
  const isOverdue = dueDateStr ? isOverdueInvoice({ status: inv.status, dueDate: dueDateStr, balance }) : false;

  return {
    id: inv.id.toString(),
    invoiceNumber: inv.invoiceNumber ?? inv.invoice_number,
    projectId: inv.projectId?.toString() ?? inv.project_id?.toString(),
    milestoneId: inv.milestoneId?.toString() ?? inv.milestone_id?.toString(),
    status: inv.status,
    issueDate: inv.issueDate ? (inv.issueDate instanceof Date ? inv.issueDate.toISOString().slice(0, 10) : String(inv.issueDate).slice(0, 10)) : null,
    dueDate: dueDateStr,
    subtotal: toMoney(inv.subtotal),
    taxType: inv.taxType ?? inv.tax_type ?? null,
    taxRate: inv.taxRate != null ? toMoney(inv.taxRate) : null,
    taxAmount: toMoney(inv.taxAmount ?? inv.tax_amount),
    taxReference: inv.taxReference ?? inv.tax_reference ?? null,
    total: totalStr,
    paid,
    balance,
    isOverdue,
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
    project: inv.project ? {
      id: inv.project.id?.toString(),
      name: inv.project.name,
      projectCode: inv.project.projectCode ?? inv.project.project_code,
      clientId: inv.project.clientId?.toString() ?? inv.project.client_id?.toString(),
      client: inv.project.client ? {
        id: inv.project.client.id?.toString(),
        displayName: inv.project.client.displayName ?? inv.project.client.display_name,
      } : undefined,
    } : undefined,
  };
};

export default formatInvoice;
