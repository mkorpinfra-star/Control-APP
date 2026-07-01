import { test, expect } from '@playwright/test';
import { login, CREDS } from './helpers.js';

test('login inválido mostra erro', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill('naoexiste@mkorp.com.br');
  await page.getByPlaceholder('••••••••').fill('senhaerrada');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText(/incorret|não encontrado/i)).toBeVisible();
});

test('login válido entra no app', async ({ page }) => {
  await login(page, CREDS.admin);
  // Admin cai no dashboard
  await expect(page).toHaveURL(/dashboard|\/$/);
});

test('rota protegida redireciona sem sessão', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/login/);
});
