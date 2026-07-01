import { test, expect } from '@playwright/test';
import { login, CREDS } from './helpers.js';

test('admin acessa auditoria e vê registros', async ({ page }) => {
  await login(page, CREDS.admin);
  await page.goto('/auditoria');
  await page.waitForTimeout(1500);
  await expect(page).not.toHaveURL(/login|dashboard$/);
  // deve mostrar filtros de auditoria
  await expect(page.getByText(/registro/i).first()).toBeVisible();
});
