-- ========================================
-- CORREÇÕES MULTI-TENANT - PuntoClicks
-- ========================================
-- Execute este script DEPOIS de importar u268549871_saaas.sql

USE u268549871_saaas;

-- 1. Corrigir Super Admin (admin@puntoclicks.com)
-- Trocar tipo de '' para 'super_admin' e manter tenant_id = 1 (pode gerenciar todos)
UPDATE usuarios
SET tipo = 'super_admin'
WHERE email = 'admin@puntoclicks.com'
  AND tipo = '';

-- 2. Verificar se Super Admin foi corrigido
SELECT
    id,
    nome,
    email,
    tipo,
    tenant_id,
    ativo
FROM usuarios
WHERE email = 'admin@puntoclicks.com';

-- 3. Listar todos os usuários por tipo e tenant
SELECT
    tipo,
    tenant_id,
    COUNT(*) as total,
    GROUP_CONCAT(nome SEPARATOR ', ') as usuarios
FROM usuarios
WHERE ativo = 1
GROUP BY tipo, tenant_id
ORDER BY tenant_id, tipo;

-- 4. Verificar tenant J2S
SELECT * FROM tenants WHERE slug = 'j2s';

-- 5. Verificar se todos os usuários ativos têm tenant válido
SELECT
    u.id,
    u.nome,
    u.email,
    u.tipo,
    u.tenant_id,
    t.nome as tenant_nome,
    t.slug as tenant_slug
FROM usuarios u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.ativo = 1
ORDER BY u.tipo, u.id;

-- ========================================
-- RESULTADO ESPERADO:
-- ========================================
-- 1. admin@puntoclicks.com → tipo = 'super_admin', tenant_id = 1
-- 2. Todos os outros usuários j2s.ad → tipo = 'admin'/'encarregado'/'funcionario', tenant_id = 1
-- 3. Tenant J2S (id=1) ativo e funcionando
