Cria uma página de serviço DO ZERO. Leia .claude/skills/nova-pagina.md + TODOS os 11 rules em .claude/rules/ PRIMEIRO.

⚠️ REGRA #1: VOCÊ CRIA O ARQUIVO. PáGINA COMPLETA, PRONTA PRA DEPLOY.

---

## ANTES DE COMEÇAR — CHECKLIST DE MATERIAIS (perguntar UMA VEZ SÓ)

> 🚨 Antes de criar qualquer coisa, envie este lembrete ao usuário:

```
📋 CHECKLIST — Material necessário para criar a página

Antes de eu começar, confirme se você já tem/preparou:

1. 📁 INFORMAÇÕES DO SITE
   □ Nome da empresa / site
   □ Serviço principal + público-alvo
   □ Cor primária (#XXXXXX)
   □ Domínio onde vai hospedar (para sitemap e canonical)

2. 📞 CONTATO
   □ WhatsApp (com DDI: +55...)
   □ Telefone fixo (se houver)
   □ Email de contato
   □ Endereço completo (para Google Maps embed e JSON-LD)

3. 🖼️ IMAGENS E VÍDEOS
   □ Já colocou imagens na pasta do projeto? (se não, uso Unsplash)
   □ Tem vídeo para o hero? (se não, uso imagem)
   □ Já criou favicons? (se não, posso gerar/orientar)
   □ Tem logo em SVG ou PNG?

4. 📊 DADOS REAIS (só o que realmente existir)
   □ Certificações e normas (ISO, NR, CREA, etc.)
   □ Anos de experiência (número real)
   □ Depoimentos de clientes (textos reais)
   □ Reviews do Google (nota e quantidade)
   □ Fotos de projetos realizados

5. 🔧 TRACKING (pode adicionar depois)
   □ ID do GA4 (G-XXXXXXXXXX)
   □ ID do Meta Pixel (se houver)

6. 🌐 IDIOMAS
   □ Precisa de seletor de idiomas? Quais?

Me passe tudo o que tiver agora — o que não tiver eu resolvo ou deixo marcado pra depois.
```

> Aguardar resposta. NÃO prosseguir sem as informações mínimas: nome, serviço, cor, WhatsApp.

---

## APÓS RECEBER OS MATERIAIS

### PASSO 1 — PESQUISA GOOGLE (OBRIGATÓRIA)

1. Pesquisar o serviço no Google (3 buscas com intenção comercial)
2. Entrar nos 5 melhores sites COMERCIAIS (não blogs)
3. Mapear H1, H2, H3, estrutura de seções, provas sociais
4. Planejar versão SUPERIOR em profundidade e copy

### PASSO 2 — CRIAR A PÁGINA

Seguir skills/nova-pagina.md ETAPA 3 — aplicar TODOS os rules.

**Estrutura obrigatória:**
1. `<style type="text/tailwindcss">` com @layer base (h1=32.44px, h2=28.83px)
2. `<style>` normal com variáveis, button-gradient, scroll-behavior, zoom
3. Header com glass effect + menu desktop/mobile
4. Hero com vídeo/imagem + overlay Netflix + breadcrumb + 2 CTAs
5. Mínimo 6 seções de conteúdo (baseadas na pesquisa Google)
6. FAQ em 2 colunas
7. CTA intermediário(s)
8. Footer com links legais + mapa + crédito
9. WhatsApp flutuante
~~10. Banner de cookies~~ → NÃO CRIAR (interfere no tracking)

**Copy obrigatória:**
- Sentence case (1ª letra maiúscula, resto minúsculo)
- H2 com 5+ palavras
- Zero dados inventados
- Baseada na pesquisa (não genérica)
- Mínimo 800 palavras total

**Se o usuário forneceu imagens na pasta:**
- Usar as imagens do projeto (não Unsplash)
- Otimizar: WebP, lazy loading, alt descritivo

**Se NÃO forneceu:**
- Usar Unsplash com parâmetros otimizados (w=1200, fit=crop)
- Alt descritivo e relevante

### PASSO 3 — SLUG E SITEMAP

- Criar em /servicos/nome-do-servico/index.html
- Adicionar ao sitemap.xml
- Atualizar robots.txt se necessário

### PASSO 4 — VERIFICAÇÃO

- Executar /checklist-validacao mentalmente
- Verificar CADA seção: container, typescale, contraste, imagem, copy
- Se encontrar problema → CORRIGIR antes de entregar

---

## MARCADOR DE CONCLUSÃO

```
✅ PÁGINA CRIADA — PRONTA PARA REFINAMENTO
📄 Arquivo: [caminho do arquivo]
🔍 PESQUISA: [5 URLs dos concorrentes]
📐 Typescale: h1=32.44px ✔ | h2=28.83px ✔ | <style type="text/tailwindcss"> ✔
📊 Seções: [X seções criadas]
🖼️ Imagens: [pasta do projeto / Unsplash]
📝 Copy: [X palavras] | sentence case ✔

Próximos passos recomendados:
1. /auditar-pagina → auditoria completa
2. /pesquisar-copy → pesquisa profunda de concorrentes
3. /corrigir-copy → refinamento da copy
4. /corrigir-estrutura → régua no CSS
5. /corrigir-layout → régua no visual
6. /corrigir-seo → meta tags finais
```
