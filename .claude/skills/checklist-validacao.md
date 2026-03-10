# SKILL: /checklist-validacao

> v3.0 — Checklist ULTRA-FINO com PROVA OBRIGATÓRIA
>
> ⚠️ REGRA DE EXECUÇÃO
>
> Cada item é uma VERIFICAÇÃO ATIVA — abrir o arquivo, localizar o trecho, confirmar.
>
> ❌ Proibido marcar ✅ sem ter aberto e verificado o trecho
> ❌ Proibido assumir que está correto por ter sido implementado antes
> ❌ Proibido pular item com "provavelmente está certo"
> ❌ Checklist incompleto = entrega bloqueada
>
> Se encontrar violação no meio do checklist → corrigir e reiniciar do zero.

---

## TÉCNICO
✔ nenhum erro no console | nenhum 404 em assets

## HEADER E HERO
✔ glass effect funcionando (backdrop-filter: blur)
✔ dropdown com todos os serviços
✔ menu mobile funcional (fecha ao clicar link interno)
✔ h1 em 32.44px font-weight 800 (extrabold, via @layer base em `<style type="text/tailwindcss">`)
✔ GREP por 48px em h1 → se encontrar = ERRADO = REPROVADO (correto = 32.44px)
✔ H1 do hero SEM style inline (font-size no style = REPROVADO)
✔ CSS usa `<style type="text/tailwindcss">` com @layer base (NÃO `<style>` normal)
✔ overlay gradiente Netflix no hero
✔ 2 CTAs no hero com facebookclick + gtag_report_conversion
✔ vídeo hero: autoplay, loop, muted, playsinline, onloadedmetadata
✔ Parágrafos do hero: text-gray-300, 16px, font-weight 400, line-height 1.6, letter-spacing 0.04em

## TÍTULOS H2 — CONSISTÊNCIA VISUAL
✔ @layer base presente em `<style type="text/tailwindcss">` com h1=32.44px/800 e h2=28.83px/400 (GREP confirmar — 48px ou 36px = ERRADO = REPROVADO)
✔ @layer base NÃO está em `<style>` normal (sem type) — se está = QUEBRADO = REPROVADO
✔ NENHUM !important nos headings
✔ NENHUM h2/h3 com classes Tailwind de tamanho (text-5xl, text-2xl, font-bold, etc.)
✔ H2 usa apenas classes de cor e margem: `class="text-gray-900 mb-6"`
✔ Destaques em `<span class="text-red-600">`
✔ Fundo escuro: text-white (não text-gray-900)

## SUBTÍTULOS
✔ text-base text-gray-600 font-light
✔ letter-spacing: 0.05em (inline)
✔ max-w-4xl no subtítulo
✔ Fundo escuro: text-gray-100

## ESPAÇAMENTO
✔ Container título+subtítulo: mb-20 (nunca mb-16/12/8)
✔ text-left em páginas de serviço

## ALINHAMENTO VERTICAL E LARGURA
✔ TODAS as seções usam `w-[92%] lg:w-[85%] max-w-[1800px] mx-auto`
✔ Nenhuma seção com `max-w-7xl` como container principal
✔ Nenhuma seção com largura diferente das demais
✔ Containers seguem mesma linha vertical esquerda

## LAYOUT E DESIGN
✔ nenhuma seção com max-w-4xl ou menor
✔ nenhuma lista vertical com 3+ itens (deve ser grid horizontal)
✔ NENHUM timeline vertical / steps verticais com bolhas — deve ser grid 3-4 colunas
✔ NENHUM zig-zag com fundo preto alternando esquerda/direita
✔ NENHUM conteúdo empilhado vertical em desktop — sempre grid 2-4 colunas
✔ nenhum badge decorativo acima de títulos
✔ contraste: título gordo/escuro vs subtítulo fino/acinzentado
✔ cards com border-gray-200 | shadow apenas no hover
✔ tipografia conforme design.md (px ou Tailwind conforme projeto)
✔ Imagens em layouts 2 colunas com `max-h-[450px]` e `items-center`
✔ Imagem NUNCA 2x mais alta que o texto ao lado
✔ NENHUMA seção com números/stats inventados (350+, 14 anos, 98% — se cliente não deu = REMOVER)

## NAVEGAÇÃO INTERNA (páginas de serviço)
✔ html { scroll-behavior: smooth; }
✔ Hero tem `id="hero"`
✔ "Início" → `#hero` (NUNCA ../)
✔ Nomes no menu = versões curtas dos H2 reais (máx 3 palavras, tom técnico)
✔ LISTAR cada item do menu e o H2 correspondente para provar que confere
✔ Ordem no menu = ordem EXATA das seções na página (verificar 1 por 1)
✔ Dropdown serviços → links para outras páginas
✔ Menu mobile fecha ao clicar link interno
❌ Se encontrar: "Por quê?", "Porque", "Benefícios", "Processo", "Incluído" → VIOLAÇÃO

## LINKS E BREADCRUMB
✔ todos os links funcionam | breadcrumb correto
✔ menu com todos os serviços | zero páginas órfãs
✔ breadcrumb JSON-LD presente

## SEO
✔ `<title>` presente (máximo 65 caracteres — contar)
✔ `<meta description>` presente (máximo 155 caracteres — contar)
✔ canonical implementado
✔ JSON-LD correto para o tipo de página
✔ og:image em 1200×630px WebP
✔ favicon e apple-touch-icon presentes
✔ Hierarquia h1 → h2 → h3

## CONTRASTE WCAG AA
✔ bg-white: text-gray-900/800 (nunca 400/500)
✔ Fundo escuro (bg-black, from-gray-900): text-white/gray-100 (nunca 300/400)
✔ Fundo vermelho (from-red-600): text-white. Span text-red-600 em fundo vermelho = INVISÍVEL = REPROVADO
✔ text-gray-400 em fundo escuro = PROIBIDO = REPROVADO
✔ Texto ≥18px: contraste 3:1 | <18px: 4.5:1

---

## 🔍 COPY — PESQUISA GOOGLE OBRIGATÓRIA (NÃO PULAR)

> 🚨 ESTA SEÇÃO É OBRIGATÓRIA. NÃO PODE SER RESUMIDA NEM PULADA.
> Se marcar ✅ sem ter feito a pesquisa → ENTREGA INVÁLIDA.

**PASSO 1 — Pesquisar:** Ler o H1 da página. Pesquisar esse tema no Google.

**PASSO 2 — Entrar nos resultados:** Abrir os 5 primeiros resultados ORGÂNICOS (ignorar anúncios). Ler os H2 e H3 de cada um.

**PASSO 3 — Comparar:** Listar os tópicos/seções que os top 5 cobrem vs o que a página auditada cobre.

**PASSO 4 — Corrigir:**
- Se os top 5 cobrem tópicos que a página NÃO cobre → ADICIONAR seções
- Se os headings da página são genéricos vs top 5 → REESCREVER
- Se a copy é rasa vs top 5 → APROFUNDAR

**PASSO 5 — Validar copy:**
✔ Nenhum clichê vago ("soluções completas", "qualidade certificada")
✔ Benefícios concretos e mensuráveis
✔ Resultados específicos com dados reais
✔ Copy igual ou SUPERIOR ao #1 orgânico do Google
✔ Mínimo 6 seções de conteúdo (excluindo hero e footer) — CONTAR
✔ Mínimo 800 palavras — CONTAR
✔ Componentes DaisyUI usados (cards, steps, collapse, stats, timeline)
✔ Cada seção com recurso visual diferente (nunca só texto)

❌ NUNCA marcar copy como ✅ sem ter pesquisado no Google
❌ NUNCA dizer "Copy baseada em pesquisa" sem ter FEITO a pesquisa agora
❌ NUNCA aceitar < 6 seções ou < 800 palavras

---

## PERFORMANCE
✔ imagens em WebP/AVIF | lazy loading (exceto hero: eager)
✔ skeleton loading em conteúdo dinâmico | scripts com defer
✔ font preload + font-display: swap

## RESPONSIVIDADE E ACESSIBILIDADE
✔ funcional em 360px, 768px, 1024px, 1440px
✔ contraste WCAG AA | labels em todos os inputs
✔ nenhum overflow horizontal

## NEGÓCIO E CONVERSÃO
✔ CTA acima da dobra | WhatsApp flutuante
✔ formulário enviando + email chegando
✔ facebookclick + gtag em TODOS os botões de conversão
~~✔ banner de cookies funcional~~ → REMOVIDO (não criar banner de cookies)
✔ links legais no footer | crédito no rodapé | página 404

## SITEMAP E ROBOTS (verificar E corrigir/gerar)
✔ Página listada no sitemap.xml
✔ sitemap.xml na raiz do domínio
✔ robots.txt com referência ao sitemap
✔ URLs com HTTPS e trailing slash
✔ lastmod atualizado
✔ Se sitemap não existe → GERAR (perguntar domínio ao usuário)
✔ Se sitemap desatualizado → ATUALIZAR

## COMPARAÇÃO COM PÁGINA APROVADA
✔ Tamanho h2 = idêntico à página de referência
✔ Espaçamento entre seções = idêntico
✔ Contraste subtítulos = idêntico
✔ Alinhamento vertical = idêntico
✔ Layout horizontal = idêntico

---

## 🚨 REGRA DE CONCLUSÃO — ZERO PENDÊNCIAS

> Só existe ✅ (passou) ou ❌ (violação → corrigir AGORA).
> NÃO EXISTE ⚠️ "pendência", "não crítico", ou "melhoria futura".

❌ NUNCA entregar com qualquer item falhando
❌ NUNCA dizer "corrigi os principais"
❌ NUNCA sugerir "auditar novamente depois"
❌ NUNCA marcar copy como ✅ sem pesquisa Google comprovada
❌ NUNCA aceitar nomes genéricos no menu (Benefícios, Processo, Incluído)
❌ NUNCA classificar violação como "pendência" ou "não crítica"
❌ NUNCA dizer "resolver em melhoria futura"
❌ NUNCA deixar seção duplicada (mesclar imediatamente)
❌ NUNCA deixar seção sem ID (adicionar ID agora)
❌ NUNCA encontrar tópico faltante e apenas anotar (criar seção com conteúdo)
❌ NUNCA deixar layout vertical com 3+ itens (converter para grid)
✔ Se corrigiu algo → reiniciar checklist do zero
✔ Se não consegue completar → listar EXATAMENTE o que falta
✔ O usuário NUNCA deve precisar rodar este checklist duas vezes para o mesmo problema
✔ Se encontrou problema → CORRIGIU. Sem exceção.
