import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Payment Authorization Integration Tests (PAY-010)', () => {
  let manager: any;
  let staff: any;
  let unauth: any;
  let payment: any;
  let invoice: any;

  beforeEach(async () => {
    await truncateAll();
    unauth = makeAgent();
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');

    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;
    const m = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/milestones`), manager).send({
      title: 'M1', billingAmount: '1000.00',
    })).body.data;
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${m.id}/approve`), manager).send({});
    const inv = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m.id })).body.data;
    invoice = (await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;
    payment = (await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '500.00', method: 'CASH', date: '2026-11-02',
    })).body.data;
  });

  it('Test 1 (Unauthenticated): rejects call without token with 401', async () => {
    const csrf = (await unauth.get('/api/v1/auth/csrf')).body?.data?.csrfToken;
    unauth.csrfToken = csrf;
    const res = await withCsrf(unauth.post(`/api/v1/invoices/${invoice.id}/payments`), unauth).send({
      amount: '100.00', method: 'CASH', date: '2026-11-02',
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code');
  });

  it('Test 2 (Staff Void 403): rejects Staff attempting to void payment with 403 FORBIDDEN', async () => {
    const res = await withCsrf(staff.post(`/api/v1/payments/${payment.id}/void`), staff).send({
      reason: 'Staff unauthorized void attempt',
    });
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code');
  });
});
