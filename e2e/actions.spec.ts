import { test, expect } from '@playwright/test';
import { setRole } from './helpers';

test.describe('Rebase & Repave actions', () => {
  test('executive does not see action buttons', async ({ page }) => {
    await setRole(page, 'executive');
    await page.goto('/components/comp-1');

    await expect(page.getByRole('button', { name: /^rebase$/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^repave$/i })).toHaveCount(0);
  });

  test('developer can open repave dialog and select nonprod', async ({ page }) => {
    await setRole(page, 'developer');
    await page.goto('/components/comp-1');

    await expect(page.getByRole('button', { name: /^rebase$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^repave$/i })).toBeVisible();

    await page.getByRole('button', { name: /^repave$/i }).click();
    await expect(page.getByRole('heading', { name: /repave component/i })).toBeVisible();

    const prodCheckbox = page.getByRole('checkbox', { name: /production/i });
    await expect(prodCheckbox).toBeDisabled();

    const nonprod = page.getByRole('checkbox', { name: /nonprod/i });
    await expect(nonprod).toBeEnabled();
  });

  test('operations can select production in repave dialog', async ({ page }) => {
    await setRole(page, 'operations');
    await page.goto('/components/comp-1');

    await page.getByRole('button', { name: /^repave$/i }).click();
    await expect(page.getByRole('heading', { name: /repave component/i })).toBeVisible();

    const prodCheckbox = page.getByRole('checkbox', { name: /production/i });
    await expect(prodCheckbox).toBeEnabled();
  });

  test('developer can trigger rebase and lands on run detail', async ({ page }) => {
    await setRole(page, 'developer');
    await page.goto('/components/comp-1');

    await page.getByRole('button', { name: /^rebase$/i }).click();

    await expect(page).toHaveURL(/\/runs\/run-/, { timeout: 15_000 });
    await expect(page.getByText(/rebase/i).first()).toBeVisible();
    await expect(page.getByText(/pipeline steps/i)).toBeVisible();
  });
});
