# 🏢 Migração Multi-Tenant - PuntoClicks

## 📋 Visão Geral

Este projeto foi transformado de single-tenant para **multi-tenant SaaS**.

### 🎯 Contexto e História

**ANTES (Sistema Antigo):**
- URL: `j2s.ad/login` (pasta `/login` continha todo o sistema)
- Nome: **J2S Hores** (sistema de marcação de horas)
- Cliente: J2S Construções (empresa única)
- Arquitetura: Single-tenant dedicado

**AGORA (White Label SaaS):**
- **Produto:** **PuntoClicks** (plataforma de gestão de horas)
- **Cliente Piloto:** J2S Construções (migrado para tenant)
- **Objetivo:** Adicionar múltiplos clientes (tenants) usando o mesmo sistema
- **Hospedagem:** `puntoclicks.com` (diretório padrão `public_html/`)
- **Arquitetura:** Multi-tenant com subdomínios

### 🌐 Estrutura de Domínios

| Domínio                    | Função                          | Conteúdo                    |
|----------------------------|----------------------------------|-----------------------------|
| `puntoclicks.com`          | Landing Page do produto          | Marketing + Pricing         |
| `admin.puntoclicks.com`    | Admin Panel (PuntoClicks)        | Gestão de tenants           |
| `j2s.puntoclicks.com`      | Tenant App (J2S Construções)     | Sistema completo J2S Hores  |
| `cliente2.puntoclicks.com` | Tenant App (Cliente 2 futuro)    | Sistema isolado Cliente 2   |

### 📁 Estrutura de Hospedagem (Hostinger)

```
public_html/ (puntoclicks.com)
├── index.html              ← Landing Page (React build)
├── assets/                 ← CSS, JS, imagens (React)
├── api/                    ← Backend PHP (CENTRALIZADO)
│   ├── auth/
│   │   ├── login.php
│   │   └── login-central.php
│   ├── tenants/
│   │   ├── get.php        ← Branding dinâmico
│   │   ├── create.php
│   │   └── list.php
│   ├── usuarios/
│   ├── obras/
│   ├── apontamentos/
│   └── ... (todas as APIs)
├── backend/                ← Legacy (pode ser consolidado em /api)
│   └── ... (arquivos antigos j2s.ad/login)
└── .htaccess               ← Rewrite rules
```

**⚠️ IMPORTANTE:**
- A API é **CENTRALIZADA** em `puntoclicks.com/api/`
- TODOS os tenants fazem requests para a mesma API
- O isolamento é feito por `tenant_id` no banco de dados
- Subdomínios (`j2s.puntoclicks.com`) servem o MESMO frontend React, apenas detectam tenant diferente

### 🔄 Migração Realizada

- ✅ Banco de dados: adicionado `tenant_id` em todas as tabelas
- ✅ J2S migrado para `tenant_id = 1`
- ✅ Login centralizado: detecta tenant pelo email
- ✅ Frontend: detecção automática de tenant por subdomain
- ✅ Branding dinâmico: cores, logo, favicon por tenant

---

## 🗄️ 1. Migração de Banco de Dados

### Executar Migration

```bash
mysql -u root -p app_cassio < database/migrations/001_multi_tenant.sql
```

Esta migration:
- ✅ Cria tabela `tenants`
- ✅ Adiciona coluna `tenant_id` em todas as tabelas
- ✅ Migra dados existentes para `tenant_id = 1` (J2S)
- ✅ Cria índices compostos para performance
- ✅ Cria stored procedures: `sp_create_tenant`, `sp_suspend_tenant`, `sp_activate_tenant`

### Verificar Sucesso

```sql
SELECT * FROM tenants WHERE slug = 'j2s';
SELECT COUNT(*) FROM usuarios WHERE tenant_id = 1;
SELECT COUNT(*) FROM obras WHERE tenant_id = 1;
```

---

## 🧩 2. Frontend - Tenant Detection

### Estrutura de Contexts

```
TenantProvider (detecta subdomain)
  └── AuthProvider (valida tenant no login)
      └── App Routes
```

### TenantContext.jsx

Detecta tenant automaticamente:

- **Produção:** `j2s.puntoclicks.com` → tenant: `j2s`
- **Local:** `localhost` → usa `localStorage.getItem('dev_tenant')` ou padrão `j2s`

### Desenvolvimento Local

Para testar diferentes tenants em localhost:

```javascript
localStorage.setItem('dev_tenant', 'j2s'); // ou outro slug
window.location.reload();
```

### Branding Dinâmico

O TenantContext aplica automaticamente:
- ✅ Cor primária (`--color-primary`)
- ✅ Logo (`logo_url`)
- ✅ Favicon
- ✅ Title da página

---

## 🔒 3. Backend - Tenant Middleware

### ⚠️ CRÍTICO: Atualizar TODAS as APIs

**Cada endpoint PHP deve:**

1. Usar `tenant_middleware.php` em vez de `jwt.php` diretamente
2. Filtrar queries por `tenant_id`

### Exemplo de Conversão

#### ❌ Antes (Single-Tenant)

```php
<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$sql = "SELECT * FROM obras WHERE ativa = 1";
$stmt = $pdo->query($sql);
```

#### ✅ Depois (Multi-Tenant)

```php
<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/tenant_middleware.php';

// Validar tenant access (já valida token, tenant status, trial, etc.)
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id'];

$sql = "SELECT * FROM obras WHERE ativa = 1 AND tenant_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$tenant_id]);
```

### Funções Disponíveis

```php
// Validar acesso e obter tenant_id
$auth = validateTenantAccess();
// Retorna: ['user_id', 'tenant_id', 'tipo', 'nome', 'email', 'tabela']

// Exigir admin
requireAdmin($auth);

// Exigir super_admin (acesso multi-tenant)
requireSuperAdmin($auth);
```

---

## 📂 4. APIs que PRECISAM Atualização

### Prioridade ALTA (dados sensíveis)

- [ ] `/api/obras/*.php` (✅ list.php já atualizado)
- [ ] `/api/apontamentos/*.php`
- [ ] `/api/usuarios/*.php`
- [ ] `/api/encarregados/*.php`
- [ ] `/api/clientes/*.php`
- [ ] `/api/financeiro/*.php`
- [ ] `/api/folha-pagamento/*.php`

### Prioridade MÉDIA

- [ ] `/api/aprovacoes/*.php`
- [ ] `/api/notificacoes/*.php`
- [ ] `/api/relatorios/*.php`

### Checklist por Arquivo

Para cada arquivo `.php`:

1. ✅ Trocar `require_once jwt.php` por `require_once tenant_middleware.php`
2. ✅ Adicionar `$auth = validateTenantAccess();`
3. ✅ Extrair `$tenant_id = $auth['tenant_id'];`
4. ✅ Adicionar `WHERE tenant_id = ?` em TODAS as queries
5. ✅ Usar prepared statements (nunca `query()` direto)
6. ✅ Testar com token válido

---

## 🧪 5. Testando Multi-Tenant

### Criar Novo Tenant (Via SQL)

```sql
CALL sp_create_tenant(
    'Cliente Teste',        -- nome
    'cliente-teste',        -- slug
    NULL,                   -- logo_url
    '#FF5733',              -- primary_color
    'teste@example.com',    -- admin_email
    'Admin Teste',          -- admin_nome
    'senha123',             -- admin_senha
    @new_tenant_id,
    @new_admin_id,
    @license_key
);

SELECT @new_tenant_id, @new_admin_id, @license_key;
```

### Testar Login

```bash
curl -X POST http://localhost/login/backend/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "passport": "admin@teste.com",
    "password": "senha123",
    "tenant_slug": "cliente-teste"
  }'
```

### Verificar Isolamento

```sql
-- Criar obra no tenant 2
INSERT INTO obras (numero, nome, tenant_id, ativa)
VALUES ('999', 'Obra Teste Tenant 2', 2, 1);

-- Verificar que J2S (tenant 1) NÃO vê essa obra
SELECT * FROM obras WHERE tenant_id = 1; -- não deve retornar obra 999
SELECT * FROM obras WHERE tenant_id = 2; -- deve retornar obra 999
```

---

## 🚀 6. Próximos Passos

### Backend
- [ ] Atualizar TODAS as APIs para usar `tenant_middleware.php`
- [ ] Criar API de onboarding (self-service para novos clientes)
- [ ] Implementar webhooks de pagamento (Stripe/Paddle)
- [ ] Criar cron job para verificar trials expirados

### Frontend
- [ ] Criar Landing Page (puntoclicks.com)
- [ ] Criar Admin Panel (admin.puntoclicks.com)
- [ ] Criar página de Pricing
- [ ] Criar página de Documentação interativa
- [ ] Implementar onboarding flow

### DevOps
- [ ] Configurar wildcard SSL (*.puntoclicks.com)
- [ ] Configurar DNS para subdomains dinâmicos
- [ ] Implementar backup automático por tenant
- [ ] Monitoramento de usage por tenant (Metabase/Grafana)

---

## 🔐 7. Segurança Multi-Tenant

### Regras OBRIGATÓRIAS

1. ✅ **NUNCA** usar `$pdo->query()` com concatenação de SQL
2. ✅ **SEMPRE** usar prepared statements com `?` placeholders
3. ✅ **SEMPRE** filtrar por `tenant_id` em WHERE, JOIN, subqueries
4. ✅ **SEMPRE** validar tenant ativo antes de permitir operação
5. ✅ **NUNCA** expor `tenant_id` em URLs públicas (usar `slug`)

### Anti-Patterns (NÃO FAZER)

```php
// ❌ ERRADO - SQL Injection + sem tenant isolation
$sql = "SELECT * FROM obras WHERE id = " . $_GET['id'];
$stmt = $pdo->query($sql);

// ❌ ERRADO - tenant_id vindo do frontend
$tenant_id = $input['tenant_id']; // NUNCA confiar no frontend

// ❌ ERRADO - JOIN sem filtro de tenant
SELECT * FROM obras o
LEFT JOIN clientes c ON o.cliente_id = c.id
WHERE o.tenant_id = ?
```

### Correto

```php
// ✅ CORRETO
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id']; // tenant_id vem do JWT validado

$sql = "
    SELECT * FROM obras o
    LEFT JOIN clientes c ON o.cliente_id = c.id AND c.tenant_id = ?
    WHERE o.id = ? AND o.tenant_id = ?
";
$stmt = $pdo->prepare($sql);
$stmt->execute([$tenant_id, $obra_id, $tenant_id]);
```

---

## 📊 8. Performance

### Índices Criados

Todos os índices foram criados automaticamente pela migration:

```sql
-- Exemplo
CREATE INDEX idx_obras_tenant ON obras(tenant_id, ativa);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id, ativo);
CREATE INDEX idx_apontamentos_tenant ON apontamentos(tenant_id, data);
```

### Query Patterns

```sql
-- ✅ Otimizado (usa índice composto)
SELECT * FROM obras
WHERE tenant_id = ? AND ativa = 1
ORDER BY data_inicio DESC;

-- ❌ Não otimizado (tenant_id no final)
SELECT * FROM obras
WHERE ativa = 1 AND tenant_id = ?;
```

**Regra:** Sempre colocar `tenant_id` como primeiro filtro no WHERE.

---

## 🆘 9. Troubleshooting

### ❌ Erro SSL 525: "SSL handshake failed"

**Causa:** Cloudflare está em modo "Proxied" mas servidor não tem SSL ou está incompatível.

**Soluções (em ordem de prioridade):**

#### **Solução A: Mudar SSL Mode no Cloudflare (RÁPIDO - 2 min)**
1. Cloudflare → SSL/TLS → Overview
2. Mudar de "Full (Strict)" para **"Flexible"**
3. Aguardar 2-3 minutos
4. Testar: `https://j2s.puntoclicks.com`

#### **Solução B: Desabilitar Proxy (DNS Only)**
1. Cloudflare → DNS → Records
2. Clicar na **nuvem laranja** dos registros A (`j2s`, `admin`, `@`)
3. Mudar para **DNS only** (nuvem cinza)
4. Aguardar 2-3 minutos
5. Testar: `https://j2s.puntoclicks.com`

#### **Solução C: Wildcard SSL na Hostinger (RECOMENDADO para produção)**
1. Hostinger → SSL
2. Ativar **Let's Encrypt Wildcard SSL** para `puntoclicks.com`
3. Aguardar 10-30 minutos (propagação)
4. Cloudflare → SSL/TLS → **Full**
5. Cloudflare → DNS → Registros em **Proxied** (nuvem laranja)
6. Testar: `https://j2s.puntoclicks.com`

**⚠️ Por que Wildcard SSL é importante?**
- Cobre automaticamente TODOS os subdomínios (`*.puntoclicks.com`)
- Novos tenants funcionam sem configuração manual
- Essencial para SaaS com subdomínios dinâmicos

---

### ❌ Erro: "Token sem tenant_id"

- **Causa:** Usuário fez login antes da migration
- **Solução:** Fazer logout + login novamente

### ❌ Erro: "Tenant não encontrado"

- **Causa:** Subdomain não existe na tabela `tenants`
- **Solução:** Criar tenant via `sp_create_tenant` ou API `/tenants/create.php`
- **Ou:** Arquivo `/api/tenants/get.php` não existe ou não está acessível

### ❌ Erro: "Tenant suspenso ou inativo"

- **Causa:** Status do tenant não é 'ativo' ou 'trial'
- **Solução:**
  ```sql
  UPDATE tenants SET status = 'ativo' WHERE slug = 'cliente-x';
  ```

### ❌ Query retorna vazio mas deveria ter dados

- **Causa:** Esqueceu de filtrar por `tenant_id` em JOIN ou subquery
- **Solução:** Adicionar `AND tabela.tenant_id = ?` em TODOS os JOINs

### ❌ Frontend carrega mas não detecta tenant

- **Causa 1:** API `/tenants/get.php` não existe ou está retornando erro
- **Causa 2:** CORS bloqueando request do frontend
- **Causa 3:** `VITE_API_URL` no `.env.production` está incorreto

**Soluções:**
1. Verificar arquivo `/api/tenants/get.php` existe no servidor
2. Testar API diretamente: `curl "https://puntoclicks.com/api/tenants/get.php?slug=j2s"`
3. Verificar `.env.production`: `VITE_API_URL=https://puntoclicks.com/api`
4. Verificar headers CORS no PHP:
   ```php
   header('Access-Control-Allow-Origin: *');
   header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
   header('Access-Control-Allow-Headers: Content-Type, Authorization');
   ```

---

## 📞 10. Contato

**Desenvolvedor:** Guilherme Gomes
**Site:** https://guilhermesites.com.br

---

**Status:** 🚧 Em Migração
**Última Atualização:** 2026-03-09
