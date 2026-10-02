// Edge Function: proxy para a OpenRouter. A chave fica SÓ no servidor
// (antes ia no bundle do app via VITE_OPENROUTER_KEY e qualquer um podia extraí-la).
// Deploy:  supabase secrets set OPENROUTER_KEY=...  &&  supabase functions deploy ia-imagem
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const PROMPTS: Record<string, string> = {
  nf: `Você é um assistente que lê notas fiscais de materiais elétricos/iluminação pública.
Analise a imagem e extraia TODOS os itens com suas quantidades e unidades.
Responda APENAS com um JSON válido no formato:
[{"nome": "Nome do produto", "quantidade": 10, "unidade": "un"}]
Se não conseguir identificar nenhum item, retorne [].
Não inclua texto fora do JSON.`,
  obra: 'Descreva resumidamente o que está nesta foto de obra de iluminação pública. Seja objetivo em 1-2 frases.',
}
const MAX_BASE64 = 6_000_000 // ~4,5 MB de imagem

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const key = Deno.env.get('OPENROUTER_KEY')
    if (!key) return json({ error: 'IA não configurada no servidor' }, 503)

    // Só usuários ativos e com papel de estoque/gestão
    const caller = createClient(url, anonKey, { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } })
    const { data: { user } } = await caller.auth.getUser()
    if (!user) return json({ error: 'Não autenticado' }, 401)
    const { data: cargo } = await caller.rpc('meu_cargo')
    if (!['admin', 'almoxarife', 'supervisor'].includes(cargo)) return json({ error: 'Sem permissão' }, 403)

    const { tipo, imagem } = await req.json()
    if (!PROMPTS[tipo] || typeof imagem !== 'string' || imagem.length > MAX_BASE64)
      return json({ error: 'Requisição inválida' }, 400)

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://app.mkorp.com.br' },
      body: JSON.stringify({
        model: Deno.env.get('OPENROUTER_MODEL') || 'google/gemini-3-flash-preview',
        max_tokens: 4000,
        messages: [{ role: 'user', content: [
          { type: 'text', text: PROMPTS[tipo] },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imagem}` } },
        ] }],
      }),
      signal: AbortSignal.timeout(45_000),
    })
    if (!r.ok) return json({ error: 'Falha no serviço de IA' }, 502)
    const out = await r.json()
    return json({ texto: out?.choices?.[0]?.message?.content ?? '' })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
