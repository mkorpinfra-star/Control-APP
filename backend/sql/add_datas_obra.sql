-- ============================================
-- ADICIONAR DATAS DE INÍCIO E FIM NAS OBRAS
-- Para controlar período de vigência da obra
-- ============================================

ALTER TABLE `obras`
    ADD COLUMN IF NOT EXISTS `data_inicio` DATE NULL AFTER `endereco`,
    ADD COLUMN IF NOT EXISTS `data_fim` DATE NULL AFTER `data_inicio`,
    ADD COLUMN IF NOT EXISTS `email_financeiro` VARCHAR(255) NULL AFTER `endereco`;

-- Criar índice para consultas por data
CREATE INDEX IF NOT EXISTS `idx_data_inicio` ON `obras`(`data_inicio`);
CREATE INDEX IF NOT EXISTS `idx_data_fim` ON `obras`(`data_fim`);

-- ============================================
-- MIGRATION COMPLETA
-- ============================================
