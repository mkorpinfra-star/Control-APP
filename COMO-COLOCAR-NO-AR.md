# 🚀 Mkorp Control — Guia completo de deploy (colocar no ar)

Guia passo a passo para publicar o app: **site na sua VPS** + **banco de dados (Supabase)** + **app Android na Google Play**.

> Escrito para quem **nunca fez deploy**. Cada comando pode ser copiado e colado.
> Tempo estimado total: 2 a 4 horas (primeira vez).

---

## 📑 Índice

1. [Entendendo a arquitetura (leia primeiro)](#1-entendendo-a-arquitetura)
2. [Preciso de Supabase? (resposta direta)](#2-preciso-de-supabase)
3. [PARTE A — Configurar o Supabase (banco)](#parte-a--configurar-o-supabase)
4. [PARTE B — Ligar o app ao Supabase real (sair do modo protótipo)](#parte-b--ligar-o-app-ao-supabase-real)
5. [PARTE C — Subir o site na VPS](#parte-c--subir-o-site-na-vps)
6. [PARTE D — Publicar na Google Play (teste com 100 contas)](#parte-d--publicar-na-google-play)
7. [PARTE E — Alternativa sem loja: PWA (instalar pelo navegador)](#parte-e--alternativa-pwa)
8. [Custos resumidos](#-custos-resumidos)
9. [Checklist final](#-checklist-final)
10. [Problemas comuns](#-problemas-comuns)

---

## 1. Entendendo a arquitetura

O Mkorp Control tem **3 peças**:

```
┌─────────────────────────┐     ┌──────────────────────────┐
│   APP (front-end)        │     │   SUPABASE (back-end)    │
│   - site React/Vite      │────▶│   - banco de dados       │
│   - app Android (mesmo   │     │   - login/usuários       │
│     código via Capacitor)│     │   - fotos (storage)      │
└─────────────────────────┘     └──────────────────────────┘
        ▲                                   
        │ hospedado na sua VPS              Supabase é nuvem (grátis)
        │ (arquivos estáticos)              OU self-hosted na VPS
```

**Ponto-chave:** o app em si é só **arquivos estáticos** (HTML/CSS/JS). Ele não precisa de "servidor rodando" — qualquer hospedagem que sirva arquivos (sua VPS com nginx) funciona. **Quem guarda os dados é o Supabase.**

---

## 2. Preciso de Supabase?

**Sim — você precisa de um banco de dados.** Hoje o app está em **modo protótipo** (dados falsos na memória que somem ao recarregar). Para virar um sistema real com dados que persistem, login de verdade e fotos, você precisa de um back-end.

Você tem **3 opções** (escolha UMA):

| Opção | Esforço | Custo | Recomendação |
|---|---|---|---|
| **A. Supabase Cloud** | ⭐ Fácil | Grátis até crescer | ✅ **Recomendado** — comece por aqui |
| **B. Supabase self-hosted na sua VPS** | 🔧 Médio/Difícil | Só o custo da VPS | Se quiser tudo no seu servidor |
| **C. Outro back-end (PHP, Node...)** | 🔧🔧 Difícil | — | ❌ Reescreveria o app. Não recomendo |

> 💡 **Recomendação:** use o **Supabase Cloud (grátis)**. A VPS hospeda só o site. Você pode migrar para self-hosted depois, sem mexer no código.
>
> **Free tier do Supabase Cloud:** 500 MB de banco, 1 GB de storage (fotos), 50.000 usuários ativos/mês. Mais que suficiente para começar.

Este guia usa a **Opção A**. No fim há uma nota sobre a Opção B.

---

## PARTE A — Configurar o Supabase

### A.1 — Criar o projeto

1. Acesse **https://supabase.com** → **Start your project** → faça login (GitHub ou e-mail)
2. **New Project**
   - **Name:** `mkorp-control`
   - **Database Password:** crie uma senha forte e **guarde** (você vai precisar)
   - **Region:** `South America (São Paulo)` — mais perto = mais rápido
3. Clique **Create new project** e aguarde ~2 minutos

### A.2 — Criar as tabelas (rodar o SQL)

1. No painel do Supabase, menu lateral → **SQL Editor** → **New query**
2. Abra o arquivo **`supabase_schema.sql`** (está na raiz deste projeto)
3. **Copie todo o conteúdo** e cole no SQL Editor
4. Clique **Run** (canto inferior direito)
5. Deve aparecer **"Success. No rows returned"** — pronto, todas as tabelas, funções e o bucket de fotos foram criados

> O `supabase_schema.sql` já cria: usuários, contratos, ordens de serviço, registros de campo, controle de ponto, almoxarifado, requisições, movimentações (com quem entregou/retirou), as funções de estoque e o bucket `fotos-campo`.

### A.3 — Pegar as chaves de API

1. Menu lateral → **Project Settings** (engrenagem) → **API**
2. Copie e guarde dois valores:
   - **Project URL** → algo como `https://abcdxyz.supabase.co`
   - **anon public** (em "Project API keys") → uma chave longa começando com `eyJ...`

> ⚠️ **Nunca** use a chave `service_role` no app (ela é secreta e dá acesso total). Use só a `anon public`.

### A.4 — Desativar confirmação de e-mail (facilita o início)

1. Menu **Authentication** → **Providers** → **Email**
2. Desligue **"Confirm email"** → **Save**
   (assim você cria usuários e eles já entram, sem precisar confirmar e-mail)

### A.5 — Criar o primeiro usuário admin

Como o app usa login por e-mail/senha, crie o admin:

1. Menu **Authentication** → **Users** → **Add user** → **Create new user**
   - **Email:** `admin@mkorp.com.br`
   - **Password:** escolha uma senha real (ex: a que você usará)
   - Marque **Auto Confirm User**
   - **Create user**
2. **Copie o User UID** que aparece (um código tipo `a1b2c3d4-...`)
3. Volte em **SQL Editor** → New query → rode isto (troque o UID e o nome):

```sql
insert into public.usuarios (id, nome, email, cargo, matricula, ativo)
values (
  'COLE_AQUI_O_USER_UID',   -- UID copiado do passo anterior
  'Felipe Garcia',
  'admin@mkorp.com.br',
  'admin',
  'ADM001',
  true
);
```

4. **Run**. Agora você tem um admin de verdade. (Repita para criar supervisores/eletricistas, mudando `cargo` para `supervisor`, `eletricista`, `ajudante` ou `motorista`.)

✅ **Supabase pronto.**

---

## PARTE B — Ligar o app ao Supabase real

Hoje o arquivo `src/services/supabase.js` está em **modo protótipo** (mock). Para usar o banco real:

### B.1 — Criar o arquivo `.env`

Na raiz do projeto, abra o arquivo **`.env`** e coloque suas chaves (da Parte A.3):

```env
VITE_SUPABASE_URL=https://abcdxyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### B.2 — Trocar a camada de dados (mock → real)

> Esta é a única mudança de código. Peça para o desenvolvedor (ou para a IA) **"gerar o `src/services/supabase.js` real com Supabase, mantendo as mesmas funções do mock"**. A versão real usa `@supabase/supabase-js` (já instalado) e faz as queries no banco.

O pacote já está instalado. O esqueleto da versão real começa assim:

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

…e cada função (ex: `ordensServicoService.getAll`) vira uma chamada real:

```js
getAll: async (filtros = {}) => {
  let q = supabase.from('ordens_servico').select('*, contratos(nome), usuarios(nome)');
  if (filtros.status) q = q.eq('status', filtros.status);
  const { data, error } = await q.order('numero', { ascending: false });
  if (error) throw error;
  return data;
},
```

As tabelas e os nomes dos campos **já batem** com o que o app espera (o schema foi feito assim). O `AuthContext` também já está pronto para o Supabase Auth real.

> 🔑 **Resumo:** `.env` + substituir o conteúdo do `supabase.js` mock pela versão real = app conectado ao banco.

### B.3 — Testar localmente antes de subir

```bash
npm run dev
```

Acesse `http://localhost:5173`, entre com `admin@mkorp.com.br` e a senha que você criou no Supabase. Se logar e os dados vierem do banco → **funcionou**.

---

## PARTE C — Subir o site na VPS

Vamos hospedar o **site** (build estático) numa VPS Ubuntu com **nginx** e **HTTPS grátis**.

> Pré-requisitos: uma VPS (Ubuntu 22.04), um **domínio** (ex: `app.mkorp.com.br`) apontando para o IP da VPS (registro **A** no seu provedor de domínio).

### C.1 — Gerar o build de produção (no seu PC)

```bash
npm run build
```

Isso cria a pasta **`dist/`** com o site pronto. É essa pasta que vai para a VPS.

### C.2 — Acessar a VPS e instalar o nginx

No seu PC, conecte via SSH (troque pelo IP da sua VPS):

```bash
ssh root@SEU_IP_DA_VPS
```

Na VPS:

```bash
apt update && apt upgrade -y
apt install -y nginx
```

### C.3 — Enviar a pasta `dist/` para a VPS

No **seu PC** (não na VPS), dentro da pasta do projeto:

```bash
# cria a pasta no servidor
ssh root@SEU_IP_DA_VPS "mkdir -p /var/www/mkorp"

# envia os arquivos do build (precisa do scp; no Windows use o PowerShell ou Git Bash)
scp -r dist/* root@SEU_IP_DA_VPS:/var/www/mkorp/
```

### C.4 — Configurar o nginx

Na VPS, crie a configuração do site:

```bash
nano /etc/nginx/sites-available/mkorp
```

Cole isto (troque `app.mkorp.com.br` pelo seu domínio):

```nginx
server {
    listen 80;
    server_name app.mkorp.com.br;

    root /var/www/mkorp;
    index index.html;

    # SPA: qualquer rota cai no index.html (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # cache de assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Salve (`Ctrl+O`, `Enter`, `Ctrl+X`). Ative o site:

```bash
ln -s /etc/nginx/sites-available/mkorp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t          # testa a config (deve dizer "ok")
systemctl reload nginx
```

Agora acessar `http://app.mkorp.com.br` já mostra o app.

### C.5 — Ativar HTTPS grátis (obrigatório!)

⚠️ **O GPS e a câmera só funcionam com HTTPS.** Use o Certbot (grátis):

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d app.mkorp.com.br
```

Responda o e-mail, aceite os termos, e escolha **redirect** (forçar HTTPS). Pronto — `https://app.mkorp.com.br` no ar com cadeado 🔒.

> O Certbot renova o certificado sozinho. Não precisa fazer nada.

### C.6 — Atualizações futuras do site

Toda vez que mudar o app, repita só isto:

```bash
# no seu PC
npm run build
scp -r dist/* root@SEU_IP_DA_VPS:/var/www/mkorp/
```

(não precisa mexer no nginx de novo)

✅ **Site no ar.**

---

## PARTE D — Publicar na Google Play

O app Android usa o **mesmo código** do site (via **Capacitor**). Você gera um `.aab` e sobe na Play Console.

> ❗ **Sobre o "modo free de 100 contas":** a Google Play tem a faixa **Internal Testing (Teste interno)** que permite **até 100 testadores** (por e-mail), **sem revisão demorada e sem custo extra**. É exatamente isso que você quer para uso interno da empresa. Existe **uma taxa única de US$ 25** para criar a conta de desenvolvedor (paga uma vez na vida, não é mensal).

### D.1 — Pré-requisitos no seu PC

- **Android Studio** instalado (https://developer.android.com/studio)
- **Java JDK 17** (vem com o Android Studio)

### D.2 — Regenerar o projeto Android

A pasta `android/` foi removida na limpeza. Recrie:

```bash
npm run build
npx cap add android
npx cap sync android
```

### D.3 — Configurar nome, ícone e versão

O `capacitor.config.json` já está com:
- **appId:** `br.com.mkorp.control`
- **appName:** `Mkorp Control`

Os ícones (`public/icon-512.png`) já são da Mkorp. Para gerar os ícones do Android automaticamente:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --android
```

### D.4 — Abrir no Android Studio e gerar o AAB assinado

```bash
npx cap open android
```

No Android Studio:

1. Menu **Build** → **Generate Signed Bundle / APK**
2. Escolha **Android App Bundle (.aab)** → **Next**
3. **Create new...** (criar a chave de assinatura — o "keystore"):
   - Escolha um caminho e **guarde esse arquivo .jks com a senha** (você vai precisar dele em TODA atualização futura — se perder, não consegue mais atualizar o app!)
   - Preencha os campos (validade 25+ anos)
4. **Next** → escolha **release** → **Finish**
5. O `.aab` é gerado em `android/app/release/app-release.aab`

### D.5 — Criar a conta na Play Console

1. Acesse **https://play.google.com/console**
2. Pague a **taxa única de US$ 25** e preencha os dados (pessoa física ou empresa)
3. Aguarde a verificação da conta (pode levar de horas a alguns dias)

### D.6 — Criar o app e subir no Teste Interno (100 testadores)

1. Na Play Console → **Criar app**
   - Nome: **Mkorp Control**
   - Idioma padrão: Português (Brasil)
   - App / Gratuito
2. Menu lateral → **Testes** → **Teste interno** → **Criar versão**
3. Faça upload do **`app-release.aab`**
4. Em **Testadores**, crie uma lista e adicione os **e-mails** (até 100) das pessoas que vão usar
5. **Revisar versão** → **Iniciar lançamento para teste interno**
6. A Play Console te dá um **link de inscrição**. Cada testador abre o link no celular, aceita ser testador e instala o app pela Play Store **normalmente**.

> ✅ **Teste interno = praticamente instantâneo** (minutos, sem revisão longa) e até **100 pessoas**. Perfeito para a equipe da empresa. Você pode subir novas versões quando quiser.

### D.7 — Atualizações futuras do app

```bash
# 1. suba o número da versão em android/app/build.gradle (versionCode +1, versionName)
npm run build
npx cap sync android
npx cap open android
# 2. gere um novo .aab assinado (com a MESMA keystore) e suba na Play Console
```

> 📌 **Sobre produção pública:** se um dia quiser publicar para qualquer pessoa baixar (não só os 100 testadores), contas pessoais novas precisam de um período de **teste fechado com 20 testadores por 14 dias** antes de liberar produção. Para uso **interno da empresa**, o **Teste Interno (100 contas) já resolve** e você não precisa disso.

---

## PARTE E — Alternativa: PWA

Se você **não quiser mexer com Google Play**, o app já é um **PWA** — dá para instalar direto pelo navegador, **de graça e na hora**:

1. Com o site no ar com HTTPS (Parte C), abra `https://app.mkorp.com.br` no celular (Chrome/Safari)
2. Menu do navegador → **"Adicionar à tela inicial"** / **"Instalar app"**
3. Vira um ícone na tela inicial e abre em tela cheia, como um app nativo

**Vantagens:** zero custo, zero loja, atualiza sozinho (só atualizar o site).
**Limitação:** não aparece na Play Store (instala pelo link). GPS e câmera funcionam normalmente (porque tem HTTPS).

> 💡 Muitas empresas usam só o PWA para apps internos. Vale considerar antes de pagar a Play Console.

---

## 💰 Custos resumidos

| Item | Custo |
|---|---|
| Supabase Cloud (free tier) | **Grátis** (até crescer muito) |
| VPS (Ubuntu básica) | já é sua / ~R$ 20–40/mês |
| Domínio (.com.br) | ~R$ 40/ano |
| HTTPS (Certbot) | **Grátis** |
| PWA | **Grátis** |
| Google Play (conta dev) | **US$ 25 uma única vez** |

**Mínimo para colocar no ar (sem loja):** só a VPS + domínio + Supabase grátis = caminho mais barato (via PWA).

---

## ✅ Checklist final

**Banco (Supabase)**
- [ ] Projeto criado
- [ ] `supabase_schema.sql` rodado com sucesso
- [ ] Chaves (URL + anon) copiadas
- [ ] "Confirm email" desativado
- [ ] Usuário admin criado (Auth + tabela `usuarios`)

**App ligado ao banco**
- [ ] `.env` preenchido com as chaves
- [ ] `src/services/supabase.js` trocado de mock para real
- [ ] Testado em `npm run dev` (login real funciona)

**Site na VPS**
- [ ] Domínio apontando para o IP (registro A)
- [ ] `npm run build` feito
- [ ] `dist/` enviado para `/var/www/mkorp`
- [ ] nginx configurado e recarregado
- [ ] HTTPS ativo (Certbot) — cadeado 🔒
- [ ] GPS testado no celular (só funciona com HTTPS)

**Android (opcional)**
- [ ] `npx cap add android` feito
- [ ] `.aab` assinado gerado (keystore guardada em local seguro!)
- [ ] Conta Play Console criada (US$ 25)
- [ ] Teste interno criado com a lista de e-mails (até 100)
- [ ] Link de inscrição enviado para a equipe

---

## 🛠 Problemas comuns

**"Tela branca" depois do deploy**
→ Faltou a regra `try_files ... /index.html` no nginx (Parte C.4). Sem ela, rotas internas dão 404.

**GPS / câmera não funcionam**
→ Falta HTTPS. Geolocalização e câmera **exigem** `https://` (ou `localhost`). Rode o Certbot (Parte C.5).

**Login não funciona / "Invalid login credentials"**
→ O usuário precisa existir **nos dois lugares**: em **Authentication → Users** E na tabela **`usuarios`** com o mesmo UID. Veja A.5.

**Fotos não salvam**
→ Confira se o bucket **`fotos-campo`** existe (Supabase → Storage). O `supabase_schema.sql` já cria, mas confirme.

**App Android abre em branco**
→ Rode `npx cap sync android` depois de cada `npm run build`. O build precisa estar atualizado antes do sync.

**Esqueci/perdi a keystore do Android**
→ Não dá para atualizar o app na Play com outra chave. **Faça backup do arquivo `.jks` e da senha** em local seguro (ex: gerenciador de senhas).

---

## 📌 Nota: Supabase self-hosted na VPS (Opção B)

Se quiser **tudo no seu servidor** (sem depender da nuvem Supabase):

1. Na VPS com Docker instalado:
   ```bash
   git clone --depth 1 https://github.com/supabase/supabase
   cd supabase/docker
   cp .env.example .env   # edite senhas e chaves
   docker compose up -d
   ```
2. O Supabase sobe localmente (banco, auth, storage, painel)
3. No `.env` do app, use a URL do seu servidor em vez da `supabase.co`

> ⚠️ Self-hosted dá mais trabalho (backups, atualizações, segurança são por sua conta). **Comece com o Cloud grátis** e migre depois se precisar.

---

*Documento gerado para o projeto **Mkorp Control** — Gestão de iluminação pública.*
*Dúvidas em algum passo? Peça ajuda detalhando em qual etapa travou.*
