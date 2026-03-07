-- ========================================
-- SISTEMA DE PROVISÃO DE FÉRIAS
-- Fórmula: (valor_hora × 176 horas) ÷ 12 meses = provisão mensal
-- ========================================

-- 1. Adicionar coluna GENERATED para cálculo automático de provisão de férias mensal
ALTER TABLE `funcionarios`
ADD COLUMN `ferias_provisao_mensal` DECIMAL(10,2) GENERATED ALWAYS AS (
    (custo_hora_normal * 176) / 12
) STORED COMMENT 'Provisão mensal de férias: (hora × 176) ÷ 12';

-- 2. Adicionar coluna para provisão de férias acumulada (manual/atualizada mensalmente)
ALTER TABLE `funcionarios`
ADD COLUMN `ferias_acumuladas` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Total acumulado de férias não pagas';

-- ========================================
-- Adicionar provisão de férias na tabela payroll
-- ========================================

ALTER TABLE `payroll`
ADD COLUMN `ferias_provisao` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Provisão de férias do mês',
ADD COLUMN `ferias_acumuladas` DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Total acumulado até este mês';

-- ========================================
-- View para resumo de obras com provisões
-- ========================================

CREATE OR REPLACE VIEW `view_resumo_obras_completo` AS
SELECT
    o.id AS obra_id,
    o.numero AS obra_numero,
    o.nome AS obra_nome,
    o.pais,
    COUNT(DISTINCT fo.funcionario_id) AS total_funcionarios,

    -- Custos (pago aos funcionários)
    COALESCE(SUM(p.salario_base), 0) AS custo_salarios,
    COALESCE(SUM(p.valor_horas_normais + p.valor_horas_extras + p.valor_horas_noturnas), 0) AS custo_horas,
    COALESCE(SUM(p.total_descontos), 0) AS custo_impostos,
    COALESCE(SUM(p.ferias_provisao), 0) AS custo_ferias_provisao,
    COALESCE(SUM(p.total_liquido), 0) AS custo_total_liquido,

    -- Faturamento (cobrado do cliente)
    COALESCE(SUM(b.valor_horas_normais + b.valor_horas_extras + b.valor_horas_noturnas), 0) AS faturamento_total,

    -- Margem
    COALESCE(SUM(b.valor_horas_normais + b.valor_horas_extras + b.valor_horas_noturnas), 0) -
    COALESCE(SUM(p.total_liquido + p.ferias_provisao), 0) AS margem_bruta,

    -- Último mês processado
    MAX(p.mes) AS ultimo_mes_processado

FROM obras o
LEFT JOIN funcionario_obra fo ON fo.obra_id = o.id
LEFT JOIN payroll p ON p.obra_id = o.id AND p.funcionario_id = fo.funcionario_id
LEFT JOIN billing b ON b.obra_id = o.id AND b.mes = p.mes
WHERE o.ativo = 1 OR o.ativa = 1
GROUP BY o.id, o.numero, o.nome, o.pais;

-- ========================================
-- Verificar provisão de férias calculada
-- ========================================

SELECT
    id,
    nome,
    custo_hora_normal,
    ferias_provisao_mensal,
    CONCAT('€', FORMAT(ferias_provisao_mensal, 2)) AS provisao_formatada,
    CONCAT('Férias anuais: €', FORMAT(ferias_provisao_mensal * 12, 2)) AS ferias_anuais
FROM funcionarios
WHERE ativo = 1
ORDER BY nome;
