-- ========================================
-- FIX: Atualizar obras antigas com encarregado_id apontando para usuarios
-- Problema: 14 obras têm encarregado_id=1 (da tabela usuarios)
-- Solução: Limpar esses IDs ou mapear para encarregados novos
-- ========================================

-- OPÇÃO 1: Ver quantas obras têm encarregado_id inválido
SELECT
    o.id,
    o.numero,
    o.nome,
    o.encarregado_id,
    'Encarregado não existe na tabela encarregados' as problema
FROM obras o
WHERE o.encarregado_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM encarregados e WHERE e.id = o.encarregado_id
  );

-- OPÇÃO 2: Limpar encarregado_id inválidos (tornar NULL)
-- Executar SOMENTE se quiser remover os vínculos antigos
UPDATE obras
SET encarregado_id = NULL
WHERE encarregado_id IS NOT NULL
  AND encarregado_id NOT IN (SELECT id FROM encarregados);

-- OPÇÃO 3: Atribuir todas as obras antigas ao primeiro encarregado da nova tabela
-- Executar SOMENTE se você quer vincular todas ao encarregado "guilherme" (id=1 da tabela encarregados)
-- UPDATE obras
-- SET encarregado_id = (SELECT MIN(id) FROM encarregados LIMIT 1)
-- WHERE encarregado_id IS NOT NULL
--   AND NOT EXISTS (
--       SELECT 1 FROM encarregados e WHERE e.id = o.encarregado_id
--   );

-- Verificar após fix:
SELECT
    'Obras com encarregado válido' as status,
    COUNT(*) as total
FROM obras o
INNER JOIN encarregados e ON e.id = o.encarregado_id
UNION ALL
SELECT
    'Obras SEM encarregado' as status,
    COUNT(*) as total
FROM obras
WHERE encarregado_id IS NULL;
