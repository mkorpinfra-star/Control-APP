// Garante que o endurecimento NÃO quebrou os fluxos legítimos de cada perfil.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
if (!/127\.0\.0\.1|localhost/.test(URL)) throw new Error('somente ambiente local');
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const svc = createClient(URL, process.env.SERVICE_KEY, opts);
async function entrar(n) {
  const c = createClient(URL, process.env.ANON_KEY, opts);
  const { data, error } = await c.auth.signInWithPassword({ email: `${n}@teste.local`, password: 'Teste@12345' });
  if (error) throw error; c.uid = data.user.id; return c;
}
let admin, sup, almox, ele, inativo, ids = {};
before(async () => {
  [admin, sup, almox, ele, inativo] = await Promise.all(['admin', 'supervisor', 'almox', 'eletricista', 'inativo'].map(entrar));
  ids.item = (await svc.from('almoxarifado_itens').select('id').limit(1).single()).data.id;
  ids.os = (await svc.from('ordens_servico').select('id').eq('responsavel_id', ele.uid).limit(1).single()).data.id;
});
const ok = ({ error }) => assert.ifError(error);

test('F1 admin lista funcionários (inclusive inativos) e lê CPF', async () => {
  const { data } = await admin.from('usuarios').select('id, ativo');
  assert.ok(data.length >= 6 && data.some(u => u.ativo === false));
  const { data: docs } = await admin.from('usuarios_documentos').select('cpf');
  assert.ok(docs.length >= 1);
});

test('F2 admin altera cargo e acessos de um funcionário', async () => {
  ok(await admin.from('usuarios').update({ acessos: { relatorios: true } }).eq('id', ele.uid).select().single());
  ok(await admin.from('usuarios').update({ acessos: null }).eq('id', ele.uid));
});

test('F3 funcionário lê o próprio perfil e altera o próprio telefone', async () => {
  ok(await ele.from('usuarios').update({ telefone: '(11) 90000-0000' }).eq('id', ele.uid).select().single());
});

test('F4 usuário inativo consegue ler o próprio perfil (para o app avisar que está desativado)', async () => {
  const { data } = await inativo.from('usuarios').select('ativo').eq('id', inativo.uid).single();
  assert.equal(data.ativo, false);
});

test('F5 ciclo do ponto: rascunho → enviado → aprovado pelo supervisor → fechado pelo admin', async () => {
  const dia = '2026-02-02';
  const { data: p, error } = await ele.from('controle_ponto').insert({ usuario_id: ele.uid, data: dia, hora_entrada: '08:00', status: 'rascunho', latitude_entrada: -23.5, longitude_entrada: -46.6 }).select().single();
  assert.ifError(error);
  ok(await ele.from('controle_ponto').update({ hora_saida: '17:00', status: 'enviado' }).eq('id', p.id).select().single());
  const { data: ap, error: e2 } = await sup.from('controle_ponto').update({ status: 'aprovado' }).eq('id', p.id).select().single();
  assert.ifError(e2);
  assert.equal(ap.aprovado_por, sup.uid, 'aprovado_por deve ser preenchido pelo servidor');
  ok(await admin.from('controle_ponto').update({ status: 'fechado' }).eq('id', p.id).select().single());
  const { data: trilha } = await ele.from('ponto_ajustes').select('status_depois, gps').eq('ponto_id', p.id).order('id');
  assert.deepEqual(trilha.map(t => t.status_depois), ['rascunho', 'enviado', 'aprovado', 'fechado']);
  assert.equal(trilha[0].gps.latitude_entrada, -23.5);
});

test('F6 ponto rejeitado pode ser corrigido e reenviado', async () => {
  const { data: p } = await ele.from('controle_ponto').insert({ usuario_id: ele.uid, data: '2026-02-03', hora_entrada: '08:00', status: 'enviado' }).select().single();
  ok(await sup.from('controle_ponto').update({ status: 'rejeitado', motivo_rejeicao: 'faltou saída' }).eq('id', p.id));
  ok(await ele.from('controle_ponto').update({ hora_saida: '17:00', status: 'enviado' }).eq('id', p.id).select().single());
});

test('F7 almoxarife: cadastra item (saldo criado automaticamente), dá entrada e saída', async () => {
  const { data: item, error } = await almox.from('almoxarifado_itens').insert({ nome: 'Rele teste', categoria: 'rele_fotoeletrico', unidade: 'un' }).select().single();
  assert.ifError(error);
  const { data: s1 } = await almox.rpc('estoque_entrada', { p_item_id: item.id, p_quantidade: 5, p_observacao: 'NF 1' });
  assert.equal(Number(s1), 5);
  const { data: s2 } = await almox.rpc('estoque_saida', { p_item_id: item.id, p_quantidade: 2, p_observacao: 'perda' });
  assert.equal(Number(s2), 3);
  const { data: movs } = await almox.from('movimentacoes_estoque').select('tipo').eq('item_id', item.id);
  assert.equal(movs.length, 2);
});

test('F8 requisição: funcionário cria (catálogo + texto livre), almoxarife responde e aprova', async () => {
  await svc.from('almoxarifado_estoque').update({ quantidade: 10 }).eq('item_id', ids.item);
  const { data: id, error } = await ele.rpc('criar_requisicao', { p_os_id: ids.os, p_itens: [{ item_id: ids.item, quantidade: 2 }, { nome_livre: 'Fita isolante', quantidade: 1 }] });
  assert.ifError(error);
  const { data: req } = await almox.from('requisicoes').select('*, requisicao_itens(*)').eq('id', id).single();
  assert.equal(req.requisicao_itens.length, 2);
  const livre = req.requisicao_itens.find(i => !i.item_id);
  ok(await almox.from('requisicao_itens').update({ disponivel: false, resposta_almoxarife: 'Chega sexta' }).eq('id', livre.id));
  ok(await almox.rpc('aprovar_requisicao', { p_requisicao_id: id }));
  const { data: depois } = await ele.from('requisicoes').select('status, aprovado_por').eq('id', id).single();
  assert.equal(depois.status, 'aprovada');
  assert.equal(depois.aprovado_por, almox.uid);
});

test('F9 funcionário cancela a própria requisição pendente', async () => {
  const { data: id } = await ele.rpc('criar_requisicao', { p_os_id: null, p_itens: [{ item_id: ids.item, quantidade: 1 }] });
  ok(await ele.rpc('cancelar_requisicao', { p_requisicao_id: id }));
});

test('F10 responsável em campo: vê sua OS, inicia, registra execução e comenta', async () => {
  const { data: minhas } = await ele.from('ordens_servico').select('id');
  assert.ok(minhas.some(o => o.id === ids.os));
  ok(await ele.from('ordens_servico').update({ status: 'em_andamento', latitude: -23.5, longitude: -46.6 }).eq('id', ids.os).select().single());
  const { error: e2 } = await ele.from('ordens_servico').update({ responsavel_id: null }).eq('id', ids.os).select().single();
  assert.ok(e2, 'funcionário não deveria trocar o responsável');
  ok(await ele.from('registros_campo').insert({ os_id: ids.os, usuario_id: ele.uid, descricao: 'Troca de lâmpada', status_apos: 'parcial', fotos: [] }).select().single());
  ok(await ele.from('os_comentarios').insert({ os_id: ids.os, usuario_id: ele.uid, texto: 'Chegando' }).select().single());
});

test('F11 supervisor cria OS e contrato; admin lê auditoria', async () => {
  const { data: c, error } = await sup.from('contratos').insert({ nome: 'Contrato Sup', municipio: 'X', estado: 'SP' }).select().single();
  assert.ifError(error);
  ok(await sup.from('ordens_servico').insert({ numero: 9001, contrato_id: c.id, tipo_defeito: 'outro' }).select().single());
  ok(await ele.from('audit_log').insert({ usuario_id: ele.uid, acao: 'teste_app' }));
  const { data } = await admin.from('audit_log').select('acao');
  assert.ok(data.length > 0);
});

test('F12 notificações: qualquer ativo notifica gestores; cada um só lê as suas', async () => {
  ok(await ele.from('notificacoes').insert({ usuario_id: sup.uid, titulo: 'Ponto enviado', lida: false }));
  const { data: minhas } = await sup.from('notificacoes').select('usuario_id');
  assert.ok(minhas.length > 0 && minhas.every(n => n.usuario_id === sup.uid));
  const { data: alheias } = await ele.from('notificacoes').select('id').eq('usuario_id', sup.uid);
  assert.equal(alheias.length, 0);
});
