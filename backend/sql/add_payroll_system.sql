-- ============================================
-- SISTEMA DE FOLHA DE PAGAMENTO E FATURAMENTO
-- Data: 2026-02-05
-- ============================================

-- 1. ADICIONAR CAMPOS NO CADASTRO DE FUNCIONÁRIOS
ALTER TABLE `usuarios`
    ADD COLUMN `funcao` ENUM('pedreiro', 'eletricista', 'encanador', 'plaquista', 'lampista', 'outro') NULL AFTER `tipo`,
    ADD COLUMN `salario_base` DECIMAL(10,2) NULL DEFAULT NULL AFTER `funcao`,
    ADD COLUMN `salario_hora` DECIMAL(10,2) NULL DEFAULT NULL AFTER `salario_base`,
    ADD COLUMN `vale_moradia` DECIMAL(10,2) NULL DEFAULT 0.00 AFTER `salario_hora`,
    ADD COLUMN `ibf` DECIMAL(10,2) NULL DEFAULT 0.00 AFTER `vale_moradia`,
    ADD COLUMN `observacoes_rh` TEXT NULL AFTER `ibf`;

-- 2. CRIAR TABELA DE CONFIGURAÇÕES FISCAIS
CREATE TABLE IF NOT EXISTS `config_fiscal` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cas_desconto_funcionario` DECIMAL(5,2) NOT NULL DEFAULT 6.50 COMMENT 'CAS - Desconto funcionário (%)',
    `cas_custo_empresa` DECIMAL(5,2) NOT NULL DEFAULT 15.50 COMMENT 'CAS - Custo empresa (%)',
    `igi_percentual` DECIMAL(5,2) NOT NULL DEFAULT 4.50 COMMENT 'IGI - Imposto (%)',
    `hora_extra_multiplicador` DECIMAL(3,2) NOT NULL DEFAULT 1.40 COMMENT 'Multiplicador hora extra',
    `hora_noturna_multiplicador` DECIMAL(3,2) NOT NULL DEFAULT 1.60 COMMENT 'Multiplicador hora noturna',
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir valores padrão
INSERT INTO `config_fiscal` (
    `cas_desconto_funcionario`,
    `cas_custo_empresa`,
    `igi_percentual`,
    `hora_extra_multiplicador`,
    `hora_noturna_multiplicador`
) VALUES (6.50, 15.50, 4.50, 1.40, 1.60);

-- 3. CRIAR TABELA DE FOLHA DE PAGAMENTO MENSAL
CREATE TABLE IF NOT EXISTS `folha_pagamento` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `funcionario_id` INT NOT NULL,
    `obra_id` INT NOT NULL,
    `mes_referencia` VARCHAR(7) NOT NULL COMMENT 'Formato: YYYY-MM',

    -- Horas trabalhadas
    `horas_normais` DECIMAL(10,2) DEFAULT 0,
    `horas_extra` DECIMAL(10,2) DEFAULT 0,
    `horas_noturna` DECIMAL(10,2) DEFAULT 0,
    `total_horas` DECIMAL(10,2) GENERATED ALWAYS AS (horas_normais + horas_extra + horas_noturna) STORED,

    -- Valores base
    `salario_base` DECIMAL(10,2) NOT NULL,
    `salario_hora` DECIMAL(10,2) NOT NULL,
    `vale_moradia` DECIMAL(10,2) DEFAULT 0,
    `ibf` DECIMAL(10,2) DEFAULT 0,

    -- Cálculos de horas
    `valor_horas_normais` DECIMAL(10,2) GENERATED ALWAYS AS (horas_normais * salario_hora) STORED,
    `valor_horas_extra` DECIMAL(10,2) GENERATED ALWAYS AS (horas_extra * salario_hora * 1.4) STORED,
    `valor_horas_noturna` DECIMAL(10,2) GENERATED ALWAYS AS (horas_noturna * salario_hora * 1.6) STORED,

    -- Total a pagar
    `subtotal_horas` DECIMAL(10,2) GENERATED ALWAYS AS (
        (horas_normais * salario_hora) +
        (horas_extra * salario_hora * 1.4) +
        (horas_noturna * salario_hora * 1.6)
    ) STORED,

    -- CAS
    `cas_desconto_funcionario_percentual` DECIMAL(5,2) DEFAULT 6.50,
    `cas_desconto_funcionario_valor` DECIMAL(10,2) GENERATED ALWAYS AS (salario_base * cas_desconto_funcionario_percentual / 100) STORED,
    `cas_custo_empresa_percentual` DECIMAL(5,2) DEFAULT 15.50,
    `cas_custo_empresa_valor` DECIMAL(10,2) GENERATED ALWAYS AS (salario_base * cas_custo_empresa_percentual / 100) STORED,

    -- Total final
    `total_a_pagar` DECIMAL(10,2) GENERATED ALWAYS AS (
        (horas_normais * salario_hora) +
        (horas_extra * salario_hora * 1.4) +
        (horas_noturna * salario_hora * 1.6) +
        vale_moradia + ibf - (salario_base * cas_desconto_funcionario_percentual / 100)
    ) STORED,

    `status` ENUM('rascunho', 'fechado', 'pago') DEFAULT 'rascunho',
    `data_pagamento` DATE NULL,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY `unique_funcionario_obra_mes` (`funcionario_id`, `obra_id`, `mes_referencia`),
    INDEX `idx_mes_referencia` (`mes_referencia`),
    INDEX `idx_obra` (`obra_id`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CRIAR TABELA DE FATURAMENTO MENSAL
CREATE TABLE IF NOT EXISTS `faturamento` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `obra_id` INT NOT NULL,
    `mes_referencia` VARCHAR(7) NOT NULL COMMENT 'Formato: YYYY-MM',

    -- Total de horas faturadas (vem dos apontamentos aprovados)
    `total_horas_normais` DECIMAL(10,2) DEFAULT 0,
    `total_horas_extra` DECIMAL(10,2) DEFAULT 0,
    `total_horas_noturna` DECIMAL(10,2) DEFAULT 0,

    -- Valores configurados de faturamento (podem ser diferentes dos da folha)
    `valor_hora_normal_fatura` DECIMAL(10,2) NOT NULL,
    `valor_hora_extra_fatura` DECIMAL(10,2) NOT NULL,
    `valor_hora_noturna_fatura` DECIMAL(10,2) NOT NULL,

    -- Cálculo do faturamento
    `valor_horas_normais` DECIMAL(10,2) GENERATED ALWAYS AS (total_horas_normais * valor_hora_normal_fatura) STORED,
    `valor_horas_extra` DECIMAL(10,2) GENERATED ALWAYS AS (total_horas_extra * valor_hora_extra_fatura) STORED,
    `valor_horas_noturna` DECIMAL(10,2) GENERATED ALWAYS AS (total_horas_noturna * valor_hora_noturna_fatura) STORED,

    -- Subtotal antes de impostos
    `valor_total_servicos` DECIMAL(10,2) GENERATED ALWAYS AS (
        (total_horas_normais * valor_hora_normal_fatura) +
        (total_horas_extra * valor_hora_extra_fatura) +
        (total_horas_noturna * valor_hora_noturna_fatura)
    ) STORED,

    -- IGI 4.5%
    `igi_percentual` DECIMAL(5,2) DEFAULT 4.50,
    `igi_valor` DECIMAL(10,2) GENERATED ALWAYS AS (
        ((total_horas_normais * valor_hora_normal_fatura) +
        (total_horas_extra * valor_hora_extra_fatura) +
        (total_horas_noturna * valor_hora_noturna_fatura)) * igi_percentual / 100
    ) STORED,

    -- Total da fatura (com IGI)
    `valor_total_fatura` DECIMAL(10,2) GENERATED ALWAYS AS (
        ((total_horas_normais * valor_hora_normal_fatura) +
        (total_horas_extra * valor_hora_extra_fatura) +
        (total_horas_noturna * valor_hora_noturna_fatura)) +
        (((total_horas_normais * valor_hora_normal_fatura) +
        (total_horas_extra * valor_hora_extra_fatura) +
        (total_horas_noturna * valor_hora_noturna_fatura)) * igi_percentual / 100)
    ) STORED,

    `status` ENUM('rascunho', 'enviado', 'pago') DEFAULT 'rascunho',
    `data_envio` DATE NULL,
    `data_recebimento` DATE NULL,
    `numero_fatura` VARCHAR(50) NULL,
    `observacoes` TEXT NULL,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY `unique_obra_mes` (`obra_id`, `mes_referencia`),
    INDEX `idx_mes_referencia` (`mes_referencia`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. VIEW PARA DASHBOARD FINANCEIRO POR OBRA
CREATE OR REPLACE VIEW `vw_dashboard_financeiro_obra` AS
SELECT
    o.id as obra_id,
    o.numero as obra_numero,
    o.nome as obra_nome,
    DATE_FORMAT(CURDATE(), '%Y-%m') as mes_atual,

    -- FATURAMENTO
    COALESCE(f.valor_total_servicos, 0) as receita_servicos,
    COALESCE(f.igi_valor, 0) as receita_igi,
    COALESCE(f.valor_total_fatura, 0) as receita_total,
    f.status as fatura_status,

    -- CUSTOS DE FOLHA
    COALESCE(SUM(fp.subtotal_horas), 0) as custo_salarios,
    COALESCE(SUM(fp.vale_moradia), 0) as custo_vale_moradia,
    COALESCE(SUM(fp.ibf), 0) as custo_ibf,
    COALESCE(SUM(fp.cas_desconto_funcionario_valor), 0) as desconto_cas_funcionario,
    COALESCE(SUM(fp.cas_custo_empresa_valor), 0) as custo_cas_empresa,
    COALESCE(SUM(fp.total_a_pagar), 0) as custo_folha_liquida,
    COALESCE(SUM(fp.subtotal_horas + fp.vale_moradia + fp.ibf + fp.cas_custo_empresa_valor), 0) as custo_total_empresa,

    -- LUCRO
    COALESCE(f.valor_total_fatura, 0) - COALESCE(SUM(fp.subtotal_horas + fp.vale_moradia + fp.ibf + fp.cas_custo_empresa_valor), 0) as lucro_bruto,

    -- ESTATÍSTICAS
    COUNT(DISTINCT fp.funcionario_id) as total_funcionarios,
    COALESCE(SUM(fp.total_horas), 0) as total_horas

FROM obras o
LEFT JOIN faturamento f ON f.obra_id = o.id AND f.mes_referencia = DATE_FORMAT(CURDATE(), '%Y-%m')
LEFT JOIN folha_pagamento fp ON fp.obra_id = o.id AND fp.mes_referencia = DATE_FORMAT(CURDATE(), '%Y-%m')
WHERE o.ativa = 1
GROUP BY o.id, o.numero, o.nome, f.valor_total_servicos, f.igi_valor, f.valor_total_fatura, f.status;

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL - COMENTAR EM PRODUÇÃO)
-- ============================================

-- Atualizar funcionários com dados financeiros de exemplo
/*
UPDATE usuarios SET
    funcao = 'pedreiro',
    salario_base = 2000.00,
    salario_hora = 12.00,
    vale_moradia = 250.00,
    ibf = 100.00
WHERE id = 2 AND tipo = 'funcionario';

UPDATE usuarios SET
    funcao = 'eletricista',
    salario_base = 1875.00,
    salario_hora = 12.00,
    vale_moradia = 250.00,
    ibf = 100.00
WHERE id = 3 AND tipo = 'funcionario';
*/
