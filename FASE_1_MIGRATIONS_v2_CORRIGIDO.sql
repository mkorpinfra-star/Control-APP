-- ============================================
-- MIGRAÇÕES - SISTEMA J2S ENGINYERIA
-- VERSÃO 2 - CORRIGIDA
-- Data: 2026-02-06
-- ============================================
-- Este arquivo contém todas as alterações de banco de dados
-- necessárias para implementar as FASES 1-6 do sistema
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

-- Inserir impostos padrão (IGI 4.5%, CAS Funcionário 6.5%, CAS Empresa 15.5%)
INSERT INTO `config_impostos` (`imposto_nome`, `percentual`, `aplicado_em`, `descricao`) VALUES
('IGI', 4.50, 'faturamento', 'Imposto Geral Indireto - 4,5% sobre o valor da nota'),
('CAS Funcionário', 6.50, 'folha_funcionario', 'Desconto de 6,5% do salário bruto do funcionário'),
('CAS Empresa', 15.50, 'folha_empresa', 'Custo patronal de 15,5% sobre o salário bruto')
ON DUPLICATE KEY UPDATE percentual = VALUES(percentual);

-- 1.2 Criar tabela funcoes (cargos/funções dos funcionários)
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

-- 1.3 Adicionar campo funcao_id em usuarios
ALTER TABLE `usuarios`
ADD COLUMN `funcao_id` int(11) NULL AFTER `tipo`;

-- 1.3b Adicionar constraint FOREIGN KEY
ALTER TABLE `usuarios`
ADD CONSTRAINT `fk_usuarios_funcao` FOREIGN KEY (`funcao_id`) REFERENCES `funcoes`(`id`) ON DELETE SET NULL;

-- 1.4 Adicionar campo salario_base_mensal em usuarios
ALTER TABLE `usuarios`
ADD COLUMN `salario_base_mensal` decimal(10,2) DEFAULT NULL AFTER `funcao_id`;

-- 1.5 Adicionar email_encarregado em obras
ALTER TABLE `obras`
ADD COLUMN `email_encarregado` varchar(255) NULL AFTER `email_financeiro`;

-- ============================================
-- FASE 4: CAMPOS PARA MOTOR DE CÁLCULO
-- ============================================

-- 2.1 Adicionar campos em faturamento para cálculo de IGI
ALTER TABLE `faturamento`
ADD COLUMN `igi_percentual` decimal(5,2) DEFAULT 4.50,
ADD COLUMN `igi_valor` decimal(10,2) DEFAULT 0,
ADD COLUMN `total_bruto` decimal(10,2) DEFAULT 0,
ADD COLUMN `total_liquido` decimal(10,2) DEFAULT 0;

-- 2.2 Adicionar campos em folha_pagamento para multiplicadores e CAS
ALTER TABLE `folha_pagamento`
ADD COLUMN `salario_base_hora` decimal(10,2) DEFAULT NULL,
ADD COLUMN `multiplicador_extra` decimal(3,2) DEFAULT 1.40,
ADD COLUMN `multiplicador_noturna` decimal(3,2) DEFAULT 1.60,
ADD COLUMN `cas_funcionario_percentual` decimal(5,2) DEFAULT 6.50,
ADD COLUMN `cas_funcionario_valor` decimal(10,2) DEFAULT 0,
ADD COLUMN `cas_empresa_percentual` decimal(5,2) DEFAULT 15.50,
ADD COLUMN `cas_empresa_valor` decimal(10,2) DEFAULT 0,
ADD COLUMN `vale_moradia` decimal(10,2) DEFAULT 0,
ADD COLUMN `ibf` decimal(10,2) DEFAULT 0,
ADD COLUMN `total_bruto` decimal(10,2) DEFAULT 0,
ADD COLUMN `total_liquido` decimal(10,2) DEFAULT 0,
ADD COLUMN `custo_total_empresa` decimal(10,2) DEFAULT 0;

-- 2.3 Adicionar campo obra_id em folha_pagamento (para dashboard de lucratividade)
ALTER TABLE `folha_pagamento`
ADD COLUMN `obra_id` int(11) NULL AFTER `funcionario_id`;

-- 2.3b Adicionar constraint FOREIGN KEY para obra_id
ALTER TABLE `folha_pagamento`
ADD CONSTRAINT `fk_folha_obra` FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`) ON DELETE SET NULL;

-- ============================================
-- ATUALIZAÇÃO DE DADOS EXISTENTES
-- ============================================

-- Atualizar registros existentes de faturamento com cálculo de IGI
UPDATE `faturamento`
SET
  `total_bruto` = COALESCE(`valor_total_servicos`, `total_normal` + `total_extra` + `total_noturno`, 0),
  `igi_valor` = COALESCE(`valor_total_servicos`, `total_normal` + `total_extra` + `total_noturno`, 0) * 0.045,
  `total_liquido` = COALESCE(`valor_total_servicos`, `total_normal` + `total_extra` + `total_noturno`, 0) * 0.955
WHERE `total_bruto` IS NULL OR `total_bruto` = 0;

-- ============================================
-- FIM DAS MIGRAÇÕES
-- ============================================

COMMIT;

-- ============================================
-- INSTRUÇÕES PÓS-MIGRAÇÃO
-- ============================================
-- 1. Verificar se todas as tabelas foram alteradas corretamente
-- 2. Testar a criação de novos funcionários com função e salário
-- 3. Testar a geração de faturamento e folha de pagamento
-- 4. Verificar se os cálculos de IGI e CAS estão corretos
-- ============================================
