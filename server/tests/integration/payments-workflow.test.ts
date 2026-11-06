import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll, createClient, createQuotation } from '../helpers/factories';

describe('Payment Multi-Step Lifecycle Workflow (PAY-010)', () => {
  let manager: any;
  let invoice: any;

  beforeEach(async () => {
    await truncateAll();
    manager = await loginAs(makeAgent(), 'MANAGER');
    const client = await createClient();
    const q = await createQuotation({ clientId: client.id, createdBy: manager.user.id, status: 'ACCEPTED' });
    const p = (await withCsrf(manager.post('/api/v1/projects'), manager).send({ quotationId: q.id.toString() })).body.data;
    const m = (await withCsrf(manager.post(`/api/v1/projects/${p.id}/milestones`), manager).send({
      title: 'Phase 1 Delivery', billingAmount: '10000.00',
    })).body.data;
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'IN_PROGRESS' });
    await withCsrf(manager.patch(`/api/v1/milestones/${m.id}`), manager).send({ status: 'COMPLETED' });
    await withCsrf(manager.post(`/api/v1/milestones/${m.id}/approve`), manager).send({});
    const inv = (await withCsrf(manager.post('/api/v1/invoices'), manager).send({ milestoneId: m.id })).body.data;
    invoice = (await withCsrf(manager.post(`/api/v1/invoices/${inv.id}/issue`), manager).send({
      issueDate: '2026-11-01', dueDate: '2026-11-30',
    })).body.data;
  });

  it('Step-by-step payment recording across multiple methods to fully settle invoice', async () => {
    const p1 = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '3000.00', method: 'CASH', date: '2026-11-02',
    });
    expect(p1.status).toBe(201);
    expect(p1.body.meta.newBalance).toBe('7000.00');
    expect(p1.body.meta.invoiceStatus).toBe('PARTIALLY_PAID');

    const p2 = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '4000.00', method: 'BANK_TRANSFER', date: '2026-11-03', reference: 'WIRE-12345',
    });
    expect(p2.status).toBe(201);
    expect(p2.body.meta.newBalance).toBe('3000.00');
    expect(p2.body.meta.invoiceStatus).toBe('PARTIALLY_PAID');

    const p3 = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '3000.00', method: 'CARD', date: '2026-11-04', reference: 'POS-AUTH-999',
    });
    expect(p3.status).toBe(201);
    expect(p3.body.meta.newBalance).toBe('0.00');
    expect(p3.body.meta.invoiceStatus).toBe('PAID');

    const p4 = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '100.00', method: 'CASH', date: '2026-11-04',
    });
    expect(p4.status).toBe(409);
  });

  it('Voiding intermediate and full payments transitions status back to ISSUED', async () => {
    const pay1 = (await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '6000.00', method: 'CASH', date: '2026-11-02',
    })).body.data;
    const pay2 = (await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '4000.00', method: 'BANK_TRANSFER', date: '2026-11-03', reference: 'WIRE-678',
    })).body.data;

    const void2 = await withCsrf(manager.post(`/api/v1/payments/${pay2.id}/void`), manager).send({
      reason: 'Payment 2 entered erroneously',
    });
    expect(void2.status).toBe(200);
    expect(void2.body.meta.newBalance).toBe('4000.00');
    expect(void2.body.meta.invoiceStatus).toBe('PARTIALLY_PAID');

    const void1 = await withCsrf(manager.post(`/api/v1/payments/${pay1.id}/void`), manager).send({
      reason: 'Payment 1 bounced/refunded',
    });
    expect(void1.status).toBe(200);
    expect(void1.body.meta.newBalance).toBe('10000.00');
    expect(void1.body.meta.invoiceStatus).toBe('ISSUED');

    const fullPay = await withCsrf(manager.post(`/api/v1/invoices/${invoice.id}/payments`), manager).send({
      amount: '10000.00', method: 'CARD', date: '2026-11-05', reference: 'RE-CARD-FULL',
    });
    expect(fullPay.status).toBe(201);
    expect(fullPay.body.meta.newBalance).toBe('0.00');
    expect(fullPay.body.meta.invoiceStatus).toBe('PAID');
  });

  it('Returns 404 for non-existent invoice or payment', async () => {
    const inv404 = await withCsrf(manager.post('/api/v1/invoices/999999/payments'), manager).send({
      amount: '100.00', method: 'CASH', date: '2026-11-02',
    });
    expect(inv404.status).toBe(404);

    const void404 = await withCsrf(manager.post('/api/v1/payments/999999/void'), manager).send({
      reason: 'Non-existent payment void test',
    });
    expect(void404.status).toBe(404);
  });
});
