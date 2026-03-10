# SKILL: /auditar-pagina

> v3.0 — Auditoria ULTRA-FINA com BLOQUEIOS
> Cada ponto é verificação ativa — abrir, localizar, confirmar.
> Sem exceção, sem atalho, sem "provavelmente está certo".

Auditoria completa de página existente.
Aplicar quando receber página já desenvolvida para revisão ou melhoria.

---

## 🚫 ITENS QUE NÃO PODEM SER PULADOS (BLOQUEIO)

> Se QUALQUER um destes itens for pulado, a auditoria INTEIRA é INVÁLIDA.
> Não importa se tudo mais foi verificado — pular estes = refazer tudo.

1. **PESQUISA GOOGLE (PASSO 2 DO COMANDO)** — Pesquisar o tema do H1 no Google ANTES de editar qualquer copy. Entrar nos 5 primeiros resultados orgânicos. Listar URLs reais e H2s de cada.
2. **NAVEGAÇÃO** — Listar cada item do menu e o H2 da seção que ele aponta. "Início" → #hero (NUNCA ../). CORRIGIR todos os `href="../"` para `href="#secao"`.
3. **CONTAINERS** — TODOS devem usar `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto`.
4. **FAQ LAYOUT** — DEVE ser 2 colunas (F.A.Q esquerda + perguntas colapsáveis direita). NUNCA lista vertical.
5. **IMAGENS** — TODA seção DEVE ter ≥1 imagem. Se não tem → ADICIONAR.

### 🚨 ANTI-SIMULAÇÃO — PESQUISA GOOGLE

> A IA DEVE pesquisar DE VERDADE no Google. "Baseado em conhecimento de mercado" = FRAUDE.

❌ PROIBIDO: "Baseado em padrões conhecidos do setor" → isso é INVENTAR, não pesquisar
❌ PROIBIDO: "Simular pesquisa" ou "TOP 5 ORGÂNICOS PADRÃO" → FRAUDE
❌ PROIBIDO: Listar tópicos sem mostrar de QUAL URL vieram

✔ OBRIGATÓRIO: Usar a ferramenta de pesquisa web para buscar o tema
✔ OBRIGATÓRIO: Listar 5 URLs reais (com domínio visível)
✔ OBRIGATÓRIO: Para cada URL, listar os H2s e H3s encontrados
✔ OBRIGATÓRIO: Imprimir o STOP GATE: `🔍 PESQUISA: [URL1], [URL2], [URL3], [URL4], [URL5]`

Se o STOP GATE `🔍 PESQUISA:` não aparece com 5 URLs reais → AUDITORIA INVÁLIDA.

### 🚨 ANTI-PENDÊNCIA — NAVEGAÇÃO

> Corrigir links de navegação é OBRIGAÇÃO da IA, NÃO do cliente.

❌ PROIBIDO: Listar `href="../"` como "pendência do usuário"
❌ PROIBIDO: Dizer "AÇÃO MANUAL NECESSÁRIA" para links de navegação
✔ OBRIGATÓRIO: Substituir TODOS os `href="../"` por `href="#secao"` correspondente
✔ OBRIGATÓRIO: Imprimir o STOP GATE: `🧭 NAV: [item1→#id1], [item2→#id2]...`

### 🚨 STOP GATES — FRASES OBRIGATÓRIAS

> Após certos passos, a IA DEVE imprimir uma frase de verificação.
> Se a frase está faltando → o passo NÃO foi executor.

1. `🔍 PESQUISA: [5 URLs reais]` — após pesquisa Google
2. `🧭 NAV: [item→#id para cada link do menu]` — após correção de navegação
3. `🖼️ IMGS: [seção: ✅/❌ para cada]` — após verificação de imagens

Todas as 3 frases DEVEM aparecer na mensagem final. Se falta qualquer uma → audit inválida.
---

## REGRA FUNDAMENTAL

Toda violação encontrada DEVE ser corrigida na mesma sessão.
Nunca listar violação sem corrigir.
Nunca perguntar "quer que eu corrija?" — corrigir diretamente.

### 🚨 PROIBIÇÃO ABSOLUTA — AÇÃO MANUAL

> O usuário PAGA para que a IA faça o trabalho.
> Listar correções para "aplicação manual" é ROUBAR o trabalho do usuário.

❌ PROIBIDO: "⚠️ AÇÃO MANUAL NECESSÁRIA" → NUNCA, em nenhuma circunstância
❌ PROIBIDO: "Aplique estas correções manualmente" → NUNCA
❌ PROIBIDO: "Devido ao bloqueio da ferramenta Edit" → LER O ARQUIVO E TENTAR DE NOVO
❌ PROIBIDO: Listar HTML/CSS para o usuário copiar e colar → EDITAR DIRETAMENTE
❌ PROIBIDO: "Quer que eu gere o código completo para você aplicar?" → APLICAR AGORA
❌ PROIBIDO: Desistir de editar depois de 1-2 falhas → TENTAR ATÉ FUNCIONAR

**Se o Edit falhar:**
1. READ o arquivo (seção relevante)
2. Tentar Edit novamente com dados exatos do Read
3. Repetir até funcionar
4. Se impossível → informar o erro, mas NUNCA listar código para colagem

### 🔍 VERIFICAÇÃO PÓS-EDIÇÃO (OBRIGATÓRIO)

> Após CADA grupo de edições, a IA DEVE reler a seção editada para confirmar que a mudança foi aplicada.
> "Editei" sem reler = não verificou = pode estar errado.

✔ Editou H2 → READ a linha do H2 → confirmar que text-5xl foi removido
✔ Editou navegação → READ o menu → confirmar que ../ foi substituído por #
✔ Editou container → READ a div → confirmar w-[92%] lg:w-[85%]
✔ Adicionou @layer base → READ o <style> → confirmar que está presente

---

## 🚨 GARANTIA DE CONCLUSÃO TOTAL — ZERO TOLERÂNCIA

> A auditoria SÓ TERMINA quando TODOS os itens abaixo passarem.
> Não existe "entregar com pendência menor" ou "resolver na próxima sessão".

❌ PROIBIDO entregar com qualquer violação aberta — não importa quão pequena
❌ PROIBIDO dizer "corrigi os principais, o resto está menor"
❌ PROIBIDO entregar e sugerir "auditar novamente depois"
❌ PROIBIDO parar no meio por limite de contexto sem informar o que falta
❌ PROIBIDO marcar como concluído se pular qualquer seção do checklist

✔ OBRIGATÓRIO percorrer TODOS os 15 pontos de auditoria (seções 1.1 a 1.15)
✔ OBRIGATÓRIO corrigir CADA violação encontrada — sem exceção
✔ OBRIGATÓRIO reler a página inteira APÓS corrigir para verificar que não quebrou nada
✔ OBRIGATÓRIO executar /checklist-validacao ao final como segunda verificação
✔ OBRIGATÓRIO que o resultado final seja: ZERO violações em TODOS os 15 pontos

Se não conseguir completar por limite de contexto:
→ Listar EXATAMENTE o que falta (com número do ponto)
→ Nunca fingir que está tudo certo
→ O usuário NUNCA deve precisar pedir /auditar-pagina duas vezes para o mesmo problema

---

## 🚫 ZERO PENDÊNCIAS — REGRA ABSOLUTA

> NÃO EXISTE "pendência", "não crítico", ou "melhoria futura".
> Se encontrou um problema → CORRIGE AGORA. Sem exceção.

❌ PROIBIDO classificar qualquer violação como "pendência"
❌ PROIBIDO dizer "não é crítico" ou "não impede funcionamento"
❌ PROIBIDO sugerir "resolver em melhoria futura"
❌ PROIBIDO deixar seção duplicada sem mesclar
❌ PROIBIDO deixar seção sem ID
❌ PROIBIDO encontrar tópico faltante na copy e apenas anotar
❌ PROIBIDO listar o que deveria ser feito sem FAZER

✔ Seção duplicada → MESCLAR em 1 (manter o melhor conteúdo de cada)
✔ Seção sem ID → ADICIONAR ID baseado no H2
✔ Tópico faltante na copy → CRIAR seção nova com conteúdo real
✔ Ordem do menu errada → REORGANIZAR as seções da página
✔ Nome do menu genérico → RENOMEAR para versão técnica do H2

Se o AI encontra um problema e não corrige → a auditoria é INVÁLIDA.

---

## ETAPA 0 — LER TODOS OS RULES (SEM EXCEÇÃO)

Ler completamente antes de abrir qualquer arquivo:
1. .claude/rules/design.md (incluindo seções 11 e 12)
2. .claude/rules/header-hero.md
3. .claude/rules/seo.md
4. .claude/rules/performance.md
5. .claude/rules/security.md
6. .claude/rules/tracking.md
7. .claude/rules/copywriting.md
8. .claude/rules/standards.md
9. .claude/rules/navigation.md
10. .claude/rules/sitemap.md
11. .claude/rules/layout.md

❌ Se não leu TODOS os 11 → NÃO INICIAR a auditoria.

---

## ETAPA 1 — MAPEAMENTO SEÇÃO POR SEÇÃO

> 🚫 ANTES de auditar qualquer coisa, MAPEAR a página inteira.
> O mapeamento é a PROVA de que o AI leu cada seção.

### PASSO ZERO — MAPEAMENTO OBRIGATÓRIO (antes de auditar)

Abrir o arquivo HTML e percorrer do INÍCIO ao FIM. Para cada `<section>` encontrada, registrar:

```
MAPA DA PÁGINA:
1. Linha XX — <section id="hero"> — H2: (nenhum) — Layout: [tipo] — Container: [classe]
2. Linha XX — <section id="xxx"> — H2: "Texto" — Layout: grid 3col / vertical / split — Container: [classe]
3. Linha XX — <section id="xxx"> — H2: "Texto" — Layout: [tipo] — Componente: cards/steps/collapse — Container: [classe]
...
N. Linha XX — <section id="contato"> — H2: "..." — Layout: [tipo] — Container: [classe]
FOOTER: Linha XX — Container: [classe]
TOTAL: N seções + footer
DUPLICATAS: [listar seções com temas similares]
```

### VERIFICAÇÕES IMEDIATAS NO MAPA:

❌ Se o mapa tem menos de 6 seções → CRIAR seções novas (com copy real, não placeholder)
❌ Se alguma seção não tem ID → ADICIONAR ID baseado no H2 (agora, não depois)
❌ Se algum container não é `w-[92%] lg:w-[85%] max-w-[1800px]` → CORRIGIR (agora)
❌ Se 2 seções cobrem o mesmo tema (ex: 2x "Como funciona") → MESCLAR em 1 seção
❌ Se alguma seção tem layout vertical com 3+ itens → CONVERTER para grid horizontal
❌ Se alguma seção é só texto sem componente visual → ADICIONAR cards/steps/stats/collapse
❌ Se alguma seção é inconsistente visualmente com as outras → PADRONIZAR (H2, subtítulo, espaçamento)

### CONSISTÊNCIA DE DESIGN POR SEÇÃO (OBRIGATÓRIO VERIFICAR EM CADA SEÇÃO):

Para CADA seção do mapa, conferir:

### 🚨🚨🚨 TYPESCALE + TAILWIND CDN — VERIFICAÇÃO #1 (ANTES DE TUDO) 🚨🚨🚨

> GREP no CSS da página pelos valores reais. NÃO confiar no que "parece" certo.

**PASSO A** — Verificar Tailwind CDN:

grep -n "cdn.tailwindcss" arquivo.html → se encontrar = usa Tailwind CDN
→ O @layer base DEVE estar dentro de `<style type="text/tailwindcss">`, NÃO em `<style>` normal.
→ Se @layer base está em `<style>` normal → headings estão QUEBRADOS → MOVER para `<style type="text/tailwindcss">`

**PASSO B** — GREP pelos valores ERRADOS:

grep -n "48px" arquivo.html → se em h1 no @layer base = ERRADO → trocar para 32.44px
grep -n "36px" arquivo.html → se em h2 no @layer base = ERRADO → trocar para 28.83px
grep -n "font-weight: 700" arquivo.html → se em h2 = ERRADO → trocar para 400
grep -n "!important" arquivo.html → se nos headings = ERRADO → REMOVER

**PASSO C** — Verificar formato CSS:
- CORRETO: `<style type="text/tailwindcss">` com `@layer base { h1 { font-size: 32.44px; font-weight: 800; } }`
- ERRADO: `<style>` normal com @layer base (Tailwind CDN ignora)
- ERRADO: h1 { font-size: 48px } (valor errado)
- Se formato ERRADO → SUBSTITUIR bloco inteiro por @layer base correto

**PASSO D** — H1 do hero:
- Se H1 tem style="font-size: ..." inline → REMOVER o atributo style INTEIRO
- O @layer base já aplica. H1 deve ter APENAS classes de cor: class="text-white mb-6"

**VALORES CORRETOS (nunca outros):**
- h1 = 32.44px / font-weight 800 (NUNCA 48px)
- h2 = 28.83px / font-weight 400 (NUNCA 36px, NUNCA 700)
- h3 = 25.63px / font-weight 700

### VERIFICAÇÕES RESTANTES POR SEÇÃO:

✔ H2 em sentence case ("Perguntas frequentes" NÃO "Perguntas Frequentes")
✔ Se H2 tem span text-red-600 → só se H2 tem 4+ palavras
✔ Wrapper do título tem div class="text-left mb-20"
✔ Subtítulo: text-base text-gray-600 max-w-4xl font-light + letter-spacing: 0.05em
✔ Se seção NÃO tem subtítulo → ADICIONAR
✔ H3 em cards NÃO usa classes Tailwind de tamanho → CSS global aplica
✔ H3 em cards em sentence case
✔ Fonte da página NÃO foi alterada

### AUDITAR = MELHORAR (NÃO APENAS VERIFICAR)

> Se uma seção está visualmente feia, pobre, ou com copy fraca → MELHORAR.
> A auditoria não é só "tem ou não tem" → é "está BOM o suficiente para um site PREMIUM?".

Para CADA seção, responder HONESTAMENTE:
- "Se eu fosse o dono desta empresa, teria orgulho de mostrar esta seção a um cliente?"
- Se a resposta é NÃO → REDESENHAR

**Checklist de qualidade por seção:**
✔ Tem pelo menos 1 imagem/ilustração? (se não → ADICIONAR)
✔ Tem subtítulo padrão? (se não → ADICIONAR)
✔ H2 tem 5+ palavras? (se não → REESCREVER)
✔ H2 está em sentence case? (se não → CORRIGIR)
✔ Span colorido segue regras? (pontuação dentro, 2+ palavras normais antes)
✔ Copy tem profundidade? (mínimo 2 parágrafos com dados concretos)
✔ Layout usa grid ou split? (não lista vertical)
✔ FAQ usa layout 2 colunas? (F.A.Q esquerda, perguntas direita)

### 🚨 LAYOUTS PROIBIDOS (VERIFICAR EM CADA SEÇÃO):
❌ Timeline vertical / steps verticais com bolhas conectadas → REFAZER em grid horizontal 3-4 colunas
❌ Zig-zag com fundo preto (itens alternando esquerda/direita) → REFAZER em grid uniforme
❌ Conteúdo empilhado numa coluna vertical infinita → REFAZER em grid 2-4 colunas
❌ Seção com space-y-8 em desktop → PROVAVELMENTE vertical → REFAZER em grid

### 🚨 ESTATÍSTICAS INVENTADAS (VERIFICAR):
❌ Seção de "números" com dados como "350+ instalações", "14 anos", "98% satisfação"
❌ Se o CLIENTE não forneceu esses números → REMOVER a seção inteira
❌ Seção de stats com dados genéricos = INVENTADO = REMOVER
✔ Só manter estatísticas se forem dados REAIS fornecidos pelo cliente

❌ PROIBIDO aprovar seção esteticamente ruim
❌ PROIBIDO aprovar seção com copy genérica ou rasa
❌ PROIBIDO aprovar seção que destoa visualmente das outras
❌ PROIBIDO aprovar seção sem nenhuma imagem/ilustração
❌ PROIBIDO aprovar seção com layout vertical em desktop
❌ PROIBIDO aprovar seção com números/stats inventados
✔ Se seção é feia → REDESENHAR layout (mesmos padrões das melhores seções)
✔ Se copy é fraca → REESCREVER com dados concretos e benefícios claros
✔ Se design inconsistente → PADRONIZAR para ficar idêntico às demais seções

### ORDEM INTELIGENTE DAS SEÇÕES

> A ordem das seções na página importa. Seções de alto impacto devem vir PRIMEIRO.
> Se uma seção importante está enterrada lá embaixo → MOVER para cima.

**Ordem de prioridade recomendada (abaixo do hero):**

| Prioridade | Tipo de Seção | Por quê |
|---|----|----|
| 1 | Benefícios / Vantagens | visitante quer saber o que ganha |
| 2 | O que está incluído / Como funciona | o que recebe pelo investimento |
| 3 | Tipos / Variedades | opções disponíveis |
| 4 | Dimensionamento / Cálculo | como escolher o ideal |
| 5 | CTA intermediário | capturar quem já se convenceu |
| 6 | Investimento / ROI | quanto custa e quanto economiza |
| 7 | Processo / Fases | como funciona passo a passo |
| 8 | Financiamento | formas de pagamento |
| 9 | Legislação / Normas | requisitos legais |
| 10 | FAQ | dúvidas restantes |
| 11 | Outros serviços | cross-sell |
| 12 | CTA final / Contato | captura final |

✔ Se seção de benefícios está na posição 6 → MOVER para posição 1
✔ Se FAQ está acima de Investimento → MOVER FAQ para depois
✔ CTA intermediário deve ficar entre as seções 4-5 (não logo após o hero)

### AÇÃO OBRIGATÓRIA:
Corrigir TODAS as violações do mapa ANTES de prosseguir com os 15 pontos.
Seções duplicadas mescladas. Seções sem ID corrigidas. Layouts verticais convertidos.
Design padronizado. Sentence case aplicado. Spans coloridos corrigidos.
Ordem de seções verificada e ajustada. Imagens verificadas.
Só depois disso → verificar CADA seção contra os pontos 1.1 a 1.15:

Para cada seção, verificar ATIVAMENTE (abrir o trecho, não assumir):

### 1.1 Header
✔ glass effect (backdrop-filter: blur)
✔ tipografia em px (não classes text-*)
✔ dropdown de serviços completo com todas as páginas
✔ CTA com facebookclick + gtag_report_conversion
✔ menu mobile funcional com fechar após clique

### 1.2 Hero
✔ min-h-screen | overlay gradiente Netflix (from-black via-black/80 to-black/40)
✔ h1 em 32.44px font-weight 800 (via @layer base em `<style type="text/tailwindcss">`)
✔ NUNCA style inline no H1. NUNCA 48px.
✔ subtítulos em px corretos (18px/300 + 16px/400)
✔ 2 CTAs com tracking (facebookclick + gtag)
✔ breadcrumb presente com estrutura JSON-LD
✔ vídeo hero: autoplay, loop, muted, playsinline, onloadedmetadata="this.play()"
✔ z-index correto: vídeo z-0, overlay z-10, conteúdo z-20

### 1.3 Títulos H2 (TODOS — verificar CADA UM)
✔ @layer base presente no CSS em `<style type="text/tailwindcss">` com h1 = 32.44px/800 e h2 = 28.83px/400 (ver design.md secao 3)
- GREP por 48px e 36px no @layer base - se encontrar = ERRADO, trocar para 32.44px e 28.83px
- GREP por font-weight: 700 em h2 - se encontrar = ERRADO, trocar para 400
- Se @layer base está em `<style>` normal (sem type) → MOVER para `<style type="text/tailwindcss">`
- Se H1 do hero tiver style inline (style com font-size) = REMOVER o style inline
- VALORES CORRETOS: h1=32.44px/800, h2=28.83px/400, h3=25.63px/700
✔ H2 usa APENAS classes de cor e margem: `class="text-gray-900 mb-6"` — NENHUMA classe de tamanho
✔ Destaque em `<span class="text-red-600">`
✔ Se fundo escuro: text-white
✔ TODOS os h2 da página IDÊNTICOS visualmente
✔ Nunca text-5xl | nunca text-6xl | nunca text-4xl | nunca mb-4

### 1.4 Subtítulos de Seção (TODOS — verificar CADA UM)
✔ text-base text-gray-600 font-light
✔ letter-spacing: 0.05em (inline style no subtítulo, já que não está no @layer base para p)
✔ max-w-4xl (no subtítulo, não no container)
✔ Se fundo escuro: text-gray-100
✔ Nunca text-lg | nunca text-gray-700 | nunca font-medium

### 1.5 Espaçamento Título → Conteúdo
✔ Container título+subtítulo: mb-20 (nunca mb-16/12/8)
✔ text-left (nunca text-center em páginas de serviço)

### 1.6 Alinhamento Vertical e Largura
✔ TODAS as seções usam `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto`
✔ Nenhuma seção com `max-w-7xl` como container principal
✔ Nenhuma seção com largura diferente das demais
✔ Os containers seguem a mesma linha vertical esquerda
✔ Scroll visual: nenhuma seção "pula" lateralmente

### 1.7 Cada Seção de Conteúdo
✔ Container: `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto`
✔ 3+ itens em grid horizontal (nunca lista vertical)
✔ tipografia conforme tabela design.md seção 3
✔ nenhum badge decorativo acima de títulos
✔ contraste título (gordo escuro) vs subtítulo (fino acinzentado)
✔ cards com border-gray-200, shadow só no hover
✔ Layout texto+imagem: `items-center` no grid, imagem com `max-h-[450px]`
✔ Imagem NUNCA 2x mais alta que o texto ao lado

### 1.8 Navegação Interna (páginas de serviço)

> 🚫 BLOQUEIO: Listar CADA item do menu e o H2 correspondente para provar que está correto.

✔ html { scroll-behavior: smooth; } presente
✔ Hero tem `id="hero"` obrigatoriamente
✔ Cada seção de conteúdo tem ID correspondente ao menu
✔ "Início" → `#hero` (topo da página ATUAL — NUNCA ../)
✔ "Serviços" → dropdown com outras páginas
✔ Menu mobile: mesmos links que desktop
✔ Menu mobile fecha ao clicar em link interno
✔ Nomes no menu = versões curtas dos H2 REAIS (máx 3 palavras, tom técnico)
✔ Ordem itens no menu = ordem EXATA das seções na página (1ª seção = 1º item)
✔ Se 3º item do menu leva pro final da página → VIOLAÇÃO (fora de ordem)
✔ PROVA: listar → "Menu item X → aponta para #id → H2 da seção é Y → posição: Zª seção"
❌ Nomes como "Por quê?", "Porque", "Benefícios", "Processo", "Incluído" → VIOLAÇÃO
❌ "Início" apontar para ../ → VIOLAÇÃO

### 1.9 SEO Completo
✔ `<title>` — máximo 65 caracteres (contar)
✔ `<meta description>` — máximo 155 caracteres (contar)
✔ canonical presente e correto
✔ JSON-LD correto para o tipo de página
✔ og:image em 1200×630px WebP
✔ breadcrumb JSON-LD
✔ Conteúdo reflete pesquisa real de concorrentes (não genérico)
✔ Mínimo ~520 palavras na página
✔ Hierarquia h1 → h2 → h3

### 1.10 Contraste WCAG AA
✔ bg-white: texto text-gray-900/800 (nunca text-gray-400/500)
✔ bg-gray-50: texto text-gray-900/600 (nunca text-gray-400/500)
✔ Fundo escuro (bg-black, from-gray-900): texto text-white/gray-100 (nunca text-gray-300/400)
✔ Fundo vermelho (from-red-600): texto text-white. Span text-red-600 em fundo vermelho = INVISÍVEL → REMOVER/trocar
✔ text-gray-400 em fundo escuro = PROIBIDO → trocar para text-gray-100

### 1.11 Copy — PESQUISA ATIVA NO GOOGLE + Qualidade do Texto

> 🚫 BLOQUEIO: SE ESTE PASSO FOR PULADO, A AUDITORIA INTEIRA É INVÁLIDA.
> NÃO é verificar se o texto "parece ok". É pesquisar no Google DE VERDADE.
> Marcar como ✅ sem ter feito pesquisa = FRAUDE na auditoria.

**PASSO A — Pesquisa no Google (OBRIGATÓRIO):**
1. Ler o `<h1>` da página auditada → identificar o tema/palavra-chave principal
2. Pesquisar esse tema no Google (ex: "instalações hidráulicas residenciais SP")
3. Ignorar resultados patrocinados (Ads) — apenas orgânicos
4. Entrar nos **5 primeiros resultados orgânicos**
5. Para cada resultado, extrair e documentar:
   - URL completa do resultado
   - Todos os `<h2>` e `<h3>` (estrutura de seções)
   - Que dores/problemas abordam
   - Que benefícios e provas usam
   - Tom e nível de especificidade da copy
   - Tamanho aproximado do conteúdo

**🔍 STOP GATE OBRIGATÓRIO após PASSO A:**
Imprimir: `🔍 PESQUISA: [URL1], [URL2], [URL3], [URL4], [URL5]`
Se não listou 5 URLs reais (com domínio visível) → AUDITORIA INVÁLIDA.
❌ "Baseado em conhecimento de mercado" = FRAUDE. Deve usar ferramenta de pesquisa real.

**PASSO B — Análise de padrões:**
6. Identificar: quais seções aparecem em TODOS os top 5?
7. Identificar: quais seções são exclusivas dos #1 e #2?
8. Mapear: que tipo de prova social e dados concretos usam?
9. Conclusão: o que a página auditada tem que os top 5 NÃO têm? (diferencial)

**PASSO C — Comparação e reescrita (OBRIGATÓRIO APLICAR, NÃO APENAS ANOTAR):**
10. Comparar os headings da página auditada com os headings dos top 5
11. Se a página auditada tem seções que os top 5 NÃO cobrem → manter (é diferencial)
12. Se os top 5 cobrem tópicos que a página auditada NÃO tem → **CRIAR seção nova** com:
    - H2 técnico e profissional (5+ palavras, sentence case)
    - Mínimo 3 parágrafos de conteúdo real (não placeholder)
    - Componente DaisyUI apropriado (cards, stats, steps, collapse)
    - ID correspondente para navegação
    - Pelo menos 1 imagem (Unsplash ou Google Images)
13. Se algum heading da página é genérico demais vs os top 5 → **REESCREVER** o heading agora
14. Reescrever copy para ser melhor que TODOS os top 5 — mais específica, mais concreta, mais profissional

❌ PROIBIDO encontrar tópico faltante e apenas LISTAR como "poderia adicionar"
❌ PROIBIDO dizer "Pendência de copy" — se falta, CRIA agora
✔ Se a pesquisa revela que faltam 3 tópicos → CRIAR 3 seções novas COM conteúdo

**ORDEM CRÍTICA: A pesquisa Google (PASSO A-C) DEVE acontecer ANTES de qualquer edição de copy.**
**Se a IA editou copy sem ter pesquisado antes → AUDORIA INVÁLIDA.**

**PASSO D — Checklist de qualidade (após pesquisa E reescrita):**
✔ Nenhum clichê vago: "soluções completas", "qualidade certificada"
✔ Todo benefício é concreto e mensurável
✔ Todo resultado é específico (não "garantindo conforto")
✔ Se o leitor pensar "ok, mas como me beneficio?" → reescrever agora
✔ Copy é igual ou superior ao melhor resultado orgânico do Google
✔ Seções/headings cobrem os mesmos tópicos que os top 5 ranqueados
✔ Página tem profundidade suficiente para o Google querer ranquear
✔ Mínimo 6 seções de conteúdo (excluindo hero e footer) — CONTAR
✔ Mínimo 800 palavras de conteúdo total — CONTAR
✔ Componentes DaisyUI usados para variedade visual (cards, steps, collapse, stats)
✔ Nenhuma seção é só texto — cada uma tem recurso visual diferente
✔ Nenhuma seção vazia ou com 1 frase só
✔ Todo tópico que os top 5 cobrem foi IMPLEMENTADO (não apenas anotado)

❌ NUNCA pular a pesquisa no Google — é OBRIGATÓRIA na auditoria
❌ NUNCA manter copy genérica se os top 5 do Google são mais específicos
❌ NUNCA auditar copy sem ter pesquisado os concorrentes primeiro

### 1.12 Tracking e Conversão
✔ facebookclick em TODOS os CTAs (hero, seções, footer, WhatsApp)
✔ gtag_report_conversion em TODOS os CTAs
✔ GA4 instalado com ID correto
~~✔ Banner de cookies bloqueando tracking antes do aceite~~ → REMOVIDO (não criar banner de cookies)
✔ CTA acima da dobra + repetido a cada 2-3 seções

### 1.13 Performance
✔ Imagens em WebP/AVIF | lazy loading (exceto hero: eager)
✔ Skeleton loading em conteúdo dinâmico
✔ Scripts com defer/async
✔ Font preload + font-display: swap

### 1.14 Footer e Elementos Globais
✔ Links legais: Política de Privacidade, Cookies, Termos de Uso
  - TODOS com `target="_blank" rel="noopener noreferrer"`
  - URLs: /politica-de-privacidade/, /politica-de-cookies/, /termos-de-uso/
  - Se página não existir → CRIAR AGORA (pasta + index.html)
✔ Copyright dinâmico: formato `ANO – ANO+1` (ex: 2026 – 2027) via JavaScript — NUNCA ano hardcoded, NUNCA ano único
✔ og:image apontando para imagem EXISTENTE na pasta do projeto
✔ WhatsApp flutuante com facebookclick + gtag
✔ Crédito: guilhermesites.com.br com rel="noopener follow"
✔ Mapa do Google Maps embed
~~✔ Banner de cookies funcional~~ → REMOVIDO (não criar banner de cookies)
✔ Página 404 customizada

### 1.15 Sitemap e Robots — VERIFICAR E CORRIGIR/GERAR
✔ Página listada no sitemap.xml do domínio correto
✔ robots.txt existe e aponta para sitemap.xml
✔ URLs com HTTPS e trailing slash
✔ lastmod atualizado para data de hoje

**Se sitemap.xml NÃO EXISTIR:**
→ Perguntar ao usuário qual domínio vai instalar o site
→ GERAR sitemap.xml completo conforme .claude/rules/sitemap.md
→ GERAR robots.txt conforme .claude/rules/sitemap.md
→ Listar TODAS as páginas HTML do projeto no sitemap

**Se sitemap.xml EXISTIR mas estiver desatualizado:**
→ ATUALIZAR adicionando páginas faltantes
→ ATUALIZAR `<lastmod>` de todas as URLs
→ REMOVER páginas que não existem mais

❌ NUNCA apenas reportar "sitemap está desatualizado" — CORRIGIR na hora

---

## ETAPA 2 — CORREÇÃO

Corrigir TODAS as violações encontradas, uma por uma, completamente.
Não passar para a próxima violação sem terminar a atual.

Ordem de prioridade:
1. Violações de estrutura (h2, subtítulos, espaçamento)
2. Alinhamento vertical
3. Navegação interna
4. SEO e meta tags
5. Tracking e CTAs
6. Copy e conteúdo
7. Sitemap (gerar se não existir, atualizar se desatualizado)

---

## ETAPA 3 — VERIFICAÇÃO FINAL

Executar /checklist-validacao após todas as correções.
Reler a página inteira novamente do início ao fim.
Se encontrar QUALQUER violação residual → corrigir e reiniciar checklist.
Só então entregar.

---

## ETAPA 4 — COMPARAÇÃO COM PÁGINA APROVADA

Se existir página aprovada no projeto:
1. Abrir a página aprovada
2. Abrir a página auditada
3. Comparar visualmente: tamanho h2, espaçamento, subtítulos, alinhamento, layout
4. Se qualquer diferença → corrigir para igualar

---

## FORMATO DE ENTREGA

Após concluir:
✅ [lista do que foi corrigido — TUDO que foi encontrado deve estar aqui]
⚠️ [APENAS itens que dependem de dado do CLIENTE — ex: ID do GA4, domínio para sitemap]
🔲 [o que o cliente precisa fornecer — se houver]

❌ NUNCA colocar violação técnica como ⚠️ — se é técnico, corrigiu agora.

---

## 📊 SISTEMA DE PONTUAÇÃO — NOTA DA AUDITORIA (0-100)

> Ao final de CADA auditoria, atribuir uma nota de 0 a 100.
> A nota é a soma das categorias abaixo. Score < 85 = FAIL → continuar corrigindo.

| Categoria | Peso | Critério |
|---|---|---|
| **Design** | 25 pts | H2 padronizados, subtítulos corretos, mb-20, alinhamento vertical, FAQ 2 colunas, sem badges |
| **Copy** | 20 pts | H2 5+ palavras, sentence case, profundidade, dados concretos, sem clichês |
| **Ilustrações** | 15 pts | Cada seção tem imagem, imagens relevantes, alt correto, Unsplash/Google sourcing |
| **SEO** | 15 pts | Meta description, canonical, JSON-LD, sitemap, og:image, robots.txt |
| **Navegação** | 10 pts | Menu 7-8 itens, ordem correta, links funcionais, #hero no Início |
| **Interatividade** | 10 pts | Hover states, transições, animações, FAQ collapsible, WhatsApp flutuante |
| **Consistência** | 5 pts | Containers iguais, fonte mantida, cores coerentes, spans corretos |

**Critério de aprovação:**
- 95-100 → ✅ EXCELENTE — pronta para deploy
- 85-94 → ✅ BOA — aceitável, mas pode melhorar
- 70-84 → ❌ FAIL — precisa mais correções
- < 70 → ❌ REPROVADA — redesenhar seções inteiras

**🚨 BLOCKERS POR CATEGORIA (A IA NÃO PODE INFLAR A NOTA):**

| Situação | Blocker |
|---|---|
| FAQ NÃO é 2 colunas | Design máx 15/25 |
| H2 usa text-5xl em vez de @layer base | Design máx 10/25 |
| Google NÃO pesquisado de verdade (sem URLs) | Copy máx 5/20 |
| Algum H2 tem <5 palavras | Copy máx 10/20 |
| Qualquer seção sem imagem | Ilustrações máx 5/15 |
| Sem meta description | SEO máx 5/15 |
| Qualquer link com `../` | Navegação = 0/10 |
| FAQ não collapsible | Interatividade máx 5/10 |
| Containers misturados | Consistência = 0/5 |

**A nota DEVE aparecer no final:**
```
📊 NOTA DA AUDITORIA: XX/100
- Design: XX/25
- Copy: XX/20
- Ilustrações: XX/15
- SEO: XX/15
- Navegação: XX/10
- Interatividade: XX/10
- Consistência: XX/5
```

❌ Se nota < 85 → PROIBIDO colocar o marcador "AUDITORIA FINALIZADA"
❌ Se algum blocker está ativo → a nota da categoria NÃO pode exceder o máximo do blocker

---

## 🚨 MARCADOR DE CONCLUSÃO — OBRIGATÓRIO

> A última mensagem da auditoria DEVE conter exatamente:

```
✅ AUDITORIA FINALIZADA — ZERO VIOLAÇÕES
📊 NOTA: XX/100
🔍 PESQUISA: [URL1], [URL2], [URL3], [URL4], [URL5]
🧭 NAV: [item1→#id1], [item2→#id2], ...
🖼️ IMGS: [seção1: ✅], [seção2: ✅], ...
```

✔ Se a auditoria terminar sem TODAS estas linhas → a auditoria NÃO terminou
✔ Se precisou parar por limite de contexto → NÃO colocar esta frase, e listar o que falta
✔ O usuário usa esta frase para confirmar que o trabalho está 100% completo
❌ NUNCA colocar esta frase se ainda existem violações abertas
❌ NUNCA colocar esta frase se a nota é < 85
❌ NUNCA colocar esta frase se algum STOP GATE está faltando

