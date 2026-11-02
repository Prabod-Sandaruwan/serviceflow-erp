import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient } from '../helpers/factories';
import { getColomboToday } from '../../src/lib/date';
import prisma from '../../src/config/prisma';

describe('Quotations API Integration Tests (QUOT-003, QUOT-004)', () => {
  let staffAgent: any, otherStaffAgent: any, activeClient: any, inactiveClient: any;

  const createQ = (overrides: any) => prisma.quotation.create({
    data: {
      quotationNumber: `QT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      clientId: activeClient.id, title: 'Test Quotation', status: 'DRAFT',
      quotationDate: getColomboToday(), validUntil: new Date(getColomboToday().getTime() + 86400000),
      subtotal: 100, taxAmount: 0, total: 100, createdBy: staffAgent.user.id, ...overrides,
    },
  });

  beforeEach(async () => {
    await truncateAll();
    staffAgent = await loginAs(makeAgent(), 'STAFF');
    otherStaffAgent = await loginAs(makeAgent(), 'STAFF');
    activeClient = await createClient({ is_active: true });
    inactiveClient = await createClient({ is_active: false });
  });

  it('creates quotation with QT- number, Location header, and totals (201)', async () => {
    const tmrw = new Date(getColomboToday().getTime() + 86400000);
    const res = await withCsrf(staffAgent.post('/api/v1/quotations'), staffAgent).send({
      clientId: activeClient.id.toString(), title: 'ERP Setup', validUntil: tmrw.toISOString(),
      items: [{ description: 'Core', quantity: 1, unitPrice: 1500000 }, { description: 'Training', quantity: 2, unitPrice: 125000 }],
    });
    expect(res.status).toBe(201);
    expect(res.header.location).toBe(`/api/v1/quotations/${res.body.data.id}`);
    expect(res.body.data.quotationNumber).toMatch(/^QT-\d{4}-\d{4}$/);
    expect(res.body.data.total).toBe(1750000);
    expect(res.body.data.isExpired).toBe(false);
  });

  it('rejects invalid creation (0 items, inactive client, past validUntil) with 422', async () => {
    const tmrw = new Date(getColomboToday().getTime() + 86400000).toISOString();
    const yest = new Date(getColomboToday().getTime() - 86400000).toISOString();
    const item = [{ description: 'T', quantity: 1, unitPrice: 100 }];
    const post = (d: any) => withCsrf(staffAgent.post('/api/v1/quotations'), staffAgent).send(d);

    expect((await post({ clientId: activeClient.id.toString(), title: 'T', validUntil: tmrw, items: [] })).status).toBe(422);
    expect((await post({ clientId: inactiveClient.id.toString(), title: 'T', validUntil: tmrw, items: item })).status).toBe(422);
    expect((await post({ clientId: activeClient.id.toString(), title: 'T', validUntil: yest, items: item })).status).toBe(422);
  });

  it('list quotations for Staff strictly filters to their own quotations', async () => {
    await createQ({ title: 'Staff Q', createdBy: staffAgent.user.id });
    await createQ({ title: 'Other Q', createdBy: otherStaffAgent.user.id });

    const res = await staffAgent.get('/api/v1/quotations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Staff Q');
    expect(res.body.meta.total).toBe(1);
  });

  it('detail endpoint for Staff returns 403 when reading another user quotation', async () => {
    const otherQ = await createQ({ title: 'Other Q', createdBy: otherStaffAgent.user.id });
    const res = await staffAgent.get(`/api/v1/quotations/${otherQ.id}`);
    expect(res.status).toBe(403);
  });

  it('verify pendingApproval=true only returns PENDING_APPROVAL status quotations', async () => {
    await createQ({ title: 'Pending Q', status: 'PENDING_APPROVAL' });
    await createQ({ title: 'Draft Q', status: 'DRAFT' });

    const res = await staffAgent.get('/api/v1/quotations?pendingApproval=true');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('PENDING_APPROVAL');
  });

  it('verify isExpired is returned correctly in the response', async () => {
    const yest = new Date(getColomboToday().getTime() - 86400000);
    const past = new Date(getColomboToday().getTime() - 7 * 86400000);
    const tmrw = new Date(getColomboToday().getTime() + 86400000);
    const expQ = await createQ({ title: 'Exp Q', status: 'SENT', quotationDate: past, validUntil: yest });
    const actQ = await createQ({ title: 'Act Q', status: 'SENT', quotationDate: getColomboToday(), validUntil: tmrw });

    const resExp = await staffAgent.get(`/api/v1/quotations/${expQ.id}`);
    expect(resExp.status).toBe(200);
    expect(resExp.body.data.isExpired).toBe(true);

    const resAct = await staffAgent.get(`/api/v1/quotations/${actQ.id}`);
    expect(resAct.status).toBe(200);
    expect(resAct.body.data.isExpired).toBe(false);
  });
});
