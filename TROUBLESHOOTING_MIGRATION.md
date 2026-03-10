# 🔧 Troubleshooting - Migration Multi-Tenant

## Erros Comuns e Soluções

### ❌ Erro: "Coluna 'deletado_em' desconhecida"
**Causa:** VIEW tentando usar colunas que não existem
**Status:** ✅ Corrigido na migration
**Solução:** Usar versão atualizada de `001_multi_tenant.sql`

---

### ❌ Erro: "Entrada '1' duplicada para a chave 'PRIMARY'"
**Causa:** Tenant ID 1 já existe (J2S já foi inserido antes)
**Status:** ✅ Corrigido na migration
**Solução:** Migration agora usa `INSERT IGNORE` + `UPDATE`

Executar novamente:
```bash
mysql -u root -p app_cassio < database/migrations/001_multi_tenant.sql
```

---

### ❌ Erro: "Cannot add foreign key constraint"
**Causa:** Tabela `tenants` não existe ou tenant_id = 1 não existe

**Solução:**
```sql
-- Verificar se tabela tenants existe
SHOW TABLES LIKE 'tenants';

-- Verificar se tenant J2S existe
SELECT * FROM tenants WHERE id = 1;

-- Se não existir, criar manualmente:
INSERT INTO tenants (id, nome, slug, admin_email, license_key, status)
VALUES (1, 'J2S', 'j2s', 'admin@j2s.ad', 'PK-J2S-2026-PILOT-001', 'ativo');
```

---

### ❌ Erro: "Column 'tenant_id' already exists"
**Causa:** Migration já foi executada parcialmente antes

**Solução 1 (Recomendado):** Pular ALTER TABLE que já foi executado
```sql
-- Verificar quais tabelas JÁ têm tenant_id
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'app_cassio'
  AND COLUMN_NAME = 'tenant_id';
```

Comentar (adicionar `--` no início) as linhas `ALTER TABLE` das tabelas que já têm `tenant_id`.

**Solução 2 (Reset completo - CUIDADO):**
```sql
-- ⚠️ ISSO VAI REMOVER tenant_id de TODAS as tabelas
ALTER TABLE usuarios DROP FOREIGN KEY usuarios_ibfk_X; -- substituir X pelo número correto
ALTER TABLE usuarios DROP COLUMN tenant_id;

ALTER TABLE obras DROP FOREIGN KEY obras_ibfk_X;
ALTER TABLE obras DROP COLUMN tenant_id;

-- Repetir para todas as tabelas, então executar migration novamente
```

---

### ❌ Erro: "Unknown column 'senha_hash' in field list"
**Causa:** Tabela `usuarios` usa `senha` em vez de `senha_hash`

**Solução:**
```sql
-- Verificar nome correto da coluna
SHOW COLUMNS FROM usuarios LIKE '%senha%';

-- Se for 'senha', renomear para 'senha_hash'
ALTER TABLE usuarios CHANGE senha senha_hash VARCHAR(255);
```

---

### ❌ Erro: "Unknown column 'passaporte' in field list"
**Causa:** Tabela `usuarios` não tem coluna `passaporte`

**Solução:**
```sql
-- Adicionar coluna passaporte
ALTER TABLE usuarios
ADD COLUMN passaporte VARCHAR(50) UNIQUE AFTER email;

-- Preencher passaportes existentes com email (temporário)
UPDATE usuarios SET passaporte = email WHERE passaporte IS NULL;
```

---

### ❌ Erro ao executar Stored Procedure: "Incorrect number of arguments"
**Causa:** Chamada da SP com número errado de parâmetros

**Assinatura correta (atualizada):**
```sql
CALL sp_create_tenant(
    'Nome da Empresa',         -- p_nome
    'slug-empresa',            -- p_slug
    '/logo.png',               -- p_logo_url
    '#CE0201',                 -- p_primary_color
    'admin@empresa.com',       -- p_admin_email
    'Nome do Admin',           -- p_admin_name
    '$2y$10$hash...',          -- p_admin_senha (deve vir hasheado)
    @tenant_id,                -- OUT p_tenant_id
    @admin_id,                 -- OUT p_admin_id
    @license_key               -- OUT p_license_key
);

SELECT @tenant_id, @admin_id, @license_key;
```

---

## 🔍 Verificações de Sanidade

### 1. Verificar estrutura do banco após migration

```sql
-- Tenant J2S deve existir
SELECT id, nome, slug, status FROM tenants WHERE id = 1;

-- Todas as tabelas principais devem ter tenant_id
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'app_cassio'
  AND COLUMN_NAME = 'tenant_id'
ORDER BY TABLE_NAME;

-- Deve retornar pelo menos:
-- apontamentos, aprovacoes, clientes, encarregados,
-- funcionario_obra, notificacoes, obras, usuarios
```

### 2. Verificar dados migrados para tenant_id = 1

```sql
-- Contar registros no tenant J2S
SELECT
  'usuarios' as tabela, COUNT(*) as total FROM usuarios WHERE tenant_id = 1
UNION ALL
SELECT 'obras', COUNT(*) FROM obras WHERE tenant_id = 1
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes WHERE tenant_id = 1
UNION ALL
SELECT 'apontamentos', COUNT(*) FROM apontamentos WHERE tenant_id = 1;
```

**Resultado esperado:** Todos os dados existentes devem estar em tenant_id = 1

### 3. Verificar índices criados

```sql
-- Verificar índices de tenant_id
SELECT
  TABLE_NAME,
  INDEX_NAME,
  COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'app_cassio'
  AND INDEX_NAME LIKE '%tenant%'
ORDER BY TABLE_NAME, INDEX_NAME;
```

### 4. Testar VIEW

```sql
-- VIEW deve retornar estatísticas do J2S
SELECT * FROM vw_tenant_stats WHERE slug = 'j2s';
```

### 5. Testar Stored Procedures

```sql
-- Suspender tenant (teste)
CALL sp_suspend_tenant(1);
SELECT status FROM tenants WHERE id = 1; -- deve ser 'suspenso'

-- Reativar
CALL sp_activate_tenant(1);
SELECT status FROM tenants WHERE id = 1; -- deve ser 'ativo'
```

---

## 🚨 Problemas de Performance

### Query lenta após adicionar tenant_id

**Causa:** Índices não estão sendo usados

**Diagnóstico:**
```sql
EXPLAIN SELECT * FROM obras WHERE tenant_id = 1 AND ativa = 1;
```

**Solução:** Garantir índice composto existe
```sql
-- Criar índice se não existir
CREATE INDEX idx_obras_tenant_ativa ON obras(tenant_id, ativa);

-- Testar novamente
EXPLAIN SELECT * FROM obras WHERE tenant_id = 1 AND ativa = 1;
-- Deve mostrar "Using index" na coluna Extra
```

---

## 🔄 Reset Completo (ÚLTIMO RECURSO)

⚠️ **CUIDADO:** Isso remove TODAS as alterações da migration

```sql
-- 1. Dropar stored procedures
DROP PROCEDURE IF EXISTS sp_create_tenant;
DROP PROCEDURE IF EXISTS sp_suspend_tenant;
DROP PROCEDURE IF EXISTS sp_activate_tenant;

-- 2. Dropar VIEW
DROP VIEW IF EXISTS vw_tenant_stats;

-- 3. Remover foreign keys e colunas tenant_id
-- (verificar nomes exatos das FKs com SHOW CREATE TABLE)
ALTER TABLE usuarios DROP FOREIGN KEY usuarios_ibfk_1;
ALTER TABLE usuarios DROP COLUMN tenant_id;

ALTER TABLE obras DROP FOREIGN KEY obras_ibfk_1;
ALTER TABLE obras DROP COLUMN tenant_id;

-- Repetir para todas as tabelas...

-- 4. Dropar tabela tenants
DROP TABLE IF EXISTS tenants;

-- 5. Executar migration novamente
SOURCE database/migrations/001_multi_tenant.sql;
```

---

## 📞 Precisa de Ajuda?

Se nenhuma solução acima resolver:

1. **Exportar estrutura do banco:**
   ```bash
   mysqldump -u root -p --no-data app_cassio > estrutura_atual.sql
   ```

2. **Enviar estrutura + mensagem de erro completa**

3. **Verificar logs do MySQL:**
   - Windows: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
   - Linux: `/var/log/mysql/error.log`

---

**Última Atualização:** 2026-03-09
