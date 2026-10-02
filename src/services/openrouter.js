// A chamada à IA passa pela Edge Function `ia-imagem` (supabase/functions/ia-imagem).
// A chave da OpenRouter fica apenas como secret no Supabase — nunca no bundle do app.
import { supabase } from './supabase';

async function chamarIA(tipo, base64Image) {
  const { data, error } = await supabase.functions.invoke('ia-imagem', { body: { tipo, imagem: base64Image } });
  if (error) throw new Error('Erro ao chamar IA');
  if (data?.error) throw new Error(data.error);
  return data?.texto ?? '';
}

export async function extrairItensNF(base64Image) {
  const texto = await chamarIA('nf', base64Image);
  try {
    const match = texto.match(/\[[\s\S]*\]/);
    const itens = match ? JSON.parse(match[0]) : [];
    return Array.isArray(itens) ? itens.filter(i => i && typeof i.nome === 'string') : [];
  } catch {
    return [];
  }
}

export async function descreverFotoObra(base64Image) {
  return chamarIA('obra', base64Image);
}
