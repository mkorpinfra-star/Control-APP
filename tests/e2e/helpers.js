import { expect } from '@playwright/test';

export const CREDS = {
  admin: { email: process.env.QA_EMAIL || 'felipe.garcia@mkorp.com.br', senha: process.env.QA_PASS || 'Mkorp2026' },
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
