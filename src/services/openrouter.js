const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function chamarIA(messages, model = 'google/gemini-2.0-flash-exp:free') {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://app.mkorp.com.br',
    },
    body: JSON.stringify({ model, messages }),
  });
  if (!res.ok) throw new Error('Erro ao chamar IA');
  const json = await res.json();
  return json.choices[0].message.content;
}

export async function extrairItensNF(base64Image) {
  const prompt = `Você é um assistente que lê notas fiscais de materiais elétricos/iluminação pública.
Analise a imagem e extraia TODOS os itens com suas quantidades e unidades.
Responda APENAS com um JSON válido no formato:
[{"nome": "Nome do produto", "quantidade": 10, "unidade": "un"}]
Se não conseguir identificar nenhum item, retorne [].
Não inclua texto fora do JSON.`;

  const texto = await chamarIA([
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      ],
    },
  ]);

  try {
    const match = texto.match(/\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}

export async function descreverFotoObra(base64Image) {
  const texto = await chamarIA([
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Descreva resumidamente o que está nesta foto de obra de iluminação pública. Seja objetivo em 1-2 frases.' },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
      ],
    },
  ]);
  return texto;
}
