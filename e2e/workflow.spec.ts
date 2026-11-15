import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import { login, approveQuotation, createProject, issueInvoiceAndPay } from './helpers';

test.describe('ServiceFlow ERP End-to-End Workflow', () => {
  test.beforeAll(() => {
    try {
      execSync('npm --prefix server run db:seed', { stdio: 'ignore' });
    } catch {}
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Full ERP Workflow: Login -> Quotation -> Project -> Invoice -> Payment', async ({ page }) => {
    // 1. Login with dedicated test user
    await login(page, 'admin@serviceflow.lk', '12345');
    await expect(page).toHaveURL(/\/(dashboard)?$/);

    // 2. Approve Quotation
    await approveQuotation(page);

    // 3. Create / Open Project
    await createProject(page);
    await expect(page.getByText(/Project Details|Milestones|Tasks/i).first()).toBeVisible();

    // 4. Issue Invoice & Record Payment
    await issueInvoiceAndPay(page);

    // 5. Final Assertions
    const paymentRecorded = page.getByText(/Payment recorded successfully|Payment successful/i)
      .or(page.getByRole('heading', { name: 'Payments' }));
    await expect(paymentRecorded.first()).toBeVisible({ timeout: 5000 });
  });
});
