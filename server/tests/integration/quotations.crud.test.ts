import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';
import { getColomboToday } from '../../src/lib/date';
import prisma from '../../src/config/prisma';

describe('Quotations CRUD & Submit API Integration Tests', () => {
  let staffAgent: any, otherStaffAgent: any, activeClient: any, inactiveClient: any;

  beforeEach(async () => {
    await truncateAll();
    staffAgent = await loginAs(makeAgent(), 'STAFF');
    otherStaffAgent = await loginAs(makeAgent(), 'STAFF');
    activeClient = await createClient({ is_active: true });
    inactiveClient = await createClient({ is_active: false });
  });

  it('creates quotation with QT- number, 201, and Location header', async () => {
    const tmrw = new Date(getColomboToday().getTime() + 86400000).toISOString();
    const res = await withCsrf(staffAgent.post('/api/v1/quotations'), staffAgent).send({
      clientId: activeClient.id.toString(), title: 'ERP', validUntil: tmrw,
      items: [{ description: 'Core', quantity: 1, unitPrice: 1500000 }, { description: 'Training', quantity: 2, unitPrice: 125000 }],
    });
    expect(res.status).toBe(201);
    expect(res.header.location).toBe(`/api/v1/quotations/${res.body.data.id}`);
    expect(res.body.data.quotationNumber).toMatch(/^QT-\d{4}-\d{4}$/);
    expect(res.body.data.total).toBe(1750000);
  });

  it('rejects invalid creation (0 items, inactive client, past validUntil) with 422', async () => {
    const tmrw = new Date(getColomboToday().getTime() + 86400000).toISOString();
    const item = [{ description: 'T', quantity: 1, unitPrice: 100 }];
    const post = (d: any) => withCsrf(staffAgent.post('/api/v1/quotations'), staffAgent).send(d);
    expect((await post({ clientId: activeClient.id.toString(), title: 'T', validUntil: tmrw, items: [] })).status).toBe(422);
    expect((await post({ clientId: inactiveClient.id.toString(), title: 'T', validUntil: tmrw, items: item })).status).toBe(422);
    expect((await post({ clientId: activeClient.id.toString(), title: 'T', validUntil: new Date(getColomboToday().getTime() - 86400000).toISOString(), items: item })).status).toBe(422);
  });

  it('list and detail scoping for Staff: lists own only, 403 on others', async () => {
    const q1 = await createQuotation({ clientId: activeClient.id, title: 'My Q', createdBy: staffAgent.user.id });
    const q2 = await createQuotation({ clientId: activeClient.id, title: 'Other Q', createdBy: otherStaffAgent.user.id });
    const listRes = await staffAgent.get('/api/v1/quotations');
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].id).toBe(q1.id.toString());
    expect((await staffAgent.get(`/api/v1/quotations/${q2.id}`)).status).toBe(403);
  });

  it('pendingApproval filter and isExpired derivation', async () => {
    await createQuotation({ clientId: activeClient.id, status: 'PENDING_APPROVAL', createdBy: staffAgent.user.id });
    await createQuotation({ clientId: activeClient.id, status: 'DRAFT', createdBy: staffAgent.user.id });
    const pRes = await staffAgent.get('/api/v1/quotations?pendingApproval=true');
    expect(pRes.body.data).toHaveLength(1);
    expect(pRes.body.data[0].status).toBe('PENDING_APPROVAL');

    const expQ = await createQuotation({ clientId: activeClient.id, status: 'SENT', quotationDate: new Date(getColomboToday().getTime() - 7 * 86400000), validUntil: new Date(getColomboToday().getTime() - 86400000), createdBy: staffAgent.user.id });
    expect((await staffAgent.get(`/api/v1/quotations/${expQ.id}`)).body.data.isExpired).toBe(true);
  });

  it('edits a DRAFT quotation, replaces old items, and recomputes totals safely', async () => {
    const q = await createQuotation({ clientId: activeClient.id, createdBy: staffAgent.user.id });
    await prisma.quotationItem.create({ data: { quotationId: q.id, lineNo: 1, description: 'Old', quantity: 1, unitPrice: 100, lineAmount: 100 } });
    const res = await withCsrf(staffAgent.patch(`/api/v1/quotations/${q.id}`), staffAgent).send({
      title: 'Updated', items: [{ description: 'New Core', quantity: 2, unitPrice: 200 }, { description: 'New Svc', quantity: 1, unitPrice: 50 }], tax: { type: 'VAT', rate: 10, amount: 45 },
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ title: 'Updated', subtotal: 450, taxAmount: 45, total: 495 });
    expect(res.body.data.items).toHaveLength(2);
  });

  it('rejects editing non-DRAFT with 409 and other user with 403', async () => {
    const pQ = await createQuotation({ clientId: activeClient.id, status: 'PENDING_APPROVAL', createdBy: staffAgent.user.id });
    expect((await withCsrf(staffAgent.patch(`/api/v1/quotations/${pQ.id}`), staffAgent).send({ title: 'Edit' })).status).toBe(409);
    const oQ = await createQuotation({ clientId: activeClient.id, createdBy: otherStaffAgent.user.id });
    expect((await withCsrf(staffAgent.patch(`/api/v1/quotations/${oQ.id}`), staffAgent).send({ title: 'Edit' })).status).toBe(403);
  });

  it('submits a DRAFT quotation for approval, and guards double-submit or 0 items', async () => {
    const q = await createQuotation({ clientId: activeClient.id, createdBy: staffAgent.user.id });
    await prisma.quotationItem.create({ data: { quotationId: q.id, lineNo: 1, description: 'Item', quantity: 1, unitPrice: 100, lineAmount: 100 } });
    const res = await withCsrf(staffAgent.post(`/api/v1/quotations/${q.id}/submit`), staffAgent);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'PENDING_APPROVAL' });

    expect((await withCsrf(staffAgent.post(`/api/v1/quotations/${q.id}/submit`), staffAgent)).status).toBe(409);
    const emptyQ = await createQuotation({ clientId: activeClient.id, createdBy: staffAgent.user.id });
    expect((await withCsrf(staffAgent.post(`/api/v1/quotations/${emptyQ.id}/submit`), staffAgent)).status).toBe(422);
  });
});

