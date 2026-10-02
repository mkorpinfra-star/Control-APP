import { expect } from '@playwright/test';

// Credenciais SEMPRE via variável de ambiente (nunca versionar senha real).
// Ambiente local de testes: admin@teste.local / Teste@12345 (tests/local/seed.mjs)
export const CREDS = {
  admin: { email: process.env.QA_EMAIL || 'admin@teste.local', senha: process.env.QA_PASS || 'Teste@12345' },
};

// Faz login pela tela inicial
export async function login(page, { email, senha }) {
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
  // espera SAIR da rota de login (login pode levar alguns segundos)
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
  // garante que a sessão foi persistida
  await expect.poll(async () => await page.evaluate(() => !!localStorage.getItem('mkorp_sessao')), { timeout: 5000 }).toBe(true);
}
