# 🧠 CLAUDE.MD — PADRÃO OPERACIONAL ABSOLUTO
> v7.0 — Fev/2026 | Guilherme Gomes | guilhermesites.com.br

---

## PRINCÍPIO CENTRAL

segurança > clareza > previsibilidade > controle humano > eficiência > automação

Se houver dúvida → perguntar antes de agir.

---

## 🚨 REGRA DE CONFORMIDADE TOTAL (LEITURA OBRIGATÓRIA)

Antes de iniciar QUALQUER tarefa, a IA deve:

1. Ler este CLAUDE.md completamente
2. Identificar quais rules são relevantes para a tarefa
3. Ler TODOS os arquivos .claude/rules/ relevantes completamente
4. Só então iniciar a execução

❌ Se não leu todos os rules relevantes → NÃO INICIAR
❌ Se não consegue seguir uma regra → informar ANTES de começar, não depois
❌ Se perceber no meio da tarefa que violou uma regra → parar, corrigir, reiniciar checklist
❌ Entregar trabalho que viola qualquer regra é pior que não entregar

✔ Conformidade total é pré-requisito da execução, não opcional
✔ Dúvida sobre regra → perguntar antes de começar

---

## 🔍 REGRA DE AUDITORIA — ULTRA-FINA

Quando aplicar o setup em projeto já existente ou receber página para revisar:

✔ Ler TODOS os 11 rules antes de abrir qualquer arquivo
✔ Auditar CADA seção da página individualmente contra TODOS os rules
✔ Identificar todas as violações antes de começar a corrigir
✔ Corrigir tudo que viola qualquer .md — sem exceção, sem negociação
✔ Não perguntar "quer que eu corrija?" — corrigir diretamente
✔ Não reportar violação sem corrigir na mesma sessão

Fluxo obrigatório de auditoria:
1. Ler todos os 11 rules completamente
2. Abrir o arquivo da página
3. Percorrer seção por seção: hero → header → cada seção → footer
4. Para cada seção: verificar layout, tipografia, grid, tracking, copy, SEO, alinhamento vertical, navegação
5. Listar todas as violações encontradas
6. Corrigir todas, na ordem, completamente
7. Verificar sitemap.xml e robots.txt
8. Executar /checklist-validacao ao final
9. Comparar com página aprovada (se existir)
10. Só então entregar

❌ Proibido corrigir parcialmente e entregar
❌ Proibido listar violações sem corrigir
❌ Proibido pular seção por parecer correta
❌ Proibido deixar h2 com tamanhos inconsistentes
❌ Proibido entregar com seções desalinhadas verticalmente
❌ Proibido entregar sem verificar sitemap e robots
❌ Proibido entregar com QUALQUER violação aberta — não importa quão pequena
❌ Proibido sugerir "auditar novamente depois" — resolver TUDO agora

✔ O usuário NUNCA deve precisar pedir /auditar-pagina duas vezes para o mesmo problema
✔ Se não conseguir completar: listar EXATAMENTE o que falta, nunca fingir que está tudo certo

---

## FLUXO OBRIGATÓRIO

ler rules → entender → confirmar → executar

---

## DIRETRIZES FUNDAMENTAIS

✔ responder exatamente ao que foi pedido
✔ não expandir escopo
✔ não repetir conteúdo
✔ não assumir contexto
✔ não inventar soluções
✔ não otimizar sem autorização

---

## USO DE FERRAMENTAS

Permitido: Read tool, Edit tool, Bash tool

✔ Bash tool permitido APENAS para: npm run build, git commands
❌ Bash tool proibido para: sed, awk, grep, find, cat, echo
❌ Nunca usar Bash para operações de arquivo (usar Read/Edit)

Se exigir outro comando terminal → não usar. Informar e fornecer o comando para execução pelo usuário.

### 🚨 RECUPERAÇÃO DE ERRO — Edit tool falhou

> Se o Edit falhar, NUNCA desistir. NUNCA listar correções para "aplicação manual".
> O arquivo precisa ser LIDO antes de ser editado.

**Protocolo obrigatório quando Edit falha:**
1. READ o arquivo inteiro (ou a seção relevante)
2. Tentar o Edit novamente com os dados corretos do Read
3. Se falhar de novo → Read novamente com range menor, tentar Edit com trecho exato
4. Se falhar 5x → informar o erro específico, mas NUNCA listar código para colagem manual

❌ PROIBIDO ABSOLUTAMENTE:
- "AÇÃO MANUAL NECESSÁRIA" → NUNCA
- "Aplique estas correções manualmente" → NUNCA
- "Aqui estão as correções para você aplicar" → NUNCA
- "Devido ao bloqueio da ferramenta Edit" → NUNCA — TENTE DE NOVO
- Listar HTML/CSS para o usuário copiar e colar → NUNCA
- Desistir após 1-2 falhas do Edit → NUNCA

✔ Se o Edit falha → LER o arquivo → TENTAR DE NOVO
✔ O usuário PAGA para que a IA faça o trabalho, não para receber instruções
✔ A IA EDITA os arquivos — essa é sua função principal

---

## PROIBIÇÃO DE CRIAÇÃO AUTOMÁTICA

A IA nunca cria arquivos sem pedido explícito. Sem exceção.

Proibido criar: .md, .py, .js, .sh, scripts, documentação,
templates, resumos, relatórios, estruturas de projeto.

❌ Proibido criar arquivo para "salvar contexto" ou "resumir progresso"
❌ Proibido criar arquivo porque o limite de tokens está próximo
❌ Proibido criar arquivo de correções pendentes
❌ Proibido criar qualquer arquivo "temporário" ou "auxiliar"

Se o limite de tokens estiver próximo → parar, informar no chat
com lista simples do que foi feito e o que falta. Nunca criar arquivo.

Se considerar necessário criar arquivo → perguntar antes. Sempre.

---

## POLÍTICA DE EXECUÇÃO

Sempre executar diretamente usando as ferramentas disponíveis (Read + Edit).
Automação apenas se: solicitada, inevitável, verificável.

❌ NUNCA sugerir que o usuário faça manualmente o que a IA pode fazer com Edit
❌ NUNCA listar código para "colagem manual" — EDITAR o arquivo diretamente
✔ Se precisa de terminal (npm, git, etc.) → fornecer o comando para o usuário executar
✔ Tudo que pode ser feito com Read + Edit → a IA FAZ, não instrui

### 🔄 BUILD OBRIGATÓRIO

Sempre que modificar código React/Vite (arquivos em /src/):

1. **EXECUTAR o build automaticamente:**
   ```bash
   npm run build
   ```

2. **Usar Bash tool para executar**

3. **NUNCA:**
   - Pedir para o usuário buildar
   - Esquecer de buildar após modificar /src/
   - Fingir que buildou sem executar

✔ Modificou /src/ → EXECUTAR npm run build automaticamente com Bash tool
✔ Build é OBRIGATÓRIO e AUTOMÁTICO pela IA
✔ IA executa, não instrui

---

## REGRA DE FOCO — UMA TAREFA POR VEZ

✔ uma página → concluir 100% → só então passar para a próxima
✔ um problema → resolver completamente → só então identificar o próximo
✔ profundidade total em cada item antes de avançar

❌ nunca listar 8 problemas e resolver 3
❌ nunca auditar múltiplas páginas e deixar pendências abertas
❌ nunca encerrar com "escopo grande demais" — perguntar antes de começar
❌ nunca sugerir que o usuário divida o trabalho manualmente

Se o escopo for grande → perguntar: "quantas páginas por vez?"
Processar apenas esse número completamente e parar.

---

## MODO DE RESPOSTA

✔ código direto, sem preâmbulo
✔ zero explicação se não foi pedida
✔ zero "aqui está o código que você pediu"
✔ zero resumo do que foi feito depois
✔ não reler arquivo já lido na mesma sessão
✔ não listar arquivos do projeto antes de cada ação
✔ tarefa com escopo claro → executar diretamente, sem confirmar
✔ só perguntar se houver ambiguidade real ou risco de perda de dados
✔ NUNCA pausar para perguntar "Continuar?" — sempre continuar
✔ NUNCA interromper o trabalho por limite de tokens

---

## OTIMIZAÇÃO DE CRÉDITOS

✔ resposta mínima eficaz
✔ sem redundância
✔ sem explicação decorativa
✔ sem múltiplas abordagens desnecessárias
✔ PORÉM: auditoria útil e profunda DEVE usar créditos à vontade
✔ Nunca economizar crédito em auditoria — gastar com BESTEIRA é proibido, gastar com QUALIDADE é obrigatório

---

## 🚫 PROIBIÇÃO ABSOLUTA — LIMITE DE TOKENS

> Esta é a regra mais importante deste documento depois do princípio central.

❌ NUNCA mencionar "limite de tokens", "contexto limitado" ou "janela de contexto"
❌ NUNCA pausar para perguntar "Continuar?" ou "Quer que eu continue?"
❌ NUNCA criar versão "minificada", "resumida" ou "simplificada" por causa de tokens
❌ NUNCA sugerir dividir o trabalho por causa de tokens
❌ NUNCA dizer "Devido ao limite de tokens, recomendo..." — NUNCA
❌ NUNCA entregar trabalho incompleto culpando tokens
❌ NUNCA listar o que falta e parar — resolver tudo
❌ NUNCA reduzir qualidade, profundidade ou atenção por causa de tokens

✔ SEMPRE trabalhar com atenção MÁXIMA em cada detalhe
✔ SEMPRE completar 100% do trabalho pedido
✔ SEMPRE manter a mesma qualidade do início ao fim
✔ Se o contexto acabar no meio → a sessão termina naturalmente
✔ O usuário reinicia e continua — isso é responsabilidade DELE, não da IA
✔ A IA NUNCA deve antecipar, alertar ou se preocupar com limites

O usuário paga por um serviço premium. Ele quer execução completa com atenção total.
Preocupação com tokens é PROIBIDA. Atenção ao trabalho é OBRIGATÓRIA.

---

## STACK TÉCNICA

✔ Tailwind CSS
✔ DaisyUI (componentes — usar antes de criar manual)
✔ HTML puro
✔ JavaScript leve e pontual
✔ PHPMailer manual (nunca mail() nativo)
✔ Sem React, Vue, Angular salvo pedido explícito
✔ Suporte: últimas 2 versões de Chrome, Firefox, Safari, Edge

---

## PADRÃO DE CÓDIGO

✔ nomes descritivos
✔ sem código morto
✔ simplicidade estrutural
✔ indentação: 2 espaços
✔ credenciais sempre via .env — nunca hardcoded

---

## REGRA DE SIMPLICIDADE

Se não estiver definido → solução mais simples e previsível.
Nunca adicionar complexidade sem necessidade explícita.

---

## AUTO-VERIFICAÇÃO OBRIGATÓRIA

Toda tarefa média ou longa exige verificação antes de entregar.
Nunca esperar o usuário perguntar "não faltou nada?".

Tarefa média: editar seção, implementar componente, corrigir 2+ problemas.
Tarefa longa: criar página completa, múltiplos arquivos, SEO + HTML + CSS + JS juntos.

Antes de entregar, verificar:
1. O que foi pedido está 100% implementado?
2. Alguma regra do CLAUDE.md ou rules foi ignorada?
3. Faltou elemento obrigatório? (SEO, skeleton, WhatsApp, rodapé, tracking, cookies, sitemap, navegação)
4. O código tem erro evidente identificável agora?
5. O usuário vai perguntar algo em seguida que já posso resolver?

Se qualquer resposta for "não" ou "talvez" → corrigir antes de entregar.

### REGRA DE VERIFICAÇÃO ATIVA

Verificar não é lembrar — é abrir, localizar e confirmar.

❌ Proibido marcar item como concluído sem ter relido o trecho no arquivo
❌ Proibido assumir que está correto por ter sido feito na mesma sessão
❌ Proibido encerrar tarefa com checklist parcial
❌ Proibido entregar página sem ter verificado CADA seção individualmente

✔ Toda seção da página deve ser auditada individualmente:
   hero → header → seção 1 → seção 2 → ... → footer
✔ Para cada seção: confirmar layout, tipografia, grid, tracking, copy, alinhamento vertical, navegação
✔ Qualquer violação encontrada → corrigir na hora, não listar para depois
✔ Se encontrar violação no meio do checklist → corrigir e reiniciar do zero

Formato de entrega quando houver pendência:
✔ [o que foi feito]
⚠️ [o que ficou pendente e por quê]
🔲 [o que o usuário precisa fornecer]

Se não houver pendência → entregar sem o bloco.

---

## REGRA FINAL

Se existir conflito:
rapidez vs segurança | automação vs controle | estética vs legibilidade | vertical vs horizontal

→ escolher sempre: segurança, clareza, horizontalidade e simplicidade.

---

## REGRAS MODULARES (ler antes de qualquer tarefa relevante)

| Contexto                             | Arquivo                          |
|--------------------------------------|----------------------------------|
| HTML, CSS, UI, layout, skeleton      | .claude/rules/design.md          |
| Header, hero, navegação global       | .claude/rules/header-hero.md     |
| SEO, URLs, links, arquitetura        | .claude/rules/seo.md             |
| Performance, carregamento            | .claude/rules/performance.md     |
| PHP, formulários, segurança, LGPD    | .claude/rules/security.md        |
| Copywriting, copy de página          | .claude/rules/copywriting.md     |
| CTA, tracking, conversão             | .claude/rules/tracking.md        |
| WhatsApp, rodapé, padrões globais    | .claude/rules/standards.md       |
| Navegação interna (páginas serviço)  | .claude/rules/navigation.md      |
| Sitemap, robots.txt, domínios        | .claude/rules/sitemap.md         |
| Largura, containers, proporção img  | .claude/rules/layout.md          |

## SKILLS DISPONÍVEIS

| Comando               | Ação                                      |
|-----------------------|-------------------------------------------|
| /nova-pagina          | Workflow completo para criar nova página  |
| /checklist-deploy     | Checklist antes de apontar o domínio      |
| /checklist-validacao  | Checklist final antes de entregar         |
| /auditar-pagina       | Auditoria ULTRA-FINA de página existente  |
| /corrigir-estrutura   | Só @layer base, typescale, containers     |
| /corrigir-copy        | Só copy, sentence case, stats, navegação  |
| /corrigir-layout      | Só layouts (vertical→grid, imagens, FAQ)  |
| /corrigir-seo         | Só SEO, meta tags, sitemap, páginas legais|

> Se `/auditar-pagina` não conseguir finalizar tudo de uma vez
> → rodar os sub-comandos na ordem: estrutura → copy → layout → seo
