import { test, expect } from '@playwright/test';
import { setRole } from './helpers';

test.describe('Dashboard', () => {
  test('loads for developer and shows summary cards', async ({ page }) => {
    await setRole(page, 'developer');
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    await expect(page.getByText(/applications/i).first()).toBeVisible();
    await expect(page.getByText(/recent pipeline runs/i)).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await setRole(page, 'developer');

    await page.getByRole('link', { name: 'Applications' }).click();
    await expect(page).toHaveURL(/\/applications/);
    await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible();

    await page.getByRole('link', { name: 'Runs' }).click();
    await expect(page).toHaveURL(/\/runs/);
    await expect(page.getByRole('heading', { name: /pipeline runs/i })).toBeVisible();

    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
  });
});
