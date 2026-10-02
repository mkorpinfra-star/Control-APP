# Passo a passo: colocar esta versão no ar e publicar na Google Play

Siga **nesta ordem**. O app novo depende das funções do banco, e o app antigo deixa de lançar estoque quando a segurança nova é aplicada. Por isso, banco e site sobem juntos.

## 0. Segurança (antes de tudo)
1. Troque a senha do admin `felipe.garcia@mkorp.com.br` (estava no repositório).
2. Na OpenRouter, revogue a chave antiga e crie uma nova (ela estava no bundle público do site).
3. Na Play Console → *Integridade do app* → *Assinatura do app*, peça o **reset da chave de upload** (a senha estava no histórico do git). Gere um keystore novo e guarde-o fora do repositório.
4. Envie a branch `qa/auditoria-play-store` para o GitHub e só então limpe o histórico com `scripts/limpar-historico.sh` (o script explica). O procedimento foi testado numa cópia: o repositório caiu de 169 MB para 36 MB.

## 1. Banco (Supabase) — homologação primeiro
1. Crie um projeto Supabase de homologação e restaure nele um dump da produção:
   `supabase db dump --db-url <producao> -f prod.sql` (schema) e, se possível, dados anonimizados.
2. Compare o schema real com `supabase_schema.sql` + `tests/local/stack/05_reconstruido.sql`.
   As migrações supõem as colunas usadas pelo app (ex.: `controle_ponto.latitude_entrada`, `requisicao_itens.nome_livre`).
3. Aplique as migrações em ordem:
   - `supabase/migrations/20261002000000_seguranca_rls_estoque_ponto.sql`
   - `supabase/migrations/20261002010000_indices_storage.sql`
4. Rode os testes de API apontando para a homologação. Use **somente** contas de teste:
   crie os usuários de `tests/local/seed.mjs` lá e use `SUPABASE_URL=<homolog> ANON_KEY=… SERVICE_KEY=…`.
   Os testes recusam URLs que não sejam locais; para homologação, troque a guarda no topo dos arquivos conscientemente.
5. Authentication → Providers → Email: **desligue "Allow new users to sign up"**. Funcionários passam a ser criados pela função `admin-criar-usuario`.
6. Authentication → URL Configuration: adicione `https://app.mkorp.com.br/redefinir-senha` em *Redirect URLs*.
7. Configure o SMTP do Supabase (o envio de e-mail padrão tem limite muito baixo) para o "Esqueci minha senha".

## 2. Edge Functions
```bash
supabase secrets set OPENROUTER_KEY=<nova-chave>
supabase functions deploy admin-reset-senha
supabase functions deploy admin-criar-usuario
supabase functions deploy ia-imagem
```
A função de reset estava publicada como `bright-worker`. Depois de publicar `admin-reset-senha`, a antiga pode ser removida. Se preferir manter o nome antigo, defina `VITE_FN_RESET_SENHA=bright-worker`.

## 3. Site (VPS)
- No GitHub Actions, remova o secret `OPENROUTER_KEY` (não é mais usado) e confirme que o workflow usa Node 22.
- Opcional: `VITE_APP_URL` e `VITE_EMAIL_SUPORTE` (veja `.env.example`).
- Faça o merge na `main` **no mesmo momento** em que aplicar as migrações na produção.
- Publique `public/privacidade.html` e `public/excluir-conta.html` **depois** de o jurídico preencher os itens entre [colchetes].

## 4. App Android (Capacitor 8, API 36)
Requisitos: Android Studio Otter (2025.2.1) ou mais novo, JDK 21, Node 22.
```bash
npm ci
cp .env.example .env.production   # preencha URL e chave anon de PRODUÇÃO
npm run build:android              # vite build + cap sync android
npx cap open android
```
No Android Studio: *Build → Generate Signed App Bundle* com o keystore novo (o `keystore.properties` fica fora do git).
`versionCode 3` / `versionName 1.1.0` já estão no `android/app/build.gradle`.

**Testes obrigatórios em aparelho** (Android 10, 13 e 15/16):
- login, sessão expirada (deixe o app fechado por mais de 1 h) e "Esqueci minha senha";
- ponto com GPS concedido, negado e revogado nas configurações; GPS desligado;
- câmera no registro de campo e na NF; galeria (Photo Picker) na foto de perfil;
- botão voltar fechando modais e saindo das telas;
- barra de status e barra de navegação sem cobrir o conteúdo (edge-to-edge);
- teclado não cobrindo campos; rotação; modo avião durante um envio;
- fonte do sistema em 130% e TalkBack nos botões principais.

## 5. Play Console
- **Conteúdo do app:** política de privacidade (URL), acesso para revisão (conta de teste + instruções), anúncios = não, classificação de conteúdo, público-alvo (adulto), app governamental = não.
- **Segurança dos dados:** localização precisa; nome, e-mail, telefone, IDs de usuário, outras informações pessoais (CPF); fotos; atividade no app. Tudo coletado para *funcionalidade do app*, criptografado em trânsito, com exclusão sob pedido. Imagens de NF são enviadas à OpenRouter (compartilhamento com terceiro para funcionalidade).
- **Exclusão de conta:** URL `https://app.mkorp.com.br/excluir-conta.html`.
- **Permissões:** só localização em primeiro plano e câmera. Não declare localização em segundo plano.
- **Testes:** teste interno → teste fechado (se a conta for pessoal criada após 13/11/2023: 12 testadores por 14 dias) → produção.
- Alternativa para uso só interno: publicar como **app privado no Managed Google Play**.
