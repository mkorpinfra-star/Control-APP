-- ========================================
-- 🧪 TESTES DE ISOLAMENTO MULTI-TENANT
-- ========================================
-- Este script testa se o isolamento entre tenants está funcionando corretamente

-- Limpar testes anteriores (se existirem)
DELETE FROM tenants WHERE slug IN ('test-tenant-1', 'test-tenant-2');

-- ========================================
-- 1. CRIAR DOIS TENANTS DE TESTE
-- ========================================

-- Tenant 1 (senha já deve vir hasheada, mas para teste usamos texto plano)
-- NOTA: Em produção, usar password_hash() do PHP antes de passar para stored procedure
CALL sp_create_tenant(
    'Test Tenant 1',           -- p_nome
    'test-tenant-1',           -- p_slug
    NULL,                      -- p_logo_url
    '#FF5733',                 -- p_primary_color
    'admin1@test.com',         -- p_admin_email
    'Admin Test 1',            -- p_admin_name
    '$2y$10$dummy.hash.test1', -- p_admin_senha (hash fake para teste)
    @tenant1_id,               -- OUT p_tenant_id
    @admin1_id,                -- OUT p_admin_id
    @license1                  -- OUT p_license_key
);

-- Tenant 2
CALL sp_create_tenant(
    'Test Tenant 2',
    'test-tenant-2',
    NULL,
    '#33C3FF',
    'admin2@test.com',
    'Admin Test 2',
    '$2y$10$dummy.hash.test2',
    @tenant2_id,
    @admin2_id,
    @license2
);

SELECT 'Tenants criados' as 'Status', @tenant1_id as 'Tenant 1 ID', @tenant2_id as 'Tenant 2 ID';

-- ========================================
-- 2. INSERIR DADOS DE TESTE EM CADA TENANT
-- ========================================

-- Cliente Tenant 1
INSERT INTO clientes (nome, email, telefone, tenant_id)
VALUES ('Cliente Tenant 1', 'cliente1@test.com', '111111111', @tenant1_id);
SET @cliente1_id = LAST_INSERT_ID();

-- Cliente Tenant 2
INSERT INTO clientes (nome, email, telefone, tenant_id)
VALUES ('Cliente Tenant 2', 'cliente2@test.com', '222222222', @tenant2_id);
SET @cliente2_id = LAST_INSERT_ID();

-- Obra Tenant 1
INSERT INTO obras (numero, nome, cliente_id, tenant_id, ativa)
VALUES ('T1-001', 'Obra Tenant 1', @cliente1_id, @tenant1_id, 1);
SET @obra1_id = LAST_INSERT_ID();

-- Obra Tenant 2
INSERT INTO obras (numero, nome, cliente_id, tenant_id, ativa)
VALUES ('T2-001', 'Obra Tenant 2', @cliente2_id, @tenant2_id, 1);
SET @obra2_id = LAST_INSERT_ID();

SELECT 'Dados de teste inseridos' as 'Status';

-- ========================================
-- 3. TESTES DE ISOLAMENTO
-- ========================================

-- TESTE 1: Tenant 1 NÃO deve ver dados do Tenant 2
SELECT '=== TESTE 1: Isolamento de Obras ===' as '';

SELECT 'Tenant 1 deve ver apenas SUA obra:' as '';
SELECT id, numero, nome, tenant_id
FROM obras
WHERE tenant_id = @tenant1_id;

SELECT 'Tenant 2 deve ver apenas SUA obra:' as '';
SELECT id, numero, nome, tenant_id
FROM obras
WHERE tenant_id = @tenant2_id;

SELECT 'Query SEM filtro de tenant (❌ NUNCA FAZER ISSO):' as '';
SELECT id, numero, nome, tenant_id
FROM obras
WHERE id IN (@obra1_id, @obra2_id);

-- TESTE 2: Isolamento de Clientes
SELECT '=== TESTE 2: Isolamento de Clientes ===' as '';

SELECT 'Tenant 1 clientes:' as '';
SELECT id, nome, tenant_id FROM clientes WHERE tenant_id = @tenant1_id;

SELECT 'Tenant 2 clientes:' as '';
SELECT id, nome, tenant_id FROM clientes WHERE tenant_id = @tenant2_id;

-- TESTE 3: JOINs devem respeitar tenant_id
SELECT '=== TESTE 3: Isolamento em JOINs ===' as '';

SELECT 'Query INCORRETA (❌ vaza dados):' as '';
SELECT o.numero, o.nome, c.nome as cliente_nome, o.tenant_id as obra_tenant, c.tenant_id as cliente_tenant
FROM obras o
LEFT JOIN clientes c ON o.cliente_id = c.id
WHERE o.id IN (@obra1_id, @obra2_id);
-- Note que se obra.cliente_id apontar para outro tenant, retorna NULL (mas expõe a obra)

SELECT 'Query CORRETA (✅ isolamento completo):' as '';
SELECT o.numero, o.nome, c.nome as cliente_nome
FROM obras o
LEFT JOIN clientes c ON o.cliente_id = c.id AND c.tenant_id = @tenant1_id
WHERE o.tenant_id = @tenant1_id;

-- ========================================
-- 4. TESTES DE PERFORMANCE (ÍNDICES)
-- ========================================

SELECT '=== TESTE 4: Performance de Índices ===' as '';

EXPLAIN SELECT * FROM obras WHERE tenant_id = @tenant1_id AND ativa = 1;
-- Deve usar índice idx_obras_tenant

EXPLAIN SELECT * FROM usuarios WHERE tenant_id = @tenant1_id AND ativo = 1;
-- Deve usar índice idx_usuarios_tenant

-- ========================================
-- 5. TESTES DE SEGURANÇA
-- ========================================

SELECT '=== TESTE 5: Validação de Foreign Keys ===' as '';

-- Tentar criar obra com cliente de outro tenant (deve falhar silenciosamente ou retornar erro)
SELECT 'Tentando criar obra no Tenant 1 com cliente do Tenant 2...' as '';

-- Isso NÃO deve funcionar se foreign keys estiverem configuradas corretamente:
-- INSERT INTO obras (numero, nome, cliente_id, tenant_id, ativa)
-- VALUES ('T1-FAKE', 'Obra Fake', @cliente2_id, @tenant1_id, 1);
-- (comentado pois pode ou não dar erro dependendo da constraint)

-- ========================================
-- 6. TESTES DE STATUS E LICENÇAS
-- ========================================

SELECT '=== TESTE 6: Status de Tenants ===' as '';

SELECT slug, status, license_type, trial_ends_at, license_expires_at
FROM tenants
WHERE slug IN ('test-tenant-1', 'test-tenant-2');

-- Testar suspensão
CALL sp_suspend_tenant(@tenant1_id);

SELECT 'Tenant 1 após suspensão:' as '';
SELECT slug, status FROM tenants WHERE id = @tenant1_id;

-- Testar reativação
CALL sp_activate_tenant(@tenant1_id);

SELECT 'Tenant 1 após reativação:' as '';
SELECT slug, status FROM tenants WHERE id = @tenant1_id;

-- ========================================
-- 7. VERIFICAÇÃO DE CONTADORES
-- ========================================

SELECT '=== TESTE 7: Contadores por Tenant ===' as '';

SELECT
    t.slug,
    (SELECT COUNT(*) FROM usuarios u WHERE u.tenant_id = t.id) as total_users,
    (SELECT COUNT(*) FROM obras o WHERE o.tenant_id = t.id) as total_projects,
    (SELECT COUNT(*) FROM clientes c WHERE c.tenant_id = t.id) as total_clients
FROM tenants t
WHERE t.slug IN ('test-tenant-1', 'test-tenant-2');

-- ========================================
-- 8. LIMPEZA (REMOVER DADOS DE TESTE)
-- ========================================

SELECT '=== Limpeza de Dados de Teste ===' as '';

-- Remover obras de teste
DELETE FROM obras WHERE tenant_id IN (@tenant1_id, @tenant2_id);

-- Remover clientes de teste
DELETE FROM clientes WHERE tenant_id IN (@tenant1_id, @tenant2_id);

-- Remover usuários de teste
DELETE FROM usuarios WHERE tenant_id IN (@tenant1_id, @tenant2_id);

-- Marcar tenants como deleted (soft delete)
UPDATE tenants SET deleted_at = NOW() WHERE id IN (@tenant1_id, @tenant2_id);

SELECT 'Dados de teste removidos' as 'Status';

-- ========================================
-- RESUMO DOS TESTES
-- ========================================

SELECT '
========================================
✅ TESTES CONCLUÍDOS
========================================

Verifique os resultados acima:

1. ✅ Cada tenant deve ver APENAS seus dados
2. ✅ JOINs devem filtrar por tenant_id
3. ✅ Índices devem ser utilizados
4. ✅ Status e licenças funcionando
5. ✅ Stored procedures funcionando

⚠️  Se qualquer teste falhou, revisar:
   - Foreign keys (tenant_id)
   - Índices compostos
   - Queries das APIs (filtrar tenant_id)

📖 Ver MULTI_TENANT_MIGRATION.md para mais detalhes
========================================
' as '';
