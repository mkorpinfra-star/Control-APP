-- ========================================
-- SISTEMA DE PROVISÃO DE FÉRIAS
-- Fórmula: (valor_hora × 176 horas) ÷ 12 meses = provisão mensal
-- ========================================

-- 1. Adicionar coluna para provisão de férias na tabela folha_pagamento
ALTER TABLE `folha_pagamento`
ADD COLUMN IF NOT EXISTS `ferias_provisao` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Provisão de férias do mês: (salario_hora × 176) ÷ 12';

-- ========================================
-- PRONTO! O cálculo já está implementado no PHP
-- ========================================
-- O arquivo backend/api/payroll/generate-monthly.php
-- calcula automaticamente: $feriasProvisaoMensal = ($salarioHora * 176) / 12
--
-- E salva na coluna ferias_provisao quando gera a folha
-- ========================================

-- Testar: Gerar folha de pagamento e verificar coluna ferias_provisao
-- SELECT
--     funcionario_id,
--     mes_referencia,
--     salario_hora,
--     ferias_provisao,
--     CONCAT('€', FORMAT(ferias_provisao, 2)) as provisao_formatada
-- FROM folha_pagamento
-- ORDER BY mes_referencia DESC, funcionario_id
-- LIMIT 10;
