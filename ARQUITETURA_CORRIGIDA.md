# 🏗️ Arquitetura PuntoClicks - CORRIGIDA

## 🎯 Conceito Central

**UM app, UM login, MÚLTIPLOS clientes**

---

## 🌐 Domínios e Funções

### 1. `puntoclicks.com` (Domínio Principal)

**Função:** Marketing + Login Centralizado

**Rotas:**
- `/` - Landing page
- `/login` - **Login único para TODOS os clientes**
- `/signup` - Cadastro de novos clientes
- `/pricing` - Planos e preços
- `/docs` - Documentação
- `/politica-privacidade` - LGPD
- `/termos-uso` - Termos

**Características:**
- ✅ Sem autenticação necessária (público)
- ✅ Design marketing (hero, features, CTA)
- ✅ Login centralizado busca tenant pelo email

---

### 2. `admin.puntoclicks.com` (Super Admin)

**Função:** Gerenciamento de TODOS os clientes

**Usuário:** Você (Guilherme) - Super Admin

**Rotas:**
- `/dashboard` - Visão geral de todos os tenants
- `/tenants` - Lista de todos os clientes
- `/tenants/create` - Criar novo cliente
- `/tenants/:id` - Detalhes de um cliente
- `/analytics` - Métricas globais
- `/billing` - Controle de pagamentos

**Dados Exibidos:**
- Total de clientes ativos
- Total de usuários (soma de todos)
- Total de obras (soma de todos)
- Receita mensal recorrente (MRR)
- Clientes em trial
- Licenças expiradas

---

### 3. `j2s.puntoclicks.com` (Tenant - Cliente)

**Função:** Sistema operacional do cliente J2S

**Usuários:** Admin J2S, Funcionários, Encarregados

**Rotas:** (todas as rotas atuais do sistema)
- `/dashboard`
- `/obras`
- `/funcionarios`
- `/apontamentos`
- `/aprovacoes`
- `/financeiro`
- `/relatorios`
- etc.

**Características:**
- ✅ Autenticação obrigatória
- ✅ Dados filtrados por `tenant_id = 1`
- ✅ Branding do cliente (logo, cor)

---

### 4. `cliente2.puntoclicks.com` (Tenant - Cliente 2)

**Mesma estrutura do J2S, mas:**
- `tenant_id = 2`
- Logo e cor diferentes
- Dados isolados

---

## 🔐 Fluxo de Login Centralizado

### Passo 1: Usuário Acessa App

```
App Android/iOS abre: https://puntoclicks.com/login
```

### Passo 2: Tela de Login

```
+----------------------------------+
|     [Logo PuntoClicks]          |
|                                  |
|  Email: [________________]      |
|  Senha: [________________]      |
|                                  |
|     [Entrar]                     |
|                                  |
|  Esqueceu a senha?               |
+----------------------------------+
```

**Input:**
- Email: `admin@j2s.ad`
- Senha: `senha123`

### Passo 3: Backend Identifica Tenant

```php
POST /api/auth/login-central.php
Body: { "email": "admin@j2s.ad", "password": "senha123" }

// Backend faz:
1. Buscar usuário pelo email
2. Identificar qual tenant (tenant_id)
3. Buscar slug do tenant
4. Validar senha
5. Gerar JWT com tenant_id
6. Retornar: token + tenant_slug + redirect_url
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "nome": "Admin J2S",
    "email": "admin@j2s.ad",
    "tipo": "admin",
    "tenant_id": 1
  },
  "tenant": {
    "id": 1,
    "slug": "j2s",
    "nome": "J2S Construções",
    "logo_url": "/tenants/j2s/logo.png",
    "primary_color": "#CE0201"
  },
  "redirect_url": "https://j2s.puntoclicks.com/dashboard"
}
```

### Passo 4: Frontend Redireciona

```javascript
// AuthContext.jsx
const response = await fetch('https://puntoclicks.com/api/auth/login-central.php', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

const data = await response.json();

if (data.success) {
  // Salvar token
  localStorage.setItem('token', data.token);

  // Redirecionar para subdomain do cliente
  window.location.href = data.redirect_url;
  // → https://j2s.puntoclicks.com/dashboard
}
```

### Passo 5: Usuário no Dashboard do Cliente

```
URL: https://j2s.puntoclicks.com/dashboard
Token JWT contém: { tenant_id: 1, user_id: 1, tipo: 'admin' }
TenantContext detecta: subdomain = 'j2s' → tenant_id = 1
Todas as queries filtram: WHERE tenant_id = 1
```

---

## 📱 App Android - Configuração

### Arquivo: `app/src/main/java/Config.java`

```java
public class Config {
    // URL Base ÚNICA para todos os clientes
    public static final String BASE_URL = "https://puntoclicks.com";
    public static final String LOGIN_URL = BASE_URL + "/login";
    public static final String API_URL = BASE_URL + "/api";
}
```

### Fluxo no App:

1. App abre WebView apontando para `https://puntoclicks.com/login`
2. Usuário faz login
3. Backend retorna `redirect_url`
4. WebView navega para `https://j2s.puntoclicks.com/dashboard`
5. App agora opera no subdomain do cliente

**Vantagem:** ✅ **NUNCA** precisa atualizar .aab quando criar cliente novo!

---

## 🎨 Frontend - Estrutura de Pastas

```
src/
├── pages/
│   ├── landing/           ✅ CRIAR (puntoclicks.com)
│   │   ├── Home.jsx       → Landing page
│   │   ├── Login.jsx      → Login centralizado
│   │   ├── Signup.jsx     → Cadastro de clientes
│   │   ├── Pricing.jsx    → Planos
│   │   └── Docs.jsx       → Documentação
│   │
│   ├── admin/             ✅ CRIAR (admin.puntoclicks.com)
│   │   ├── Dashboard.jsx  → Visão geral
│   │   ├── Tenants.jsx    → Lista de clientes
│   │   ├── CreateTenant.jsx
│   │   └── Analytics.jsx  → Métricas globais
│   │
│   └── app/               ✅ JÁ EXISTE (*.puntoclicks.com)
│       ├── Dashboard.jsx  → (atual DashboardBanking)
│       ├── Obras.jsx      → (atual Projects)
│       ├── Funcionarios.jsx
│       └── ... (todas as páginas atuais)
│
├── contexts/
│   ├── TenantContext.jsx  ✅ JÁ EXISTE
│   ├── AuthContext.jsx    ✅ JÁ EXISTE (precisa ajustar)
│   └── AdminContext.jsx   ✅ CRIAR (super admin)
│
└── App.jsx                ✅ AJUSTAR (roteamento por domínio)
```

---

## 🔄 App.jsx - Roteamento Inteligente

```javascript
function App() {
  const hostname = window.location.hostname;

  // Detectar em qual domínio estamos
  if (hostname === 'puntoclicks.com' || hostname === 'localhost') {
    // Landing Page + Login Centralizado
    return <LandingRoutes />;
  }

  if (hostname === 'admin.puntoclicks.com') {
    // Admin Panel (Super Admin)
    return <AdminRoutes />;
  }

  // Subdomain de cliente (j2s.puntoclicks.com, cliente2.puntoclicks.com...)
  return <TenantAppRoutes />;
}
```

---

## 🔐 Backend - APIs Necessárias

### 1. Login Centralizado

**Arquivo:** `backend/api/auth/login-central.php`

```php
POST /api/auth/login-central.php
Body: { "email": "admin@j2s.ad", "password": "senha" }

Response:
{
  "success": true,
  "token": "...",
  "tenant": { "slug": "j2s", "nome": "J2S", ... },
  "redirect_url": "https://j2s.puntoclicks.com/dashboard"
}
```

### 2. Buscar Tenant por Email

```php
// Interno - usado pelo login-central.php
SELECT u.*, t.slug, t.nome, t.logo_url, t.primary_color
FROM usuarios u
JOIN tenants t ON u.tenant_id = t.id
WHERE u.email = ? AND u.ativo = 1 AND t.status IN ('ativo', 'trial')
```

### 3. Todas as APIs Atuais

```php
// TODAS as APIs existentes continuam funcionando
// MAS agora filtram por tenant_id
WHERE tenant_id = ? AND ...
```

---

## ✅ Checklist de Implementação

### Fase 1: Backend (Crítico)
- [ ] Criar `backend/api/auth/login-central.php`
- [ ] Migrar TODAS as APIs para filtrar por `tenant_id`
- [ ] Testar isolamento de dados

### Fase 2: Frontend - Landing
- [ ] Criar `src/pages/landing/Home.jsx`
- [ ] Criar `src/pages/landing/Login.jsx` (centralizado)
- [ ] Criar `src/pages/landing/Signup.jsx`
- [ ] Criar `src/pages/landing/Pricing.jsx`

### Fase 3: Frontend - Admin Panel
- [ ] Criar `src/pages/admin/Dashboard.jsx`
- [ ] Criar `src/pages/admin/Tenants.jsx`
- [ ] Criar `src/pages/admin/CreateTenant.jsx`

### Fase 4: Roteamento
- [ ] Ajustar `App.jsx` para detectar domínio
- [ ] Criar `LandingRoutes.jsx`
- [ ] Criar `AdminRoutes.jsx`
- [ ] Manter `TenantAppRoutes.jsx` (atual)

### Fase 5: Infraestrutura
- [ ] Configurar DNS wildcard (*.puntoclicks.com)
- [ ] Configurar SSL wildcard
- [ ] Deploy em produção

### Fase 6: App Mobile
- [ ] Atualizar URL base para `puntoclicks.com/login`
- [ ] Testar fluxo de redirecionamento
- [ ] Gerar novo .aab
- [ ] Publicar atualização

---

## 🎯 Vantagens desta Arquitetura

✅ **App único** - Não precisa criar app diferente por cliente
✅ **Login único** - Usuário não precisa saber o subdomain
✅ **Escalável** - Adicionar cliente = apenas criar registro no banco
✅ **Seguro** - Isolamento total de dados por tenant_id
✅ **Simples** - Backend busca tenant automaticamente pelo email
✅ **Flexível** - Cada cliente pode ter seu branding

---

## 📞 Resumo Executivo

**Para o Usuário Final:**
1. Abre app → `puntoclicks.com/login`
2. Digita email/senha
3. Sistema identifica automaticamente qual empresa
4. Redireciona para `suaempresa.puntoclicks.com`

**Para Você (Admin):**
1. Acessa `admin.puntoclicks.com`
2. Vê todos os clientes
3. Cria novos clientes
4. Monitora métricas globais

**Para o Cliente (J2S):**
1. Acessa `j2s.puntoclicks.com`
2. Vê apenas seus dados
3. Usa sistema normalmente
4. Branding customizado (logo, cores)

---

**Última Atualização:** 2026-03-09
