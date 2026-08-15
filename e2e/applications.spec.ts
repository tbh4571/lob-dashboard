import { test, expect } from '@playwright/test';
import { setRole } from './helpers';

test.describe('Applications & Components', () => {
  test('lists applications and opens detail', async ({ page }) => {
    await setRole(page, 'developer');
    await page.goto('/applications');

    await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible();
    const appCard = page.getByRole('link', { name: /customer portal/i }).first();
    await expect(appCard).toBeVisible();
    await appCard.click();

    await expect(page).toHaveURL(/\/applications\/app-1/);
    await expect(page.getByRole('heading', { name: /customer portal/i })).toBeVisible();
    await expect(page.getByText(/components/i).first()).toBeVisible();
  });

  test('opens component detail with environments', async ({ page }) => {
    await setRole(page, 'developer');
    await page.goto('/components/comp-1');

    await expect(page.getByRole('heading', { name: /portal-ui/i })).toBeVisible();
    await expect(page.getByText(/environments/i).first()).toBeVisible();
    await expect(page.getByText(/nonprod/i).first()).toBeVisible();
    await expect(page.getByText(/production/i).first()).toBeVisible();
  });
});
