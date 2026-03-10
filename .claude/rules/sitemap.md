# REGRAS DE SITEMAP E ROBOTS.TXT — SISTEMA AUTOMÁTICO

> v1.0 — Sitemap e robots.txt devem ser SEMPRE gerados e atualizados automaticamente.

---

## PRINCÍPIO

Sitemap e robots.txt devem ser **sempre atualizados automaticamente**.
Nunca permitir arquivos desatualizados ou URLs incorretas.

---

## DOMÍNIOS DO PROJETO

| Pasta | Domínio                    | Idioma       |
|-------|----------------------------|--------------|
| .br   | j2sinstaladora.com.br      | Português BR |
| .ad   | j2s.ad                     | Catalão      |
| .es   | j2sservicios.es            | Espanhol     |

⚠️ **SEMPRE PERGUNTAR** ao usuário qual domínio gerar antes de criar sitemap.

---

## PRIORIDADES DE URL (priority)

| Tipo de Página           | Priority | Changefreq |
|--------------------------|----------|------------|
| Homepage (/)             | 1.0      | weekly     |
| Páginas de serviço       | 0.9      | monthly    |
| Páginas legais (LGPD)    | 0.3      | yearly     |
| Página 404               | não incluir | —       |

---

## ESTRUTURA DO SITEMAP.XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <url>
    <loc>https://DOMINIO/</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Repetir para cada página -->

</urlset>
```

### Regras:
✔ `<loc>` sempre com protocolo HTTPS
✔ `<loc>` sempre com trailing slash (`/`) no final
✔ `<lastmod>` atualizar para data do dia da geração
✔ ordenar URLs: homepage → serviços → páginas legais
✔ nunca incluir página 404

---

## ESTRUTURA DO ROBOTS.TXT

```txt
# Robots.txt — NOME DO CLIENTE
# Domínio: DOMINIO
# Gerado em: YYYY-MM-DD

User-agent: *
Allow: /

# Sitemap
Sitemap: https://DOMINIO/sitemap.xml

# Bloquear acesso a arquivos de sistema
Disallow: /cgi-bin/
Disallow: /.git/
Disallow: /.env
Disallow: /vendor/
Disallow: /node_modules/
Disallow: /*.log$

# Crawl-delay para bots agressivos
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10

User-agent: DotBot
Crawl-delay: 10
```

### Regras:
✔ sempre incluir linha `Sitemap:` apontando para sitemap.xml do domínio correto
✔ bloquear diretórios de sistema (`.git`, `.env`, `/vendor`)
✔ `User-agent: *` deve estar sempre no topo
✔ `Allow: /` libera todo o site por padrão
✔ crawl-delay opcional para controlar bots agressivos

---

## LOCALIZAÇÃO DOS ARQUIVOS

```
.br/sitemap.xml        → https://j2sinstaladora.com.br/sitemap.xml
.br/robots.txt         → https://j2sinstaladora.com.br/robots.txt

.ad/sitemap.xml        → https://j2s.ad/sitemap.xml
.ad/robots.txt         → https://j2s.ad/robots.txt

.es/sitemap.xml        → https://j2sservicios.es/sitemap.xml
.es/robots.txt         → https://j2sservicios.es/robots.txt
```

✔ sempre criar na raiz de cada domínio
✔ nunca criar sitemap.xml dentro de subpastas

---

## WORKFLOW DE ATUALIZAÇÃO

### Quando nova página é adicionada:
1. Identificar pasta do domínio (.br, .ad, .es)
2. Adicionar nova `<url>` no sitemap.xml correspondente
3. Atualizar `<lastmod>` de todas as URLs para data atual
4. Verificar se URL tem trailing slash `/`
5. Definir `priority` conforme tabela acima

### Quando página é removida:
1. Remover `<url>` do sitemap.xml
2. Atualizar `<lastmod>` das URLs restantes

### Quando domínio muda:
1. Perguntar ao usuário qual novo domínio
2. Atualizar todas as `<loc>` no sitemap.xml
3. Atualizar linha `Sitemap:` no robots.txt
4. Atualizar comentário do cabeçalho no robots.txt

---

## CHECKLIST PRÉ-DEPLOY

Antes de publicar o site, verificar:

✔ `sitemap.xml` existe na raiz do domínio
✔ `robots.txt` existe na raiz do domínio
✔ todas as páginas HTML estão listadas no sitemap
✔ nenhuma página 404 está no sitemap
✔ todas as URLs têm protocolo HTTPS
✔ todas as URLs têm trailing slash `/`
✔ linha `Sitemap:` no robots.txt aponta para URL correta
✔ `<lastmod>` atualizado para data de deploy
✔ sitemap.xml acessível via navegador (testar URL)

---

## SUBMISSÃO AO GOOGLE SEARCH CONSOLE

Após gerar sitemap:
1. Acessar [Google Search Console](https://search.google.com/search-console)
2. Adicionar propriedade (domínio)
3. Verificar propriedade
4. Menu lateral → **Sitemaps**
5. Adicionar URL do sitemap: `https://DOMINIO/sitemap.xml`
6. Clicar em **Enviar**

Google processará o sitemap em 24-48 horas.

---

## VALIDAÇÃO DE SITEMAP

Antes de enviar ao Google Search Console:
✔ validar XML em [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
✔ testar acesso direto no navegador
✔ verificar se não há erros 404 nas URLs listadas

---

## BOAS PRÁTICAS

✔ sempre gerar sitemap após adicionar/remover páginas
✔ atualizar `<lastmod>` quando houver mudanças significativas no conteúdo
✔ manter sitemap com no máximo 50.000 URLs (limite do Google)
✔ usar sitemap index se projeto tiver múltiplos idiomas/domínios
✔ nunca incluir URLs com `noindex` no sitemap
✔ nunca incluir URLs redirecionadas (301/302)
