import type { Page } from '@playwright/test';

export type DevRole = 'executive' | 'developer' | 'operations';

/** Set mock role before app loads (BFF reads Authorization from localStorage-driven header on next requests via reload). */
export async function setRole(page: Page, role: DevRole) {
  await page.addInitScript((r) => {
    localStorage.setItem('dev-role', r);
  }, role);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

export async function switchRoleViaUi(page: Page, role: DevRole) {
  await page.getByRole('button').filter({ has: page.locator('svg') }).last().click();
  await page.getByRole('menuitem', { name: new RegExp(role, 'i') }).click();
  await page.waitForLoadState('networkidle');
}
