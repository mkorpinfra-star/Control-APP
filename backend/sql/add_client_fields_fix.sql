-- Adicionar campos faltantes na tabela CLIENTES
-- Correção: adicionar TODOS os campos necessários
-- Execução: mysql -u usuario -p banco < backend/sql/add_client_fields_fix.sql
-- OU copiar e executar no phpMyAdmin

-- Adicionar campos que faltam
ALTER TABLE `clientes`
    ADD COLUMN IF NOT EXISTS `nif` VARCHAR(50) NULL AFTER `documento`,
    ADD COLUMN IF NOT EXISTS `endereco` TEXT NULL AFTER `telefone`,
    ADD COLUMN IF NOT EXISTS `pessoa_contato` VARCHAR(255) NULL AFTER `endereco`,
    ADD COLUMN IF NOT EXISTS `email_financeiro` VARCHAR(200) NULL AFTER `pessoa_contato`;

-- Criar índices para busca
CREATE INDEX IF NOT EXISTS `idx_clientes_documento` ON `clientes`(`documento`);
CREATE INDEX IF NOT EXISTS `idx_clientes_nif` ON `clientes`(`nif`);

-- Comentário
ALTER TABLE `clientes` COMMENT = 'Clientes com campos completos: documento, NIF, endereco, pessoa_contato, email_financeiro';

-- Mostrar estrutura final
SHOW COLUMNS FROM `clientes`;
