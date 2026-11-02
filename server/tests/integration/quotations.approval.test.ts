import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Quotations Approval & Decision API Integration Tests', () => {
  let mgrAgent: any, mgr2Agent: any, staffAgent: any, client: any;

  beforeEach(async () => {
    await truncateAll();
    mgrAgent = await loginAs(makeAgent(), 'MANAGER');
    mgr2Agent = await loginAs(makeAgent(), 'MANAGER');
    staffAgent = await loginAs(makeAgent(), 'STAFF');
    client = await createClient({ is_active: true });
  });

  it('allows manager to approve a quotation created by someone else', async () => {
    const q = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: staffAgent.user.id });
    const res = await withCsrf(mgrAgent.post(`/api/v1/quotations/${q.id}/approve`), mgrAgent);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
    expect(res.body.data.approvedBy).toBeTruthy();
    expect(res.body.data.decidedAt).toBeTruthy();
  });

  it('forbids manager from approving their own quotation with 403 SELF_APPROVAL_FORBIDDEN', async () => {
    const q = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: mgrAgent.user.id });
    const res = await withCsrf(mgrAgent.post(`/api/v1/quotations/${q.id}/approve`), mgrAgent);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('SELF_APPROVAL_FORBIDDEN');
  });

  it('forbids staff from approving quotation with 403', async () => {
    const q = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: mgrAgent.user.id });
    const res = await withCsrf(staffAgent.post(`/api/v1/quotations/${q.id}/approve`), staffAgent);
    expect(res.status).toBe(403);
  });

  it('validates rejection reason (422) and rejects successfully with valid reason', async () => {
    const q = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: staffAgent.user.id });
    const post = (d: any) => withCsrf(mgrAgent.post(`/api/v1/quotations/${q.id}/reject`), mgrAgent).send(d);
    expect((await post({})).status).toBe(422);
    expect((await post({ reason: 'bad' })).status).toBe(422);

    const validRes = await post({ reason: 'Price too high for client budget' });
    expect(validRes.status).toBe(200);
    expect(validRes.body.data.status).toBe('REJECTED');
    expect(validRes.body.data.rejectionReason).toBe('Price too high for client budget');
  });

  it('handles concurrency: two concurrent approvals result in one 200 and one 409', async () => {
    const q = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: staffAgent.user.id });
    const [res1, res2] = await Promise.all([
      withCsrf(mgrAgent.post(`/api/v1/quotations/${q.id}/approve`), mgrAgent),
      withCsrf(mgr2Agent.post(`/api/v1/quotations/${q.id}/approve`), mgr2Agent),
    ]);
    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([200, 409]);
    const conflictRes = res1.status === 409 ? res1 : res2;
    expect(conflictRes.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });
});

