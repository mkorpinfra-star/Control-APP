Corrige APENAS SEO e meta tags. Leia .claude/rules/seo.md + .claude/rules/sitemap.md + .claude/rules/security.md. NÃO leia outros rules.

⚠️ REGRA #1: VOCÊ EDITA. NUNCA liste correções para "aplicação manual".

---

## ESCOPO — SÓ SEO (nada mais)

### 1. META TAGS
- `<title>` presente (máx 65 caracteres — CONTAR)
- `<meta name="description">` presente (máx 155 caracteres — CONTAR)
- `<meta name="robots" content="index, follow">`
- `<meta name="language" content="pt-BR">`
- `<meta name="author">` + `<meta name="publisher">`
- `<meta name="google" content="notranslate">`

### 2. OPEN GRAPH
- og:title, og:description, og:type, og:url, og:locale, og:site_name
- og:image → procurar imagem EXISTENTE no projeto (images/, assets/, qualquer .jpg/.png/.webp)
- Se não existe imagem → criar path para /assets/og-image.webp e anotar

### 3. TWITTER CARDS
- twitter:card, twitter:title, twitter:description, twitter:image

### 4. CANONICAL E HREFLANG
- `<link rel="canonical">` com URL correta (HTTPS + trailing slash)
- hreflang para cada idioma (se aplicável)
- x-default

### 5. JSON-LD
- Schema.org LocalBusiness ou Organization ou WebPage
- Breadcrumb JSON-LD
- FAQ JSON-LD (se página tem FAQ)

### 6. FAVICON
- apple-touch-icon
- favicon-32x32 e favicon-16x16
- site.webmanifest

### 7. SITEMAP E ROBOTS
- Página listada no sitemap.xml (verificar)
- sitemap.xml na raiz com URLs HTTPS + trailing slash
- robots.txt com referência ao sitemap
- lastmod atualizado

### 8. PÁGINAS LEGAIS
- /politica-de-privacidade/ existe?
- /politica-de-cookies/ existe?
- /termos-de-uso/ existe?
- Se não existem → CRIAR

---

## NÃO FAZER (fora do escopo)

❌ NÃO corrigir @layer base ou typescale (use /corrigir-estrutura)
❌ NÃO corrigir textos ou copy (use /corrigir-copy)
❌ NÃO redesenhar layouts (use /corrigir-layout)
❌ NÃO pesquisar no Google para conteúdo
❌ NÃO criar seções novas

---

## 🏆 PADRÃO DE QUALIDADE — NÃO ENTREGAR NADA PELA METADE

> SEO completo = TODOS os itens implementados. Não existe "parcialmente feito".

### PROIBIDO FINALIZAR SE:
❌ Title tem mais de 65 caracteres
❌ Description tem mais de 155 caracteres ou está vazia
❌ Falta qualquer meta tag obrigatória (og:, twitter:, canonical)
❌ JSON-LD ausente ou com erros de sintaxe
❌ Página não está no sitemap.xml
❌ Faltam páginas legais (privacidade, cookies, termos)

✔ CADA meta tag verificada individualmente
✔ CADA caractere do title e description contado
✔ JSON-LD validado (sem vírgulas extras, sem aspas incorretas)

---

## MARCADOR DE CONCLUSÃO

```
✅ SEO CORRIGIDO — QUALIDADE PREMIUM
🔍 Title: [X chars — máx 65] ✔
🔍 Description: [X chars — máx 155] ✔
🔍 OG/Twitter: [completo ✔]
🔍 Canonical: [URL]
🔍 JSON-LD: [tipos implementados]
🔍 Sitemap: [página listada ✔]
🔍 Páginas legais: [privacidade ✔] [cookies ✔] [termos ✔]
```
