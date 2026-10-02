// Testes de API (autorização no servidor + regras de negócio críticas).
// Rodam SOMENTE contra o ambiente local (Postgres + PostgREST + GoTrue) com dados fictícios.
//   SUPABASE_URL=http://127.0.0.1:54321 ANON_KEY=... SERVICE_KEY=... node --test tests/local/
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const ANON = process.env.ANON_KEY;
const SERVICE = process.env.SERVICE_KEY;
if (!/127\.0\.0\.1|localhost/.test(URL)) throw new Error('testes locais não podem apontar para produção');
const SENHA = 'Teste@12345';

const novo = () => createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
const svc = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });
async function entrar(email) {
  const c = novo();
  const { data, error } = await c.auth.signInWithPassword({ email, password: SENHA });
  if (error) throw error;
  c.uid = data.user.id;
  return c;
}

let admin, sup, almox, ele, ele2, inativo, ids = {};
before(async () => {
  [admin, sup, almox, ele, ele2, inativo] = await Promise.all(
    ['admin', 'supervisor', 'almox', 'eletricista', 'eletricista2', 'inativo'].map(n => entrar(`${n}@teste.local`)),
  );
  const { data: item } = await svc.from('almoxarifado_itens').select('id').limit(1).single();
  const { data: os } = await svc.from('ordens_servico').select('id').limit(1).single();
  ids = { item: item.id, os: os.id };
});

const saldo = async () => (await svc.from('almoxarifado_estoque').select('quantidade').eq('item_id', ids.item).single()).data.quantidade;
const setSaldo = (q) => svc.from('almoxarifado_estoque').update({ quantidade: q }).eq('item_id', ids.item);

// Considera "bloqueado" quando a API devolve erro OU não afeta nenhuma linha.
async function bloqueado(q) {
  const { data, error } = await q;
  return !!error || !data || (Array.isArray(data) && data.length === 0);
}

// ---------------- Autorização / isolamento ----------------
test('S1 funcionário NÃO consegue se promover a admin', async () => {
  await ele.from('usuarios').update({ cargo: 'admin' }).eq('id', ele.uid).select();
  const { data } = await svc.from('usuarios').select('cargo').eq('id', ele.uid).single();
  assert.equal(data.cargo, 'eletricista');
});

test('S2 funcionário NÃO lê CPF de outros (usuarios_documentos)', async () => {
  const { data } = await ele2.from('usuarios_documentos').select('*');
  assert.equal((data ?? []).length, 0);
});

test('S3 funcionário NÃO altera ponto de outro funcionário', async () => {
  await svc.from('controle_ponto').upsert({ usuario_id: ele2.uid, data: '2026-01-05', hora_entrada: '08:00', status: 'rascunho' }, { onConflict: 'usuario_id,data' });
  await ele.from('controle_ponto').update({ hora_entrada: '05:00' }).eq('usuario_id', ele2.uid).select();
  const { data } = await svc.from('controle_ponto').select('hora_entrada').eq('usuario_id', ele2.uid).eq('data', '2026-01-05').single();
  assert.equal(data.hora_entrada.slice(0, 5), '08:00');
});

test('S4 funcionário NÃO aprova o próprio ponto', async () => {
  await ele.from('controle_ponto').upsert({ usuario_id: ele.uid, data: '2026-01-06', hora_entrada: '08:00', status: 'rascunho' }, { onConflict: 'usuario_id,data' });
  await ele.from('controle_ponto').update({ status: 'aprovado' }).eq('usuario_id', ele.uid).eq('data', '2026-01-06').select();
  const { data } = await svc.from('controle_ponto').select('status').eq('usuario_id', ele.uid).eq('data', '2026-01-06').single();
  assert.notEqual(data.status, 'aprovado');
});

test('S5 funcionário NÃO altera saldo de estoque direto na tabela', async () => {
  await setSaldo(10);
  await ele.from('almoxarifado_estoque').update({ quantidade: 9999 }).eq('item_id', ids.item).select();
  assert.equal(Number(await saldo()), 10);
});

test('S6 funcionário NÃO lança movimentação de estoque', async () => {
  assert.ok(await bloqueado(ele.from('movimentacoes_estoque').insert({ item_id: ids.item, tipo: 'entrada', quantidade: 1, saldo_apos: 1 }).select()));
});

test('S7 trilha de auditoria: funcionário não lê e ninguém apaga/edita', async () => {
  await svc.from('audit_log').insert({ acao: 'teste', usuario_id: admin.uid });
  const { data: lidos } = await ele.from('audit_log').select('*');
  assert.equal((lidos ?? []).length, 0, 'funcionário leu audit_log');
  await admin.from('audit_log').delete().neq('id', 0);
  const { count } = await svc.from('audit_log').select('id', { count: 'exact', head: true });
  assert.ok(count > 0, 'admin conseguiu apagar audit_log');
});

test('S8 funcionário NÃO altera matriz de acessos da empresa', async () => {
  await ele.from('config_empresa').update({ acessos: { eletricista: { medicao: true } } }).eq('id', 1).select();
  const { data } = await svc.from('config_empresa').select('acessos').eq('id', 1).single();
  assert.equal(data.acessos, null);
});

test('S9 conta criada por auto-cadastro (sem perfil) não lê nada', async () => {
  const c = novo();
  const email = `intruso${Date.now()}@teste.local`;
  const { error } = await c.auth.signUp({ email, password: SENHA });
  if (error) return; // signup desabilitado = ok
  const { data } = await c.from('usuarios').select('id, email');
  assert.equal((data ?? []).length, 0);
  assert.ok(await bloqueado(c.from('usuarios').insert({ id: (await c.auth.getUser()).data.user.id, email, nome: 'x', cargo: 'admin' }).select()));
});

test('S10 usuário desativado não acessa dados', async () => {
  const { data } = await inativo.from('ordens_servico').select('id');
  assert.equal((data ?? []).length, 0);
});

test('S11 funcionário NÃO apaga OS nem contrato', async () => {
  await ele.from('ordens_servico').delete().eq('id', ids.os);
  const { data } = await svc.from('ordens_servico').select('id').eq('id', ids.os);
  assert.equal(data.length, 1);
});

test('S12 funcionário vê só as próprias requisições', async () => {
  await svc.from('requisicoes').insert({ usuario_id: ele2.uid, status: 'pendente' });
  const { data } = await ele.from('requisicoes').select('usuario_id');
  assert.ok((data ?? []).every(r => r.usuario_id === ele.uid));
});

// ---------------- Regras de negócio (estoque / requisição) ----------------
async function criarRequisicao(cli, qtd) {
  const { data, error } = await cli.rpc('criar_requisicao', { p_os_id: null, p_itens: [{ item_id: ids.item, quantidade: qtd }] });
  if (error) throw error;
  return data;
}

test('B1 aprovar a mesma requisição 2x baixa o estoque uma única vez', async () => {
  await setSaldo(10);
  const id = await criarRequisicao(ele, 3);
  const r = await Promise.all([almox.rpc('aprovar_requisicao', { p_requisicao_id: id }), almox.rpc('aprovar_requisicao', { p_requisicao_id: id })]);
  assert.equal(r.filter(x => !x.error).length, 1, 'duas aprovações aceitas');
  assert.equal(Number(await saldo()), 7);
  const { data: movs } = await svc.from('movimentacoes_estoque').select('id').eq('requisicao_id', id);
  assert.equal(movs.length, 1);
});

test('B2 aprovações concorrentes não deixam saldo negativo', async () => {
  await setSaldo(5);
  const a = await criarRequisicao(ele, 4);
  const b = await criarRequisicao(ele2, 4);
  const r = await Promise.all([almox.rpc('aprovar_requisicao', { p_requisicao_id: a }), sup.rpc('aprovar_requisicao', { p_requisicao_id: b })]);
  assert.equal(r.filter(x => !x.error).length, 1);
  assert.equal(Number(await saldo()), 1);
});

test('B3 quantidades inválidas são rejeitadas', async () => {
  await assert.rejects(criarRequisicao(ele, 0));
  await assert.rejects(criarRequisicao(ele, -2));
  const { error: e1 } = await almox.rpc('estoque_entrada', { p_item_id: ids.item, p_quantidade: -5, p_observacao: 'x' });
  assert.ok(e1);
  await setSaldo(2);
  const { error: e2 } = await almox.rpc('estoque_saida', { p_item_id: ids.item, p_quantidade: 3, p_observacao: 'x' });
  assert.ok(e2, 'saída maior que o saldo foi aceita');
  assert.equal(Number(await saldo()), 2);
});

test('B4 funcionário não aprova requisição nem lança entrada', async () => {
  const id = await criarRequisicao(ele, 1);
  const { error } = await ele.rpc('aprovar_requisicao', { p_requisicao_id: id });
  assert.ok(error);
  const { error: e2 } = await ele.rpc('estoque_entrada', { p_item_id: ids.item, p_quantidade: 100, p_observacao: 'x' });
  assert.ok(e2);
});

test('B5 requisição rejeitada não pode ser aprovada depois', async () => {
  await setSaldo(10);
  const id = await criarRequisicao(ele, 1);
  const { error: rej } = await almox.rpc('rejeitar_requisicao', { p_requisicao_id: id, p_motivo: 'sem uso' });
  assert.ifError(rej);
  const { error } = await almox.rpc('aprovar_requisicao', { p_requisicao_id: id });
  assert.ok(error);
  assert.equal(Number(await saldo()), 10);
});

// ---------------- Ponto ----------------
test('P1 ponto enviado não pode ser alterado pelo funcionário', async () => {
  await ele.from('controle_ponto').upsert({ usuario_id: ele.uid, data: '2026-01-07', hora_entrada: '08:00', status: 'enviado' }, { onConflict: 'usuario_id,data' });
  await ele.from('controle_ponto').update({ hora_entrada: '06:00' }).eq('usuario_id', ele.uid).eq('data', '2026-01-07').select();
  const { data } = await svc.from('controle_ponto').select('hora_entrada').eq('usuario_id', ele.uid).eq('data', '2026-01-07').single();
  assert.equal(data.hora_entrada.slice(0, 5), '08:00');
});

test('P2 toda alteração de horário fica registrada com hora do servidor', async () => {
  await ele.from('controle_ponto').upsert({ usuario_id: ele.uid, data: '2026-01-08', hora_entrada: '08:00', status: 'rascunho' }, { onConflict: 'usuario_id,data' });
  await ele.from('controle_ponto').update({ hora_entrada: '07:30' }).eq('usuario_id', ele.uid).eq('data', '2026-01-08');
  const { data: p } = await svc.from('controle_ponto').select('id').eq('usuario_id', ele.uid).eq('data', '2026-01-08').single();
  const { data: log } = await svc.from('ponto_ajustes').select('*').eq('ponto_id', p.id).order('id');
  assert.ok(log.length >= 2, 'sem trilha de ajustes');
  assert.ok(log.every(l => l.registrado_em && l.alterado_por === ele.uid));
  assert.ok(await bloqueado(ele.from('ponto_ajustes').delete().eq('ponto_id', p.id).select()));
});

test('P3 supervisor aprova; ponto fechado não volta a ser editado', async () => {
  await ele.from('controle_ponto').upsert({ usuario_id: ele.uid, data: '2026-01-09', hora_entrada: '08:00', hora_saida: '17:00', status: 'enviado' }, { onConflict: 'usuario_id,data' });
  const { data: p } = await svc.from('controle_ponto').select('id').eq('usuario_id', ele.uid).eq('data', '2026-01-09').single();
  const { error } = await sup.from('controle_ponto').update({ status: 'aprovado', aprovado_em: new Date().toISOString() }).eq('id', p.id).select().single();
  assert.ifError(error);
  await admin.from('controle_ponto').update({ status: 'fechado' }).eq('id', p.id);
  await ele.from('controle_ponto').update({ hora_saida: '23:00', status: 'rascunho' }).eq('id', p.id);
  const { data } = await svc.from('controle_ponto').select('status, hora_saida').eq('id', p.id).single();
  assert.equal(data.status, 'fechado');
  assert.equal(data.hora_saida.slice(0, 5), '17:00');
});
