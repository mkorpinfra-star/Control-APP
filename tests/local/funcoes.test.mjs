// Edge Functions rodando localmente (Deno) atrás do gateway: autorização e efeitos.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
if (!/127\.0\.0\.1|localhost/.test(URL)) throw new Error('somente ambiente local');
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const svc = createClient(URL, process.env.SERVICE_KEY, opts);
async function entrar(email, senha = 'Teste@12345') {
  const c = createClient(URL, process.env.ANON_KEY, opts);
  const { data, error } = await c.auth.signInWithPassword({ email, password: senha });
  if (error) throw error; c.uid = data.user.id; return c;
}
const corpo = async (error, data) => error ? (await error.context?.json?.().catch(() => null)) ?? { error: error.message } : data;
let admin, ele;
before(async () => { [admin, ele] = await Promise.all([entrar('admin@teste.local'), entrar('eletricista@teste.local')]); });

test('E1 admin cria funcionário pela função: login + perfil + CPF + auditoria', async () => {
  const email = `novo${Date.now()}@teste.local`;
  const { data, error } = await admin.functions.invoke('admin-criar-usuario', {
    body: { email, senha: 'Senha@1234', nome: 'Novo Teste', cargo: 'ajudante', cpf: '111.111.111-11', matricula: 'T-NOVO' } });
  assert.ifError(error);
  assert.equal(data.usuario.email, email);
  const novo = await entrar(email, 'Senha@1234');
  const { data: eu } = await novo.from('usuarios').select('cargo, ativo').eq('id', novo.uid).single();
  assert.deepEqual(eu, { cargo: 'ajudante', ativo: true });
  const { data: doc } = await svc.from('usuarios_documentos').select('cpf').eq('usuario_id', novo.uid).single();
  assert.equal(doc.cpf, '111.111.111-11');
  const { data: log } = await svc.from('audit_log').select('usuario_id').eq('acao', 'funcionario_criado').eq('entidade_id', novo.uid);
  assert.equal(log[0].usuario_id, admin.uid);
});

test('E2 funcionário NÃO cria usuário pela função', async () => {
  const { error, data } = await ele.functions.invoke('admin-criar-usuario', { body: { email: 'x@teste.local', senha: 'Senha@1234', nome: 'x', cargo: 'admin' } });
  assert.ok(error, 'deveria negar');
  assert.match((await corpo(error, data)).error, /administradores/);
});

test('E3 validações: cargo inválido, senha curta, e-mail inválido', async () => {
  for (const body of [
    { email: 'a@teste.local', senha: 'Senha@1234', nome: 'a', cargo: 'rei' },
    { email: 'b@teste.local', senha: '123', nome: 'b', cargo: 'ajudante' },
    { email: 'semarroba', senha: 'Senha@1234', nome: 'c', cargo: 'ajudante' },
  ]) {
    const { error } = await admin.functions.invoke('admin-criar-usuario', { body });
    assert.ok(error, JSON.stringify(body));
  }
});

test('E4 reset de senha: admin pode, funcionário não, senha curta recusada', async () => {
  const alvo = (await svc.from('usuarios').select('id').eq('email', 'eletricista2@teste.local').single()).data.id;
  const { error: negado } = await ele.functions.invoke('admin-reset-senha', { body: { user_id: alvo, nova_senha: 'Outra@1234' } });
  assert.ok(negado);
  const { error: curta } = await admin.functions.invoke('admin-reset-senha', { body: { user_id: alvo, nova_senha: '1234567' } });
  assert.ok(curta);
  const { error } = await admin.functions.invoke('admin-reset-senha', { body: { user_id: alvo, nova_senha: 'Outra@1234' } });
  assert.ifError(error);
  await entrar('eletricista2@teste.local', 'Outra@1234');
  await svc.auth.admin.updateUserById(alvo, { password: 'Teste@12345' });
});

test('E5 IA: funcionário de campo é bloqueado; sem token é 401', async () => {
  const { error, data } = await ele.functions.invoke('ia-imagem', { body: { tipo: 'nf', imagem: 'AAAA' } });
  assert.ok(error);
  assert.match((await corpo(error, data)).error, /permissão/i);
  const r = await fetch(`${URL}/functions/v1/ia-imagem`, { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } });
  assert.equal(r.status, 401);
});
