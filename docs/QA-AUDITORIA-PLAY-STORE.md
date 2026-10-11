# Auditoria técnica e QA — MKORP Control (preparação Google Play)

- **Data:** 02/10/2026 (2 rodadas) · **Branch:** `qa/auditoria-play-store` (base `main` @ `7a2efa0a`)
- **Guia de implantação:** [`docs/DEPLOY-PLAY.md`](DEPLOY-PLAY.md)
- **Ambiente de teste:** Supabase local (Postgres 16 + PostgREST 12.2.3 + GoTrue 2.180 + Edge Functions em Deno 2.5) com dados fictícios, Chromium (Playwright) em viewport de celular. **Produção não foi acessada** (nem leitura).
- **Não executado neste ambiente:** build Android/AAB, emulador e aparelho físico — o SDK Android e o Maven do Google (`dl.google.com`) estão bloqueados pela rede do ambiente.

## 1. Parecer

**NÃO PRONTO para publicação.**

Todos os ajustes possíveis no repositório foram feitos e testados (inclusive a migração para Capacitor 8 / API 36). O que falta não pode ser feito daqui:

1. **Compilar e testar o app Android em aparelho.** O projeto já está em Capacitor 8, target/compile 36, mas o SDK e o Maven do Google estão bloqueados neste ambiente: o AAB nunca foi gerado nem executado.
2. **Aplicar as migrações e as Edge Functions no Supabase**, primeiro em homologação. Até lá, a produção continua com o banco aberto para qualquer usuário logado.
3. **Trocar as credenciais vazadas e limpar o histórico do git.** O script está pronto e foi testado numa cópia; o force-push é decisão da equipe.
4. **Jurídico e Play Console:** preencher as minutas de privacidade e exclusão de conta, formulário de Segurança dos dados, conta de revisão e decidir sobre a Portaria 671/2021.
5. **Schema real de produção:** não está versionado. As correções foram validadas contra o schema do repositório.

## 2. Stack e arquitetura

| Item | Achado |
|---|---|
| Front | React 19 + Vite 7 + Tailwind 4 + TanStack Query 5, SPA (`react-router` 7) |
| App Android | Antes: Capacitor 5.7, minSdk 22, target 35, carregando o site remoto. **Agora: Capacitor 8.5**, `br.com.mkorp.solutions`, versionCode 3 / 1.1.0, minSdk 24, target/compile 36, AGP 8.13, Gradle 8.14.3, JDK 21, `dist/` empacotado |
| Backend | Supabase (Auth + PostgREST + Storage + Edge Functions: `admin-reset-senha`, `admin-criar-usuario`, `ia-imagem`). Sem backend próprio |
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
| Recuperação de acesso pelo próprio usuário | **Ausente → implementado** ("Esqueci minha senha" + tela `/redefinir-senha`) |
| Extras | OS, contratos, registro de campo com fotos, medição (R$), dashboard, relatórios CSV, auditoria, entrada de NF por foto com IA |

## 3. Problemas encontrados e correções

Legenda de evidência: **[E]** executado, **[L]** verificado por leitura de código, **[B]** bloqueado.

### Bloqueadores

| # | Problema | Impacto | Reprodução | Correção | Status |
|---|---|---|---|---|---|
| B-01 | RLS `auth_all_*` (`SUPABASE_PRODUCAO.sql`): qualquer autenticado lê/escreve todas as tabelas | Funcionário vira admin (`update usuarios set cargo='admin'`), lê CPF de todos, aprova o próprio ponto, altera ponto alheio, zera estoque, apaga auditoria | `tests/local/seguranca.test.mjs` S1–S12 contra schema original: **20/20 reprovados** (`qa-evidencias/api-antes-das-correcoes.txt`) | `supabase/migrations/20261002000000_seguranca_rls_estoque_ponto.sql`: políticas por papel, triggers que bloqueiam campos sensíveis, auditoria *append-only* | [E] 32/32 aprovados após a migração (aplicada 2× para provar idempotência). **Produção: pendente** |
| B-02 | Senha do admin de produção no repo (`tests/e2e/helpers.js`) | Acesso total ao sistema | leitura | Removida; testes usam env/credenciais fictícias | [L] corrigido no código — **trocar a senha** |
| B-03 | Arquivos de um projeto anterior de terceiros estavam no repositório e no histórico (APKs/AABs, keystore, `.env`, credenciais, planilha de **folha de pagamento**) | Vazamento de dados pessoais/financeiros de terceiros (LGPD) | inspeção do histórico (conteúdo da planilha **não foi aberto**) | Tudo removido; **histórico zerado** (repositório novo com um único commit limpo) | [E] — publicar o histórico zerado (force-push) e avaliar o incidente |
| B-04 | Senha da keystore de upload no histórico (`android/keystore.properties`, commit `702642a2`) | Assinatura de builds por terceiros (com o arquivo `.keystore`) | `git show` | Já fora do índice desde `c9af258b` | [L] — **resetar chave de upload** na Play Console |
| B-05 | Chave OpenRouter embutida no bundle (`VITE_OPENROUTER_KEY`) | Qualquer um extrai a chave do JS e gera custo | leitura | Edge Function `ia-imagem` (chave só no servidor, exige papel); variável removida do workflow | [E] bundle sem `openrouter.ai`; função [L] não implantada — **revogar a chave antiga** |
| B-06 | Ponto não gravava: horários vazios (`''`) enviados para colunas `time` | "Iniciar/Encerrar expediente" mostrava a hora na tela, mas **nada era salvo**, sem aviso | E2E P1 no código original: 0 linhas em `controle_ponto` | `pontoService.registrar` converte `''`→`NULL` e usa `upsert` | [E] P1 aprovado |
| B-07 | Lista de ponto e de requisições quebrada: embed `usuarios(nome)` ambíguo (2 FKs → `PGRST201`) | Gestor não via pontos para aprovar; ninguém via requisições ("Nenhuma requisição encontrada") | E2E R1/P4 no original | Hint `usuarios!usuario_id(nome)` | [E] R1, R2, P4 aprovados |
| B-08 | Target API 35; exigido **36** desde 31/08/2026 (extensão possível até 01/11/2026) | Play recusa upload de app novo/atualização | leitura + doc oficial | Migrado para Capacitor 8.5 a partir do template oficial: target/compile 36, minSdk 24, AGP 8.13, Gradle 8.14.3, JDK 21, `configChanges` com `density`, SystemBars (edge-to-edge) | [E] `npx cap sync` + `cap doctor` OK · compilação [B] |

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
| A-11 | Release com `webContentsDebuggingEnabled: true`, `allowMixedContent: true`, `allowBackup: true` e carregando o site remoto | Desligados; app empacota o `dist/`; permissões de armazenamento removidas (galeria usa Photo Picker) | [L] — build [B] |
| A-12 | Signup público do Supabase usado para criar funcionários; conta auto-cadastrada tinha acesso total | RLS exige perfil ativo; criação pela Edge Function `admin-criar-usuario` (login + perfil + CPF atômicos, desfaz o login se o perfil falhar) → signup público pode ser desligado | [E] S9, E1–E3, U1 |

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
| M-09 | 15 vulnerabilidades em dependências de produção; 11 pacotes sem uso (firebase, i18next, chart.js…) | Removidos, `npm audit fix`, Capacitor 8 e `@capacitor/cli` movido para devDependencies → **0 vulnerabilidades** | [E] |
| M-10 | `.single()` em consultas opcionais gerava 406 no console | `maybeSingle()` | [E] A1 sem erros |
| M-11 | Ponto mostrava `17:49:00` (segundos) nas listas | Formato HH:MM | [E] |
| M-12 | Jornada que cruza a meia-noite dava 0 h e não podia ser encerrada no dia seguinte | `src/lib/jornada.js` soma 24 h quando o horário "volta"; ao abrir o app com expediente de ontem aberto, a tela vai para ontem e avisa | [E] unit + P5 |
| M-13 | Domingo não podia ser registrado (semana seg–sáb; calendário bloqueava sáb/dom) | Semana de 7 dias, calendário sem bloqueio | [E] captura 320 px |
| M-14 | Sem recuperação de senha pelo usuário | "Esqueci minha senha" (sem revelar se o e-mail existe) + `/redefinir-senha` | [E] L5 |
| M-15 | Botão voltar do Android não fechava modais | `@capacitor/app` + pilha de camadas (`src/lib/voltar.js`): fecha modal/painel, volta tela, minimiza nas telas raiz | [L] — aparelho [B] |
| M-16 | Upload no Storage permitido em qualquer bucket, por qualquer autenticado | Só usuário ativo, só `fotos-campo`, avatar só no próprio nome | [E] `tests/local/storage_policies.sql` 5/5 |
| M-17 | Fontes carregadas do Google (falham offline e expõem o IP do usuário a terceiros) | Empacotadas com `@fontsource` | [E] build |
| M-18 | Sem índices para as consultas das listas | `20261002010000_indices_storage.sql` (11 índices) | [E] aplicada 2× |
| M-19 | `gradle-wrapper.jar` ignorado pelo `.gitignore` (`*.jar`) → `gradlew` quebrado em clone novo | Exceção no `.gitignore` + wrapper 8.14.3 | [L] |

### Baixo

| # | Problema | Status |
|---|---|---|
| L-01 | Botões flutuantes sem rótulo acessível | Corrigido (`aria-label`) [L] |
| L-02 | "corrigir manualmente" com 10 px e área de toque pequena | Aumentado [E] |
| L-03 | Calendário bloqueava sábado e a semana permitia | Ver M-13 [E] |
| L-04 | `MainActivity` duplicada (pacote antigo `br.com.mkorp.control`) | Removida [L] |
| L-05 | `node_modules`, `dist`, `bundletool.jar` versionados (56 mil arquivos) | Removidos do índice [E] |
| L-06 | ESLint com 22 erros (inclusive falsos positivos de config) | 0 erros / 5 avisos [E] |
| L-07 | "Solicitar acesso" com e-mail pessoal fixo no código; botão de mostrar senha sem rótulo | `VITE_EMAIL_SUPORTE`; `aria-label` [L] |

## 4. Matriz de testes

Resultados: **A** = executado e aprovado · **R** = executado e reprovado · **L** = só leitura de código · **B** = bloqueado/não testado.

| ID | Área | Perfil | Cenário | Esperado | Antes | Depois |
|---|---|---|---|---|---|---|
| L1 | Login | — | credencial inválida | mensagem de erro | A | A |
| L2 | Login | inativo | usuário desativado | bloqueia com aviso | R | A |
| L3 | Sessão | qualquer | sessão inválida/expirada | volta ao login com aviso | R | A |
| L4 | Permissão UI | eletricista | abrir rotas de admin pela URL | redireciona | A | A |
| L5 | Recuperação | eletricista | esqueci a senha → link → nova senha → login | troca e entra | Ausente | A |
| E1–E5 | Edge Functions | admin/eletricista | criar usuário, validações, reset de senha, IA sem permissão/sem token | só admin; validações | — | A (5/5) |
| U1 | Funcionários | admin | cadastrar pela tela | login + perfil criados | — | A |
| ST | Storage | vários | bucket, avatar alheio, inativo | negado | — | A (5/5) |
| S1–S12 | Permissão API | vários | escalada, CPF, ponto alheio, estoque, auditoria, signup, inativo, isolamento | negado pelo servidor | R (12/12) | A (12/12) |
| F1–F12 | Fluxos permitidos API | todos | operações legítimas de cada papel | permitido | — | A (12/12) |
| P1 | Ponto | eletricista | iniciar/encerrar com GPS e enviar | grava + trilha | R | A |
| P2 | GPS | eletricista | permissão negada | marca e avisa | R | A |
| P3 | Rede | eletricista | sem conexão ao salvar | erro visível | R | A |
| P4 | Ponto | supervisor | aprovar | `aprovado_por` = servidor | R | A |
| P1–P3 (API) | Ponto | vários | enviado imutável, trilha, fechado | conforme regra | R | A |
| — | Ponto | — | virada de dia/fuso (21h BRT) | data local | R (unit) | A (unit) |
| — | Ponto | — | horário do aparelho alterado | detectar/registrar | — | **L**: trilha guarda hora do servidor; o horário marcado ainda vem do aparelho |
| P5 | Ponto | supervisor | expediente de ontem aberto após a meia-noite | abre ontem e encerra | R [L] | A (+ unit) |
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
| — | Botão voltar do Android, teclado sobre campos, edge-to-edge, versões Android | — | — | — | B | L (implementado) / B (aparelho) |
| — | Build release/AAB, assinatura, comportamento da release | — | — | — | B | B |
| — | Leitor de tela (TalkBack) | — | — | — | B | B |

Evidências: `qa-evidencias/` (saídas de teste antes/depois, `antes-P1-R1-C1-R2.png` e capturas em `screens/`).

## 5. Google Play — requisitos (consultados em 02/10/2026)

| Requisito | Situação | Onde |
|---|---|---|
| Target API 36 para apps novos/atualizações desde 31/08/2026 (extensão até 01/11/2026) — [fonte](https://developer.android.com/google/play/requirements/target-sdk) | **Atende no código** (Capacitor 8, target 36 — [fonte](https://capacitorjs.com/docs/updating/8-0)); compilação [B] | Máquina do dev |
| AAB assinado com Play App Signing | Gradle lê `keystore.properties` fora do repo [L]; não compilado [B] | Máquina do dev |
| Contas pessoais criadas após 13/11/2023: teste fechado com **12 testadores por 14 dias** antes da produção — [fonte](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) | Tipo de conta desconhecido | Play Console |
| Localização: só *foreground*; sem `ACCESS_BACKGROUND_LOCATION` → não precisa do formulário de declaração — [fonte](https://support.google.com/googleplay/android-developer/answer/9799150?hl=en) | Atende [L] | — |
| Política de privacidade (URL pública + link no app) | Minuta criada (`public/privacidade.html`) + link em Configurações — **validar com jurídico** | Jurídico + deploy |
| Exclusão de conta: caminho no app + link web — [fonte](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en) | Pedido no app (notifica admin) + `public/excluir-conta.html` (minuta). A exclusão em si é manual pelo admin | Jurídico/RH |
| Segurança dos dados | A preencher: localização precisa, nome, e-mail, telefone, IDs, "outras informações pessoais" (CPF), fotos, atividade no app; criptografia em trânsito; exclusão sob pedido; compartilhamento com OpenRouter (imagem de NF) | Play Console |
| Acesso para revisão | Criar conta de revisor com dados fictícios em produção/homologação | Play Console |
| Ficha da loja | Ícone 512, feature graphic 1024×500, capturas, descrições, categoria, classificação de conteúdo, público-alvo | Play Console |
| Permissões de fotos | Nenhuma permissão de armazenamento/mídia (Camera 8 usa Photo Picker) [L]; validar em aparelho | Aparelho |

> Alternativa: como é um app interno de empresa, publicá-lo como **app privado no Managed Google Play** evita a ficha pública. A decisão é de negócio.

## 6. Arquivos alterados (principais)

- **Banco:** `supabase/migrations/20261002000000_seguranca_rls_estoque_ponto.sql`, `20261002010000_indices_storage.sql` (novos)
- **Edge Functions:** `ia-imagem`, `admin-criar-usuario` (novas), `admin-reset-senha` (checa `ativo`, senha ≥ 8)
- **Android:** Capacitor 8.5 (`package.json`, `android/variables.gradle`, `build.gradle`, `app/build.gradle`, wrapper 8.14.3, manifest), `capacitor.config.json` (SystemBars)
- **Novos:** `src/lib/jornada.js`, `src/lib/voltar.js`, `src/components/BotaoVoltarAndroid.jsx`, `src/pages/RedefinirSenha.jsx`, `scripts/zerar-historico.sh`, `docs/DEPLOY-PLAY.md`
- **Serviços:** `src/services/supabase.js`, `src/services/openrouter.js`, `src/lib/datas.js` (novo), `src/providers/QueryProvider.jsx`
- **Auth/rotas:** `src/contexts/AuthContext.jsx`, `src/routes/TenantRoutes.jsx`, `src/pages/Login.jsx`
- **Telas:** BaterPonto, Requisicoes, RegistroCampo, Timesheet, Monitoramento, OrdensServico, EntradaNF, Settings, Employees, `components/AvisoConexao.jsx` (novo), contraste em 25 arquivos
- **Android/config:** `capacitor.config.json`, `AndroidManifest.xml`, `index.html`, `package.json`, `eslint.config.js`, `.gitignore`, `.env.example`, workflow de deploy
- **Testes:** `tests/unit/` (11), `tests/local/` (stack local + seed + 37 testes de API/funções + policies de Storage), `tests/e2e-local/` (15 E2E), `playwright.local.config.js`
- **Removidos do índice:** `node_modules/`, `dist/`, `4.aab`, `bundletool.jar`, `MainActivity` duplicada
- **Sobras do projeto anterior removidas (app zerado):** `.claude/` (comandos de site/SEO e caminhos do outro projeto), `android/.idea/`, `eas.json`, `.htaccess` da raiz e regra `/backend/` + CORS `*` do `public/.htaccess`, `src/data/paises.js`, `src/services/mockData.js`, 4 CSS sem uso, `src/lib/utils.js`, `App.css`, `react.svg`, `vite.svg`, imagem de banco em `assets/`, guias desatualizados do protótipo (`COMO-COLOCAR-NO-AR.*`, `ROADMAP-MVP-DEPLOY.md`), `clsx`/`tailwind-merge`. Splash do Android trocado do padrão do Capacitor para a marca MKORP. Textos de marketing movidos para `docs/marketing/`.

## 7. Resultados finais (02/10/2026)

| Verificação | Resultado |
|---|---|
| ESLint | 0 erros, 5 avisos |
| Testes unitários (fuso + jornada) | 11/11 |
| Testes de API + Edge Functions | 37/37 (migrações aplicadas 2×) |
| Policies de Storage | 5/5 |
| E2E pela interface (celular 393×851) | 15/15 — no código original: 2/12 |
| `vite build` | OK (entrada 664 KB) |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| `npx cap sync android` / `cap doctor` | OK |
| Histórico zerado (branch `app-zerado`) | 1 commit, nenhum arquivo ou referência do projeto anterior |
| Build Android / AAB / release | **Não executado** (SDK e Maven do Google bloqueados no ambiente) |

## 8. Pendências e checklist para publicar

Passo a passo detalhado em [`docs/DEPLOY-PLAY.md`](DEPLOY-PLAY.md).

**Impeditivas (fora do repositório)**
- [ ] Trocar a senha do admin; revogar a chave OpenRouter; resetar a chave de upload; publicar o histórico zerado com `scripts/zerar-historico.sh` (force-push); avaliar o vazamento da folha de terceiros.
- [ ] Exportar o schema real de produção e comparar com o do repositório.
- [ ] Aplicar as 2 migrações **primeiro em homologação**, rodar `npm run test:api` contra ela e só depois em produção, **junto** com o deploy do site.
- [ ] Publicar as 3 Edge Functions e o secret `OPENROUTER_KEY`; desligar o signup público; cadastrar `…/redefinir-senha` nas Redirect URLs; configurar SMTP.
- [ ] Gerar o AAB (Android Studio Otter, JDK 21) e testar em aparelho (Android 10, 13 e 15/16) — roteiro no guia.
- [ ] Validação jurídica: privacidade, exclusão de conta × guarda do ponto, Portaria MTP 671/2021. **Esta auditoria não declara conformidade legal.**
- [ ] Play Console: Segurança dos dados, conta de revisão, ficha da loja, classificação, teste fechado (12×14 se for conta pessoal).

**Regras de negócio a decidir (ambiguidades)**
- Jornada noturna: adotei "horário menor que o anterior = dia seguinte" e jornada de 8 h; confirmar com RH (adicional noturno não é calculado).
- O horário da marcação deve ser o do servidor? Hoje é o do aparelho, com a hora do servidor guardada na trilha.
- Fluxo de separação → saída → entrega (parcial) → confirmação de recebimento. A aprovação baixa o estoque na hora.
- Escopo e contrato da integração com o ERP (inexistente).
- Quem conclui a exclusão de conta e o que é anonimizado.

**Melhorias recomendadas (não impeditivas)**
- Bucket `fotos-campo` público: migrar para privado + URLs assinadas (exige converter os links já gravados).
- Paginação nas listas longas (OS, movimentações, ponto).
- Push notifications (hoje só notificações dentro do app).
