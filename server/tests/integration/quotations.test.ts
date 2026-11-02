import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import prisma from '../../src/config/prisma';

describe('Quotation Lifecycle & Validation Tests (QUOT-011)', () => {
  let staff: any, mgr: any, client: any;

  beforeEach(async () => {
    await truncateAll();
    staff = await loginAs(makeAgent(), 'STAFF');
    mgr = await loginAs(makeAgent(), 'MANAGER');
    client = await createClient({ is_active: true });
  });

  it('Happy Path (AS-03..05): create -> submit -> approve -> send -> accept with audit logs', async () => {
    const tmrw = new Date(Date.now() + 86400000).toISOString();
    const cRes = await withCsrf(staff.post('/api/v1/quotations'), staff).send({
      clientId: client.id.toString(), title: 'ERP Solution', validUntil: tmrw,
      items: [{ description: 'Dev', quantity: 1, unitPrice: 1000 }],
    });
    expect(cRes.status).toBe(201);
    const qid = BigInt(cRes.body.data.id);
    expect(await prisma.auditLog.count({ where: { entityId: qid, action: 'QUOTATION_CREATED' } })).toBe(1);

    const sRes = await withCsrf(staff.post(`/api/v1/quotations/${qid}/submit`), staff);
    expect(sRes.status).toBe(200);
    expect(await prisma.auditLog.count({ where: { entityId: qid, action: 'QUOTATION_SUBMITTED' } })).toBe(1);

    const aRes = await withCsrf(mgr.post(`/api/v1/quotations/${qid}/approve`), mgr);
    expect(aRes.status).toBe(200);
    expect(await prisma.auditLog.count({ where: { entityId: qid, action: 'QUOTATION_APPROVED' } })).toBe(1);

    const sendRes = await withCsrf(staff.post(`/api/v1/quotations/${qid}/send`), staff);
    expect(sendRes.status).toBe(200);
    expect(await prisma.auditLog.count({ where: { entityId: qid, action: 'QUOTATION_SENT' } })).toBe(1);

    const rRes = await withCsrf(staff.post(`/api/v1/quotations/${qid}/respond`), staff).send({ outcome: 'ACCEPTED', date: '2026-11-02' });
    expect(rRes.status).toBe(200);
    expect(await prisma.auditLog.count({ where: { entityId: qid, action: 'QUOTATION_RESPONDED' } })).toBe(1);

    const pdfRes = await staff.get(`/api/v1/quotations/${qid}/pdf`);
    expect(pdfRes.status).toBe(200);
    expect(pdfRes.headers['content-type']).toContain('application/pdf');
  });

  it('Negative Paths: self-approval (403), staff approval (403), edit submitted (409)', async () => {
    const q1 = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: mgr.user.id });
    const selfRes = await withCsrf(mgr.post(`/api/v1/quotations/${q1.id}/approve`), mgr);
    expect(selfRes.status).toBe(403);
    expect(selfRes.body.error.code).toBe('SELF_APPROVAL_FORBIDDEN');

    const q2 = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: mgr.user.id });
    expect((await withCsrf(staff.post(`/api/v1/quotations/${q2.id}/approve`), staff)).status).toBe(403);

    const q3 = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: staff.user.id });
    expect((await withCsrf(staff.patch(`/api/v1/quotations/${q3.id}`), staff).send({ title: 'New' })).status).toBe(409);
  });

  it('Negative Paths: approve twice (409), accept expired (409), reject without reason (422), invalid ID (404)', async () => {
    const appQ = await createQuotation({ clientId: client.id, status: 'APPROVED', createdBy: staff.user.id });
    expect((await withCsrf(mgr.post(`/api/v1/quotations/${appQ.id}/approve`), mgr)).status).toBe(409);

    const past = new Date(Date.now() - 86400000);
    const expQ = await createQuotation({ clientId: client.id, status: 'SENT', validUntil: past, quotationDate: new Date(past.getTime() - 86400000 * 7), createdBy: staff.user.id });
    const expRes = await withCsrf(staff.post(`/api/v1/quotations/${expQ.id}/respond`), staff).send({ outcome: 'ACCEPTED', date: '2026-11-02' });
    expect(expRes.status).toBe(409);

    const pendQ = await createQuotation({ clientId: client.id, status: 'PENDING_APPROVAL', createdBy: staff.user.id });
    expect((await withCsrf(mgr.post(`/api/v1/quotations/${pendQ.id}/reject`), mgr).send({})).status).toBe(422);

    expect((await staff.get('/api/v1/quotations/999999')).status).toBe(404);
    expect((await withCsrf(mgr.post('/api/v1/quotations/999999/approve'), mgr)).status).toBe(404);
  });
});
