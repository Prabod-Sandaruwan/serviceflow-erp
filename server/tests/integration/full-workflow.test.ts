import { describe, it, expect, beforeEach } from 'vitest';
import { makeAgent, loginAs } from '../helpers/agent';
import { truncateAll } from '../helpers/factories';
import {
  createAndConvertLead,
  processQuotation,
  setupProject,
  handleInvoiceAndPayment,
  recordExpense,
} from './workflow.helpers';

describe('End-to-End API Workflow Test (TEST-001)', () => {
  let admin: any, manager: any, staff: any;

  beforeEach(async () => {
    await truncateAll();
    admin = await loginAs(makeAgent(), 'ADMIN');
    manager = await loginAs(makeAgent(), 'MANAGER');
    staff = await loginAs(makeAgent(), 'STAFF');
  });

  it('executes the full lead-to-report flow and verifies exact financial figures', async () => {
    // 1. Create a lead, add follow-up, and convert to client
    const { clientId } = await createAndConvertLead(staff);
    expect(clientId).toBeDefined();

    // 2. Create quotation for 1000.00, submit (staff), approve (manager), send, and accept
    const { quotationId } = await processQuotation(staff, manager, clientId, 1000);
    expect(quotationId).toBeDefined();

    // 3. Create project from accepted quotation, add milestone (1000.00), and approve it
    const { projectId, milestoneId } = await setupProject(manager, quotationId, 1000);
    expect(projectId).toBeDefined();
    expect(milestoneId).toBeDefined();

    // 4. Generate invoice for milestone, issue it, and record a 400.00 partial payment
    const { invoiceId, paymentAmount } = await handleInvoiceAndPayment(manager, milestoneId, 400);
    expect(invoiceId).toBeDefined();
    expect(paymentAmount).toBe(400);

    // 5. Record an active project expense of 150.00
    const { expenseId, expenseAmount } = await recordExpense(manager, projectId, 150);
    expect(expenseId).toBeDefined();
    expect(expenseAmount).toBe(150);

    // 6. Query finance report as Manager / Admin
    const reportRes = await manager.get('/api/v1/reports/finance?from=2026-11-01&to=2026-11-30');
    expect(reportRes.status).toBe(200);

    const report = reportRes.body.data;

    // Acceptance Criteria: Final report numbers MUST match the math of the steps
    expect(report.revenue).toBe('1000.00');
    expect(report.paymentsReceived).toBe('400.00');
    expect(report.expenses).toBe('150.00');
    expect(report.estimatedProfitability).toBe('850.00');
    expect(report.outstanding).toBe('600.00');

    // Also verify report is accessible to Admin with identical figures
    const adminReportRes = await admin.get('/api/v1/reports/finance?from=2026-11-01&to=2026-11-30');
    expect(adminReportRes.status).toBe(200);
    expect(adminReportRes.body.data.estimatedProfitability).toBe('850.00');
  });
});
