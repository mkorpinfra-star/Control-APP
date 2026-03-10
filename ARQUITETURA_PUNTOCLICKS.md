# 🏗️ ARQUITETURA PUNTOCLICKS - LEIA PRIMEIRO

> **ATENÇÃO AGENTE IA:** Este documento é OBRIGATÓRIO para entender o contexto do projeto.
> Leia ANTES de fazer qualquer alteração relacionada a domínios, APIs ou estrutura de pastas.

---

## 🎯 O QUE É PUNTOCLICKS?

**PuntoClicks** é uma plataforma SaaS White Label de gestão de horas/obras.

### 📜 História do Projeto

#### **ANTES (Sistema Antigo - j2s.ad/login)**

```
j2s.ad/login/
├── index.php (login)
├── dashboard.php
├── obras.php
├── usuarios.php
└── ... (sistema completo dentro de /login)
```

- **Cliente único:** J2S Construções
- **Produto:** J2S Hores (sistema customizado)
- **Hospedagem:** j2s.ad/login (pasta dedicada)
- **Banco:** Single-tenant (sem `tenant_id`)

#### **AGORA (Multi-Tenant SaaS - puntoclicks.com)**

```
puntoclicks.com (public_html/)
├── index.html (Landing Page React)
├── assets/ (build React)
├── api/ (Backend PHP CENTRALIZADO)
│   ├── auth/
│   ├── tenants/
│   ├── usuarios/
│   ├── obras/
│   └── ...
└── backend/ (legacy - será consolidado)
```

- **Produto:** PuntoClicks (White Label SaaS)
- **Cliente Piloto:** J2S Construções (agora `tenant_id = 1`)
- **Objetivo:** Múltiplos clientes (tenants) usando o mesmo sistema
- **Hospedagem:** puntoclicks.com (diretório padrão)
- **Banco:** Multi-tenant (`tenant_id` em todas as tabelas)

---

## 🌐 ESTRUTURA DE DOMÍNIOS

| Domínio                      | Tipo              | Função                          | Frontend               | Backend                     |
|------------------------------|-------------------|---------------------------------|------------------------|-----------------------------|
| `puntoclicks.com`            | Landing Page      | Marketing + Pricing             | React Build (public)   | `puntoclicks.com/api/`      |
| `admin.puntoclicks.com`      | Admin Panel       | Gestão de tenants (PuntoClicks) | React Build (public)   | `puntoclicks.com/api/`      |
| `j2s.puntoclicks.com`        | Tenant App        | Sistema J2S Hores               | React Build (public)   | `puntoclicks.com/api/`      |
| `cliente2.puntoclicks.com`   | Tenant App        | Sistema Cliente 2 (futuro)      | React Build (public)   | `puntoclicks.com/api/`      |
| `*.puntoclicks.com`          | Tenant App        | Qualquer tenant novo            | React Build (public)   | `puntoclicks.com/api/`      |

### ⚠️ REGRA CRÍTICA: API CENTRALIZADA

```
✅ CORRETO: TODOS os domínios fazem request para puntoclicks.com/api/
❌ ERRADO:  j2s.puntoclicks.com/api/ (NÃO EXISTE API SEPARADA)
```

**Isolamento de dados é feito por:**
- `tenant_id` no banco de dados (não por domínio ou pasta)
- JWT contém `tenant_id` validado no backend
- Cada request verifica: `WHERE tenant_id = ?`

---

## 📁 ESTRUTURA DE HOSPEDAGEM (Hostinger)

```
/home/u123456789/domains/puntoclicks.com/public_html/
├── index.html                    ← Landing Page (React build)
├── assets/
│   ├── index-HASH.js            ← JavaScript do React
│   ├── index-HASH.css           ← CSS do React
│   └── logo-HASH.png            ← Assets estáticos
│
├── api/                          ← ⚠️ BACKEND PHP CENTRALIZADO
│   ├── auth/
│   │   ├── login.php            ← Login por tenant_slug
│   │   └── login-central.php   ← Login centralizado (detecta tenant por email)
│   │
│   ├── tenants/
│   │   ├── get.php              ← ⚠️ CRÍTICO - Retorna branding do tenant
│   │   ├── create.php           ← Criar novo tenant (onboarding)
│   │   ├── list.php             ← Listar todos tenants (super admin)
│   │   └── stats.php            ← Estatísticas de uso
│   │
│   ├── usuarios/
│   │   ├── list.php             ← Filtra por tenant_id
│   │   ├── create.php
│   │   └── update.php
│   │
│   ├── obras/
│   │   ├── list.php             ← Filtra por tenant_id
│   │   ├── create.php
│   │   └── update.php
│   │
│   ├── apontamentos/
│   │   ├── list.php
│   │   ├── save.php
│   │   └── approve.php
│   │
│   └── ... (todas as outras APIs)
│
├── backend/                      ← ⚠️ LEGACY (arquivos antigos j2s.ad/login)
│   └── ...                       ← Será consolidado em /api/
│
├── .htaccess                     ← Rewrite rules + CORS
├── .env                          ← Credenciais DB (NÃO COMMITAR)
└── robots.txt
```

---

## 🔐 COMO FUNCIONA O ISOLAMENTO MULTI-TENANT

### 1️⃣ **Frontend: Detecção de Tenant por Subdomain**

```javascript
// src/contexts/TenantContext.jsx

const hostname = window.location.hostname;
// hostname = "j2s.puntoclicks.com"

const parts = hostname.split('.');
// parts = ["j2s", "puntoclicks", "com"]

const tenantSlug = parts[0]; // "j2s"

// Busca branding do tenant:
fetch(`https://puntoclicks.com/api/tenants/get.php?slug=j2s`)
```

### 2️⃣ **Backend: Validação de Tenant no JWT**

```php
// backend/includes/tenant_middleware.php

$auth = validateTenantAccess(); // Valida JWT + tenant ativo
$tenant_id = $auth['tenant_id']; // Extraído do JWT (não do frontend!)

// SEMPRE filtrar por tenant_id:
$sql = "SELECT * FROM obras WHERE tenant_id = ? AND ativa = 1";
$stmt->execute([$tenant_id]);
```

### 3️⃣ **Banco de Dados: Isolamento por tenant_id**

```sql
-- Toda tabela tem tenant_id:
SELECT * FROM usuarios WHERE tenant_id = 1; -- J2S
SELECT * FROM usuarios WHERE tenant_id = 2; -- Cliente 2

-- JOINs também filtram tenant_id:
SELECT * FROM obras o
LEFT JOIN clientes c ON o.cliente_id = c.id AND c.tenant_id = 1
WHERE o.tenant_id = 1;
```

---

## 🚨 REGRAS CRÍTICAS (NÃO VIOLAR)

### 1. **API SEMPRE CENTRALIZADA**

```bash
✅ CORRETO:
fetch('https://puntoclicks.com/api/usuarios/list.php')

❌ ERRADO:
fetch('https://j2s.puntoclicks.com/api/usuarios/list.php')
```

### 2. **tenant_id NUNCA VEM DO FRONTEND**

```php
❌ ERRADO:
$tenant_id = $_POST['tenant_id']; // VULNERABILIDADE!!!

✅ CORRETO:
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id']; // Extraído do JWT validado
```

### 3. **SEMPRE FILTRAR POR tenant_id**

```php
❌ ERRADO:
$sql = "SELECT * FROM obras WHERE id = ?";
$stmt->execute([$obra_id]);

✅ CORRETO:
$sql = "SELECT * FROM obras WHERE id = ? AND tenant_id = ?";
$stmt->execute([$obra_id, $tenant_id]);
```

### 4. **WILDCARD SSL É OBRIGATÓRIO**

```bash
# Cloudflare + Hostinger precisam de wildcard SSL:
*.puntoclicks.com → Cobre TODOS os subdomínios
j2s.puntoclicks.com → Funciona automaticamente
cliente-novo.puntoclicks.com → Funciona automaticamente

# Sem wildcard:
❌ Precisa criar SSL para cada tenant manualmente
❌ Tenants novos dão erro SSL até configurar
```

---

## 🛠️ CHECKLIST DE DEPLOY

Antes de apontar domínio ou adicionar tenant:

### 1. **DNS (Cloudflare ou Hostinger)**
- [ ] Registro A: `@ → 46.202.145.23`
- [ ] Registro A: `* → 46.202.145.23` (wildcard)
- [ ] Registro A: `admin → 46.202.145.23`
- [ ] Registro CNAME: `www → puntoclicks.com`

### 2. **SSL/TLS**
- [ ] Hostinger: Let's Encrypt Wildcard SSL ativo
- [ ] Cloudflare: SSL Mode = "Full" (ou "Flexible" temporário)
- [ ] Testar: `https://j2s.puntoclicks.com`
- [ ] Testar: `https://admin.puntoclicks.com`

### 3. **Backend (API)**
- [ ] Arquivo `/api/tenants/get.php` existe
- [ ] `.env` com credenciais corretas no servidor
- [ ] CORS habilitado em todos os arquivos PHP
- [ ] Testar: `curl "https://puntoclicks.com/api/tenants/get.php?slug=j2s"`

### 4. **Frontend (React Build)**
- [ ] `npm run build` executado
- [ ] `.env.production` com `VITE_API_URL=https://puntoclicks.com/api`
- [ ] Pasta `dist/` enviada para `public_html/`
- [ ] Testar: `https://puntoclicks.com` (landing)
- [ ] Testar: `https://j2s.puntoclicks.com` (tenant app)

### 5. **Banco de Dados**
- [ ] Migration `001_multi_tenant.sql` executada
- [ ] Tenant J2S existe: `SELECT * FROM tenants WHERE slug = 'j2s'`
- [ ] Dados migrados: `SELECT COUNT(*) FROM usuarios WHERE tenant_id = 1`
- [ ] Índices criados: `SHOW INDEX FROM usuarios`

---

## 📞 CONTATO

**Desenvolvedor:** Guilherme Gomes
**Site:** https://guilhermesites.com.br

---

**Última Atualização:** 2026-03-10
**Status:** 🚧 Em Produção (Tenant Piloto: J2S)
