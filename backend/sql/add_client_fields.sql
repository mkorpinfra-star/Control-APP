-- Adicionar campos faltantes na tabela CLIENTES
-- Execução: mysql -u usuario -p banco < backend/sql/add_client_fields.sql
-- OU copiar e executar no phpMyAdmin

ALTER TABLE `clientes`
    ADD COLUMN IF NOT EXISTS `nif` VARCHAR(50) NULL AFTER `documento`,
    ADD COLUMN IF NOT EXISTS `pessoa_contato` VARCHAR(255) NULL AFTER `endereco`;

-- Criar índices para busca
CREATE INDEX IF NOT EXISTS `idx_clientes_documento` ON `clientes`(`documento`);
CREATE INDEX IF NOT EXISTS `idx_clientes_nif` ON `clientes`(`nif`);

-- Comentários
ALTER TABLE `clientes` COMMENT = 'Clientes com campos completos: documento, NIF, endereco, pessoa_contato';
