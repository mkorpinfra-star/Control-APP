-- ============================================
-- FIX: Adicionar colunas faltantes na tabela clientes
-- ============================================

ALTER TABLE `clientes`
    ADD COLUMN IF NOT EXISTS `nif` VARCHAR(50) NULL AFTER `documento`,
    ADD COLUMN IF NOT EXISTS `email_financeiro` VARCHAR(200) NULL AFTER `email`,
    ADD COLUMN IF NOT EXISTS `endereco` TEXT NULL AFTER `telefone`,
    ADD COLUMN IF NOT EXISTS `pessoa_contato` VARCHAR(200) NULL AFTER `endereco`;
