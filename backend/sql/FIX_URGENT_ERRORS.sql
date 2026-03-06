-- ============================================
-- FIX URGENT - EXECUTAR NO PHPMYADMIN
-- ============================================

-- 1. ADD COLUNA BIOMETRIA (se não existir)
ALTER TABLE `usuarios`
ADD COLUMN IF NOT EXISTS `biometria` TINYINT(1) DEFAULT 0 COMMENT 'Se tem biometria cadastrada';

-- 2. ADD COLUNAS FALTANTES EM APONTAMENTOS
ALTER TABLE `apontamentos`
ADD COLUMN IF NOT EXISTS `horas_normais` DECIMAL(10,2) DEFAULT 0 COMMENT 'Horas normais (8-17h)',
ADD COLUMN IF NOT EXISTS `horas_extra` DECIMAL(10,2) DEFAULT 0 COMMENT 'Horas extras (17-22h)',
ADD COLUMN IF NOT EXISTS `horas_noturna` DECIMAL(10,2) DEFAULT 0 COMMENT 'Horas noturnas (22-6h)',
ADD COLUMN IF NOT EXISTS `total_horas` DECIMAL(10,2) DEFAULT 0 COMMENT 'Total de horas';

-- 3. ADD COLUNAS FALTANTES EM FATURAMENTO
ALTER TABLE `faturamento`
ADD COLUMN IF NOT EXISTS `total_horas` DECIMAL(10,2) DEFAULT 0 COMMENT 'Total de horas faturadas';

-- 4. ATUALIZAR FUNCIONÁRIOS SEM BIOMETRIA
UPDATE `usuarios` SET `biometria` = 0 WHERE `biometria` IS NULL;

-- 5. VERIFICAR SE TUDO FOI CRIADO
SELECT 'USUARIOS - Estrutura:' as info;
DESCRIBE `usuarios`;

SELECT 'APONTAMENTOS - Estrutura:' as info;
DESCRIBE `apontamentos`;

SELECT 'FATURAMENTO - Estrutura:' as info;
DESCRIBE `faturamento`;
