import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient } from '../helpers/factories';
import { getColomboToday } from '../../src/lib/date';

describe('Quotations API Integration Tests (QUOT-003)', () => {
  let staffAgent: any, activeClient: any, inactiveClient: any;

  beforeEach(async () => {
    await truncateAll();
    staffAgent = await loginAs(makeAgent(), 'STAFF');
    activeClient = await createClient({ is_active: true });
    inactiveClient = await createClient({ is_active: false });
  });

  it('creates quotation with QT- number, Location header, and totals (201)', async () => {
    const tomorrow = new Date(getColomboToday().getTime() + 86400000);
    const payload = {
      clientId: activeClient.id.toString(),
      title: 'ERP Implementation',
      validUntil: tomorrow.toISOString(),
      items: [
        { description: 'Phase 1 core setup', quantity: 1, unitPrice: 1500000 },
        { description: 'Module training', quantity: 2, unitPrice: 125000 },
      ],
      tax: { type: 'VAT', rate: 18, amount: 0 },
    };

    const res = await withCsrf(staffAgent.post('/api/v1/quotations'), staffAgent).send(payload);

    expect(res.status).toBe(201);
    expect(res.header.location).toBe(`/api/v1/quotations/${res.body.data.id}`);
    expect(res.body.data.quotationNumber).toMatch(/^QT-\d{4}-\d{4}$/);
    expect(res.body.data.subtotal).toBe(1750000);
    expect(res.body.data.total).toBe(1750000);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.items[0].lineAmount).toBe(1500000);
  });

  it('rejects creation with 0 items with 422', async () => {
    const tomorrow = new Date(getColomboToday().getTime() + 86400000);
    const res = await withCsrf(staffAgent.post('/api/v1/quotations'), staffAgent).send({
      clientId: activeClient.id.toString(),
      title: 'Empty items quotation',
      validUntil: tomorrow.toISOString(),
      items: [],
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects creation for inactive client with 422', async () => {
    const tomorrow = new Date(getColomboToday().getTime() + 86400000);
    const res = await withCsrf(staffAgent.post('/api/v1/quotations'), staffAgent).send({
      clientId: inactiveClient.id.toString(),
      title: 'Quotation for inactive client',
      validUntil: tomorrow.toISOString(),
      items: [{ description: 'Test item', quantity: 1, unitPrice: 100 }],
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('CLIENT_INACTIVE');
  });

  it('rejects creation when validUntil is before quotation date with 422', async () => {
    const yesterday = new Date(getColomboToday().getTime() - 86400000);
    const res = await withCsrf(staffAgent.post('/api/v1/quotations'), staffAgent).send({
      clientId: activeClient.id.toString(),
      title: 'Past valid until',
      validUntil: yesterday.toISOString(),
      items: [{ description: 'Test item', quantity: 1, unitPrice: 100 }],
    });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
