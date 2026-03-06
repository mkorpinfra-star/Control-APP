-- ============================================
-- MIGRATION COMPLETA v3
-- Corrige e atualiza schema para versão atual
-- ============================================

-- 1. ALTERAR ENUM de tipo de usuário para incluir 'admin'
ALTER TABLE `usuarios`
MODIFY COLUMN `tipo` ENUM('funcionario', 'encarregado', 'admin') NOT NULL DEFAULT 'funcionario';

-- 2. ADICIONAR campo foto_url para funcionários e encarregados + biometria
ALTER TABLE `usuarios`
ADD COLUMN IF NOT EXISTS `foto_url` VARCHAR(500) NULL AFTER `email`,
ADD COLUMN IF NOT EXISTS `telefone` VARCHAR(50) NULL AFTER `email`,
ADD COLUMN IF NOT EXISTS `funcao` VARCHAR(100) NULL AFTER `email`,
ADD COLUMN IF NOT EXISTS `biometria_credential_id` TEXT NULL AFTER `foto_url`,
ADD COLUMN IF NOT EXISTS `biometria_public_key` TEXT NULL AFTER `biometria_credential_id`,
ADD COLUMN IF NOT EXISTS `biometria_cadastrada` TINYINT(1) DEFAULT 0 AFTER `biometria_public_key`;

-- 3. ADICIONAR email_financeiro na tabela obras (se não existir)
ALTER TABLE `obras`
ADD COLUMN IF NOT EXISTS `email_financeiro` VARCHAR(200) NULL AFTER `encarregado_id`;

-- 4. ADICIONAR email_financeiro na tabela clientes (se não existir)
ALTER TABLE `clientes`
ADD COLUMN IF NOT EXISTS `email_financeiro` VARCHAR(200) NULL AFTER `email`;

-- 5. ATUALIZAR enum de status para incluir 'aprovado_encarregado'
ALTER TABLE `apontamentos`
MODIFY COLUMN `status` ENUM('rascunho', 'enviado', 'aprovado_encarregado', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'rascunho';

-- 6. ADICIONAR campos para dupla aprovação
ALTER TABLE `apontamentos`
ADD COLUMN IF NOT EXISTS `aprovado_admin_em` DATETIME NULL AFTER `aprovado_em`,
ADD COLUMN IF NOT EXISTS `aprovado_admin_por` INT NULL AFTER `aprovado_por`,
ADD COLUMN IF NOT EXISTS `assinatura_admin_base64` LONGTEXT NULL AFTER `assinatura_base64`;

-- 7. REMOVER coluna total_horas gerada (não funciona com novo formato JSON)
-- Em vez disso, vamos usar uma coluna virtual mais simples
ALTER TABLE `apontamentos` DROP COLUMN IF EXISTS `total_horas`;

-- 8. ADICIONAR campo total_horas como DECIMAL normal (calculado no backend)
ALTER TABLE `apontamentos`
ADD COLUMN IF NOT EXISTS `total_horas` DECIMAL(6,2) NULL DEFAULT 0 AFTER `horas_diarias`;

-- 9. CRIAR índices adicionais para performance
ALTER TABLE `apontamentos`
ADD INDEX IF NOT EXISTS `idx_aprovado_admin_por` (`aprovado_admin_por`);

ALTER TABLE `usuarios`
ADD INDEX IF NOT EXISTS `idx_passaporte` (`passaporte`);

-- 10. ADICIONAR Foreign Key para aprovação admin (se não existir)
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_NAME = 'fk_aprovado_admin_por'
    AND TABLE_NAME = 'apontamentos'
    AND TABLE_SCHEMA = DATABASE()
);

SET @sql = IF(@constraint_exists = 0,
    'ALTER TABLE `apontamentos` ADD CONSTRAINT `fk_aprovado_admin_por` FOREIGN KEY (`aprovado_admin_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL',
    'SELECT "Constraint já existe" as status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 11. CRIAR tabela de configuração de valores (se não existir)
CREATE TABLE IF NOT EXISTS `config_valores` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `valor_hora_normal` DECIMAL(10,2) NOT NULL DEFAULT 21.00,
    `valor_hora_extra` DECIMAL(10,2) NOT NULL DEFAULT 28.00,
    `valor_hora_noturna` DECIMAL(10,2) NOT NULL DEFAULT 30.00,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. INSERIR valores padrão na config_valores
INSERT INTO `config_valores` (`valor_hora_normal`, `valor_hora_extra`, `valor_hora_noturna`)
VALUES (21.00, 28.00, 30.00)
ON DUPLICATE KEY UPDATE `id` = `id`;

-- 13. ATUALIZAR configurações existentes com novos emails
INSERT INTO `configuracoes` (`chave`, `valor`) VALUES
('email_admin', 'contactes@j2s.ad'),
('email_j2s', 'contactes@j2s.ad')
ON DUPLICATE KEY UPDATE `chave` = `chave`;

-- ============================================
-- FIM DA MIGRATION
-- ============================================

SELECT 'Migration v3 concluída com sucesso!' as status;
