// Edge Function: admin redefine a senha de um funcionário.
// Só um usuário com cargo 'admin' consegue chamar.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization') || ''

    // Identifica quem chamou
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: uErr } = await caller.auth.getUser()
    if (uErr || !user) return json({ error: 'Não autenticado' }, 401)

    // Confirma que é admin
    const admin = createClient(url, serviceKey)
    const { data: perfil } = await admin.from('usuarios').select('cargo').eq('id', user.id).single()
    if (perfil?.cargo !== 'admin') return json({ error: 'Apenas administradores' }, 403)

    const { user_id, nova_senha } = await req.json()
    if (!user_id || !nova_senha || String(nova_senha).length < 6)
      return json({ error: 'Informe o usuário e uma senha com ao menos 6 caracteres.' }, 400)

    const { error } = await admin.auth.admin.updateUserById(user_id, { password: nova_senha })
    if (error) return json({ error: error.message }, 400)

    return json({ ok: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
