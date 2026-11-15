import { describe, it, expect, beforeAll } from 'vitest';
import { makeAgent, loginAs, withCsrf } from '../helpers/agent';
import { truncateAll } from '../helpers/factories';
import {
  setupCorrectionEnv,
  createApprovedMilestone,
  createAndIssueInvoice,
  fetchFinanceReport,
} from './corrections.helpers';

describe('Invoice Cancellation and Payment Voiding Flows (TEST-003)', () => {
  let mgr: any;
  let project: any;
  let m3: any, inv3: any, payment3: any;

  beforeAll(async () => {
    await truncateAll();
    mgr = await loginAs(makeAgent(), 'MANAGER');
    const env = await setupCorrectionEnv(mgr);
    project = env.project;
  });

  it('Scenario 1: DRAFT invoice cancellation keeps revenue at 0', async () => {
    const m1 = await createApprovedMilestone(mgr, project.id, 'M1', '10000.00');
    const inv1 = (await withCsrf(mgr.post('/api/v1/invoices'), mgr).send({ milestoneId: m1.id })).body.data;
    const cancelRes = await withCsrf(mgr.post(`/api/v1/invoices/${inv1.id}/cancel`), mgr)
      .send({ reason: 'Cancelling draft invoice' });
    expect(cancelRes.status).toBe(200);
    const report = await fetchFinanceReport(mgr);
    expect(report.revenue).toBe(0);
  });

  it('Scenario 2: ISSUED cancellation decreases report revenue by subtotal', async () => {
    const m2 = await createApprovedMilestone(mgr, project.id, 'M2', '25000.00');
    const inv2 = await createAndIssueInvoice(mgr, m2.id);
    const beforeCancel = await fetchFinanceReport(mgr);
    expect(beforeCancel.revenue).toBe(25000);

    const cancelRes = await withCsrf(mgr.post(`/api/v1/invoices/${inv2.id}/cancel`), mgr)
      .send({ reason: 'Scope change cancelled issued' });
    expect(cancelRes.status).toBe(200);
    const afterCancel = await fetchFinanceReport(mgr);
    expect(afterCancel.revenue).toBe(0);
  });

  it('Scenario 3: Rejects cancellation of PARTIALLY_PAID invoice (409)', async () => {
    m3 = await createApprovedMilestone(mgr, project.id, 'M3', '40000.00');
    inv3 = await createAndIssueInvoice(mgr, m3.id);
    const payRes = await withCsrf(mgr.post(`/api/v1/invoices/${inv3.id}/payments`), mgr)
      .send({ amount: '15000.00', method: 'CASH', date: '2026-11-05' });
    expect(payRes.status).toBe(201);
    payment3 = payRes.body.data;

    const cancelRes = await withCsrf(mgr.post(`/api/v1/invoices/${inv3.id}/cancel`), mgr)
      .send({ reason: 'Attempt cancel with active payment' });
    expect([400, 409]).toContain(cancelRes.status);
    expect(cancelRes.body.error.code).toBe('INVOICE_HAS_PAYMENTS');
  });

  it('Scenario 4: Void payment, cancel invoice, recreate and update reports', async () => {
    const rep1 = await fetchFinanceReport(mgr);
    expect(rep1.revenue).toBe(40000);
    expect(rep1.payments).toBe(15000);

    const voidRes = await withCsrf(mgr.post(`/api/v1/payments/${payment3.id}/void`), mgr)
      .send({ reason: 'Erroneous payment charge' });
    expect(voidRes.status).toBe(200);

    const rep2 = await fetchFinanceReport(mgr);
    expect(rep2.payments).toBe(0);

    const cancelRes = await withCsrf(mgr.post(`/api/v1/invoices/${inv3.id}/cancel`), mgr)
      .send({ reason: 'Cancelled after payment voided' });
    expect(cancelRes.status).toBe(200);

    const rep3 = await fetchFinanceReport(mgr);
    expect(rep3.revenue).toBe(0);

    const recreated = await createAndIssueInvoice(mgr, m3.id);
    expect(recreated.id).not.toBe(inv3.id);

    const rep4 = await fetchFinanceReport(mgr);
    expect(rep4.revenue).toBe(40000);
  });
});
