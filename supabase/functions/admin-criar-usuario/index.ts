// Edge Function: admin cria funcionário (login + perfil + CPF) de forma atômica.
// Substitui o `auth.signUp` público usado pelo app — com ela o signup público
// do Supabase pode (e deve) ficar DESLIGADO (Authentication → Providers → Email → "Allow new users to sign up").
// Deploy: supabase functions deploy admin-criar-usuario
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const CARGOS = ['admin', 'supervisor', 'almoxarife', 'eletricista', 'ajudante', 'motorista']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const caller = createClient(url, anonKey, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } })
    const { data: { user } } = await caller.auth.getUser()
    if (!user) return json({ error: 'Não autenticado' }, 401)

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const { data: perfil } = await admin.from('usuarios').select('cargo, ativo').eq('id', user.id).single()
    if (perfil?.cargo !== 'admin' || perfil?.ativo === false) return json({ error: 'Apenas administradores' }, 403)

    const b = await req.json()
    const email = String(b.email || '').trim().toLowerCase()
    const nome = String(b.nome || '').trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'E-mail inválido.' }, 400)
    if (!nome) return json({ error: 'Informe o nome.' }, 400)
    if (!CARGOS.includes(b.cargo)) return json({ error: 'Cargo inválido.' }, 400)
    if (!b.senha || String(b.senha).length < 8) return json({ error: 'A senha deve ter ao menos 8 caracteres.' }, 400)

    const { data: criado, error: e1 } = await admin.auth.admin.createUser({ email, password: String(b.senha), email_confirm: true })
    if (e1 || !criado?.user) return json({ error: 'Erro ao criar login: ' + (e1?.message || 'desconhecido') }, 400)
    const id = criado.user.id

    const { data: novo, error: e2 } = await admin.from('usuarios').insert({
      id, email, nome, cargo: b.cargo, matricula: b.matricula || null, telefone: b.telefone || null,
      data_admissao: b.data_admissao || null, ativo: true,
    }).select().single()
    if (e2) {
      await admin.auth.admin.deleteUser(id) // não deixa login "órfão" sem perfil
      return json({ error: 'Erro ao salvar perfil: ' + e2.message }, 400)
    }
    if (b.cpf) await admin.from('usuarios_documentos').upsert({ usuario_id: id, cpf: String(b.cpf) })
    await admin.from('audit_log').insert({
      usuario_id: user.id, acao: 'funcionario_criado', entidade: 'usuarios', entidade_id: id,
      dados_novos: { nome, cargo: b.cargo, email }, contexto: 'edge:admin-criar-usuario',
    })
    return json({ usuario: novo })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
