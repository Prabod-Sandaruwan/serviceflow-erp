import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import { getColomboToday } from '../../src/lib/date';
import prisma from '../../src/config/prisma';

describe('Quotations Revise, Send, Client Response, Expiry & PDF Tests', () => {
  let agent: any, client: any;

  beforeEach(async () => {
    await truncateAll();
    agent = await loginAs(makeAgent(), 'STAFF');
    client = await createClient({ is_active: true });
  });

  it('sends an APPROVED quotation to client (APPROVED -> SENT)', async () => {
    const q = await createQuotation({ clientId: client.id, status: 'APPROVED', createdBy: agent.user.id });
    const res = await withCsrf(agent.post(`/api/v1/quotations/${q.id}/send`), agent);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SENT');
    expect(res.body.data.sentAt).toBeTruthy();

    const draftQ = await createQuotation({ clientId: client.id, status: 'DRAFT', createdBy: agent.user.id });
    expect((await withCsrf(agent.post(`/api/v1/quotations/${draftQ.id}/send`), agent)).status).toBe(409);
  });

  it('records client response: SENT -> ACCEPTED and SENT -> DECLINED', async () => {
    const q1 = await createQuotation({ clientId: client.id, status: 'SENT', createdBy: agent.user.id });
    const r1 = await withCsrf(agent.post(`/api/v1/quotations/${q1.id}/respond`), agent).send({ outcome: 'ACCEPTED', date: '2026-11-02', note: 'Agreed' });
    expect(r1.status).toBe(200);
    expect(r1.body.data.status).toBe('ACCEPTED');
    expect(r1.body.data.responseNote).toBe('Agreed');

    const q2 = await createQuotation({ clientId: client.id, status: 'SENT', createdBy: agent.user.id });
    const r2 = await withCsrf(agent.post(`/api/v1/quotations/${q2.id}/respond`), agent).send({ outcome: 'DECLINED', date: '2026-11-02' });
    expect(r2.status).toBe(200);
    expect(r2.body.data.status).toBe('DECLINED');
  });

  it('rejects ACCEPT on expired quotation with 409 QUOTATION_EXPIRED', async () => {
    const past = new Date(getColomboToday().getTime() - 86400000);
    const q = await createQuotation({ clientId: client.id, status: 'SENT', quotationDate: new Date(past.getTime() - 7 * 86400000), validUntil: past, createdBy: agent.user.id });
    const res = await withCsrf(agent.post(`/api/v1/quotations/${q.id}/respond`), agent).send({ outcome: 'ACCEPTED', date: '2026-11-02' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('QUOTATION_EXPIRED');
  });

  it('revises REJECTED in place to DRAFT, clearing rejection fields', async () => {
    const q = await createQuotation({ clientId: client.id, status: 'REJECTED', rejectionReason: 'Too high', decidedAt: new Date(), createdBy: agent.user.id });
    const res = await withCsrf(agent.post(`/api/v1/quotations/${q.id}/revise`), agent);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(q.id.toString());
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.rejectionReason).toBeNull();
  });

  it('revises DECLINED into a new DRAFT copy linked by revisionOfId', async () => {
    const q = await createQuotation({ clientId: client.id, status: 'DECLINED', createdBy: agent.user.id });
    await prisma.quotationItem.create({ data: { quotationId: q.id, lineNo: 1, description: 'Svc', quantity: 1, unitPrice: 100, lineAmount: 100 } });
    const res = await withCsrf(agent.post(`/api/v1/quotations/${q.id}/revise`), agent);
    expect(res.status).toBe(200);
    expect(res.body.data.id).not.toBe(q.id.toString());
    expect(res.body.data.revisionOfId).toBe(q.id.toString());
    expect(res.body.data.status).toBe('DRAFT');
  });

  it('downloads quotation PDF (200, application/pdf) and blocks non-owner staff (403)', async () => {
    const q = await createQuotation({ clientId: client.id, createdBy: agent.user.id });
    await prisma.quotationItem.create({ data: { quotationId: q.id, lineNo: 1, description: 'Core', quantity: 1, unitPrice: 100, lineAmount: 100 } });
    const res = await agent.get(`/api/v1/quotations/${q.id}/pdf`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain(`filename="${q.quotationNumber}.pdf"`);

    const otherAgent = await loginAs(makeAgent(), 'STAFF');
    const forbidRes = await otherAgent.get(`/api/v1/quotations/${q.id}/pdf`);
    expect(forbidRes.status).toBe(403);
  });
});
