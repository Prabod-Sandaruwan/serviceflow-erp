import { withCsrf } from '../helpers/agent';

export async function createAndConvertLead(agent: any) {
  const leadRes = await withCsrf(agent.post('/api/v1/leads'), agent).send({
    expectedValue: 5000,
    notes: 'Inbound enterprise inquiry',
  });
  const leadId = leadRes.body.data.id.toString();

  await withCsrf(agent.post('/api/v1/follow-ups'), agent).send({
    leadId,
    scheduledAt: '2026-11-20T10:00:00.000Z',
    notes: 'Discovery call completed',
  });

  const convRes = await withCsrf(agent.post(`/api/v1/leads/${leadId}/convert`), agent).send({});
  return { leadId, clientId: convRes.body.data.id.toString() };
}

export async function processQuotation(creator: any, approver: any, clientId: string, amount = 1000) {
  const qRes = await withCsrf(creator.post('/api/v1/quotations'), creator).send({
    clientId,
    title: 'Enterprise Solution Implementation',
    validUntil: '2026-12-31T00:00:00.000Z',
    items: [{ description: 'Core ERP Modules', quantity: 1, unitPrice: amount }],
  });
  const qid = qRes.body.data.id.toString();

  await withCsrf(creator.post(`/api/v1/quotations/${qid}/submit`), creator);
  await withCsrf(approver.post(`/api/v1/quotations/${qid}/approve`), approver);
  await withCsrf(creator.post(`/api/v1/quotations/${qid}/send`), creator);
  await withCsrf(creator.post(`/api/v1/quotations/${qid}/respond`), creator).send({
    outcome: 'ACCEPTED',
    date: '2026-11-02',
  });

  return { quotationId: qid, subtotal: amount, total: amount };
}

export async function setupProject(agent: any, quotationId: string, milestoneAmount = 1000) {
  const pRes = await withCsrf(agent.post('/api/v1/projects'), agent).send({
    quotationId,
    name: 'Enterprise Rollout',
  });
  const projectId = pRes.body.data.id.toString();

  const mRes = await withCsrf(agent.post(`/api/v1/projects/${projectId}/milestones`), agent).send({
    title: 'Phase 1 Delivery',
    billingAmount: String(milestoneAmount),
  });
  const milestoneId = mRes.body.data.id.toString();

  await withCsrf(agent.patch(`/api/v1/milestones/${milestoneId}`), agent).send({ status: 'IN_PROGRESS' });
  await withCsrf(agent.patch(`/api/v1/milestones/${milestoneId}`), agent).send({ status: 'COMPLETED' });
  await withCsrf(agent.post(`/api/v1/milestones/${milestoneId}/approve`), agent).send({});

  return { projectId, milestoneId };
}

export async function handleInvoiceAndPayment(agent: any, milestoneId: string, paymentAmount = 400) {
  const invRes = await withCsrf(agent.post('/api/v1/invoices'), agent).send({ milestoneId });
  const invoiceId = invRes.body.data.id.toString();

  await withCsrf(agent.post(`/api/v1/invoices/${invoiceId}/issue`), agent).send({
    issueDate: '2026-11-05',
    dueDate: '2026-11-30',
  });

  const payRes = await withCsrf(agent.post(`/api/v1/invoices/${invoiceId}/payments`), agent).send({
    amount: String(paymentAmount),
    method: 'BANK_TRANSFER',
    reference: 'TXN-WF-4001',
    date: '2026-11-06',
  });

  return { invoiceId, paymentId: payRes.body?.data?.id?.toString(), paymentAmount };
}

export async function recordExpense(agent: any, projectId: string, amount = 150) {
  const expRes = await withCsrf(agent.post('/api/v1/expenses'), agent).send({
    projectId,
    category: 'SOFTWARE',
    amount: String(amount),
    expenseDate: '2026-11-07',
    description: 'Cloud hosting environment',
  });
  return { expenseId: expRes.body.data.id.toString(), expenseAmount: amount };
}
