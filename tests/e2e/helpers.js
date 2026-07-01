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
  // espera sair da tela de login
  await expect(page.getByRole('button', { name: 'Entrar' })).toHaveCount(0, { timeout: 15000 });
}
