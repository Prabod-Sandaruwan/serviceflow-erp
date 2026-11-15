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

  const approveBtn = page.getByRole('button', { name: 'Approve' });
  if (await approveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await approveBtn.click();
    await expect(page.getByText(/Quotation approved/i)).toBeVisible({ timeout: 5000 });
  }
}

export async function createProject(page: Page) {
  const createProjBtn = page.getByRole('button', { name: 'Create Project' });
  if (await createProjBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await createProjBtn.click();
    await page.waitForURL(/\/projects\/\w+/, { timeout: 10000 });
  } else {
    await page.goto('/projects');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const row = page.locator('table tbody tr').first();
    await row.getByRole('link').first().click();
    await page.waitForURL(/\/projects\/\w+/, { timeout: 10000 });
  }
}

export async function issueInvoiceAndPay(page: Page) {
  await page.goto('/invoices');
  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  const payableRow = page.locator('table tbody tr').filter({ hasText: /Partially Paid|Issued|Draft/i }).first();
  if (await payableRow.isVisible({ timeout: 2000 }).catch(() => false)) {
    await payableRow.getByRole('link').first().click();
  } else {
    await page.locator('table tbody tr').first().getByRole('link').first().click();
  }
  await page.waitForURL(/\/invoices\/\w+/, { timeout: 10000 });

  const issueBtn = page.getByRole('button', { name: 'Issue' });
  if (await issueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await issueBtn.click();
    const futureDate = new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10);
    await page.locator('#dueDate').fill(futureDate);
    await page.getByRole('button', { name: /Confirm Issue/i }).click();
    await expect(page.getByText(/Invoice issued successfully/i)).toBeVisible({ timeout: 5000 });
  }

  const recordPayBtn = page.getByRole('button', { name: 'Record Payment' });
  await recordPayBtn.waitFor({ state: 'visible', timeout: 5000 });
  await recordPayBtn.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  const submitBtn = dialog.getByRole('button', { name: 'Record Payment' });
  await submitBtn.click();
}
