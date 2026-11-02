import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient } from '../helpers/factories';
import { getColomboToday } from '../../src/lib/date';
import prisma from '../../src/config/prisma';

describe('Quotations API Integration Tests (QUOT-003, 004, 005)', () => {
  let staffAgent: any, otherStaffAgent: any, activeClient: any, inactiveClient: any;

  const createQ = (overrides: any) => prisma.quotation.create({
    data: {
      quotationNumber: `QT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientId: activeClient.id, title: 'Q', status: 'DRAFT', quotationDate: getColomboToday(),
      validUntil: new Date(getColomboToday().getTime() + 86400000), subtotal: 100, taxAmount: 0,
      total: 100, createdBy: staffAgent.user.id, ...overrides,
    },
  });

  beforeEach(async () => {
    await truncateAll();
    staffAgent = await loginAs(makeAgent(), 'STAFF');
    otherStaffAgent = await loginAs(makeAgent(), 'STAFF');
    activeClient = await createClient({ is_active: true });
    inactiveClient = await createClient({ is_active: false });
  });

  it('creates quotation with QT- number, 201, and Location header', async () => {
    const tmrw = new Date(getColomboToday().getTime() + 86400000);
    const res = await withCsrf(staffAgent.post('/api/v1/quotations'), staffAgent).send({
      clientId: activeClient.id.toString(), title: 'ERP', validUntil: tmrw.toISOString(),
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
    const q1 = await createQ({ title: 'My Q', createdBy: staffAgent.user.id });
    const q2 = await createQ({ title: 'Other Q', createdBy: otherStaffAgent.user.id });
    const listRes = await staffAgent.get('/api/v1/quotations');
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].id).toBe(q1.id.toString());
    expect((await staffAgent.get(`/api/v1/quotations/${q2.id}`)).status).toBe(403);
  });

  it('pendingApproval filter and isExpired derivation', async () => {
    await createQ({ status: 'PENDING_APPROVAL' });
    await createQ({ status: 'DRAFT' });
    const pRes = await staffAgent.get('/api/v1/quotations?pendingApproval=true');
    expect(pRes.body.data).toHaveLength(1);
    expect(pRes.body.data[0].status).toBe('PENDING_APPROVAL');

    const expQ = await createQ({ status: 'SENT', quotationDate: new Date(getColomboToday().getTime() - 7 * 86400000), validUntil: new Date(getColomboToday().getTime() - 86400000) });
    expect((await staffAgent.get(`/api/v1/quotations/${expQ.id}`)).body.data.isExpired).toBe(true);
  });

  it('edits a DRAFT quotation, replaces old items, and recomputes totals safely', async () => {
    const q = await createQ({ title: 'Initial' });
    await prisma.quotationItem.create({ data: { quotationId: q.id, lineNo: 1, description: 'Old', quantity: 1, unitPrice: 100, lineAmount: 100 } });
    const res = await withCsrf(staffAgent.patch(`/api/v1/quotations/${q.id}`), staffAgent).send({
      title: 'Updated',
      items: [{ description: 'New Core', quantity: 2, unitPrice: 200 }, { description: 'New Svc', quantity: 1, unitPrice: 50 }],
      tax: { type: 'VAT', rate: 10, amount: 45 },
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ title: 'Updated', subtotal: 450, taxAmount: 45, total: 495 });
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.items[0]).toMatchObject({ description: 'New Core', lineAmount: 400 });
  });

  it('rejects editing non-DRAFT quotation with 409 and other user quotation with 403', async () => {
    const pendingQ = await createQ({ status: 'PENDING_APPROVAL' });
    const resConflict = await withCsrf(staffAgent.patch(`/api/v1/quotations/${pendingQ.id}`), staffAgent).send({ title: 'Edit' });
    expect(resConflict.status).toBe(409);

    const otherQ = await createQ({ createdBy: otherStaffAgent.user.id });
    const resForbidden = await withCsrf(staffAgent.patch(`/api/v1/quotations/${otherQ.id}`), staffAgent).send({ title: 'Edit' });
    expect(resForbidden.status).toBe(403);
  });
});
