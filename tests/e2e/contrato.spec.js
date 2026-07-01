import { test, expect } from '@playwright/test';
import { login, CREDS } from './helpers.js';

// Cria um contrato de teste e valida que aparece na lista
test('admin cria contrato de teste', async ({ page }) => {
  await login(page, CREDS.admin);
  await page.goto('/contratos');

  // abre o FAB (botão flutuante +)
  await page.locator('button.fixed.bottom-24').click();

  const nome = 'QA-E2E ' + Date.now();
  await page.getByPlaceholder('Ex: Prefeitura de São Paulo').fill(nome);
  await page.getByPlaceholder('Município').fill('Cidade Teste');
  await page.getByRole('button', { name: /Criar contrato/i }).click();

  await expect(page.getByText(nome)).toBeVisible({ timeout: 10000 });
});
