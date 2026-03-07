-- ========================================
-- ADICIONAR CONFIGURAÇÕES INDIVIDUAIS POR OBRA
-- Faturamento + Impostos + País
-- ========================================

-- 1. Adicionar campo PAÍS
ALTER TABLE `obras`
ADD COLUMN `pais` VARCHAR(100) DEFAULT 'España' COMMENT 'País onde a obra está localizada' AFTER `endereco`,
ADD INDEX `idx_pais` (`pais`);

-- 2. Adicionar campos de FATURAMENTO (valores cobrados do cliente)
ALTER TABLE `obras`
ADD COLUMN `fatura_hora_normal` DECIMAL(10,2) DEFAULT 25.00 COMMENT 'Valor/hora normal cobrado do cliente' AFTER `pais`,
ADD COLUMN `fatura_hora_extra` DECIMAL(10,2) DEFAULT 37.50 COMMENT 'Valor/hora extra cobrado do cliente' AFTER `fatura_hora_normal`,
ADD COLUMN `fatura_hora_noturna` DECIMAL(10,2) DEFAULT 50.00 COMMENT 'Valor/hora noturna cobrado do cliente' AFTER `fatura_hora_extra`;

-- 3. Adicionar campos de MULTIPLICADORES
ALTER TABLE `obras`
ADD COLUMN `multiplicador_extra` DECIMAL(5,2) DEFAULT 1.50 COMMENT 'Multiplicador hora extra (ex: 1.5x)' AFTER `fatura_hora_noturna`,
ADD COLUMN `multiplicador_noturna` DECIMAL(5,2) DEFAULT 2.00 COMMENT 'Multiplicador hora noturna (ex: 2x)' AFTER `multiplicador_extra`;

-- 4. Adicionar campos de IMPOSTOS/TRIBUTAÇÕES (percentuais por país/obra)
ALTER TABLE `obras`
ADD COLUMN `imposto_igi` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'IGI - Imposto Geral Indireto (%)' AFTER `multiplicador_noturna`,
ADD COLUMN `imposto_cas_funcionario` DECIMAL(5,2) DEFAULT 4.70 COMMENT 'CAS Funcionário (%)' AFTER `imposto_igi`,
ADD COLUMN `imposto_cas_empresa` DECIMAL(5,2) DEFAULT 23.60 COMMENT 'CAS Empresa (%)' AFTER `imposto_cas_funcionario`,
ADD COLUMN `imposto_irpc` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'IRPC - Imposto Renda Pessoa Coletiva (%)' AFTER `imposto_cas_empresa`;

-- 5. Verificar estrutura atualizada
DESCRIBE obras;

-- 6. Atualizar obras existentes com valores padrão (opcional)
-- UPDATE obras SET
--     fatura_hora_normal = 25.00,
--     fatura_hora_extra = 37.50,
--     fatura_hora_noturna = 50.00,
--     multiplicador_extra = 1.50,
--     multiplicador_noturna = 2.00,
--     imposto_igi = 0.00,
--     imposto_cas_funcionario = 4.70,
--     imposto_cas_empresa = 23.60,
--     imposto_irpc = 0.00
-- WHERE pais IS NULL OR fatura_hora_normal IS NULL;
