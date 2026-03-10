Corrige APENAS layouts das seções. Leia .claude/rules/layout.md + .claude/rules/design.md. NÃO leia outros rules.

⚠️ REGRA #1: VOCÊ EDITA. NUNCA liste correções para "aplicação manual".

---

## ESCOPO — SÓ LAYOUT (nada mais)

### 1. ELIMINAR LAYOUTS VERTICAIS
- GREP por `space-y-` em desktop → provavelmente vertical → REFAZER em grid
- Timeline vertical com bolhas/linhas → REFAZER em grid 3-4 colunas com cards numerados
- Lista empilhada vertical → REFAZER em grid 2-4 colunas
- Para CADA seção: "Esse layout é horizontal em desktop?" Se NÃO → REFAZER

### 2. ELIMINAR ZIG-ZAG COM FUNDO PRETO
- Seção com itens alternando esquerda/direita em fundo preto → REFAZER
- Substituir por grid uniforme com cards em fundo branco ou seção padrão

### 3. VERIFICAR IMAGENS
- TODA seção DEVE ter pelo menos 1 imagem
- Imagens de 2 colunas: max-h-[450px] + items-center
- Imagem NUNCA 2x mais alta que o texto ao lado
- Se falta imagem → ADICIONAR (Unsplash otimizado: w=1200, fit=crop, format=webp)

### 4. FAQ
- DEVE ser layout 2 colunas: F.A.Q à esquerda, perguntas `<details>/<summary>` à direita
- Se é lista vertical → REFAZER em 2 colunas
- 🚨 **OBRIGATÓRIO: o container da DIREITA DEVE ter perguntas + respostas (`<details>/<summary>` nativo — NUNCA DaisyUI collapse)**
- Se só existe o lado esquerdo (título F.A.Q + subtítulo) sem perguntas na direita → **VIOLAÇÃO GRAVE** → CRIAR mínimo 6 pergunta com respostas reais
- FAQ vazio (só título e subtítulo sem conteúdo) é PIOR que não ter FAQ

### 5. GRID PADRÃO
- Cards: border-gray-200, shadow APENAS no hover
- Grid responsivo: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- Wrapper título+subtítulo: mb-20

### 6. PROCESSO/ETAPAS
- OBRIGATÓRIO: grid horizontal (3-4 colunas)
- Cards com número grande (01, 02...) + título h3 + descrição
- NUNCA bolhas/circles conectadas por linhas

### 7. CONTRASTE TEXTO × FUNDO (OBRIGATÓRIO)

> 🚨 Verificar CADA seção — texto ilegível é violação GRAVE.

Para CADA seção da página:
- Identificar o fundo (bg-black, bg-white, bg-gray-50, from-gray-900, from-red-600, etc.)
- Verificar se o texto é LEGÍVEL contra esse fundo

**Regras obrigatórias:**
- Fundo escuro (bg-black, bg-gray-900, from-gray-900) → texto DEVE ser `text-white` ou `text-gray-100`
- Fundo claro (bg-white, bg-gray-50) → texto DEVE ser `text-gray-900` ou `text-gray-800`
- Fundo vermelho (bg-red-600, from-red-600, bg-red-700) → texto DEVE ser `text-white`
- `text-gray-400` em fundo escuro → **PROIBIDO** → trocar para `text-gray-100` ou `text-gray-300` (mínimo)
- `text-gray-700` em fundo escuro → **INVISÍVEL** → trocar para `text-gray-100`
- `<span class="text-red-600">` em fundo vermelho → **INVISÍVEL** → REMOVER span ou trocar para `text-white`

### 8. REMOVER BADGES DECORATIVOS

> Badges (pílulas coloridas acima de títulos) poluem o design — design.md 8.2.

- GREP por `rounded-full px-4 py-2` + texto uppercase/capitalizado → BADGE
- Se encontrar badge acima de H2 ou H3 (ex: "EFICIÊNCIA ENERGÉTICA A+++", "CONTROLE SMART") → REMOVER o badge inteiro
- Máximo 1 badge por página (no hero, se necessário)
- Fora do hero → ZERO badges

### 9. HEADINGS AO REDESENHAR SEÇÃO

> Ao refazer um layout, a IA tende a colocar classes Tailwind de tamanho nos headings.

- NUNCA criar H2 com text-5xl, text-6xl, font-bold
- H2 correto: APENAS `text-gray-900 mb-6` (fundo claro) ou `text-white mb-6` (fundo escuro)
- H3 correto: APENAS `text-gray-900 mb-4` (fundo claro) ou `text-white mb-3` (fundo escuro)
- O @layer base aplica tamanho (32.44px para H1, 28.83px para H2) — o layout só define **cor e margem**

### 12. FONTE INTER OBRIGATÓRIA

> A fonte padrão de TODO o site DEVE ser **Inter** (Google Fonts).

- GREP por `font-family` no CSS:
  - Se usa system font stack (`-apple-system, BlinkMacSystemFont...`) → SUBSTITUIR por `'Inter', sans-serif`
  - Se não tem `font-family` definido → ADICIONAR `* { font-family: 'Inter', sans-serif; }` no `<style>` normal
  - Se não tem o link do Google Fonts → ADICIONAR no `<head>`: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet">`
  - Adicionar também `<link rel="preconnect" href="https://fonts.googleapis.com">` e `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`

### 13. GRID SEM ESPAÇO EM BRANCO (PREENCHER SEMPRE)

> 🚨 Se um grid/lista de itens tem espaço sobrando → PREENCHER com mais itens.
> NUNCA deixar uma coluna do grid vazia ou com espaço em branco visível.

- Se grid-cols-3 tem 9 slots visíveis mas só 9 itens com espaço pra 12 → ADICIONAR 3 itens
- Se grid-cols-4 com 4 itens mas espaço visual pra 8 → ADICIONAR 4 itens
- Regra: o grid DEVE parecer completo e preenchido — ZERO espaço em branco sobrando
- Se não souber o que adicionar → criar itens relevantes baseados no serviço da página
- ATENÇÃO: isso não é só sobre "quantidade". É sobre preenchimento visual completo.

### 14. ALTURA DE IMAGENS DEVE ACOMPANHAR CONTAINERS

> A largura das imagens já acompanha os containers (regra 10). Mas a ALTURA também DEVE acompanhar.

- Se a imagem está abaixo de cards em grid → a altura da imagem deve ser proporcional (não muito alta, não muito baixa)
- Usar `max-h-[400px]` ou `h-[350px]` com `object-cover` para controlar a altura
- Se a imagem está ao lado de conteúdo (layout split) → usar `h-full object-cover` para a imagem acompanhar a altura do conteúdo
- Se a imagem é full-width na seção → usar `max-h-[450px] w-full object-cover rounded-lg`
- **NUNCA** deixar uma imagem com altura desproporcional ao conteúdo adjacente
- A regra visual: imagem + conteúdo devem parecer que foram desenhados juntos, não colados

---

## NÃO FAZER (fora do escopo)

❌ NÃO corrigir @layer base ou typescale (use /corrigir-estrutura)
❌ NÃO corrigir textos ou copy (use /corrigir-copy)
❌ NÃO mexer em SEO/meta tags (use /corrigir-seo)
❌ NÃO pesquisar no Google
❌ NÃO criar seções novas baseadas em pesquisa

---

## 🏆 PADRÃO DE QUALIDADE — NÃO ENTREGAR NADA PELA METADE

> CADA seção deve ter layout PREMIUM — horizontal, com imagem, profissional.

### Para CADA seção, responder HONESTAMENTE:
1. "O layout é horizontal em desktop (grid 2-4 colunas)?" Se NÃO → REFAZER
2. "Tem pelo menos 1 imagem?" Se NÃO → ADICIONAR
3. "Os cards têm border e hover consistentes?" Se NÃO → PADRONIZAR
4. "O espaçamento (mb-20 no título, py-16 na seção) está correto?" Se NÃO → CORRIGIR
5. "O texto é legível contra o fundo?" Se NÃO → CORRIGIR CONTRASTE
6. "Tem badges decorativos desnecessários?" Se SIM → REMOVER
7. "Se eu fosse o dono, teria orgulho dessa seção visualmente?" Se NÃO → REDESENHAR
8. "As imagens estão alinhadas com os containers/cards acima e ao lado?" Se NÃO → CORRIGIR
9. "Os botões CTA usam font-weight regular (400)?" Se NÃO → CORRIGIR
10. "A logo do header está alinhada com o H1 do hero?" Se NÃO → IGUALAR padding dos containers
11. "O copyright no footer usa formato ano–ano+1?" Se NÃO → CORRIGIR
12. "O H1 da hero começa na MESMA posição horizontal que a logo e o H2 da primeira seção?" Se NÃO → IGUALAR containers (w-[92%] lg:w-[85%] max-w-[1800px] mx-auto sem px-* extra)

### 10. ALINHAMENTO DE IMAGENS COM CONTAINERS (OBRIGATÓRIO)

> 🚨 Imagens que não acompanham a largura dos containers/cards criam desconforto visual.
> A imagem DEVE ter a MESMA LARGURA que o container ou grid acima/abaixo dela.

- Se a seção tem cards em grid-cols-3 com container `w-[92%] lg:w-[85%]` → a imagem abaixo DEVE ocupar a mesma largura do grid
- Se a imagem está MENOR que o container dos cards acima → ALARGAR com `w-full` ou usar `object-cover` com container de mesma largura
- Se a imagem está MAIOR que o container → CORTAR com `max-w-full overflow-hidden`
- Imagem dentro de seção DEVE respeitar o container pai → usar `w-full rounded-lg object-cover`
- Em layouts split (texto + imagem): imagem com `max-h-[450px] object-cover rounded-lg`
- A altura da imagem deve ser proporcional ao conteúdo ao lado — NUNCA 2x maior nem 2x menor

**Regra visual: se os cards terminam na marca X, a imagem abaixo DEVE começar e terminar nas mesmas marcas.**

### 11. BOTÕES CTA (FONT-WEIGHT)

> Botões CTA DEVEM usar font-weight: 400 (regular). NUNCA font-bold nem font-semibold em CTAs.

- GREP por `button-gradient` + `font-bold` ou `font-semibold` → REMOVER a classe de peso
- Botões devem ter apenas: button-gradient, text-white, px-X, py-X, rounded-lg, transition
- O peso do texto no botão vem do @layer base (p = 400) — não precisa de classe extra

### PROIBIDO FINALIZAR SE:
❌ Qualquer seção com layout vertical em desktop
❌ Qualquer seção sem imagem/ilustração
❌ FAQ em lista vertical (deve ser 2 colunas)
❌ Processo/etapas em timeline vertical (deve ser grid horizontal)
❌ Zig-zag com fundo preto ainda presente
❌ Texto ilegível (cor escura em fundo escuro ou vermelho em vermelho)
❌ Badges decorativos fora do hero
❌ Seção visualmente inferior às demais
❌ Imagem desalinhada com container/cards (menor ou maior que o grid acima)
❌ Imagem com altura desproporcional ao conteúdo adjacente
❌ Botão CTA com font-bold ou font-semibold
❌ Fonte do site não é Inter
❌ Grid com espaço em branco sobrando (colunas vazias)
❌ FAQ só com título sem perguntas/respostas na coluna direita
❌ Logo do header desalinhada com o H1 do hero (padding diferente)
❌ Copyright no footer com ano único ou hardcoded (deve ser ano–ano+1 dinâmico)
❌ Texto da hero desalinhado com a logo/seções (container diferente ou px-* extra)

✔ CADA seção avaliada visualmente — layout premium confirmado
✔ CADA seção verificada para contraste — texto 100% legível
✔ Se NÃO ficou premium → REDESENHAR até ficar

---

## MARCADOR DE CONCLUSÃO

```
✅ LAYOUT CORRIGIDO — QUALIDADE PREMIUM
🔲 Verticais→Grid: [X seções convertidas]
🔲 Imagens: [TODAS as seções com imagem ✔]
🔲 FAQ: [2 colunas ✔]
🔲 Processo: [grid horizontal ✔]
🔲 Contraste: [TODAS as seções com texto legível ✔]
🔲 Badges: [removidos fora do hero ✔]
🔲 Qualidade: CADA seção visualmente premium ✔
```
