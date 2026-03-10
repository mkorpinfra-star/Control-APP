# SKILL: /nova-pagina

> v2.0 — Workflow completo para criar uma nova página de serviço.
> Executar na ordem. Não pular etapas.

---

## ETAPA 0 — LER TODOS OS RULES (OBRIGATÓRIO)

Ler completamente antes de qualquer coisa:
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

❌ Se não leu TODOS os 11 → NÃO INICIAR.

---

## ETAPA 1 — PERGUNTAS OBRIGATÓRIAS

1. Nome do serviço + público-alvo
2. Diferenciais principais
3. Número de WhatsApp
4. Cor primária (#XXXXXX)
5. ID do GA4 (G-XXXXXXXXXX)
6. ID do Meta Pixel (se houver)
7. Seletor de idiomas? (ver header-hero.md seção 1.4)
8. Vídeo ou imagem no hero? (ver header-hero.md seção 2.2)
9. Qual domínio vai instalar? (para sitemap — ver sitemap.md)

---

## ETAPA 2 — PESQUISA (OBRIGATÓRIA)

> ❌ NUNCA pular esta etapa. Conteúdo sem pesquisa é VIOLAÇÃO.

### SEO (ver seo.md):
1. Pesquisar o termo principal no Google
2. Analisar top 5 resultados orgânicos
3. Mapear title, description, h1 de cada
4. Produzir versão superior

### Copy (ver copywriting.md):
1. Mapear h1–h3 dos concorrentes
2. Identificar dores, benefícios e provas usadas
3. Estrutura semântica baseada em pesquisa
4. Planejar versão superior com dados concretos

Se sem acesso à web → solicitar briefing com dados reais ao usuário.

---

## ETAPA 3 — IMPLEMENTAÇÃO

Aplicar TODOS os rules da ETAPA 0. Não avançar se algum não puder ser seguido.

### Checklist de implementação:
✔ `<style type="text/tailwindcss">` com @layer base (h1=32.44px, h2=28.83px). H2 usa só `class="text-gray-900 mb-6"` — NUNCA text-5xl
✔ Subtítulos: text-base text-gray-600 font-light letter-spacing: 0.05em
✔ Espaçamento: mb-20 entre título e conteúdo
✔ Alinhamento vertical: TODAS as seções na mesma largura
✔ Navegação interna: IDs nas seções (#servicos, #sobre, #portfolio, #incluido, #contato)
✔ Menu desktop/mobile: links internos (#) — "Início" = #hero (NUNCA ../)
✔ scroll-behavior: smooth
✔ Vídeo hero com todos os atributos obrigatórios
✔ Copy baseada na pesquisa da Etapa 2

---

## ETAPA 4 — SLUG

Formato: /servicos/nome-do-servico/index.html (português, hífen)

---

## ETAPA 5 — SITEMAP

✔ Adicionar nova página ao sitemap.xml do domínio correto
✔ Atualizar `<lastmod>` de todas as URLs
✔ Verificar priority (0.9 para serviço)
✔ Atualizar robots.txt se necessário

---

## ETAPA 6 — VERIFICAÇÃO ATIVA

Executar /checklist-validacao — verificar CADA seção abrindo o arquivo.
Depois executar /auditar-pagina para verificação ultra-fina.
Se encontrar violação → corrigir e reiniciar checklist.
