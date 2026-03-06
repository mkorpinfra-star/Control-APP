-- ============================================
-- MIGRAÇÕES - SISTEMA J2S ENGINYERIA
-- VERSÃO 3 - FINAL (com verificações)
-- Data: 2026-02-06
-- ============================================

START TRANSACTION;

-- ============================================
-- FASE 1: FUNDAÇÃO FISCAL
-- ============================================

-- 1.1 Criar tabela config_impostos (IGI, CAS)
CREATE TABLE IF NOT EXISTS `config_impostos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `imposto_nome` varchar(50) NOT NULL,
  `percentual` decimal(5,2) NOT NULL,
  `aplicado_em` enum('faturamento','folha_funcionario','folha_empresa') NOT NULL,
  `descricao` text,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir impostos padrão
INSERT INTO `config_impostos` (`imposto_nome`, `percentual`, `aplicado_em`, `descricao`) VALUES
('IGI', 4.50, 'faturamento', 'Imposto Geral Indireto - 4,5% sobre o valor da nota'),
('CAS Funcionário', 6.50, 'folha_funcionario', 'Desconto de 6,5% do salário bruto do funcionário'),
('CAS Empresa', 15.50, 'folha_empresa', 'Custo patronal de 15,5% sobre o salário bruto')
ON DUPLICATE KEY UPDATE percentual = VALUES(percentual);

-- 1.2 Criar tabela funcoes
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

-- Inserir funções padrão
INSERT INTO `funcoes` (`nome`, `descricao`) VALUES
('Eletricista', 'Profissional especializado em instalações elétricas'),
('Encanador', 'Profissional especializado em instalações hidráulicas'),
('Pedreiro', 'Profissional especializado em alvenaria e construção'),
('Plaquista', 'Profissional especializado em drywall e acabamentos'),
('Lampista', 'Profissional especializado em iluminação')
ON DUPLICATE KEY UPDATE descricao = VALUES(descricao);

-- ============================================
-- CAMPOS EM USUARIOS
-- ============================================

-- Verificar e adicionar funcao_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'funcao_id';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `usuarios` ADD COLUMN `funcao_id` int(11) NULL AFTER `tipo`',
  'SELECT "Coluna funcao_id já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar FK se não existir
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND CONSTRAINT_NAME = 'fk_usuarios_funcao';

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE `usuarios` ADD CONSTRAINT `fk_usuarios_funcao` FOREIGN KEY (`funcao_id`) REFERENCES `funcoes`(`id`) ON DELETE SET NULL',
  'SELECT "FK fk_usuarios_funcao já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar salario_base_mensal
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'salario_base_mensal';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `usuarios` ADD COLUMN `salario_base_mensal` decimal(10,2) DEFAULT NULL AFTER `funcao_id`',
  'SELECT "Coluna salario_base_mensal já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- CAMPOS EM OBRAS
-- ============================================

-- Verificar e adicionar email_encarregado
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'obras' AND COLUMN_NAME = 'email_encarregado';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `obras` ADD COLUMN `email_encarregado` varchar(255) NULL',
  'SELECT "Coluna email_encarregado já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- CAMPOS EM FATURAMENTO (IGI)
-- ============================================

-- Verificar e adicionar igi_percentual
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'faturamento' AND COLUMN_NAME = 'igi_percentual';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `faturamento` ADD COLUMN `igi_percentual` decimal(5,2) DEFAULT 4.50',
  'SELECT "Coluna igi_percentual já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar igi_valor
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'faturamento' AND COLUMN_NAME = 'igi_valor';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `faturamento` ADD COLUMN `igi_valor` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna igi_valor já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar total_bruto
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'faturamento' AND COLUMN_NAME = 'total_bruto';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `faturamento` ADD COLUMN `total_bruto` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna total_bruto já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar total_liquido
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'faturamento' AND COLUMN_NAME = 'total_liquido';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `faturamento` ADD COLUMN `total_liquido` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna total_liquido já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- CAMPOS EM FOLHA_PAGAMENTO (MULTIPLICADORES E CAS)
-- ============================================

-- salario_base_hora
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'salario_base_hora';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `salario_base_hora` decimal(10,2) DEFAULT NULL',
  'SELECT "Coluna salario_base_hora já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- multiplicador_extra
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'multiplicador_extra';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `multiplicador_extra` decimal(3,2) DEFAULT 1.40',
  'SELECT "Coluna multiplicador_extra já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- multiplicador_noturna
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'multiplicador_noturna';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `multiplicador_noturna` decimal(3,2) DEFAULT 1.60',
  'SELECT "Coluna multiplicador_noturna já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- cas_funcionario_percentual
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'cas_funcionario_percentual';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `cas_funcionario_percentual` decimal(5,2) DEFAULT 6.50',
  'SELECT "Coluna cas_funcionario_percentual já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- cas_funcionario_valor
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'cas_funcionario_valor';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `cas_funcionario_valor` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna cas_funcionario_valor já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- cas_empresa_percentual
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'cas_empresa_percentual';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `cas_empresa_percentual` decimal(5,2) DEFAULT 15.50',
  'SELECT "Coluna cas_empresa_percentual já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- cas_empresa_valor
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'cas_empresa_valor';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `cas_empresa_valor` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna cas_empresa_valor já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- vale_moradia
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'vale_moradia';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `vale_moradia` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna vale_moradia já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ibf
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'ibf';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `ibf` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna ibf já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- total_bruto em folha_pagamento
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'total_bruto';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `total_bruto` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna total_bruto já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- total_liquido em folha_pagamento
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'total_liquido';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `total_liquido` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna total_liquido já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- custo_total_empresa
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'custo_total_empresa';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `custo_total_empresa` decimal(10,2) DEFAULT 0',
  'SELECT "Coluna custo_total_empresa já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- obra_id em folha_pagamento
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'obra_id';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD COLUMN `obra_id` int(11) NULL',
  'SELECT "Coluna obra_id já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FK para obra_id
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND CONSTRAINT_NAME = 'fk_folha_obra';

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE `folha_pagamento` ADD CONSTRAINT `fk_folha_obra` FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`) ON DELETE SET NULL',
  'SELECT "FK fk_folha_obra já existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- ATUALIZAÇÃO DE DADOS EXISTENTES
-- ============================================

-- Atualizar faturamento existente com IGI
UPDATE `faturamento`
SET
  `total_bruto` = COALESCE(`valor_total_servicos`, 0),
  `igi_valor` = COALESCE(`valor_total_servicos`, 0) * 0.045,
  `total_liquido` = COALESCE(`valor_total_servicos`, 0) * 0.955
WHERE (`total_bruto` IS NULL OR `total_bruto` = 0) AND `valor_total_servicos` > 0;

COMMIT;

-- ============================================
-- MIGRAÇÃO CONCLUÍDA COM SUCESSO
-- ============================================
