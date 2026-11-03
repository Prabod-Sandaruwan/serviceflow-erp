export const formatProject = (p: any) => ({
  id: p.id.toString(),
  projectCode: p.projectCode ?? p.project_code,
  quotationId: p.quotationId?.toString() ?? p.quotation_id?.toString(),
  clientId: p.clientId?.toString() ?? p.client_id?.toString(),
  name: p.name,
  description: p.description ?? null,
  status: p.status,
  startDate: p.startDate ? (p.startDate instanceof Date ? p.startDate.toISOString().slice(0, 10) : String(p.startDate).slice(0, 10)) : null,
  endDate: p.endDate ? (p.endDate instanceof Date ? p.endDate.toISOString().slice(0, 10) : String(p.endDate).slice(0, 10)) : null,
  budgetAmount: p.budgetAmount != null ? p.budgetAmount.toString() : null,
  cancelReason: p.cancelReason ?? p.cancel_reason ?? null,
  createdBy: p.createdBy?.toString() ?? p.created_by?.toString(),
  createdAt: p.createdAt ?? p.created_at,
  updatedAt: p.updatedAt ?? p.updated_at,
  client: p.client ? { id: p.client.id.toString(), displayName: p.client.display_name } : undefined,
  quotation: p.quotation ? { id: p.quotation.id.toString(), quotationNumber: p.quotation.quotationNumber } : undefined,
  milestones: Array.isArray(p.milestones) ? p.milestones : undefined,
  tasks: Array.isArray(p.tasks) ? p.tasks : undefined,
});

export default formatProject;

