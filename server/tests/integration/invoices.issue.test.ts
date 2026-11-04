import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Invoice Issue & Immutability Guard (INV-005)', () => {
  let manager: any;
  let staff: any;
  let client: any;
  let project: any;
  let milestone: any;
  let invoice: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
    client = await createClient();

    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const pRes = await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() });
    project = pRes.body.data;

    const mRes = await withCsrf(manager.post(`/api/v1/projects/${project.id}/milestones`), manager).send({
      title: 'Phase 1 Delivery', billingAmount: '15000',
    });
    milestone = mRes.body.data;

    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${milestone.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${milestone.id}/approve`), manager).send({});

    const invRes = await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: milestone.id });
    invoice = invRes.body.data;
  });

  it('Test 1 (Success): issues a DRAFT invoice successfully', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/issue`), manager).send({
      issueDate: '2026-11-04', dueDate: '2026-11-30',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ISSUED');
    expect(res.body.data.issueDate).toBe('2026-11-04');
    expect(res.body.data.dueDate).toBe('2026-11-30');
    expect(res.body.data.issuedBy).toBe(manager.user.id.toString());
  });

  it('Test 2 (409 Error): Attempt to issue the same invoice twice returns 409', async () => {
    await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/issue`), manager).send({
      issueDate: '2026-11-04', dueDate: '2026-11-30',
    });
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/issue`), manager).send({
      issueDate: '2026-11-04', dueDate: '2026-11-30',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVOICE_IMMUTABLE');
  });

  it('Test 3 (409 Error): Attempt to PATCH an invoice after it has been issued returns 409 INVOICE_IMMUTABLE', async () => {
    await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/issue`), manager).send({
      issueDate: '2026-11-04', dueDate: '2026-11-30',
    });
    const res = await withCsrf(manager.patch(`/api/v1/invoices/${invoice.id}`), manager).send({
      taxAmount: '1000.00',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVOICE_IMMUTABLE');
  });

  it('Test 4 (422 Error): Attempt to issue with a dueDate that is before the issueDate returns 422', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/issue`), manager).send({
      issueDate: '2026-11-30', dueDate: '2026-11-01',
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('INVALID_DUE_DATE');
  });

  it('Test 5 (403 Forbidden): Staff cannot issue invoices', async () => {
    const res = await withCsrf(staff.post(`/api/v1/invoices/${invoice.id}/issue`), staff).send({
      issueDate: '2026-11-04', dueDate: '2026-11-30',
    });
    expect(res.status).toBe(403);
  });
});
