-- ============================================
-- MIGRAÇÕES - SISTEMA J2S ENGINYERIA
-- VERSÃO 4 - SIMPLES (apenas o essencial)
-- Data: 2026-02-06
-- ============================================
-- INSTRUÇÕES: Execute este arquivo no phpMyAdmin
-- Ignore os erros de "coluna já existe" - é normal!
-- ============================================

-- 1. Criar tabelas novas
CREATE TABLE IF NOT EXISTS `config_impostos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `imposto_nome` varchar(50) NOT NULL,
  `percentual` decimal(5,2) NOT NULL,
  `aplicado_em` enum('faturamento','folha_funcionario','folha_empresa') NOT NULL,
  `descricao` text,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_imposto` (`imposto_nome`, `aplicado_em`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir impostos apenas se não existirem (evita duplicados)
INSERT IGNORE INTO `config_impostos` (`imposto_nome`, `percentual`, `aplicado_em`, `descricao`, `ativo`) VALUES
('IGI', 4.50, 'faturamento', 'Imposto Geral Indireto - 4,5% sobre o valor da nota', 1),
('CAS Funcionário', 6.50, 'folha_funcionario', 'Desconto de 6,5% do salário bruto do funcionário', 1),
('CAS Empresa', 15.50, 'folha_empresa', 'Custo patronal de 15,5% sobre o salário bruto', 1);

CREATE TABLE IF NOT EXISTS `funcoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `funcoes` (`nome`, `descricao`) VALUES
('Eletricista', 'Profissional especializado em instalações elétricas'),
('Encanador', 'Profissional especializado em instalações hidráulicas'),
('Pedreiro', 'Profissional especializado em alvenaria e construção'),
('Plaquista', 'Profissional especializado em drywall e acabamentos'),
('Lampista', 'Profissional especializado em iluminação')
ON DUPLICATE KEY UPDATE descricao = VALUES(descricao);

-- ============================================
-- 2. Adicionar colunas em USUARIOS
-- Se der erro "coluna já existe", ignore e continue
-- ============================================

-- funcao_id
ALTER TABLE `usuarios` ADD COLUMN `funcao_id` int(11) NULL;

-- salario_base_mensal
ALTER TABLE `usuarios` ADD COLUMN `salario_base_mensal` decimal(10,2) DEFAULT NULL;

-- ============================================
-- 3. Adicionar coluna em OBRAS
-- ============================================

ALTER TABLE `obras` ADD COLUMN `email_encarregado` varchar(255) NULL;

-- ============================================
-- 4. Adicionar colunas em FATURAMENTO (IGI)
-- ============================================

ALTER TABLE `faturamento` ADD COLUMN `total_bruto` decimal(10,2) DEFAULT 0;
ALTER TABLE `faturamento` ADD COLUMN `total_liquido` decimal(10,2) DEFAULT 0;

-- ============================================
-- 5. Adicionar colunas em FOLHA_PAGAMENTO
-- ============================================

ALTER TABLE `folha_pagamento` ADD COLUMN `salario_base_hora` decimal(10,2) DEFAULT NULL;
ALTER TABLE `folha_pagamento` ADD COLUMN `multiplicador_extra` decimal(3,2) DEFAULT 1.40;
ALTER TABLE `folha_pagamento` ADD COLUMN `multiplicador_noturna` decimal(3,2) DEFAULT 1.60;
ALTER TABLE `folha_pagamento` ADD COLUMN `cas_funcionario_percentual` decimal(5,2) DEFAULT 6.50;
ALTER TABLE `folha_pagamento` ADD COLUMN `cas_funcionario_valor` decimal(10,2) DEFAULT 0;
ALTER TABLE `folha_pagamento` ADD COLUMN `cas_empresa_percentual` decimal(5,2) DEFAULT 15.50;
ALTER TABLE `folha_pagamento` ADD COLUMN `cas_empresa_valor` decimal(10,2) DEFAULT 0;
ALTER TABLE `folha_pagamento` ADD COLUMN `vale_moradia` decimal(10,2) DEFAULT 0;
ALTER TABLE `folha_pagamento` ADD COLUMN `ibf` decimal(10,2) DEFAULT 0;
ALTER TABLE `folha_pagamento` ADD COLUMN `total_bruto` decimal(10,2) DEFAULT 0;
ALTER TABLE `folha_pagamento` ADD COLUMN `total_liquido` decimal(10,2) DEFAULT 0;
ALTER TABLE `folha_pagamento` ADD COLUMN `custo_total_empresa` decimal(10,2) DEFAULT 0;
ALTER TABLE `folha_pagamento` ADD COLUMN `obra_id` int(11) NULL;

-- ============================================
-- PRONTO! MIGRAÇÃO CONCLUÍDA
-- ============================================
-- Ignore erros de "Duplicate column name" - é normal
-- O importante é que todas as colunas existam no final
-- ============================================
