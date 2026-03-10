# SKILL: /checklist-deploy

> v2.0 — Checklist antes de apontar o domínio para produção.

---

## SERVIDOR
✔ SSL/HTTPS ativo | redirect 301 HTTP→HTTPS e www→não-www
✔ .env inacessível publicamente | headers de segurança configurados

## SEO
✔ canonical correto em todas as páginas
✔ nenhum noindex não intencional
✔ Conteúdo baseado em pesquisa real de concorrentes

## SITEMAP E ROBOTS
✔ sitemap.xml existe na raiz do domínio
✔ robots.txt existe na raiz do domínio com referência ao sitemap
✔ todas as páginas HTML listadas no sitemap.xml
✔ nenhuma página 404 no sitemap
✔ todas as URLs com HTTPS e trailing slash
✔ `<lastmod>` atualizado para data do deploy
✔ sitemap.xml acessível via navegador
✔ Domínio correto nas URLs do sitemap (perguntar ao usuário se necessário)

## TRACKING
✔ GA4 em modo produção (ID correto)
✔ Meta Pixel (se aplicável)
~~✔ banner de cookies bloqueando tracking antes do aceite~~ → REMOVIDO (não criar banner de cookies)

## FUNCIONAL
✔ formulários testados | emails chegando (verificar spam)
✔ zero 404 em assets | WhatsApp com mensagem correta
✔ facebookclick + gtag em TODOS os CTAs

## NAVEGAÇÃO
✔ Links internos (#seção) em páginas de serviço
✔ scroll-behavior: smooth funcionando
✔ Menu mobile fecha ao clicar link interno
✔ Dropdown de serviços completo

## PERFORMANCE
✔ PageSpeed Insights: 90+ mobile e desktop

## CONSISTÊNCIA VISUAL
✔ TODOS os h2 idênticos entre páginas
✔ Alinhamento vertical consistente
✔ Subtítulos com letter-spacing: 0.05em
✔ Espaçamento mb-20 entre título e conteúdo

## FINALIZAÇÃO
✔ página 404 customizada | links legais no footer | crédito no rodapé
✔ Enviar sitemap ao Google Search Console
