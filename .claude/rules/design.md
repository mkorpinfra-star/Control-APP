# REGRAS DE DESIGN, LAYOUT E UI

> ⚠️ CONFORMIDADE TOTAL OBRIGATÓRIA
> Cada regra deste arquivo é inegociável.
> Se não puder seguir uma regra → informar antes de começar, nunca depois.

---

## 1. FILOSOFIA DE DESIGN

✔ minimalista, técnico, moderno, consistente
✔ monocromático + 1 cor de destaque (via token)
✔ bordas cinzas (#e5e7eb)
✔ sem sombras por padrão (apenas no hover quando definido)
✔ alinhamento à esquerda
✔ contraste tipográfico forte
✔ espaçamento respirável
✔ fonte padrão: **Inter** (Google Fonts) — NUNCA usar system font stack como padrão

Referência: Apple-style minimal / Cloudflare-style interface.
Dark mode: não implementar salvo solicitação explícita.

---

## 2. TOKENS DE COR (definir no início de cada projeto)

```css
:root {
  --color-primary:       #XXXXXX;
  --color-primary-hover: #XXXXXX;
  --color-text:          #111111;
  --color-text-muted:    #6b7280;
  --color-bg:            #ffffff;
  --color-bg-alt:        #f9fafb;
  --color-border:        #e5e7eb;
  --color-success:       #16a34a;
  --color-error:         #dc2626;
  --color-warning:       #d97706;
}
```
✔ nunca hardcodar cor diretamente em elemento.

---

## 3. SISTEMA TIPOGRÁFICO FIXO — @layer base (NUNCA alterar sem autorização)

> Escala tipográfica baseada em razão 1.125 (Major Second) a partir de 16px.
> Estes valores são ABSOLUTOS e FINAIS. NUNCA alterar sem autorização do cliente.

| Tag     | pt       | px       | font-weight | line-height | letter-spacing |
|---------|----------|----------|-------------|-------------|----------------|
| h1      | 24.33pt  | 32.44px  | 800         | 1.2         | 0.02em         |
| h2      | 21.62pt  | 28.83px  | 400         | 1.3         | 0.02em         |
| h3      | 19.22pt  | 25.63px  | 700         | 1.3         | 0.02em         |
| h4      | 17.09pt  | 22.78px  | 600         | 1.4         | 0.02em         |
| h5      | 15.19pt  | 20.25px  | 400         | 1.4         | 0.02em         |
| h6      | 13.5pt   | 18px     | 300         | 1.5         | 0.02em         |
| p       | 12pt     | 16px     | 400         | 1.6         | —              |
| small   | 10.67pt  | 14.22px  | 400         | —           | —              |
| caption | 9.48pt   | 12.64px  | 300         | —           | —              |

### 3.0.0 IMPLEMENTAÇÃO OBRIGATÓRIA — Tailwind CDN + @layer base

> 🚨 ATENÇÃO CRÍTICA: Se a página usa `cdn.tailwindcss.com`, o `@layer base` em
> `<style>` NORMAL é IGNORADO pelo Tailwind CDN (ele processa seus próprios layers).
> Resultado: headings ficam MINÚSCULOS porque o Preflight reseta para `font-size: inherit`.

**FIX: usar `<style type="text/tailwindcss">` — o CDN processa este tipo de tag:**

```html
<style type="text/tailwindcss">
@layer base {
  h1 { font-size: 32.44px; font-weight: 800; letter-spacing: 0.02em; line-height: 1.2; }
  h2 { font-size: 28.83px; font-weight: 400; letter-spacing: 0.02em; line-height: 1.3; }
  h3 { font-size: 25.63px; font-weight: 700; letter-spacing: 0.02em; line-height: 1.3; }
  h4 { font-size: 22.78px; font-weight: 600; letter-spacing: 0.02em; line-height: 1.4; }
  h5 { font-size: 20.25px; font-weight: 400; letter-spacing: 0.02em; line-height: 1.4; }
  h6 { font-size: 18px;    font-weight: 300; letter-spacing: 0.02em; line-height: 1.5; }
  p  { font-size: 16px;    font-weight: 400; line-height: 1.6; }
}
</style>
```

**Estilos que NÃO são @layer base** (button-gradient, glass, variáveis CSS) ficam em `<style>` normal:

```html
<style>
  :root { --red-primary: #D50405; ... }
  * { font-family: 'Inter', sans-serif; }
  .button-gradient { background: linear-gradient(...); }
  html { scroll-behavior: smooth; }
  body { zoom: 93%; }
</style>
```

✔ `<style type="text/tailwindcss">` → APENAS @layer base (typescale)
✔ `<style>` normal → variáveis, classes custom, scroll, zoom
✔ Com `@layer base`, as tags HTML recebem o tamanho correto AUTOMATICAMENTE
✔ Nos H2, usar APENAS classes de cor e margem: `class="text-gray-900 mb-6"`
✔ NUNCA usar classes Tailwind de tamanho (text-xl, text-5xl, etc.) — o @layer base já aplica
✔ letter-spacing e line-height já estão incluídos no @layer base

### 3.0.1 AUDITORIA — Verificar typescale funcional

> O @layer base SÓ funciona com `<style type="text/tailwindcss">`.
> Se a tag `<style>` estiver SEM `type="text/tailwindcss"`, o typescale NÃO será aplicado.

**Na auditoria, verificar:**
1. A página tem `<style type="text/tailwindcss">` com `@layer base { h1 {...} h2 {...} ... }`? Se NÃO → ADICIONAR/CORRIGIR
2. O `@layer base` está dentro de `<style>` normal (sem type)? Se SIM → MOVER para `<style type="text/tailwindcss">`
3. Algum H1-H6 tem classe Tailwind de tamanho (`text-5xl`, `text-2xl`, etc.)? Se SIM → REMOVER
4. Algum H1-H6 tem `style="font-size: ..."` inline? Se SIM → REMOVER (o @layer base aplica)
5. GREP por "48px" em h1 ou "36px" em h2 no @layer base → se encontrar = VALORES ERRADOS → trocar para 32.44px e 28.83px
6. GREP por `font-weight: 700` em h2 → ERRADO → trocar para 400 (h1 DEVE ser 800)

❌ PROIBIDO nos headings:
- `class="text-5xl"` → REMOVER
- `class="text-6xl"` → REMOVER
- `class="text-5xl md:text-6xl font-bold"` → REMOVER text-5xl md:text-6xl font-bold
- `class="text-2xl"` em H3 → REMOVER
- `class="font-bold"` em H1/H2 → REMOVER (font-weight 400)
- Qualquer classe Tailwind de tamanho de fonte em headings
- `style="font-size: ..."` inline em qualquer heading

❌ VALORES ERRADOS (se encontrar, trocar):
- h1 com 48px → trocar para 32.44px
- h1 com font-weight 400 → trocar para 800
- h2 com 36px → trocar para 28.83px
- h2 com font-weight 700 → trocar para 400
- `@layer base` dentro de `<style>` sem type → mover para `<style type="text/tailwindcss">`

✔ CORRETO nos H2:
```html
<h2 class="text-gray-900 mb-6">
  Texto do título aqui
</h2>
```
✔ O @layer base aplica 28.83px/400/1.3 automaticamente. Só precisa de cor e margem.
✔ H1 do hero: `class="text-white mb-6"` sem nenhum style inline

### 3.1 CAPITALIZAÇÃO — SENTENCE CASE OBRIGATÓRIO

> TODOS os títulos (H1, H2, H3, H4, H5, H6) e subtítulos DEVEM usar **sentence case**.
> Isso significa: **PRIMEIRA LETRA DA PRIMEIRA PALAVRA = MAIÚSCULA**, restante em minúscula.
> Exceção ÚNICA: nomes próprios (Brasil, ANEEL, São Paulo, DaisyUI).

🚨 **ATENÇÃO: tudo minúsculo também é ERRADO!**

> A IA tende a interpretar "sentence case" como "tudo minúsculo". ISSO É ERRADO.
> Sentence case = primeira letra da frase é MAIÚSCULA. Sempre.

❌ PROIBIDO (Title Case — cada palavra começa maiúscula):
- "Economia Financeira" → ERRADO
- "Instalações Elétricas Residenciais" → ERRADO
- "Perguntas Frequentes" → ERRADO

❌ PROIBIDO (all lowercase — tudo minúsculo):
- "economia financeira" → ERRADO
- "instalações elétricas residenciais" → ERRADO
- "soluções completas de climatização para projetos comerciais" → ERRADO
- "pronto para começar seu projeto" → ERRADO

✔ CORRETO (sentence case — só a 1ª letra da frase é maiúscula):
- "Economia financeira" ← E maiúsculo, resto minúsculo
- "Instalações elétricas residenciais" ← I maiúsculo, resto minúsculo
- "Soluções completas de climatização para projetos comerciais" ← S maiúsculo
- "Pronto para começar seu projeto de climatização" ← P maiúsculo
- "Energia solar fotovoltaica para edifícios" ← E maiúsculo
- "Instalações elétricas no Brasil" ← I maiúsculo + Brasil é nome próprio
- "Sistemas HVAC integrados" ← S maiúsculo + HVAC é sigla

### 3.2 COR NO TÍTULO — REGRAS ABSOLUTAS DE SPAN COLORIDO

> A mistura de cores no título (preto + vermelho) só funciona em frases longas.
> Em títulos curtos (2-3 palavras), o efeito bicolor fica feio e quebrado.

**REGRAS DO SPAN COLORIDO:**

✔ H2 precisa ter 5+ palavras para usar span colorido
✔ O span DEVE estar sempre no FINAL da frase
✔ Precisa ter mínimo 2 palavras de cor normal ANTES do span colorido
✔ Pontuação (? ! .) DEVE estar DENTRO do span, nunca solta fora
✔ O span deve ser um bloco contínuo, nunca palavras separadas

❌ PROIBIDO (títulos curtos — SEM span):
- `Perguntas <span>frequentes</span>` → 2 palavras
- `Painéis <span>solares</span>` → 2 palavras
- `Outros <span>serviços</span>` → 2 palavras

❌ PROIBIDO (pontuação fora do span):
- `Por que <span>energia solar</span>?` → o `?` ficou de cor diferente = RIDÍCULO
- `Como funciona a <span>instalação</span>?` → o `?` ficou solto

❌ PROIBIDO (palavras separadas / cores misturadas):
- `<span>Por</span> que <span>energia</span> solar?` → cada palavra uma cor
- `<span>Tipos</span> de <span>painéis</span>` → mistura de cores

✔ CORRETO (span no final, pontuação dentro, 2+ palavras normais antes):
- `Por que investir em <span>energia solar?</span>` → ? dentro do span
- `Conheça os diferentes <span>tipos de painéis solares</span>` → bloco contínuo no final
- `O que está incluído no <span>seu sistema solar</span>` → 4 palavras normais antes
- `Quanto custa instalar <span>energia solar em casa?</span>` → ? dentro do span

### 3.3 COMPRIMENTO MÍNIMO DO H2 — 5 PALAVRAS

> Títulos H2 curtos e secos (2-3 palavras) parecem telegrama.
> H2 deve ser conversacional, descritivo e envolvente.

✔ H2 DEVE ter no mínimo **5 palavras**
✔ Tom conversacional e descritivo — como se falasse com o visitante
✔ Usar verbos de ação quando possível

❌ PROIBIDO (muito curto e seco):
- "Perguntas frequentes" (2 palavras)
- "Outros serviços" (2 palavras)
- "Tipos de painéis solares" (4 palavras)
- "Processo de instalação" (3 palavras)

✔ CORRETO (5+ palavras, conversacional):
- "Dúvidas sobre energia solar que você precisa esclarecer"
- "Conheça outros serviços que oferecemos para o seu projeto"
- "Conheça os diferentes tipos de painéis solares disponíveis"
- "Como funciona o processo de instalação passo a passo"

---

## 4. FONTES

✔ máximo 1 família tipográfica por projeto
✔ preload obrigatório + font-display: swap
✔ Google Fonts com &subset=latin

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap&subset=latin">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap&subset=latin">
```

### 4.1 AUDITORIA — NUNCA TROCAR A FONTE DA PÁGINA

> Ao auditar uma página existente, a fonte JÁ ESTÁ definida.
> A auditoria NÃO é redesign — é correção e melhoria do que existe.

❌ PROIBIDO alterar, substituir ou remover a `font-family` da página original
❌ PROIBIDO trocar Google Font por system font ou vice-versa
❌ PROIBIDO adicionar nova família tipográfica que a página não usava
✔ Se a página já tem Inter → manter Inter
✔ Se a página já tem system font (`-apple-system`) → manter system font
✔ Só definir font-family se a página não tinha nenhuma (criar do zero)

---

## 5. RESPONSIVIDADE

✔ mobile first obrigatório
✔ menu hambúrguer funcional em < 768px
✔ breakpoints Tailwind: sm / md / lg / xl / 2xl
✔ testar em: 360px, 768px, 1024px, 1440px
✔ nenhum elemento com overflow horizontal

---

## 6. INTERAÇÃO

✔ hover states em todos os elementos clicáveis
✔ transition: all 0.2s ease (ou duration-300)
✔ foco visível (nunca outline: none sem substituto)
✔ scroll-behavior: smooth no html
✔ botão "Voltar ao topo" após 300px de scroll

---

## 7. SKELETON LOADING (OBRIGATÓRIO — DaisyUI)

O site não pode exibir tela em branco em nenhum momento.
Usar exclusivamente a classe `skeleton` nativa do DaisyUI.

```html
<!-- Texto -->
<div class="skeleton h-4 w-full mb-2"></div>
<div class="skeleton h-4 w-3/4 mb-2"></div>

<!-- Card -->
<div class="card w-full shadow">
  <div class="skeleton h-48 w-full rounded-t-xl"></div>
  <div class="card-body gap-3">
    <div class="skeleton h-5 w-3/4"></div>
    <div class="skeleton h-4 w-full"></div>
  </div>
</div>
```

Remover após DOMContentLoaded:
```js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.skeleton-wrapper').forEach(el => {
    el.classList.remove('skeleton-wrapper');
  });
});
```

---

## 8. REGRAS DE LAYOUT E COMPOSIÇÃO VISUAL

### 8.1 Proibições de Layout Vertical

❌ NUNCA usar max-w-4xl, max-w-3xl ou max-w-2xl em seções de conteúdo
✔ Usar max-w-7xl ou sem limitador de largura
✔ Conteúdo deve ocupar 85–90% da largura do viewport
✔ Espaço lateral total máximo: 15%

❌ NUNCA usar listas verticais (space-y-*) para 3+ itens
✔ Se seção tem 3+ itens → GRID HORIZONTAL obrigatório

Regra de grid por quantidade de itens:
- 3–4 itens → grid md:grid-cols-2 lg:grid-cols-4
- 5–8 itens → grid md:grid-cols-2 lg:grid-cols-3
- 9+ itens  → grid md:grid-cols-3 lg:grid-cols-4

❌ NUNCA criar divs aninhados com space-y-* dentro de grid
✔ Cada item do grid deve ser independente

---

### 8.5 Layout FAQ — Padrão Obrigatório (2 Colunas)

> Seções de FAQ/Perguntas NUNCA devem ser uma lista vertical simples.
> DEVEM usar layout split de 2 colunas moderno.

✔ Layout obrigatório:

```html
<section id="faqs" class="py-24 bg-gray-50">
  <div class="w-[92%] lg:w-[85%] max-w-[1800px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
      <!-- COLUNA ESQUERDA: Título grande -->
      <div class="lg:sticky lg:top-32 lg:self-start">
        <div class="text-6xl font-bold text-gray-200 mb-4">F.A.Q</div>
        <h2 class="text-gray-900 mb-4">
          [H2 com 5+ palavras conversacional]
        </h2>
        <p class="text-base text-gray-600 font-light" style="letter-spacing: 0.05em;">
          [Subtítulo descritivo]
        </p>
      </div>
      <!-- COLUNA DIREITA: Perguntas colapsáveis (MÍNIMO 6) -->
      <div class="space-y-4">
        <!-- Usar details/summary moderno -->
        <details class="group bg-white border border-gray-200 rounded-lg">
          <summary class="cursor-pointer p-6">Pergunta 1 real e específica</summary>
          <div class="px-6 pb-6 pt-4">Resposta completa e útil (mín 2 frases)</div>
        </details>
        <details class="group bg-white border border-gray-200 rounded-lg">
          <summary class="cursor-pointer p-6">Pergunta 2</summary>
          <div class="px-6 pb-6 pt-4">Resposta 2</div>
        </details>
        <details class="group bg-white border border-gray-200 rounded-lg">
          <summary class="cursor-pointer p-6">Pergunta 3</summary>
          <div class="px-6 pb-6 pt-4">Resposta 3</div>
        </details>
        <details class="group bg-white border border-gray-200 rounded-lg">
          <summary class="cursor-pointer p-6">Pergunta 4</summary>
          <div class="px-6 pb-6 pt-4">Resposta 4</div>
        </details>
        <details class="group bg-white border border-gray-200 rounded-lg">
          <summary class="cursor-pointer p-6">Pergunta 5</summary>
          <div class="px-6 pb-6 pt-4">Resposta 5</div>
        </details>
        <details class="group bg-white border border-gray-200 rounded-lg">
          <summary class="cursor-pointer p-6">Pergunta 6</summary>
          <div class="px-6 pb-6 pt-4">Resposta 6</div>
        </details>
      </div>
    </div>
  </div>
</section>
```

🚨 **VIOLAÇÃO GRAVE: FAQ sem perguntas na coluna direita**
- Se a seção FAQ existe mas NÃO tem perguntas/respostas (só o título F.A.Q + subtítulo) → é PIOR que não ter FAQ
- OBRIGATÓRIO: mínimo 6 perguntas com respostas REAIS (específicas do serviço, não genéricas)
- Cada resposta deve ter no mínimo 2 frases úteis e específicas
- A IA DEVE criar as perguntas baseadas no conteúdo da página e no serviço oferecido

❌ PROIBIDO: FAQ como lista vertical simples (space-y-4 com items empilhados)
❌ PROIBIDO: FAQ sem título grande decorativo (F.A.Q ou equivalente)
❌ PROIBIDO: FAQ só com coluna esquerda (título) SEM perguntas na coluna direita
❌ PROIBIDO: FAQ usando DaisyUI `collapse` — SEMPRE usar `<details>/<summary>` nativo HTML
✔ Coluna esquerda: sticky no desktop, com "F.A.Q" em texto grande decorativo
✔ Coluna direita: MÍNIMO 6 perguntas em `<details>/<summary>` nativo
✔ Resposta com `pt-4` — espaçamento de respiro entre a pergunta e a resposta (16px)

---

### 8.6 Ilustrações e Imagens — OBRIGATÓRIO em Cada Seção

> Seções sem nenhum elemento visual (imagem, ícone ilustrativo, stats) são MORTAS.
> Toda seção de conteúdo DEVE ter pelo menos 1 imagem ou ilustração.

**Hierarquia de sourcing de imagens:**

1. **Tópico genérico** (ex: "painel solar", "energia solar", "telhado") → **Unsplash**
   - Usar URL direta: `https://images.unsplash.com/photo-XXXX?w=800&h=600&fit=crop`
   - Sempre com `alt`, `title`, `loading="lazy"`, `width`, `height`

2. **Tópico específico** (ex: "painel monocristalino 550Wp", "inversor Fronius", "bateria LiFePO4") → **Google Images / Bing**
   - Pesquisar pela frase exata
   - Baixar o primeiro resultado relevante
   - Salvar na pasta `img/` do projeto
   - Verificar se a imagem realmente corresponde ao assunto
   - Linkar com caminho local: `<img src="../img/nome-da-imagem.webp">`

3. **Verificação obrigatória:** após baixar, confirmar que a imagem é do assunto correto

❌ PROIBIDO: seção de conteúdo sem nenhuma imagem ou elemento visual
❌ PROIBIDO: usar imagens placeholder ou genéricas que não correspondem ao tema
❌ PROIBIDO: usar imagens sem alt descritivo
✔ Seções tipo "Tipos de painéis" → DEVEM ter imagem de cada tipo
✔ Seções tipo "Como funciona" → DEVEM ter diagrama ou foto do processo
✔ Seções tipo "Benefícios" → podem usar ícones + stats, mas idealmente com foto

---

### 8.2 Proibição de Badges Decorativos

❌ NUNCA criar badges ou tags acima de títulos de seção
Exemplos proibidos: "ORGANIZAÇÃO E SEGURANÇA", "Experiência Comprovada"
Qualquer badge em bg-red-100, bg-red-50, rounded-full, etc.

Motivo: badges matam o contraste visual e poluem o design.
Se precisar destacar algo → usar contraste tipográfico no título ou subtítulo.

---

### 8.3 Contraste Tipográfico Obrigatório (Título vs Subtítulo)

✔ Título: font-weight 400 | font-size 48px | cor forte (gray-900 ou primária)
✔ Subtítulo: font-weight 300 (ULTRA FINO) | font-size 18–20px | letter-spacing: 0.03em | cor gray-600/700

❌ NUNCA usar font-medium ou font-semibold em subtítulos
❌ NUNCA usar cores pálidas demais (tipo text-gray-400 em subtítulo)

Regra de ouro: título GORDO e ESCURO → subtítulo FINO e ACINZENTADO.

---

### 8.4 Regra de Cards em Grid

Quando tiver 6+ itens:
✔ grid md:grid-cols-2 lg:grid-cols-3
✔ border border-gray-200 em cada card
✔ sombra apenas no hover: hover:shadow-2xl transition-all duration-300
✔ ícone em bg-gray-100 → bg-gray-200 no hover
✔ cores neutras nos ícones — nunca cor primária em tudo

❌ NUNCA 10+ cards — se passar de 9 itens, NÃO criar a seção
❌ NUNCA grid de 4 colunas para conteúdo complexo

---

## 9. IMAGENS

✔ alt descritivo e semântico | title relevante
✔ loading="lazy" (exceto hero: loading="eager")
✔ formato WebP ou AVIF | width e height declarados

---

## 10. ACESSIBILIDADE

✔ HTML semântico (button, nav, label, main, header, footer)
✔ contraste WCAG AA: 4.5:1 texto normal / 3:1 texto grande
✔ navegação por teclado funcional
✔ label visível + associado em todo input
✔ aria-label em ícones sem texto

---

## 11. CHECKLIST DE CONSISTÊNCIA VISUAL (executar SEMPRE antes de entregar)

### 11.1 Títulos H2 — Padrão Obrigatório (Páginas com Tailwind)

> O typescale é aplicado via @layer base (seção 3).
> H2 NÃO precisa de classes Tailwind de tamanho — o CSS já aplica 36px.

✔ TODOS os h2 na página devem ser idênticos:

```html
<h2 class="text-gray-900 mb-6">
  Texto do título <span class="text-red-600">com destaque</span>
</h2>
```

Regras:
✔ Tamanho vem do @layer base (36px) — NUNCA adicionar text-5xl ou text-6xl
✔ mb-6 — NUNCA mb-4
✔ `<span class="text-red-600">` no destaque — SÓ SE o H2 tem 5+ palavras (ver seção 3.2)
✔ Se h2 for branco (fundo escuro): text-white em vez de text-gray-900
✔ Sentence case obrigatório — ver seção 3.1
✔ Antes de entregar: auditar TODOS os h2 da página e garantir que seguem o padrão

### 11.1.1 H3 em Cards — NUNCA usar Tailwind

> H3 dentro de cards, listas ou qualquer componente DEVEM usar o @layer base.
> NUNCA sobrescrever com classes Tailwind de tamanho.

❌ PROIBIDO: `<h3 class="text-2xl font-bold">` → Tailwind sobrescreve o @layer base
❌ PROIBIDO: `<h3 class="text-xl font-semibold">` → Tailwind sobrescreve o @layer base
✔ CORRETO: `<h3 class="text-gray-900 mb-4">` → sem classes de tamanho, @layer base aplica (25.63px, 700)
✔ Classe de tamanho diferente necessária? NUNCA text-xl/text-2xl/text-3xl — se for caso excepcional, ajustar no @layer base

### 11.2 Subtítulos de Seção — Padrão Obrigatório

✔ Subtítulo logo abaixo de h2:

```html
<p class="text-base text-gray-600 max-w-4xl font-light" style="letter-spacing: 0.05em;">
  Texto do subtítulo explicativo
</p>
```

Regras:
✔ text-base — NUNCA text-lg ou text-xl
✔ text-gray-600 — NUNCA text-gray-900 ou text-gray-700
✔ font-light — obrigatório
✔ letter-spacing: 0.05em — obrigatório (usar inline style `style="letter-spacing: 0.05em;"` já que não está no @layer base para p)
✔ max-w-4xl — limitar largura do subtítulo (NÃO do container de seção)
✔ Se fundo escuro: text-gray-100 (não text-gray-300)

### 11.3 Espaçamento Entre Título e Conteúdo

✔ Container do título + subtítulo:

```html
<div class="text-left mb-20">
  <!-- h2 aqui -->
  <!-- subtítulo aqui -->
</div>
```

Regras:
✔ mb-20 — NUNCA mb-16, mb-12 ou mb-8
✔ text-left — NUNCA text-center em páginas de serviço

### 11.4 Alinhamento Vertical — REGRA OBRIGATÓRIA

❌ NUNCA permitir seções com larguras diferentes na mesma página
✔ Todas as seções devem estar alinhadas verticalmente
✔ Os containers de conteúdo devem seguir a mesma linha vertical esquerda
✔ Se uma seção usa container mx-auto px-6, TODAS devem usar
✔ Se uma seção tem max-w-7xl, TODAS devem ter max-w-7xl

Exemplo ERRADO (seções desalinhadas):
```
| [  Seção 1 — max-w-5xl  ]          |  ← mais estreita
|    [  Seção 2 — max-w-7xl        ] |  ← mais larga
| [  Seção 3 — max-w-4xl ]           |  ← mais estreita ainda
```

Exemplo CORRETO (alinhamento vertical uniforme):
```
| [  Seção 1 — max-w-7xl            ] |
| [  Seção 2 — max-w-7xl            ] |
| [  Seção 3 — max-w-7xl            ] |
```

✔ Centralizar conteúdo SOMENTE se explicitamente solicitado pelo usuário
✔ Por padrão: todo conteúdo alinhado à esquerda, na mesma verticalidade
✔ Auditar visualmente: scroll na página e verificar que nenhuma seção "pula" para largura diferente

### 11.5 Meta Description

✔ Máximo 155 caracteres (incluindo espaços)

Antes de entregar:
1. Contar caracteres da meta description
2. Se > 155: reescrever para caber no limite
3. Manter benefício + palavra-chave principal

### 11.6 Vídeo Hero Background

✔ Atributos obrigatórios:

```html
<video
  autoplay
  loop
  muted
  playsinline
  preload="metadata"
  class="absolute w-full h-full object-cover z-0"
  style="object-position: 65% center;"
  onloadedmetadata="this.play()"
>
  <source src="../videos/webm/webm/NOME-DO-VIDEO.mp4" type="video/mp4">
</video>
```

Regras:
✔ onloadedmetadata="this.play()" — obrigatório (força autoplay)
✔ z-0 na classe — overlay deve ser z-10
✔ preload="metadata" — não auto
✔ playsinline — obrigatório para mobile
✔ Caminho correto: ../videos/webm/webm/NOME.mp4

### 11.7 Contraste WCAG AA — Auditoria Obrigatória

Antes de entregar, verificar:

| Fundo      | Texto permitido              | Texto proibido             |
|------------|------------------------------|----------------------------|
| bg-white   | text-gray-900, text-gray-800 | text-gray-400, text-gray-500 |
| bg-gray-50 | text-gray-900, text-gray-600 | text-gray-400, text-gray-500 |
| Fundo escuro | text-white, text-gray-100  | text-gray-300, text-gray-400 |

Regra geral:
✔ Texto grande (≥18px): contraste mínimo 3:1
✔ Texto pequeno (<18px): contraste mínimo 4.5:1
✔ Sempre preferir text-gray-900 em fundos claros
✔ Sempre preferir text-gray-100 em fundos escuros

### 11.8 Copy — Checklist de Qualidade

Antes de entregar, revisar TODA a copy:

❌ Proibido:
- "Soluções completas" (vago)
- "Mais de X anos de experiência" (genérico)
- "Qualidade certificada" (sem especificar certificação)
- "Garantindo conforto e economia" (vago)
- "Tecnologias modernas" (sem especificar quais)

✅ Obrigatório:
- Dados mensuráveis: "Reduz consumo em até 40%"
- Benefício tangível: "Chuveiro no último andar funciona perfeitamente"
- Prova concreta: "Memorial assinado por engenheiro CREA"
- Resultado específico: "Detecta vazamentos antes de gerar prejuízo"

Regra: Se o cliente ler e pensar "Ok, mas como isso me beneficia?" → reescrever.

### 11.9 Layout Horizontal — Auditoria de Largura

Antes de entregar, verificar:
✔ Seções de conteúdo NÃO devem usar max-w-4xl ou menor
✔ Usar max-w-7xl ou sem limite (apenas container mx-auto px-6)
✔ Grids devem ocupar largura total: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3

❌ Proibido:
```html
<div class="max-w-2xl mx-auto"> <!-- muito estreito -->
<div class="max-w-3xl mx-auto"> <!-- muito estreito -->
```

✅ Correto:
```html
<div class="container mx-auto px-6 max-w-7xl">
```

### 11.10 Tracking — Checklist de CTAs

Antes de entregar, verificar que TODOS os CTAs têm:

```html
<a href="URL"
   class="facebookclick OUTRAS-CLASSES"
   onclick="gtag_report_conversion(this.href); return true;">
```

CTAs obrigatórios com tracking:
✔ Botões hero (2 CTAs)
✔ WhatsApp flutuante
✔ Botões em seções intermediárias
✔ CTAs em cards de serviço
✔ Footer CTAs

### 11.11 Workflow de Auditoria Pré-Entrega

Executar SEMPRE antes de marcar página como concluída:

1. ✅ Abrir a página e ler do início ao fim
2. ✅ Verificar TODOS os h2 — devem ser idênticos visualmente, sentence case, 5+ palavras
3. ✅ Verificar spans coloridos — só em H2 com 5+ palavras, sempre no final, ? dentro do span
4. ✅ Verificar subtítulos — devem ter letter-spacing generoso
5. ✅ Verificar espaçamento — mb-20 entre título e conteúdo
6. ✅ Verificar alinhamento vertical — todas as seções na mesma largura
7. ✅ Testar vídeo hero — deve rodar automaticamente
8. ✅ Inspecionar contraste — nenhum texto claro em fundo claro
9. ✅ Ler toda a copy — nenhum clichê ou vago sem benefício
10. ✅ Verificar layout — nenhuma seção com max-w-4xl ou menor
11. ✅ Verificar imagens — TODA seção tem pelo menos 1 imagem/ilustração
12. ✅ Verificar FAQ — layout 2 colunas (F.A.Q esquerda, perguntas direita)
13. ✅ Verificar tracking — facebookclick + gtag em TODOS os CTAs
14. ✅ Verificar navegação — links internos (#seção) nas páginas de serviço
15. ✅ Verificar sitemap — página listada no sitemap.xml

Se qualquer item falhar → corrigir antes de entregar.

---

## 12. REGRA DE COMPARAÇÃO COM PÁGINA APROVADA

Sempre que criar/corrigir uma página, comparar lado a lado com uma página já aprovada:

1. Abrir página aprovada (ex: instalacoes-eletricas)
2. Abrir página em desenvolvimento
3. Comparar visualmente:
   - Tamanho dos títulos h2
   - Espaçamento entre seções
   - Contraste dos subtítulos
   - Alinhamento vertical
   - Layout horizontal
   - Largura dos containers

Se qualquer diferença visual for detectada → corrigir para igualar à página aprovada.

❌ Nunca entregar página com visual diferente da página de referência
✔ A consistência visual entre páginas é tão importante quanto o conteúdo
