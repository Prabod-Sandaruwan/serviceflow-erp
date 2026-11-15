import { Page, expect } from '@playwright/test';

export async function login(page: Page, email = 'admin@serviceflow.lk', password = '12345') {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /Sign In/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

export async function approveQuotation(page: Page) {
  await page.goto('/quotations');
  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  const row = page.locator('table tbody tr').first();
  await row.getByRole('link').first().click();
  await page.waitForURL(/\/quotations\/\w+/, { timeout: 10000 });
  await page.locator('h1').waitFor({ state: 'visible', timeout: 10000 });

  const approveBtn = page.getByRole('button', { name: 'Approve' });
  const canApprove = await approveBtn.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
  if (canApprove) {
    await approveBtn.click();
    await expect(page.getByText(/Quotation approved/i)).toBeVisible({ timeout: 5000 });
  }
}

export async function createProject(page: Page) {
  const createProjBtn = page.getByRole('button', { name: 'Create Project' });
  const canCreate = await createProjBtn.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
  if (canCreate) {
    await createProjBtn.click();
  }
  await page.waitForURL(/\/projects/, { timeout: 10000 });
  if (!page.url().match(/\/projects\/\w+/)) {
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    await page.locator('table tbody tr').first().getByRole('link').first().click();
    await page.waitForURL(/\/projects\/\w+/, { timeout: 10000 });
  }
  await page.locator('h1').waitFor({ state: 'visible', timeout: 10000 });
}

export async function issueInvoiceAndPay(page: Page) {
  await page.goto('/invoices');
  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  const inv01 = page.getByRole('link', { name: 'INV-2026-0001' });
  if (await inv01.isVisible().catch(() => false)) {
    await inv01.click();
  } else {
    const row = page.locator('table tbody tr')
      .filter({ hasNotText: '$0.00' })
      .filter({ hasNotText: 'Cancelled' })
      .first();
    await row.locator('a').first().click();
  }

  await page.waitForURL(/\/invoices\/\w+/, { timeout: 10000 });
  await page.locator('h1').waitFor({ state: 'visible', timeout: 10000 });

  const issueBtn = page.getByRole('button', { name: 'Issue' });
  const hasIssueBtn = await issueBtn.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
  if (hasIssueBtn) {
    await issueBtn.click();
    const issueDialog = page.getByRole('dialog');
    await expect(issueDialog).toBeVisible({ timeout: 5000 });
    const futureDate = new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10);
    await issueDialog.locator('#dueDate').fill(futureDate);
    await issueDialog.getByRole('button', { name: /Confirm Issue/i }).click();
    await expect(issueDialog).toBeHidden({ timeout: 5000 });
  }

  const recordPayBtn = page.getByRole('button', { name: 'Record Payment' });
  await expect(recordPayBtn).toBeVisible({ timeout: 10000 });
  await recordPayBtn.click();

  const payDialog = page.getByRole('dialog');
  await expect(payDialog).toBeVisible({ timeout: 5000 });
  await payDialog.locator('#pay-amount').fill('10.00');
  await payDialog.getByRole('button', { name: 'Record Payment' }).click();
  await expect(payDialog).toBeHidden({ timeout: 5000 });
}
