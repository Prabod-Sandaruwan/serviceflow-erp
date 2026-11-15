import { withCsrf } from '../helpers/agent';
import { createClient, createQuotation } from '../helpers/factories';

export async function setupCorrectionEnv(manager: any) {
  const client = await createClient();
  const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
  const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
  return { client, project: pRes.body.data };
}

export async function createApprovedMilestone(manager: any, projectId: string, title: string, amount: string) {
  const mRes = await withCsrf(manager.post(`/api/v1/projects/${projectId}/milestones`), manager).send({
    title, billingAmount: amount,
  });
  const m = mRes.body.data;
  await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'IN_PROGRESS' });
  await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'COMPLETED' });
  await withCsrf(manager.post(`/api/v1/milestones/${m.id}/approve`), manager).send({});
  return m;
}

export async function createAndIssueInvoice(manager: any, milestoneId: string, issueDate = '2026-11-04') {
  const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId });
  const inv = invRes.body.data;
  const issueRes = await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
    issueDate, dueDate: '2026-11-30',
  });
  return issueRes.body.data;
}

export async function fetchFinanceReport(manager: any) {
  const res = await manager.get('/api/v1/reports/finance?from=2026-11-01&to=2026-11-30');
  return {
    revenue: Number(res.body.data.revenue),
    payments: Number(res.body.data.paymentsReceived),
  };
}
