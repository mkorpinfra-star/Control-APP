import { test, expect } from '@playwright/test';
import { login, CREDS } from './helpers.js';

// Navegação admin sem erro de console
test('admin navega pelas áreas principais sem crashar', async ({ page }) => {
  const erros = [];
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });

  await login(page, CREDS.admin);

  const rotas = ['/ordens-servico', '/contratos', '/funcionarios', '/almoxarifado', '/requisicoes', '/controle-ponto', '/medicao', '/relatorios', '/configuracoes'];
  for (const r of rotas) {
    await page.goto(r);
    await page.waitForTimeout(800);
    // a tela não deve ter voltado pro login
    await expect(page).not.toHaveURL(/login/);
  }

  // ignora ruídos conhecidos (favicon etc.)
  const relevantes = erros.filter(e => !/favicon|manifest|sourcemap/i.test(e));
  expect(relevantes, 'erros de console: ' + relevantes.join(' | ')).toHaveLength(0);
});

test('dashboard exibe cards de indicadores', async ({ page }) => {
  await login(page, CREDS.admin);
  await page.goto('/dashboard');
  await expect(page.getByText(/OS abertas|Em andamento|Concluídas/i).first()).toBeVisible();
});
