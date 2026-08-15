import { test, expect } from '@playwright/test';
import { setRole } from './helpers';

test.describe('Pipeline Runs', () => {
  test('lists runs and filters by type', async ({ page }) => {
    await setRole(page, 'executive');
    await page.goto('/runs');

    await expect(page.getByRole('heading', { name: /pipeline runs/i })).toBeVisible();

    await page.getByRole('button', { name: /ci \/ rebase/i }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('a[href*="/runs/"]').first()).toBeVisible();

    await page.getByRole('button', { name: /cd \/ repave/i }).click();
    await page.waitForTimeout(300);
  });

  test('opens run detail with subway map steps', async ({ page }) => {
    await setRole(page, 'developer');
    await page.goto('/runs');

    const firstRun = page.locator('a[href*="/runs/"]').first();
    await expect(firstRun).toBeVisible();
    await firstRun.click();

    await expect(page).toHaveURL(/\/runs\/run-/);
    await expect(page.getByText(/pipeline steps/i)).toBeVisible();

    await expect(
      page.getByText(/checkout|build|deploy|approve|fetch artifact/i).first(),
    ).toBeVisible();

    await expect(page.getByText(/start/i).first()).toBeVisible();
  });
});
