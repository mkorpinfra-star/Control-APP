# 🔧 Guia de Migração de APIs - Multi-Tenant

## 🎯 Objetivo

Atualizar TODAS as APIs para filtrar por `tenant_id` e usar `tenant_middleware.php`.

---

## 📋 Padrão de Migração (Copiar/Colar)

### ❌ ANTES (Single-Tenant):

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

// Verificar se é admin
if ($payload['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// Query SEM tenant_id
$sql = "SELECT * FROM obras WHERE ativa = 1";
$stmt = $pdo->query($sql);
```

### ✅ DEPOIS (Multi-Tenant):

```php
<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/tenant_middleware.php';

// Validar tenant + autenticação
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id'];

// Se precisa ser admin
requireAdmin($auth);

// Query COM tenant_id
$sql = "SELECT * FROM obras WHERE ativa = 1 AND tenant_id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$tenant_id]);
```

---

## 🔍 Checklist por Arquivo

Para CADA arquivo `.php` em `backend/api/`:

### 1️⃣ **Trocar includes:**
```php
// ❌ REMOVER
require_once __DIR__ . '/../../includes/jwt.php';

// ✅ ADICIONAR
require_once __DIR__ . '/../../includes/tenant_middleware.php';
```

### 2️⃣ **Trocar validação:**
```php
// ❌ REMOVER (toda essa seção)
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);
if (!$payload) { ... }

// ✅ ADICIONAR
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id'];
```

### 3️⃣ **Adicionar validação de permissão:**
```php
// Se endpoint é apenas para admin
requireAdmin($auth);

// Se endpoint é apenas para super admin
requireSuperAdmin($auth);
```

### 4️⃣ **Atualizar queries SELECT:**
```php
// ❌ ANTES
SELECT * FROM obras WHERE ativa = 1

// ✅ DEPOIS
SELECT * FROM obras WHERE ativa = 1 AND tenant_id = ?
// E no execute: $stmt->execute([$tenant_id]);
```

### 5️⃣ **Atualizar queries com JOIN:**
```php
// ❌ ANTES
SELECT o.*, c.nome as cliente_nome
FROM obras o
LEFT JOIN clientes c ON o.cliente_id = c.id
WHERE o.ativa = 1

// ✅ DEPOIS
SELECT o.*, c.nome as cliente_nome
FROM obras o
LEFT JOIN clientes c ON o.cliente_id = c.id AND c.tenant_id = ?
WHERE o.ativa = 1 AND o.tenant_id = ?
// E no execute: $stmt->execute([$tenant_id, $tenant_id]);
```

### 6️⃣ **Atualizar queries INSERT:**
```php
// ❌ ANTES
INSERT INTO obras (numero, nome, ativa) VALUES (?, ?, 1)
$stmt->execute([$numero, $nome]);

// ✅ DEPOIS
INSERT INTO obras (tenant_id, numero, nome, ativa) VALUES (?, ?, ?, 1)
$stmt->execute([$tenant_id, $numero, $nome]);
```

### 7️⃣ **Atualizar queries UPDATE:**
```php
// ❌ ANTES
UPDATE obras SET nome = ? WHERE id = ?
$stmt->execute([$nome, $id]);

// ✅ DEPOIS
UPDATE obras SET nome = ? WHERE id = ? AND tenant_id = ?
$stmt->execute([$nome, $id, $tenant_id]);
```

### 8️⃣ **Atualizar queries DELETE:**
```php
// ❌ ANTES
DELETE FROM obras WHERE id = ?
$stmt->execute([$id]);

// ✅ DEPOIS
DELETE FROM obras WHERE id = ? AND tenant_id = ?
$stmt->execute([$id, $tenant_id]);
```

### 9️⃣ **Atualizar referências a $payload:**
```php
// ❌ ANTES
$payload['id']
$payload['nome']
$payload['tipo']

// ✅ DEPOIS
$auth['user_id']
$auth['nome']
$auth['tipo']
```

---

## 📁 Arquivos a Migrar (por pasta)

### 📂 backend/api/apontamentos/
- [ ] list.php
- [ ] create.php
- [ ] update.php
- [ ] delete.php
- [ ] by-employee.php
- [ ] by-week.php

### 📂 backend/api/usuarios/
- [ ] list.php
- [ ] create.php
- [ ] update.php
- [ ] delete.php
- [ ] profile.php

### 📂 backend/api/encarregados/
- [ ] list.php
- [ ] create.php
- [ ] update.php
- [ ] delete.php

### 📂 backend/api/clientes/
- [ ] list.php
- [ ] create.php
- [ ] update.php
- [ ] delete.php

### 📂 backend/api/obras/
- [x] list.php (já migrado)
- [x] create.php (já migrado)
- [ ] update.php
- [ ] delete.php
- [ ] employees.php
- [ ] assign-employees.php

### 📂 backend/api/financeiro/
- [ ] list.php
- [ ] create.php
- [ ] update.php
- [ ] delete.php

### 📂 backend/api/folha-pagamento/
- [ ] list.php
- [ ] create.php
- [ ] update.php
- [ ] delete.php

### 📂 backend/api/notificacoes/
- [ ] list.php
- [ ] create.php
- [ ] mark-read.php

### 📂 backend/api/relatorios/
- [ ] obras.php
- [ ] funcionarios.php
- [ ] financeiro.php

---

## 🚨 REGRAS CRÍTICAS

### ⚠️ NUNCA fazer:

1. ❌ Usar `$pdo->query()` sem prepared statements
2. ❌ Confiar em `tenant_id` vindo do frontend
3. ❌ Fazer JOIN sem filtrar `tenant_id` na tabela relacionada
4. ❌ Fazer subquery sem filtrar `tenant_id`
5. ❌ Retornar dados antes de validar `tenant_id`

### ✅ SEMPRE fazer:

1. ✅ Usar `validateTenantAccess()` no início
2. ✅ Filtrar TODAS as queries por `tenant_id`
3. ✅ Usar prepared statements
4. ✅ Filtrar `tenant_id` em JOINs
5. ✅ Filtrar `tenant_id` em subqueries

---

## 🧪 Como Testar

Após migrar um arquivo, testar:

```bash
# 1. Login com usuário J2S
curl -X POST http://localhost/backend/api/auth/login-central.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@j2s.ad","password":"senha"}'

# 2. Pegar o token do response

# 3. Testar endpoint migrado
curl -X GET http://localhost/backend/api/obras/list.php \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 4. Deve retornar apenas dados do tenant J2S (tenant_id = 1)
```

---

## 📊 Progresso

Execute este comando para ver quantas APIs faltam:

```bash
php backend/scripts/check_tenant_migration.php
```

---

**IMPORTANTE:** Migrar APIs é CRÍTICO para segurança!
Sem isso, dados podem vazar entre clientes.

---

**Última Atualização:** 2026-03-09
