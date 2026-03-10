Execute auditoria ULTRA-FINA completa agora. LEIA .claude/skills/auditar-pagina.md PRIMEIRO.

⚠️ REGRA #1: VOCÊ EDITA OS ARQUIVOS. NUNCA liste correções para "aplicação manual". Se Edit falhar → READ o arquivo → tentar Edit de novo. NUNCA desistir.

---

## ORDEM OBRIGATÓRIA DOS PASSOS (NÃO PODE ALTERAR)

PASSO 1 — REGRAS: Leia CLAUDE.md + TODOS os 11 arquivos em .claude/rules/ + .claude/skills/auditar-pagina.md.

PASSO 2 — PESQUISA GOOGLE (ANTES DE QUALQUER EDIÇÃO): Pesquise o tema do H1 no Google. Entre nos 5 primeiros resultados orgânicos. Liste os H2/H3 de cada. Compare com a página. Se faltam tópicos → ANOTAR para criar depois. 🔍 STOP GATE: Imprima "🔍 PESQUISA: [URL1], [URL2], [URL3], [URL4], [URL5]" com 5 URLs reais. Se não listou URLs reais → AUDIT INVÁLIDA.

PASSO 3 — MAPEAMENTO: Abra o HTML e mapeie toda seção (linha, ID, H2, layout, container). Identifique duplicatas, IDs faltantes, containers errados, layouts verticais.

PASSO 4 — CORREÇÕES ESTRUTURAIS: Corrija containers, adicione IDs, mescle duplicatas, converta verticais em grid. Corrija TODOS os `href="../"` para `href="#secao"`. NAVEGAÇÃO não é "pendência do cliente" — corrija AGORA.

PASSO 5 — CRIAR SEÇÕES DO GOOGLE: Com base na pesquisa do PASSO 2, CRIE as seções faltantes COM conteúdo real (mín 3 parágrafos + DaisyUI + imagem). Cada seção nova DEVE ter imagem (Unsplash ou Google Images).

PASSO 5.5 — @LAYER BASE + TAILWIND CDN (OBRIGATÓRIO):
1. O CSS tem `<style type="text/tailwindcss">` com `@layer base { h1 {...} h2 {...} ... }`? Se NÃO → ADICIONAR/CORRIGIR.
2. O @layer base está em `<style>` normal (sem `type="text/tailwindcss"`)? Se SIM → MOVER (Tailwind CDN ignora @layer base em `<style>` normal).
3. Valores: h1=32.44px/800, h2=28.83px/400. Se 48px ou 36px → ERRADO → CORRIGIR.
4. Algum H2/H3 tem classe Tailwind de tamanho (text-5xl, text-2xl, font-bold) → REMOVER agora.
📐 STOP GATE: Imprima "📐 TYPESCALE: [h1=32.44px ✅/❌] [h2=28.83px ✅/❌] [style type=text/tailwindcss ✅/❌] [classes Tailwind em headings: 0 ✅/N❌]"
Se alguma ❌ → CORRIGIR AGORA.

PASSO 5.7 — CONTRASTE TEXTO × FUNDO (OBRIGATÓRIO):
Para CADA seção, verificar se texto é legível contra o fundo.
- Fundo escuro (bg-black, bg-gray-900, from-gray-900) → texto DEVE ser text-white ou text-gray-100
- Fundo claro (bg-white, bg-gray-50) → texto DEVE ser text-gray-900 ou text-gray-800
- Fundo vermelho (from-red-600) → texto DEVE ser text-white. Span text-red-600 → INVISÍVEL → REMOVER/trocar.
- text-gray-400 em fundo escuro → PROIBIDO → trocar para text-gray-100
🎨 STOP GATE: Imprima "🎨 CONTRASTE: [seção1: ✅/❌], [seção2: ✅/❌]..."
Se alguma ❌ → CORRIGIR AGORA.

PASSO 6 — AUDITORIA SEÇÃO POR SEÇÃO: Para CADA seção, verificar TODOS os itens do checklist (skill 1.1 a 1.15). Para CADA seção responder: "O dono teria orgulho?" Se não → REDESENHAR.

PASSO 7 — VERIFICAR ORDEM: Seções devem seguir: Benefícios → Incluído → Tipos → CTA → Investimento → Processo → FAQ → Outros → Contato. Mover se necessário.

PASSO 8 — NAVEGAÇÃO: Menu máx 7-8 itens. Ordem = ordem das seções. "Início" = #hero. NUNCA ../. 🧭 STOP GATE: Imprima "🧭 NAV: [item1→#id1], [item2→#id2]..." Se algum usa ../ → CORRIGIR.

PASSO 9 — IMAGENS: TODA seção DEVE ter ≥1 imagem. 🖼️ STOP GATE: Imprima "🖼️ IMGS: [seção1: ✅/❌], [seção2: ✅/❌]..." Se alguma ❌ → ADICIONAR.

PASSO 10 — RELEITURA + VERIFICAÇÃO: Releia a página inteira. Para CADA correção feita, READ a linha editada e CONFIRMAR que foi aplicada. Se text-5xl ainda aparece em algum H2 → NÃO TERMINOU. Se ../ ainda aparece em algum link → NÃO TERMINOU. Execute checklist-validacao.md.

---

## REGRAS EM 1 LINHA (MEMORIZAR)

- ZERO PENDÊNCIAS: encontrou = corrigiu AGORA. Não existe "pendência", "futuro", "cliente".
- SENTENCE CASE: "Perguntas frequentes" NÃO "Perguntas Frequentes". Exceção: nomes próprios.
- H2 MÍNIMO 5 PALAVRAS: "Perguntas frequentes" → "Dúvidas sobre forro e drywall que você precisa esclarecer".
- H2 TYPESCALE: Verificar @layer base em `<style type="text/tailwindcss">`. NUNCA text-5xl/text-6xl. H2 usa só `class="text-gray-900 mb-6"` — o @layer base aplica 28.83px automaticamente.
- CONTRASTE: Fundo escuro → texto branco. Fundo vermelho → texto branco. Span vermelho em fundo vermelho → INVISÍVEL → REMOVER.
- SPAN COLORIDO: Só H2 com 5+ palavras. SEMPRE no final. Pontuação DENTRO do span. 2+ palavras normais antes.
- MENU: Máximo 7-8 itens (Início + Serviços + 4-5 seções + Contato).
- FAQ: Layout 2 colunas (F.A.Q esquerda, perguntas colapsáveis direita). NUNCA lista vertical.
- IMAGENS: TODA seção precisa de ≥1 imagem. Unsplash para genérico, Google Images para específico.
- FONTES: NUNCA trocar a font-family da página original.
- H3: NUNCA classes Tailwind de tamanho (text-2xl, text-xl). CSS global aplica 25.63px.
- NAVEGAÇÃO: NUNCA href="../". Sempre href="#secao". Corrigir = obrigação da IA, NÃO do cliente.
- GOOGLE: DEVE pesquisar DE VERDADE. Listar 5 URLs reais. "Baseado em conhecimento" = FRAUDE.
- LIMITE: NUNCA mencionar "limite de tokens/contexto". NUNCA pausar. NUNCA resumir. Execute TUDO.

---

## NOTA OBRIGATÓRIA (0-100)

Nota com blockers por categoria:
- Design (25pts): FAQ não é 2 colunas → máx 15/25. H2 usa text-5xl → máx 10/25.
- Copy (20pts): Google não pesquisado de verdade → máx 5/20. H2 <5 palavras → máx 10/20.
- Ilustrações (15pts): Qualquer seção sem imagem → máx 5/15.
- SEO (15pts): Sem meta description → máx 5/15.
- Navegação (10pts): Qualquer link com ../ → 0/10.
- Interatividade (10pts): FAQ não collapsible → máx 5/10.
- Consistência (5pts): Containers misturados → 0/5.

Nota < 85 = PROIBIDO finalizar. Continuar corrigindo.

---

## MARCADOR DE CONCLUSÃO

A última mensagem DEVE conter EXATAMENTE:
```
✅ AUDITORIA FINALIZADA — ZERO VIOLAÇÕES
📊 NOTA: XX/100
🔍 PESQUISA: [5 URLs]
📐 TYPESCALE: [h1=32.44px ✅] [h2=28.83px ✅] [style type=text/tailwindcss ✅]
🎨 CONTRASTE: [TODAS as seções legíveis ✅]
🧭 NAV: [todos links internos #]
🖼️ IMGS: [todas seções com imagem]
```
Se QUALQUER stop gate está faltando → auditoria NÃO terminou.

---

## FALLBACK — Se não conseguir completar tudo

Se a auditoria completa não finalizar, o usuário pode rodar os sub-comandos focados:
1. `/corrigir-estrutura @arquivo` — @layer base, typescale, containers
2. `/corrigir-copy @arquivo` — copy, sentence case, stats, navegação
3. `/corrigir-layout @arquivo` — vertical→grid, imagens, FAQ
4. `/corrigir-seo @arquivo` — meta tags, sitemap, páginas legais

Cada sub-comando lê só 2-3 rules e foca em UMA categoria.
