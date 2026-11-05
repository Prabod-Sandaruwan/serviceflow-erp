import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Invoice Cancellation Rules (INV-006)', () => {
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

    await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/issue`), manager).send({
      issueDate: '2026-11-04', dueDate: '2026-11-30',
    });
  });

  it('Test 1 (Success): cancels an ISSUED invoice with a valid reason', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({
      reason: 'Client requested invoice rework due to scope adjustment',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
    expect(res.body.data.cancelReason).toBe('Client requested invoice rework due to scope adjustment');
    expect(res.body.data.cancelledBy).toBe(manager.user.id.toString());
  });

  it('Test 2 (Re-creation): allows creating a new DRAFT invoice for the same milestone after cancellation', async () => {
    await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({
      reason: 'Billing scope changed, recreating invoice',
    });

    const res = await withCsrf(manager.post('/api/v1/invoices'), manager).send({
      milestoneId: milestone.id,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.milestoneId).toBe(milestone.id.toString());
    expect(res.body.data.id).not.toBe(invoice.id);
  });

  it('Test 3 (409 Error): rejects cancellation if invoice is PAID or PARTIALLY_PAID', async () => {
    await prisma.invoice.update({ where: { id: BigInt(invoice.id) }, data: { status: 'PAID' } });

    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({
      reason: 'Attempting to cancel a paid invoice',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVOICE_HAS_PAYMENTS');
  });

  it('Test 4 (422 Error): rejects cancellation with reason shorter than 5 characters', async () => {
    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({
      reason: 'bad',
    });

    expect(res.status).toBe(422);
  });

  it('Test 5 (409 Error): rejects cancellation if invoice is already CANCELLED', async () => {
    await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({
      reason: 'First valid cancellation reason',
    });

    const res = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/cancel`), manager).send({
      reason: 'Second cancellation attempt',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_CANCELLED');
  });

  it('Test 6 (403 Forbidden): Staff cannot cancel invoices', async () => {
    const res = await withCsrf(staff.post(`/api/v1/invoices/${invoice.id}/cancel`), staff).send({
      reason: 'Staff cancellation attempt',
    });

    expect(res.status).toBe(403);
  });
});
