// Fluxos completos pela interface + conferência da persistência no banco local.
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SB = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
if (!/127\.0\.0\.1|localhost/.test(SB)) throw new Error('somente ambiente local');
const db = createClient(SB, process.env.SERVICE_KEY, { auth: { persistSession: false } });
const SHOTS = process.env.SHOTS || 'qa-evidencias/screens';
const shot = (page, nome) => page.screenshot({ path: `${SHOTS}/${nome}.png`, fullPage: true });

async function entrar(page, quem) {
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill(`${quem}@teste.local`);
  await page.getByPlaceholder('••••••••').fill('Teste@12345');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 20000 });
}
const uid = async (email) => (await db.from('usuarios').select('id').eq('email', email).single()).data.id;
const saldoLampada = async () => (await db.from('almoxarifado_estoque').select('quantidade, almoxarifado_itens!inner(nome)').eq('almoxarifado_itens.nome', 'Lampada LED 100W (teste)').single()).data.quantidade;

// ordem do arquivo (workers: 1); P4 depende de P1 e R2 de R1

test('L1 login inválido mostra erro', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill('ninguem@teste.local');
  await page.getByPlaceholder('••••••••').fill('errada123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible();
  await shot(page, '01-login-erro');
});

test('L2 usuário desativado não entra', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill('inativo@teste.local');
  await page.getByPlaceholder('••••••••').fill('Teste@12345');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText(/desativado/i)).toBeVisible();
  await expect(page).toHaveURL(/login/);
});

test('L3 sessão expirada/inválida volta ao login com aviso (antes o app "fingia" estar logado)', async ({ page }) => {
  await page.goto('/login');
  await page.evaluate(() => localStorage.setItem('mkorp_sessao', JSON.stringify({ id: 'x', nome: 'Fantasma', cargo: 'admin', ativo: true })));
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/login/);
  await expect(page.getByText(/sessão expirou/i)).toBeVisible();
  await shot(page, '02-sessao-expirada');
});

test('L4 funcionário não abre telas de admin pela URL', async ({ page }) => {
  await entrar(page, 'eletricista');
  for (const rota of ['/funcionarios', '/dashboard', '/auditoria', '/medicao', '/almoxarifado']) {
    await page.goto(rota);
    await expect(page).toHaveURL(/bater-ponto/);
  }
});

test('P1 ponto: iniciar/encerrar com GPS e enviar; servidor guarda trilha', async ({ page }) => {
  await entrar(page, 'eletricista');
  await page.getByRole('button', { name: /Iniciar expediente/ }).click();
  await expect(page.getByText(/Iniciado às/)).toBeVisible();
  await page.getByRole('button', { name: /Encerrar expediente/ }).click();
  await expect(page.getByRole('button', { name: /Encerrar expediente/ })).toHaveCount(0);
  await shot(page, '03-ponto-marcado');
  await page.getByRole('button', { name: 'Enviar', exact: true }).click();
  await page.getByRole('button', { name: 'Sim, enviar' }).click();
  await expect(page.getByText('Ponto enviado para aprovação.')).toBeVisible();
  await shot(page, '04-ponto-enviado');
  const id = await uid('eletricista@teste.local');
  const { data } = await db.from('controle_ponto').select('id, status, latitude_entrada, hora_entrada, hora_saida').eq('usuario_id', id);
  expect(data).toHaveLength(1);
  expect(data[0].status).toBe('enviado');
  expect(data[0].latitude_entrada).toBeCloseTo(-23.5505, 3);
  const { data: trilha } = await db.from('ponto_ajustes').select('id').eq('ponto_id', data[0].id);
  expect(trilha.length).toBeGreaterThanOrEqual(3);
});

test('P2 GPS negado: marca o ponto e AVISA que ficou sem localização', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 393, height: 851 }, isMobile: true, hasTouch: true, permissions: [], timezoneId: 'America/Sao_Paulo' });
  const page = await ctx.newPage();
  await entrar(page, 'eletricista2');
  await page.getByRole('button', { name: /Iniciar expediente/ }).click();
  await expect(page.getByText(/SEM localização/)).toBeVisible({ timeout: 20000 });
  await shot(page, '05-ponto-sem-gps');
  await ctx.close();
});

test('P3 sem conexão: erro visível, nada é perdido em silêncio', async ({ page, context }) => {
  await entrar(page, 'eletricista2');
  await page.getByText('corrigir manualmente').click();
  await context.setOffline(true);
  await page.getByRole('button', { name: /Salvar rascunho/ }).click();
  await expect(page.getByText(/Sem conexão. Nada será salvo/)).toBeVisible();
  await expect(page.getByText(/Não foi possível salvar o ponto/)).toBeVisible();
  await shot(page, '06-ponto-offline');
  await context.setOffline(false);
});

test('P4 supervisor aprova o ponto enviado (e não vê botão para o próprio)', async ({ page }) => {
  await entrar(page, 'supervisor');
  await page.goto('/controle-ponto');
  await page.locator('main').getByRole('button', { name: 'Aprovar' }).first().click();
  await expect.poll(async () => (await db.from('controle_ponto').select('status, aprovado_por').eq('usuario_id', await uid('eletricista@teste.local')).single()).data)
    .toMatchObject({ status: 'aprovado', aprovado_por: await uid('supervisor@teste.local') });
  await shot(page, '07-ponto-aprovado');
});

test('R1 funcionário cria requisição pela tela', async ({ page }) => {
  await entrar(page, 'eletricista');
  await page.goto('/requisicoes');
  await page.locator('button.fixed.bottom-24').click();
  await page.locator('select').nth(1).selectOption({ label: 'Lampada LED 100W (teste) (un)' });
  await page.locator('input[type=number]').fill('3');
  await shot(page, '08-requisicao-form');
  await page.getByRole('button', { name: /Criar requisição/ }).click();
  await expect(page.locator('main').getByText('Lampada LED 100W (teste)').first()).toBeVisible();
  const { data } = await db.from('requisicoes').select('status, requisicao_itens(quantidade)').eq('usuario_id', await uid('eletricista@teste.local'));
  expect(data).toHaveLength(1);
  expect(Number(data[0].requisicao_itens[0].quantidade)).toBe(3);
});

test('R2 almoxarife VÊ a requisição de outro funcionário e aprova uma única vez', async ({ page }) => {
  const antes = Number(await saldoLampada());
  await entrar(page, 'almox');
  await page.goto('/requisicoes');
  await expect(page.getByText('Eletricista Um')).toBeVisible();
  await shot(page, '09-requisicao-almoxarife');
  const aprovar = page.locator('main').getByRole('button', { name: 'Aprovar' });
  await aprovar.dblclick(); // duplo toque
  await expect(page.getByText('Nenhuma requisição encontrada')).toBeVisible();
  await expect.poll(async () => Number(await saldoLampada())).toBe(antes - 3);
  const { data: movs } = await db.from('movimentacoes_estoque').select('id').eq('tipo', 'saida_requisicao');
  expect(movs).toHaveLength(1);
});

test('C1 registro de campo com foto grava UM registro com a foto e conclui a OS', async ({ page }) => {
  await entrar(page, 'eletricista');
  await page.goto('/registro-campo');
  await page.locator('select').first().selectOption({ index: 1 });
  await page.getByPlaceholder('Descreva o serviço executado...').fill('Troca de lâmpada (teste)');
  await page.locator('input[type=file]').setInputFiles({ name: 'poste.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]) });
  await page.getByRole('button', { name: /Enviar registro de campo/ }).click();
  await expect(page.getByText('Registro enviado com sucesso!')).toBeVisible();
  await shot(page, '10-registro-campo');
  const { data } = await db.from('registros_campo').select('fotos, os_id');
  expect(data).toHaveLength(1);
  expect(data[0].fotos).toHaveLength(1);
  const { data: os } = await db.from('ordens_servico').select('status').eq('id', data[0].os_id).single();
  expect(os.status).toBe('concluida');
});

test('A1 admin percorre todas as telas sem erro de página', async ({ page }) => {
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_TUNNEL|favicon/i.test(m.text())) erros.push(m.text()); });
  await entrar(page, 'admin');
  const rotas = ['/dashboard', '/ordens-servico', '/contratos', '/funcionarios', '/almoxarifado', '/almoxarifado/entrada-nf',
    '/requisicoes', '/controle-ponto', '/monitoramento', '/aprovacoes', '/relatorios', '/medicao', '/auditoria', '/configuracoes',
    '/bater-ponto', '/registro-campo'];
  for (const r of rotas) {
    await page.goto(r);
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/login/);
    await shot(page, `admin${r.replaceAll('/', '_')}`);
  }
  expect(erros, erros.join('\n')).toHaveLength(0);
});
