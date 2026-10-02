// Popula o ambiente LOCAL de testes com dados fictícios.
// NUNCA aponte para produção: exige SUPABASE_URL local (127.0.0.1/localhost).
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE = process.env.SERVICE_KEY;
if (!/127\.0\.0\.1|localhost/.test(URL)) throw new Error('seed.mjs só roda contra ambiente local');
if (!SERVICE) throw new Error('defina SERVICE_KEY');

const admin = createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });
export const SENHA = 'Teste@12345';
export const USUARIOS = [
  { email: 'admin@teste.local', nome: 'Admin Teste', cargo: 'admin', matricula: 'T-ADM' },
  { email: 'supervisor@teste.local', nome: 'Supervisor Teste', cargo: 'supervisor', matricula: 'T-SUP' },
  { email: 'almox@teste.local', nome: 'Almoxarife Teste', cargo: 'almoxarife', matricula: 'T-ALM' },
  { email: 'eletricista@teste.local', nome: 'Eletricista Um', cargo: 'eletricista', matricula: 'T-EL1' },
  { email: 'eletricista2@teste.local', nome: 'Eletricista Dois', cargo: 'eletricista', matricula: 'T-EL2' },
  { email: 'inativo@teste.local', nome: 'Funcionario Inativo', cargo: 'ajudante', matricula: 'T-INA', ativo: false },
];

const ids = {};
for (const u of USUARIOS) {
  const { data, error } = await admin.auth.admin.createUser({ email: u.email, password: SENHA, email_confirm: true });
  if (error) throw error;
  ids[u.cargo === 'eletricista' && ids.eletricista ? 'eletricista2' : (u.ativo === false ? 'inativo' : u.cargo)] = data.user.id;
  const { error: e2 } = await admin.from('usuarios').insert({ id: data.user.id, email: u.email, nome: u.nome, cargo: u.cargo, matricula: u.matricula, ativo: u.ativo ?? true });
  if (e2) throw e2;
}
await admin.from('usuarios_documentos').insert([{ usuario_id: ids.eletricista, cpf: '000.000.000-00' }]);
const { data: contrato } = await admin.from('contratos').insert({ nome: 'Contrato Ficticio', municipio: 'Cidade Teste', estado: 'SP' }).select().single();
const { data: os } = await admin.from('ordens_servico').insert({ numero: 5001, contrato_id: contrato.id, responsavel_id: ids.eletricista, tipo_defeito: 'lampada_queimada', bairro: 'Centro', status: 'aberta' }).select().single();
const { data: item } = await admin.from('almoxarifado_itens').insert({ nome: 'Lampada LED 100W (teste)', categoria: 'lampada', unidade: 'un', estoque_minimo: 2, valor_unitario: 50 }).select().single();
await admin.from('almoxarifado_estoque').insert({ item_id: item.id, quantidade: 10 });
await admin.from('config_empresa').upsert({ id: 1, nome: 'Empresa Ficticia' });
console.log(JSON.stringify({ ids, contrato: contrato.id, os: os.id, item: item.id }));
