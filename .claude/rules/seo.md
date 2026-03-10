# REGRAS DE SEO — TÉCNICO E AVANÇADO

---

## 🚨 PESQUISA DE PADRÕES — OBRIGATÓRIA ANTES DE QUALQUER CONTEÚDO

> ❌ NUNCA criar title, meta description, headings ou copy SEM pesquisar antes.
> A pesquisa é PRÉ-REQUISITO da criação de conteúdo, não opcional.

### Se tiver acesso à web (FLUXO PRINCIPAL):

1. Pesquisar o termo principal no Google (ex: "instalações hidráulicas SP")
2. Ignorar resultados patrocinados — apenas orgânicos
3. Analisar os **5 primeiros resultados orgânicos**
4. Para cada resultado, mapear:
   - `<title>` — tamanho, palavras-chave, formato
   - `<meta description>` — gancho, benefício, CTA
   - `<h1>` — abordagem, tom, especificidade
   - `<h2>` e `<h3>` — estrutura de seções, tópicos cobertos
   - Copy geral — que dores abordam, que provas usam
5. Identificar padrões comuns e lacunas
6. Produzir versão **superior** — mais específica, mais concreta, mais persuasiva
7. Documentar brevemente os padrões encontrados antes de implementar

### Se NÃO tiver acesso à web:

✔ Informar ao usuário: "Não tenho acesso à web. Preciso que pesquise os 5 primeiros resultados orgânicos para [termo] e me envie os titles, descriptions e headings."
❌ NUNCA prosseguir com conteúdo inventado sem pesquisa

### Regra de Auditoria de Pesquisa:

Em qualquer auditoria, verificar se o conteúdo da página:
✔ Reflete estrutura baseada em pesquisa real de concorrentes
✔ Tem seções que cobrem os mesmos tópicos dos top 5 (e mais)
✔ Não contém headings genéricos inventados sem base em pesquisa
❌ Se conteúdo parecer genérico/inventado → flagrar como violação

---

## META TAGS OBRIGATÓRIAS

✔ `<title>` — máximo 65 caracteres
✔ `<meta name="description">` — 70 a 155 caracteres (contar SEMPRE)
✔ `<link rel="canonical" href="URL">`
✔ `<meta name="robots" content="index, follow">`
✔ `<meta name="language" content="pt-BR">`
✔ `<meta charset="UTF-8">`
✔ `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

---

## OPEN GRAPH

✔ og:title | og:description | og:url | og:type | og:site_name
✔ og:locale → pt_BR
✔ og:image → 1200×630px WebP
  🚨 REGRA: Buscar imagem EXISTENTE na pasta do projeto (images/, assets/, ou qualquer .jpg/.png/.webp)
  - Vasculhar a pasta do projeto por qualquer imagem disponível
  - Se encontrar: usar o caminho relativo/absoluto da imagem que já existe
  - Se NÃO encontrar: criar /assets/og-image.webp ou usar imagem de placeholder
  - o og:image DEVE apontar para um arquivo que REALMENTE EXISTE na pasta

---

## TWITTER CARDS

✔ twitter:card → summary_large_image
✔ twitter:title | twitter:description | twitter:image

---

## JSON-LD ESTRUTURADO

| Tipo de Página    | Schema                          |
|-------------------|---------------------------------|
| Home              | WebSite + LocalBusiness         |
| Página de serviço | Service ou ProfessionalService  |
| Sobre             | AboutPage + Organization        |
| Contato           | ContactPage                     |
| Blog/Artigo       | Article ou BlogPosting          |

✔ Breadcrumbs via JSON-LD em todas as páginas internas

---

## ESTRUTURA DE CONTEÚDO

✔ mínimo ~520 palavras por página de serviço
✔ um único h1 por página | hierarquia: h1 → h2 → h3
✔ HTML semântico: main, article, section, nav, header, footer

---

## ARQUIVOS DE SUPORTE

✔ sitemap.xml atualizado (ver .claude/rules/sitemap.md)
✔ robots.txt atualizado (ver .claude/rules/sitemap.md)
✔ favicon.ico | apple-touch-icon.png 180×180px

---

## PADRÃO DE URL E SLUG

✔ /servicos/nome-do-servico/index.html
✔ slug em português | separador: hífen | sem stopwords

---

## ARQUITETURA DE NAVEGAÇÃO

✔ dropdown no menu com todos os serviços
✔ breadcrumb visual + JSON-LD em páginas internas
✔ pelo menos 2 links internos por página
✔ zero páginas órfãs
✔ navegação interna em páginas de serviço (ver .claude/rules/navigation.md)
