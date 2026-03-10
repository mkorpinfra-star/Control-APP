Corrige APENAS estrutura CSS e typescale. Leia .claude/rules/design.md + .claude/rules/layout.md + .claude/rules/header-hero.md. NÃO leia outros rules.

⚠️ REGRA #1: VOCÊ EDITA. NUNCA liste correções para "aplicação manual".

---

## ESCOPO — SÓ ESTRUTURA (nada mais)

### 1. TAILWIND CDN + @LAYER BASE (VERIFICAÇÃO CRÍTICA)

> 🚨 Se a página usa `cdn.tailwindcss.com`, o `@layer base` em `<style>` normal é IGNORADO.
> O Tailwind CDN processa apenas `<style type="text/tailwindcss">`.
> Se o @layer base estiver em `<style>` sem type → headings ficam MINÚSCULOS.

**Verificar:**
1. A página usa `cdn.tailwindcss.com`? Se SIM →
2. O `@layer base` está dentro de `<style type="text/tailwindcss">`? Se NÃO → MOVER
3. Se `@layer base` está em `<style>` normal (sem type) → headings estão QUEBRADOS → CORRIGIR AGORA

**Estrutura correta:**
```html
<!-- @layer base DEVE estar aqui para Tailwind CDN processar -->
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

<!-- Variáveis, classes custom, scroll, zoom → <style> normal -->
<style>
  :root { --red-primary: #D50405; ... }
  .button-gradient { ... }
  html { scroll-behavior: smooth; }
  body { zoom: 93%; }
</style>
```

### 2. VALORES DO TYPESCALE (verificar e corrigir)
- GREP por valores ERRADOS no @layer base:
  - `48px` em h1 → trocar para `32.44px`
  - `36px` em h2 → trocar para `28.83px`
  - `font-weight: 800` em h2 → trocar para `400`
  - `font-weight: 700` em h2 → trocar para `400`
- Se encontrar `!important` em headings → REMOVER e garantir que @layer base está em `<style type="text/tailwindcss">`

### 3. HEADINGS — CLASSES PROIBIDAS
- GREP por `text-5xl`, `text-6xl`, `text-4xl`, `text-3xl`, `text-2xl`, `text-xl`, `text-lg` em qualquer H1-H6 → REMOVER
- GREP por `font-bold`, `font-extrabold` em H1 ou H2 → REMOVER (font-weight é 400)
- GREP por `leading-tight` em headings → REMOVER (line-height já está no @layer base)
- Se H1 tem `style="font-size:..."` inline → REMOVER
- H2 correto: APENAS `class="text-gray-900 mb-6"` (fundo claro) ou `class="text-white mb-6"` (fundo escuro)

### 4. CONTAINERS
- TODAS as seções com `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto`
- GREP por `container mx-auto px-6` → PROIBIDO → substituir pelo container correto

### 5. PARÁGRAFOS DO HERO
- text-gray-300, 16px, font-weight 400, line-height 1.6, letter-spacing 0.04em    
- Via style inline OU classes Tailwind equivalentes

### 6. HTML ÓRFÃO (blocos fora de section)
- Verificar: TODO o conteúdo visível está dentro de `<section>`?
- Se encontrar divs/grids soltos entre sections (fora de qualquer `<section>`) → ENVOLVER em `<section>` com ID

### 7. CONTRASTE TEXTO × FUNDO (verificação rápida)
- Para CADA seção: o texto é legível contra o fundo?
- Fundo escuro → texto text-white ou text-gray-100
- Fundo claro → texto text-gray-900 ou text-gray-800
- Se encontrar contraste ruim → CORRIGIR

### 8. LINKS DOS CTAs DA HERO (VERIFICAÇÃO CRÍTICA)

> 🚨 CTAs com links placeholder (números fictícios, #contato genérico) são VIOLAÇÃO GRAVE.

**Verificar:**
1. GREP por `tel:+5511999` ou `tel:+55XX` → PLACEHOLDER → buscar telefone real no site
2. GREP por `wa.me/5511999` ou `wa.me/55XX` → PLACEHOLDER → buscar WhatsApp real no site
3. O botão "Solicitar orçamento" deve ir para WhatsApp (`wa.me/55XXXXXXXXXXX`) com mensagem pré-definida
4. O botão "Falar com especialista" deve ir para `tel:+55XXXXXXXXXXX` com número REAL
5. Se a página é de serviço e o CTA vai pra `/#contato` da home → TROCAR pelo link direto do WhatsApp

**Como encontrar os dados reais:**
- Buscar no `index.html` da raiz por `wa.me` ou `tel:` → copiar o número
- Buscar no WhatsApp flutuante da página (botão fixo no canto) → extrair número
- Se NÃO encontrar em lugar nenhum → PERGUNTAR ao usuário ANTES de finalizar
- NUNCA deixar `999999` ou links genéricos nos CTAs

### 9. RESPIRO LATERAL MOBILE

> No mobile (w-[92%]), todos os containers devem ter respiro lateral visível.
> Se o texto cola nas bordas da tela → o container não está com w-[92%].

- Verificar que TODOS os containers usam `w-[92%]` no mobile (sem prefixo lg:)
- O `lg:w-[85%]` só se aplica a partir de 1024px
- Se encontrar `w-full` ou `w-[96%]` ou `w-[100%]` em container de seção → TROCAR por `w-[92%]`

---

## NÃO FAZER (fora do escopo)

❌ NÃO corrigir copy/texto (use /corrigir-copy)
❌ NÃO redesenhar layouts de seção (use /corrigir-layout)
❌ NÃO mexer em SEO/meta tags (use /corrigir-seo)
❌ NÃO pesquisar no Google
❌ NÃO criar seções novas
❌ NÃO mexer em navegação/menu

---

## 🏆 PADRÃO DE QUALIDADE — NÃO ENTREGAR NADA PELA METADE

> NÃO é superficial. Verificar CADA SEÇÃO individualmente.

### Para CADA seção, confirmar:
1. O container é `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto`? Se NÃO → CORRIGIR
2. O H2 tem APENAS classes de cor e margem? Se tem text-2xl, text-5xl → REMOVER
3. O H3 tem classe Tailwind de tamanho? Se SIM → REMOVER
4. O @layer base está em `<style type="text/tailwindcss">`? Se NÃO → MOVER
5. Os valores do @layer base são 32.44px/28.83px? Se 48px/36px → CORRIGIR
6. O conteúdo está dentro de `<section>`? Se HTML órfão → ENVOLVER
7. O texto é legível contra o fundo? Se contraste ruim → CORRIGIR

### PROIBIDO FINALIZAR SE:
❌ Qualquer seção com container diferente das demais
❌ Qualquer heading com classe Tailwind de tamanho
❌ @layer base em `<style>` sem `type="text/tailwindcss"`
❌ @layer base com valores errados (48px em h1, 36px em h2)
❌ H1 com style inline (font-size no style)
❌ HTML órfão fora de `<section>`
❌ Texto ilegível (contraste ruim)
❌ `font-bold` em H2 (H1 PODE ser extrabold/800 — é o padrão)
❌ CTA com tel:+5511999999999 ou wa.me/55XX (número placeholder)
❌ CTA "Solicitar orçamento" apontando pra /#contato ao invés de WhatsApp direto
❌ Container mobile com w-[96%] ou w-full (deve ser w-[92%])

✔ CADA seção verificada individualmente — sem exceção
✔ GREP final por 48px e 36px em h1/h2 — se aparecer = NÃO TERMINOU
✔ Verificar que `<style type="text/tailwindcss">` existe e contém @layer base

---

## MARCADOR DE CONCLUSÃO

```
✅ ESTRUTURA CORRIGIDA — QUALIDADE PREMIUM
📐 Tailwind CDN: [detectado/não] | @layer base em <style type="text/tailwindcss">: [✔/✘]
📐 Typescale: h1=32.44px/800 ✔ | h2=28.83px/400 ✔
📐 Containers: [X seções verificadas — TODAS iguais ✔]
📐 Headings: [classes Tailwind de tamanho removidas ✔]
📐 HTML órfão: [0 blocos fora de section ✔]
📐 Contraste: [TODAS as seções legíveis ✔]
```
