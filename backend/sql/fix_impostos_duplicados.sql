-- ============================================
-- CORRIGIR IMPOSTOS DUPLICADOS
-- Execute este arquivo no phpMyAdmin
-- ============================================

-- Deletar todos os impostos duplicados, mantendo apenas 1 de cada tipo
DELETE t1 FROM config_impostos t1
INNER JOIN config_impostos t2 
WHERE t1.id > t2.id 
  AND t1.imposto_nome = t2.imposto_nome 
  AND t1.aplicado_em = t2.aplicado_em;

-- Verificar se sobraram apenas 3 registros (IGI, CAS Funcionário, CAS Empresa)
SELECT * FROM config_impostos ORDER BY id;

-- ============================================
-- Após executar, você deve ter apenas 3 registros:
-- 1. IGI (4.50%) - Faturamento
-- 2. CAS Funcionário (6.50%) - Folha Funcionário
-- 3. CAS Empresa (15.50%) - Folha Empresa
-- ============================================
