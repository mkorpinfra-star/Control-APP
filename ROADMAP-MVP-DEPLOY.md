# Mkorp Control — Roadmap MVP, Deploy e Escala

Tudo o que você precisa saber para sair do protótipo e ir para produção real.

---

## 1. O que está pronto e o que falta para o MVP

### ✅ Já está pronto (protótipo)
- Interface completa (todas as telas)
- Fluxo de autenticação (login por perfil)
- Ordens de serviço, almoxarifado, ponto, registro de campo com GPS
- Requisições com aprovação
- Dashboard com KPIs
- Relatórios
- Capacitor configurado (base para Android)

### ❌ O que falta para o MVP funcionar de verdade

| O que falta | Por quê é necessário | Esforço |
|---|---|---|
| **Supabase real** (banco + auth) | Dados persistem, login de verdade | ⭐ Baixo |
| **Trocar o `supabase.js` mock → real** | Uma única mudança de código | ⭐ Baixo |
| **HTTPS na VPS** | GPS e câmera exigem HTTPS | ⭐ Baixo |
| **Upload de fotos** (Supabase Storage) | Fotos do campo precisam de storage real | ⭐ Baixo |
| **Build Android** (`.aab` assinado) | Para publicar na Play Store | ⭐⭐ Médio |
| **Conta Google Play** | US$ 25, única vez | ⭐ Baixo |

### APIs externas necessárias?

**Para o MVP: NENHUMA obrigatória.** O Supabase já entrega banco, auth e storage em um só lugar.

**Opcionais (adicionar depois, não agora):**

| API | Para quê | Quando adicionar |
|---|---|---|
| **Google Maps API** | Mapa real no monitoramento de equipes | V2 |
| **SendGrid / Resend** | E-mail de notificação (OS aprovada, etc.) | V2 |
| **Firebase Cloud Messaging** | Push notifications no celular | V2 |
| **ViaCEP** | Autocompletar endereço pelo CEP | V2 |
| **CNPJ.ws** | Validar CNPJ de clientes/contratos | V2 |

**Resumo:** MVP sobe com **zero APIs externas** além do Supabase.

---

## 2. Passo a passo completo — do zero ao ar

### ETAPA 1 — Supabase (banco real)

**1.1 Criar projeto**
- Acesse supabase.com → New Project
- Nome: `mkorp-control-prod`
- Região: South America (São Paulo)
- Anote: **Project URL** e **anon public key**

**1.2 Criar as tabelas**
- SQL Editor → cole e rode o arquivo `supabase_schema.sql` do projeto
- Deve retornar "Success"

**1.3 Desativar confirmação de e-mail**
- Authentication → Providers → Email → desligar "Confirm email"

**1.4 Criar o primeiro admin**
```sql
-- Depois de criar o usuário em Authentication → Users, rode:
insert into public.usuarios (id, nome, email, cargo, matricula, ativo)
values ('UID_DO_AUTH', 'Felipe Garcia', 'admin@mkorp.com.br', 'admin', 'ADM001', true);
```

---

### ETAPA 2 — Ligar o app ao banco real

**2.1 Criar o `.env` na raiz do projeto**
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**2.2 Substituir o `src/services/supabase.js`**

Trocar o arquivo mock pelo cliente real. Estrutura base:

```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// authService
export const authService = {
  login: async (email, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    const { data: perfil } = await supabase.from('usuarios').select('*').eq('id', data.user.id).single();
    return perfil;
  },
  logout: () => supabase.auth.signOut(),
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const { data: perfil } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single();
    return perfil;
  },
};

// ordensServicoService
export const ordensServicoService = {
  getAll: async (filtros = {}) => {
    let q = supabase.from('ordens_servico').select('*, contratos(nome), usuarios(nome)');
    if (filtros.status) q = q.eq('status', filtros.status);
    if (filtros.responsavel_id) q = q.eq('responsavel_id', filtros.responsavel_id);
    const { data, error } = await q.order('numero', { ascending: false });
    if (error) throw error;
    return data;
  },
  create: async (dados) => {
    const { data, error } = await supabase.from('ordens_servico').insert(dados).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, dados) => {
    const { data, error } = await supabase.from('ordens_servico').update(dados).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};

// (repetir o padrão para cada service: pontoService, almoxarifadoService, etc.)
```

> Peça à IA: "Gere o `supabase.js` real completo para o Mkorp Control, mantendo todas as funções do mock mas usando o cliente Supabase real." — ela gera tudo de uma vez.

**2.3 Testar localmente**
```bash
npm run dev
```
Entre com o e-mail/senha criados no Supabase. Se logar e carregar dados reais → ok.

---

### ETAPA 3 — VPS (site no ar)

**Pré-requisito:** VPS Ubuntu 22.04 + domínio apontando para o IP (registro A).

**3.1 Gerar o build**
```bash
npm run build
# gera a pasta dist/
```

**3.2 Enviar para a VPS**
```bash
ssh root@SEU_IP "mkdir -p /var/www/mkorp"
scp -r dist/* root@SEU_IP:/var/www/mkorp/
```

**3.3 Instalar nginx na VPS**
```bash
apt update && apt install -y nginx
```

**3.4 Configurar o nginx**
```bash
nano /etc/nginx/sites-available/mkorp
```
```nginx
server {
    listen 80;
    server_name app.mkorp.com.br;
    root /var/www/mkorp;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
}
```
```bash
ln -s /etc/nginx/sites-available/mkorp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

**3.5 HTTPS (obrigatório — GPS e câmera só funcionam com HTTPS)**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d app.mkorp.com.br
# escolha "redirect" quando perguntar
```

**3.6 Atualizar o app no futuro**
```bash
npm run build
scp -r dist/* root@SEU_IP:/var/www/mkorp/
```

---

### ETAPA 4 — Play Store (app Android funcionando de verdade)

#### 4.1 Pré-requisitos no seu PC
- Android Studio instalado
- JDK 17 (já vem com o Android Studio)

#### 4.2 Adicionar o Android ao projeto
```bash
npm run build
npx cap add android
npx cap sync android
```

#### 4.3 Configurar o `capacitor.config.json`
```json
{
  "appId": "br.com.mkorp.control",
  "appName": "Mkorp Control",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  }
}
```

> ⚠️ `"androidScheme": "https"` é obrigatório — sem isso o GPS e a câmera não funcionam no Android.

#### 4.4 Gerar ícones
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --android
```

#### 4.5 Gerar o `.aab` assinado

```bash
npx cap open android
```

No Android Studio:
1. **Build** → Generate Signed Bundle / APK
2. Escolha **Android App Bundle (.aab)**
3. **Create new keystore** — salve o `.jks` em local seguro (backup obrigatório — sem ele não dá pra atualizar)
4. Preencha os campos → **Next** → release → **Finish**
5. Arquivo gerado: `android/app/release/app-release.aab`

#### 4.6 Google Play Console

1. Acesse play.google.com/console
2. Pague **US$ 25** (única vez) e aguarde verificação da conta
3. **Criar app** → Mkorp Control / Português BR / Gratuito
4. Menu → **Testes** → **Teste interno** → **Criar versão**
5. Upload do `app-release.aab`
6. **Testadores** → criar lista → adicionar até 100 e-mails da equipe
7. Publicar → Play envia link de inscrição para os testadores

#### 4.7 Atualizar o app

Toda atualização:
```bash
# 1. Editar android/app/build.gradle:
#    versionCode +1 (ex: 1 → 2)
#    versionName "1.1"
npm run build
npx cap sync android
npx cap open android
# 2. Gerar novo .aab com a MESMA keystore
# 3. Upload na Play Console → nova versão
```

---

## 3. Como escalar para múltiplas empresas

### Estratégia de arquitetura

O Mkorp Control pode escalar de duas formas. Escolha antes de crescer:

#### Opção A — Multi-tenant (recomendada para SaaS)

Uma única instalação do app e banco serve múltiplas empresas, cada uma isolada por `empresa_id`.

**Como funciona:**
- Cada empresa tem um `empresa_id` no banco
- Todas as queries filtram por `empresa_id` automaticamente via RLS (Row Level Security) do Supabase
- Um único deploy do app na VPS atende todas as empresas
- O login identifica a empresa do usuário

**Vantagem:** um só app, um só servidor, fácil de manter.
**Desvantagem:** dados de empresas diferentes no mesmo banco (mas isolados por RLS).

**Para implementar no Supabase:**
```sql
-- Adicionar empresa_id em todas as tabelas
ALTER TABLE ordens_servico ADD COLUMN empresa_id uuid REFERENCES empresas(id);

-- RLS: cada usuário só vê dados da sua empresa
CREATE POLICY "usuario vê só sua empresa"
ON ordens_servico FOR ALL
USING (empresa_id = (SELECT empresa_id FROM usuarios WHERE id = auth.uid()));
```

#### Opção B — Instância por empresa

Cada empresa tem seu próprio projeto Supabase e seu próprio deploy na VPS (subdomínio).

**Exemplo:**
- empresa1.mkorp.com.br → banco isolado da Empresa 1
- empresa2.mkorp.com.br → banco isolado da Empresa 2

**Vantagem:** isolamento total, mais fácil de explicar para clientes enterprise.
**Desvantagem:** trabalho de manutenção multiplica (uma atualização = deploy em N lugares).

> **Recomendação:** comece com **multi-tenant (Opção A)**. É o padrão SaaS moderno. Só migre para instância por empresa se um cliente exigir isolamento total por contrato.

---

## 4. Git — versionamento e estratégia de branches

### Estrutura recomendada

```
main          ← código de produção (sempre estável)
develop       ← desenvolvimento ativo
feature/xxx   ← nova funcionalidade
fix/xxx       ← correção de bug
release/x.x   ← preparação de versão
```

### Fluxo de trabalho

```bash
# 1. Nova funcionalidade
git checkout develop
git checkout -b feature/mapa-monitoramento
# ... desenvolve ...
git push origin feature/mapa-monitoramento
# Pull Request → develop

# 2. Preparar release
git checkout -b release/1.2
# testes finais, ajustes de versão
git merge main    # e também → develop

# 3. Deploy
git checkout main
git merge release/1.2
git tag v1.2.0
npm run build && scp -r dist/* root@VPS:/var/www/mkorp/
```

### Para múltiplas empresas (Opção B)

Se cada empresa tem seu próprio deploy, use **tags + branches por cliente**:

```
main                ← código base (sem customização)
client/prefeitura-sp  ← customizações da Prefeitura SP
client/empreiteira-xyz ← customizações da Empreiteira XYZ
```

Quando atualiza o código base:
```bash
git checkout main
# ... atualiza ...
git checkout client/prefeitura-sp
git merge main     # traz as atualizações do base
# resolve conflitos de customização
# deploy para o servidor da Prefeitura SP
```

> ⚠️ **Cuidado:** manter branches por cliente é custoso. Prefira multi-tenant (Opção A) onde as customizações ficam no banco (configurações por empresa), não no código.

---

## 5. Checklist completo MVP → Produção

### Banco e backend
- [ ] Projeto Supabase criado (região SP)
- [ ] `supabase_schema.sql` executado
- [ ] Confirmação de e-mail desativada
- [ ] Admin criado (Auth + tabela usuarios)
- [ ] `.env` preenchido com URL e chave anon
- [ ] `supabase.js` trocado de mock para real
- [ ] Testado localmente com `npm run dev`

### VPS
- [ ] Domínio apontando para o IP (registro A)
- [ ] `npm run build` executado
- [ ] `dist/` enviado para `/var/www/mkorp`
- [ ] nginx configurado com `try_files /index.html`
- [ ] HTTPS ativo com Certbot
- [ ] GPS testado no celular via HTTPS ✓

### Android / Play Store
- [ ] `capacitor.config.json` com `"androidScheme": "https"`
- [ ] `npx cap add android` executado
- [ ] Ícones gerados (`@capacitor/assets`)
- [ ] Keystore criada e backup feito
- [ ] `.aab` assinado gerado
- [ ] Conta Play Console criada (US$ 25)
- [ ] App criado na Play Console
- [ ] Teste interno publicado
- [ ] Link de inscrição enviado para a equipe
- [ ] Testado no celular real (GPS, câmera, login)

### Escala
- [ ] Decidido: multi-tenant ou instância por empresa?
- [ ] `empresa_id` adicionado nas tabelas (se multi-tenant)
- [ ] RLS configurado por empresa (se multi-tenant)
- [ ] Git com branch strategy definida
- [ ] Processo de deploy documentado

---

## 6. Custo mensal estimado (MVP)

| Item | Custo |
|---|---|
| Supabase Cloud (free tier — até crescer) | **Grátis** |
| VPS básica (2 vCPU, 4GB RAM) | ~R$ 40–80/mês |
| Domínio (.com.br) | ~R$ 40/ano |
| HTTPS (Certbot) | **Grátis** |
| Google Play (conta dev, única vez) | **~R$ 125 (US$ 25)** |
| **Total mensal** | **~R$ 40–80/mês** |

Quando o Supabase free tier não for suficiente (500MB banco / 1GB storage), o plano Pro custa US$ 25/mês (~R$ 125).

---

*Roadmap MVP do **Mkorp Control** — do protótipo à produção.*
