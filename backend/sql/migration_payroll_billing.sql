-- ============================================
-- MIGRATION: Sistema de Folha de Pagamento e Faturamento
-- Adiciona funcionalidades financeiras ao sistema
-- ============================================

-- 1. ADICIONAR CAMPOS FINANCEIROS À TABELA USUARIOS
ALTER TABLE `usuarios`
    ADD COLUMN IF NOT EXISTS `funcao` ENUM('pedreiro', 'eletricista', 'encanador', 'plaquista', 'lampista', 'outro') DEFAULT NULL AFTER `tipo`,
    ADD COLUMN IF NOT EXISTS `salario_base` DECIMAL(10,2) DEFAULT NULL AFTER `funcao`,
    ADD COLUMN IF NOT EXISTS `salario_hora` DECIMAL(10,2) DEFAULT NULL AFTER `salario_base`,
    ADD COLUMN IF NOT EXISTS `vale_moradia` DECIMAL(10,2) DEFAULT 0.00 AFTER `salario_hora`,
    ADD COLUMN IF NOT EXISTS `ibf` DECIMAL(10,2) DEFAULT 0.00 AFTER `vale_moradia`;

-- 2. TABELA DE CONFIGURAÇÃO FISCAL (CAS, IGI, Multiplicadores)
CREATE TABLE IF NOT EXISTS `config_fiscal` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cas_desconto_funcionario` DECIMAL(5,2) NOT NULL DEFAULT 6.50 COMMENT 'Percentual de CAS descontado do funcionário',
    `cas_custo_empresa` DECIMAL(5,2) NOT NULL DEFAULT 15.50 COMMENT 'Percentual de CAS custo para empresa',
    `igi_percentual` DECIMAL(5,2) NOT NULL DEFAULT 4.50 COMMENT 'Percentual de IGI sobre faturamento',
    `hora_extra_multiplicador` DECIMAL(3,2) NOT NULL DEFAULT 1.40 COMMENT 'Multiplicador para hora extra (1.4x)',
    `hora_noturna_multiplicador` DECIMAL(3,2) NOT NULL DEFAULT 1.60 COMMENT 'Multiplicador para hora noturna (1.6x)',
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir config padrão
INSERT INTO `config_fiscal` (cas_desconto_funcionario, cas_custo_empresa, igi_percentual, hora_extra_multiplicador, hora_noturna_multiplicador)
VALUES (6.50, 15.50, 4.50, 1.40, 1.60)
ON DUPLICATE KEY UPDATE id = id;

-- 3. ADICIONAR COLUNAS DE HORAS SEPARADAS NA TABELA APONTAMENTOS (se não existirem)
ALTER TABLE `apontamentos`
    ADD COLUMN IF NOT EXISTS `horas_normais` DECIMAL(5,1) DEFAULT 0 AFTER `total_horas`,
    ADD COLUMN IF NOT EXISTS `horas_extra` DECIMAL(5,1) DEFAULT 0 AFTER `horas_normais`,
    ADD COLUMN IF NOT EXISTS `horas_noturna` DECIMAL(5,1) DEFAULT 0 AFTER `horas_extra`;

-- 4. TABELA DE FOLHA DE PAGAMENTO
CREATE TABLE IF NOT EXISTS `folha_pagamento` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `funcionario_id` INT NOT NULL,
    `obra_id` INT NOT NULL,
    `mes_referencia` VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',

    -- Horas trabalhadas
    `horas_normais` DECIMAL(10,2) DEFAULT 0,
    `horas_extra` DECIMAL(10,2) DEFAULT 0,
    `horas_noturna` DECIMAL(10,2) DEFAULT 0,

    -- Dados financeiros (snapshot)
    `salario_base` DECIMAL(10,2) NOT NULL,
    `salario_hora` DECIMAL(10,2) NOT NULL,
    `vale_moradia` DECIMAL(10,2) DEFAULT 0.00,
    `ibf` DECIMAL(10,2) DEFAULT 0.00,

    -- Percentuais CAS (snapshot)
    `cas_desconto_funcionario_percentual` DECIMAL(5,2) DEFAULT 6.50,
    `cas_custo_empresa_percentual` DECIMAL(5,2) DEFAULT 15.50,

    -- Valores calculados automaticamente (GENERATED COLUMNS)
    `valor_horas_normais` DECIMAL(10,2) GENERATED ALWAYS AS
        (horas_normais * salario_hora) STORED,

    `valor_horas_extra` DECIMAL(10,2) GENERATED ALWAYS AS
        (horas_extra * salario_hora * 1.4) STORED,

    `valor_horas_noturna` DECIMAL(10,2) GENERATED ALWAYS AS
        (horas_noturna * salario_hora * 1.6) STORED,

    `subtotal_horas` DECIMAL(10,2) GENERATED ALWAYS AS
        (
            (horas_normais * salario_hora) +
            (horas_extra * salario_hora * 1.4) +
            (horas_noturna * salario_hora * 1.6)
        ) STORED,

    `cas_desconto_funcionario_valor` DECIMAL(10,2) GENERATED ALWAYS AS
        (salario_base * cas_desconto_funcionario_percentual / 100) STORED,

    `cas_custo_empresa_valor` DECIMAL(10,2) GENERATED ALWAYS AS
        (salario_base * cas_custo_empresa_percentual / 100) STORED,

    `total_provimentos` DECIMAL(10,2) GENERATED ALWAYS AS
        (
            (horas_normais * salario_hora) +
            (horas_extra * salario_hora * 1.4) +
            (horas_noturna * salario_hora * 1.6) +
            vale_moradia +
            ibf
        ) STORED,

    `total_descontos` DECIMAL(10,2) GENERATED ALWAYS AS
        (salario_base * cas_desconto_funcionario_percentual / 100) STORED,

    `liquido_a_pagar` DECIMAL(10,2) GENERATED ALWAYS AS
        (
            (horas_normais * salario_hora) +
            (horas_extra * salario_hora * 1.4) +
            (horas_noturna * salario_hora * 1.6) +
            vale_moradia +
            ibf -
            (salario_base * cas_desconto_funcionario_percentual / 100)
        ) STORED,

    `custo_total_empresa` DECIMAL(10,2) GENERATED ALWAYS AS
        (
            (horas_normais * salario_hora) +
            (horas_extra * salario_hora * 1.4) +
            (horas_noturna * salario_hora * 1.6) +
            vale_moradia +
            ibf +
            (salario_base * cas_custo_empresa_percentual / 100)
        ) STORED,

    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY `unique_funcionario_obra_mes` (`funcionario_id`, `obra_id`, `mes_referencia`),
    INDEX `idx_mes_referencia` (`mes_referencia`),
    INDEX `idx_funcionario` (`funcionario_id`),
    INDEX `idx_obra` (`obra_id`),
    FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABELA DE VALORES DE FATURAMENTO (cobrança ao cliente)
CREATE TABLE IF NOT EXISTS `config_valores_faturamento` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `valor_hora_normal_faturamento` DECIMAL(10,2) NOT NULL DEFAULT 30.00 COMMENT 'Valor cobrado do cliente por hora normal',
    `valor_hora_extra_faturamento` DECIMAL(10,2) NOT NULL DEFAULT 42.00 COMMENT 'Valor cobrado do cliente por hora extra',
    `valor_hora_noturna_faturamento` DECIMAL(10,2) NOT NULL DEFAULT 48.00 COMMENT 'Valor cobrado do cliente por hora noturna',
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir valores padrão de faturamento
INSERT INTO `config_valores_faturamento` (valor_hora_normal_faturamento, valor_hora_extra_faturamento, valor_hora_noturna_faturamento)
VALUES (30.00, 42.00, 48.00)
ON DUPLICATE KEY UPDATE id = id;

-- 6. TABELA DE FATURAMENTO (Faturas ao cliente)
CREATE TABLE IF NOT EXISTS `faturamento` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `obra_id` INT NOT NULL,
    `mes_referencia` VARCHAR(7) NOT NULL COMMENT 'YYYY-MM',

    -- Horas facturadas
    `horas_normais` DECIMAL(10,2) DEFAULT 0,
    `horas_extra` DECIMAL(10,2) DEFAULT 0,
    `horas_noturna` DECIMAL(10,2) DEFAULT 0,

    -- Valores por hora (snapshot)
    `valor_hora_normal` DECIMAL(10,2) NOT NULL,
    `valor_hora_extra` DECIMAL(10,2) NOT NULL,
    `valor_hora_noturna` DECIMAL(10,2) NOT NULL,

    -- Total de serviços
    `valor_total_servicos` DECIMAL(10,2) NOT NULL,

    -- IGI
    `igi_percentual` DECIMAL(5,2) DEFAULT 4.50,
    `igi_valor` DECIMAL(10,2) GENERATED ALWAYS AS
        (valor_total_servicos * igi_percentual / 100) STORED,

    -- Total da fatura (serviços + IGI)
    `valor_total_fatura` DECIMAL(10,2) GENERATED ALWAYS AS
        (valor_total_servicos + (valor_total_servicos * igi_percentual / 100)) STORED,

    `observacoes` TEXT,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY `unique_obra_mes` (`obra_id`, `mes_referencia`),
    INDEX `idx_mes_referencia` (`mes_referencia`),
    INDEX `idx_obra` (`obra_id`),
    FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. VIEW: Dashboard Financeiro por Obra
CREATE OR REPLACE VIEW `vw_dashboard_financeiro_obra` AS
SELECT
    o.id as obra_id,
    o.numero as obra_numero,
    o.nome as obra_nome,
    c.nome as cliente_nome,
    fp.mes_referencia,

    -- Receita (Faturamento)
    COALESCE(f.valor_total_fatura, 0) as receita_total,
    COALESCE(f.valor_total_servicos, 0) as receita_servicos,
    COALESCE(f.igi_valor, 0) as receita_igi,

    -- Custo (Folha)
    COALESCE(SUM(fp.custo_total_empresa), 0) as custo_total,
    COALESCE(SUM(fp.liquido_a_pagar), 0) as custo_liquido_funcionarios,
    COALESCE(SUM(fp.cas_custo_empresa_valor), 0) as custo_cas_empresa,

    -- Lucro
    (COALESCE(f.valor_total_fatura, 0) - COALESCE(SUM(fp.custo_total_empresa), 0)) as lucro,

    -- Margem
    CASE
        WHEN COALESCE(f.valor_total_fatura, 0) > 0 THEN
            ((COALESCE(f.valor_total_fatura, 0) - COALESCE(SUM(fp.custo_total_empresa), 0)) / COALESCE(f.valor_total_fatura, 0) * 100)
        ELSE 0
    END as margem_percentual

FROM obras o
LEFT JOIN clientes c ON c.id = o.cliente_id
LEFT JOIN folha_pagamento fp ON fp.obra_id = o.id
LEFT JOIN faturamento f ON f.obra_id = o.id AND f.mes_referencia = fp.mes_referencia
WHERE o.ativa = 1
GROUP BY o.id, c.nome, fp.mes_referencia, f.valor_total_fatura, f.valor_total_servicos, f.igi_valor;

-- ============================================
-- MIGRATION COMPLETED
-- ============================================
