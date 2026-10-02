# Auditoria técnica e QA — MKORP Control (preparação Google Play)

- **Data:** 02/10/2026 · **Branch:** `qa/auditoria-play-store` (base `main` @ `7a2efa0a`)
- **Ambiente de teste:** Supabase local (Postgres 16 + PostgREST 12.2.3 + GoTrue 2.180) com dados fictícios, Chromium (Playwright) em viewport de celular. **Produção não foi acessada** (nem leitura).
- **Não executado neste ambiente:** build Android/AAB, emulador e aparelho físico — o SDK Android e o Maven do Google (`dl.google.com`) estão bloqueados pela rede do ambiente.

## 1. Parecer

**NÃO PRONTO para publicação.**

O código ficou bem mais seguro e os fluxos principais agora funcionam e foram testados ponta a ponta. Mesmo assim, há impeditivos que dependem de ações fora do repositório:

1. A migração de segurança precisa ser aplicada no Supabase de produção. Até lá, qualquer funcionário logado consegue virar admin e alterar ponto e estoque pela API.
2. Desde 31/08/2026, o app precisa usar target API 36. Hoje usa 35 com Capacitor 5. Isso exige migrar para o Capacitor 8 e testar em aparelho.
3. As credenciais vazadas no histórico precisam ser trocadas (senha do admin, senha da keystore, chave OpenRouter) e o histórico do git precisa ser limpo, porque o `4.aab` tem uma planilha de folha de pagamento de terceiros.
4. Faltam política de privacidade publicada e validada pelo jurídico, formulário de Segurança dos dados, conta de revisão e testes em aparelho físico.
5. O schema real de produção não está versionado. As correções foram validadas contra o schema do repositório.

## 2. Stack e arquitetura

| Item | Achado |
|---|---|
| Front | React 19 + Vite 7 + Tailwind 4 + TanStack Query 5, SPA (`react-router` 7) |
| App Android | Capacitor **5.7** (`br.com.mkorp.solutions`, versionCode 2, versionName 1.0, minSdk 22, target/compile 35). Antes carregava o site remoto (`server.url = https://app.mkorp.com.br`); agora empacota o `dist/` |
| Backend | Supabase (Auth + PostgREST + Storage + 1 Edge Function). Sem backend próprio |
| Autorização | Antes: só no front (guards de rota) + RLS "qualquer autenticado faz tudo". Agora: RLS por papel + triggers + funções transacionais |
| Deploy web | GitHub Actions → `scp` para VPS (`app.mkorp.com.br`) a cada push na `main` |
| Testes existentes | 4 specs Playwright apontando para a **produção** com senha real embutida; sem testes unitários/API |

### Perfis: admin, supervisor, almoxarife, eletricista, ajudante, motorista (matriz de módulos configurável pelo admin).

### Funcionalidades — o que existe de fato

| Escopo do produto | Situação no código |
|---|---|
| Gestão de funcionários e permissões | **Implementado** (CRUD, desativação, reset de senha via Edge Function, matriz de acesso por papel/usuário) |
| Localização GPS | **Parcial**: só *foreground*, no momento da marcação/registro. Sem rastreamento contínuo nem em segundo plano |
| Ponto eletrônico | **Implementado** (start/stop, almoço, correção manual, envio, aprovação, fechamento mensal). Não é REP-P certificado |
| Solicitação de materiais | **Implementado** (catálogo + texto livre, resposta do almoxarife) |
| Separação / saída / entrega parcial / confirmação de recebimento | **Ausente**. A aprovação baixa o estoque na hora; o status `entregue` existe no banco mas não é usado |
| Cancelamento de requisição | **Ausente → implementado nesta auditoria** (pelo solicitante, só pendente) |
| Comunicação com almoxarifado | **Parcial** (notificações in-app + resposta por item; sem push) |
| Integração/sincronização com ERP | **Ausente** — não há nenhuma referência a ERP no código |
| Modo offline | **Ausente** (agora o app avisa e não perde dados em silêncio) |
| Recuperação de acesso pelo próprio usuário | **Ausente** (só admin redefine). `resetPasswordForEmail` existe mas não há tela de nova senha |
| Extras | OS, contratos, registro de campo com fotos, medição (R$), dashboard, relatórios CSV, auditoria, entrada de NF por foto com IA |

## 3. Problemas encontrados e correções

Legenda de evidência: **[E]** executado, **[L]** verificado por leitura de código, **[B]** bloqueado.

### Bloqueadores

| # | Problema | Impacto | Reprodução | Correção | Status |
|---|---|---|---|---|---|
| B-01 | RLS `auth_all_*` (`SUPABASE_PRODUCAO.sql`): qualquer autenticado lê/escreve todas as tabelas | Funcionário vira admin (`update usuarios set cargo='admin'`), lê CPF de todos, aprova o próprio ponto, altera ponto alheio, zera estoque, apaga auditoria | `tests/local/seguranca.test.mjs` S1–S12 contra schema original: **20/20 reprovados** (`qa-evidencias/api-antes-das-correcoes.txt`) | `supabase/migrations/20261002000000_seguranca_rls_estoque_ponto.sql`: políticas por papel, triggers que bloqueiam campos sensíveis, auditoria *append-only* | [E] 32/32 aprovados após a migração (aplicada 2× para provar idempotência). **Produção: pendente** |
| B-02 | Senha do admin de produção no repo (`tests/e2e/helpers.js`) | Acesso total ao sistema | leitura | Removida; testes usam env/credenciais fictícias | [L] corrigido no código — **trocar a senha** |
| B-03 | `4.aab` versionado é do app **J2S Obras** e contém planilha/CSV de **folha de pagamento** | Vazamento de dados pessoais/financeiros de terceiros (LGPD) | `bundletool dump` (conteúdo da planilha **não foi aberto**) | Removido do índice | [E] — **purgar do histórico** (`git filter-repo`) e avaliar incidente |
| B-04 | Senha da keystore de upload no histórico (`android/keystore.properties`, commit `702642a2`) | Assinatura de builds por terceiros (com o arquivo `.keystore`) | `git show` | Já fora do índice desde `c9af258b` | [L] — **resetar chave de upload** na Play Console |
| B-05 | Chave OpenRouter embutida no bundle (`VITE_OPENROUTER_KEY`) | Qualquer um extrai a chave do JS e gera custo | leitura | Edge Function `ia-imagem` (chave só no servidor, exige papel); variável removida do workflow | [E] bundle sem `openrouter.ai`; função [L] não implantada — **revogar a chave antiga** |
| B-06 | Ponto não gravava: horários vazios (`''`) enviados para colunas `time` | "Iniciar/Encerrar expediente" mostrava a hora na tela, mas **nada era salvo**, sem aviso | E2E P1 no código original: 0 linhas em `controle_ponto` | `pontoService.registrar` converte `''`→`NULL` e usa `upsert` | [E] P1 aprovado |
| B-07 | Lista de ponto e de requisições quebrada: embed `usuarios(nome)` ambíguo (2 FKs → `PGRST201`) | Gestor não via pontos para aprovar; ninguém via requisições ("Nenhuma requisição encontrada") | E2E R1/P4 no original | Hint `usuarios!usuario_id(nome)` | [E] R1, R2, P4 aprovados |
| B-08 | Target API 35; exigido **36** desde 31/08/2026 (extensão possível até 01/11/2026) | Play recusa upload de app novo/atualização | leitura + doc oficial | **Não alterado** (exige Capacitor 8 + teste em aparelho) | [B] |

### Alto

| # | Problema | Correção | Status |
|---|---|---|---|
| A-01 | Aprovação de requisição sem checar status e sem transação: duplo toque = baixa dupla; aprovações concorrentes deixavam saldo errado | RPC `aprovar_requisicao` com `SELECT … FOR UPDATE`, checagem de status, índice único anti-duplicidade, botão desabilitado durante envio | [E] B1, B2, R2 (duplo clique → 1 movimentação) |
| A-02 | Entrada/saída de estoque no cliente (lê saldo → grava saldo): condição de corrida, aceitava quantidade negativa | RPCs `estoque_entrada`/`estoque_saida` + `CHECK quantidade >= 0` | [E] B3, F7 |
| A-03 | Requisição criada em 2 passos (cabeçalho + itens) sem checar erro dos itens | RPC `criar_requisicao` atômica com validação | [E] R1, F8 |
| A-04 | Almoxarife não via requisições de outros (filtro "só as minhas") | Filtro por `canAprovarRequisicao` | [E] R2 |
| A-05 | Registro de campo com foto fazia 2º INSERT com o mesmo id → erro, foto perdida, reenvio duplicava | Upload antes, INSERT único | [E] C1 (original: 1 registro com 0 fotos) |
| A-06 | Sessão restaurada só do `localStorage`, sem validar token: com sessão expirada o app "parecia logado" e mostrava telas vazias | `AuthContext` valida `getSession`, recarrega perfil, escuta `SIGNED_OUT`, avisa "sessão expirou" | [E] L3 |
| A-07 | Usuário desativado conseguia entrar (login não checava `ativo`) | Login bloqueia + RLS ignora inativos | [E] L2, S10 |
| A-08 | Datas em UTC (`toISOString`): após 21h (BRT) "hoje" virava amanhã — ponto, semana, dashboard, conclusão de OS | `src/lib/datas.js` (data local) | [E] `tests/unit/datas.test.mjs` |
| A-09 | Ponto sem trilha de ajustes; horário do aparelho editável sem registro | Tabela `ponto_ajustes` imutável (hora do **servidor**, autor, antes/depois, GPS) | [E] P2, F5 |
| A-10 | Ponto `fechado` continuava editável pelo funcionário | RLS + trigger + UI bloqueada | [E] P3 |
| A-11 | Release com `webContentsDebuggingEnabled: true`, `allowMixedContent: true`, `allowBackup: true` e carregando o site remoto | Desligados; app empacota o `dist/`; `READ_EXTERNAL_STORAGE` limitado a API ≤ 32 | [L] — build [B] |
| A-12 | Signup público do Supabase usado para criar funcionários; conta auto-cadastrada tinha acesso total | RLS exige perfil ativo; insert em `usuarios` só admin | [E] S9 — recomendado desligar signup e mover criação para Edge Function |

### Médio

| # | Problema | Correção | Status |
|---|---|---|---|
| M-01 | Falhas de rede/salvamento silenciosas no ponto (Promise rejeitada sem catch) | Mensagens de erro; mutations falham na hora (`networkMode: 'always'`) | [E] P3 |
| M-02 | Sem aviso de offline | Faixa "Sem conexão. Nada será salvo…" | [E] P3 |
| M-03 | GPS negado/indisponível: ponto salvo sem localização sem avisar | Aviso explícito com caminho para ativar a permissão | [E] P2 |
| M-04 | Entrada por NF: erro no meio do lote → repetir lançava itens em dobro | Itens já lançados são marcados e pulados | [L] |
| M-05 | Supervisor via botão "Aprovar" no próprio ponto | Oculto na UI; servidor bloqueia | [E] S4 |
| M-06 | Contraste insuficiente (cinzas `#454A54` = 1,9:1, `#6B7280` = 3,5:1) | Trocados por `#8A909C`/`#9198A3` (≥ 4,7:1) | [E] capturas |
| M-07 | Zoom bloqueado (`user-scalable=no`) | Removido | [L] |
| M-08 | Bundle inicial de 1,14 MB | Rotas com `lazy()` → 665 KB | [E] build |
| M-09 | 15 vulnerabilidades em dependências de produção; 11 pacotes sem uso (firebase, i18next, chart.js…) | Removidos + `npm audit fix` → restam 2 (`@capacitor/cli`/`tar`, resolvidas pelo Capacitor 8) | [E] |
| M-10 | `.single()` em consultas opcionais gerava 406 no console | `maybeSingle()` | [E] A1 sem erros |
| M-11 | Ponto mostrava `17:49:00` (segundos) nas listas | Formato HH:MM | [E] |

### Baixo

| # | Problema | Status |
|---|---|---|
| L-01 | Botões flutuantes sem rótulo acessível | Corrigido (`aria-label`) [L] |
| L-02 | "corrigir manualmente" com 10 px e área de toque pequena | Aumentado [E] |
| L-03 | Calendário bloqueava sábado e a semana permitia | Alinhado (só domingo) [L] |
| L-04 | `MainActivity` duplicada (pacote antigo `br.com.mkorp.control`) | Removida [L] |
| L-05 | `node_modules`, `dist`, `bundletool.jar` versionados (56 mil arquivos) | Removidos do índice [E] |
| L-06 | ESLint com 22 erros (inclusive falsos positivos de config) | 0 erros / 5 avisos [E] |

## 4. Matriz de testes

Resultados: **A** = executado e aprovado · **R** = executado e reprovado · **L** = só leitura de código · **B** = bloqueado/não testado.

| ID | Área | Perfil | Cenário | Esperado | Antes | Depois |
|---|---|---|---|---|---|---|
| L1 | Login | — | credencial inválida | mensagem de erro | A | A |
| L2 | Login | inativo | usuário desativado | bloqueia com aviso | R | A |
| L3 | Sessão | qualquer | sessão inválida/expirada | volta ao login com aviso | R | A |
| L4 | Permissão UI | eletricista | abrir rotas de admin pela URL | redireciona | A | A |
| S1–S12 | Permissão API | vários | escalada, CPF, ponto alheio, estoque, auditoria, signup, inativo, isolamento | negado pelo servidor | R (12/12) | A (12/12) |
| F1–F12 | Fluxos permitidos API | todos | operações legítimas de cada papel | permitido | — | A (12/12) |
| P1 | Ponto | eletricista | iniciar/encerrar com GPS e enviar | grava + trilha | R | A |
| P2 | GPS | eletricista | permissão negada | marca e avisa | R | A |
| P3 | Rede | eletricista | sem conexão ao salvar | erro visível | R | A |
| P4 | Ponto | supervisor | aprovar | `aprovado_por` = servidor | R | A |
| P1–P3 (API) | Ponto | vários | enviado imutável, trilha, fechado | conforme regra | R | A |
| — | Ponto | — | virada de dia/fuso (21h BRT) | data local | R (unit) | A (unit) |
| — | Ponto | — | horário do aparelho alterado | detectar/registrar | — | **L**: trilha guarda hora do servidor; o horário marcado ainda vem do aparelho |
| — | Ponto | — | jornada que cruza a meia-noite | horas corretas | — | **R [L]**: `calcHoras` zera — pendência de regra |
| R1 | Requisição | eletricista | criar pela tela | aparece na lista | R | A |
| R2 | Requisição | almoxarife | ver e aprovar com duplo toque | 1 baixa | R | A |
| B1–B5 | Estoque | vários | duplicidade, concorrência, inválidos, papel, rejeitada | consistente | R | A |
| C1 | Campo | eletricista | registro com foto | 1 registro com foto, OS concluída | R | A |
| A1 | Navegação | admin | 16 telas | sem erro de página | R (406 no console) | A |
| V1 | Visual | 3 perfis | 320 px de largura | sem estouro horizontal | — | A |
| V2 | Visual | eletricista | texto a 130% | sem corte | — | A |
| — | Separação/entrega parcial/recebimento | — | — | — | **Ausente** | **Ausente** |
| — | ERP (auth, timeout, retry, reconciliação) | — | — | — | **Ausente** | **Ausente** |
| — | GPS em segundo plano | — | — | — | Não implementado | — |
| — | Botão voltar do Android, teclado sobre campos, edge-to-edge, versões Android | — | — | — | B | B |
| — | Build release/AAB, assinatura, comportamento da release | — | — | — | B | B |
| — | Leitor de tela (TalkBack) | — | — | — | B | B |

Evidências: `qa-evidencias/` (saídas de teste antes/depois, `antes-P1-R1-C1-R2.png` e 38 capturas em `screens/`).

## 5. Google Play — requisitos (consultados em 02/10/2026)

| Requisito | Situação | Onde |
|---|---|---|
| Target API 36 para apps novos/atualizações desde 31/08/2026 (extensão até 01/11/2026) — [fonte](https://developer.android.com/google/play/requirements/target-sdk) | **Não atende** (35). Capacitor 8 exige minSdk 24, compile/target 36, AGP 8.13, Gradle 8.14.3, Node 22 — [fonte](https://capacitorjs.com/docs/updating/8-0) | Repo + aparelho |
| AAB assinado com Play App Signing | Gradle lê `keystore.properties` fora do repo [L]; não compilado [B] | Máquina do dev |
| Contas pessoais criadas após 13/11/2023: teste fechado com **12 testadores por 14 dias** antes da produção — [fonte](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) | Tipo de conta desconhecido | Play Console |
| Localização: só *foreground*; sem `ACCESS_BACKGROUND_LOCATION` → não precisa do formulário de declaração — [fonte](https://support.google.com/googleplay/android-developer/answer/9799150?hl=en) | Atende [L] | — |
| Política de privacidade (URL pública + link no app) | Minuta criada (`public/privacidade.html`) + link em Configurações — **validar com jurídico** | Jurídico + deploy |
| Exclusão de conta: caminho no app + link web — [fonte](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en) | Pedido no app (notifica admin) + `public/excluir-conta.html` (minuta). A exclusão em si é manual pelo admin | Jurídico/RH |
| Segurança dos dados | A preencher: localização precisa, nome, e-mail, telefone, IDs, "outras informações pessoais" (CPF), fotos, atividade no app; criptografia em trânsito; exclusão sob pedido; compartilhamento com OpenRouter (imagem de NF) | Play Console |
| Acesso para revisão | Criar conta de revisor com dados fictícios em produção/homologação | Play Console |
| Ficha da loja | Ícone 512, feature graphic 1024×500, capturas, descrições, categoria, classificação de conteúdo, público-alvo | Play Console |
| Permissões de fotos | Sem `READ_MEDIA_*`; `READ_EXTERNAL_STORAGE` ≤ API 32 [L]; validar galeria no Android 13+ em aparelho | Aparelho |

> Alternativa: como é um app interno de empresa, publicá-lo como **app privado no Managed Google Play** evita a ficha pública. A decisão é de negócio.

## 6. Arquivos alterados (principais)

- **Banco:** `supabase/migrations/20261002000000_seguranca_rls_estoque_ponto.sql` (novo)
- **Edge Functions:** `supabase/functions/ia-imagem/` (nova), `admin-reset-senha` (checa `ativo`, senha ≥ 8)
- **Serviços:** `src/services/supabase.js`, `src/services/openrouter.js`, `src/lib/datas.js` (novo), `src/providers/QueryProvider.jsx`
- **Auth/rotas:** `src/contexts/AuthContext.jsx`, `src/routes/TenantRoutes.jsx`, `src/pages/Login.jsx`
- **Telas:** BaterPonto, Requisicoes, RegistroCampo, Timesheet, Monitoramento, OrdensServico, EntradaNF, Settings, Employees, `components/AvisoConexao.jsx` (novo), contraste em 25 arquivos
- **Android/config:** `capacitor.config.json`, `AndroidManifest.xml`, `index.html`, `package.json`, `eslint.config.js`, `.gitignore`, `.env.example`, workflow de deploy
- **Testes:** `tests/unit/`, `tests/local/` (stack local + seed + 32 testes de API), `tests/e2e-local/` (12 E2E), `playwright.local.config.js`
- **Removidos do índice:** `node_modules/`, `dist/`, `4.aab`, `bundletool.jar`, `MainActivity` duplicada

## 7. Resultados finais (02/10/2026)

| Verificação | Resultado |
|---|---|
| ESLint | 0 erros, 5 avisos |
| Testes unitários (fuso) | 6/6 |
| Testes de API (autorização + regras) | 32/32 (migração aplicada 2×) |
| E2E pela interface (celular 393×851) | 12/12 — no código original: 2/12 |
| `vite build` | OK (entrada 665 KB) |
| `npm audit --omit=dev` | 2 pendentes (dependem do Capacitor 8) |
| Build Android / AAB / release | **Não executado** (SDK bloqueado no ambiente) |

## 8. Pendências e checklist para publicar

**Impeditivas**
- [ ] Trocar a senha do admin; revogar a chave OpenRouter; resetar a chave de upload; purgar `4.aab` e `keystore.properties` do histórico (`git filter-repo` + force-push combinado com o time) e avaliar o vazamento da folha de terceiros.
- [ ] Exportar o schema real de produção (`supabase db dump --schema public`) e comparar com o do repositório.
- [ ] Aplicar a migração **primeiro em homologação**, rodar `npm run test:api` contra ela e só depois aplicar em produção, **junto** com o deploy do front. O front novo depende das RPCs, e o front antigo quebra entrada/saída de estoque com a RLS nova.
- [ ] `supabase functions deploy ia-imagem` + `supabase secrets set OPENROUTER_KEY=…`. Confirmar o nome real da função de reset (o código chama `bright-worker`, a pasta é `admin-reset-senha`).
- [ ] Desligar o signup público no Supabase e mover a criação de funcionário para uma Edge Function (`auth.admin.createUser`).
- [ ] Migrar para Capacitor 8 (`npm i @capacitor/{core,cli,android,camera,geolocation}@8 && npx cap migrate`), target/compile 36 e tratar edge-to-edge (System Bars + `env(safe-area-inset-*)`).
- [ ] `npm run build:android` com `.env.production` e AAB assinado; testar em aparelho real (Android 10, 13 e 15/16): GPS concedido/negado/revogado, câmera e galeria, botão voltar, teclado, rotação, fechar e reabrir, sem rede.
- [ ] Validação jurídica: política de privacidade, exclusão de conta × guarda de registros de ponto, e se o ponto precisa ser REP-P (Portaria MTP 671/2021). **Esta auditoria não declara conformidade legal.**
- [ ] Play Console: Segurança dos dados, conta de revisão, ficha da loja, classificação, teste fechado (12×14 se for conta pessoal).

**Regras de negócio a decidir (ambiguidades)**
- Jornada que cruza a meia-noite e trabalho aos domingos (a tela cobre seg–sáb).
- O horário da marcação deve ser o do servidor? Hoje é o do aparelho, com trilha da hora do servidor.
- Fluxo de separação → saída → entrega (parcial) → confirmação de recebimento. A aprovação baixa o estoque na hora.
- Escopo e contrato da integração com o ERP (inexistente).
- Quem conclui a exclusão de conta e o que é anonimizado.

**Melhorias recomendadas (não impeditivas)**
- Bucket `fotos-campo` é público: avaliar bucket privado + URLs assinadas.
- Recuperação de senha pelo usuário (tela de "nova senha" no fluxo `PASSWORD_RECOVERY`).
- Botão voltar do Android fechando modais (`@capacitor/app`).
- Fontes do Google carregadas remotamente → empacotar localmente (funciona offline e evita chamada a terceiros).
- Paginação nas listas (OS, movimentações, ponto) e índices por `usuario_id`/`data`.
