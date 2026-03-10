-- =========================================
-- PUNTOCLICKS MULTI-TENANT MIGRATION
-- Transforma banco atual em multi-tenant
-- Data: 2026-03-09
-- =========================================

-- ========================================
-- 1. CRIAR TABELA DE TENANTS (CLIENTES)
-- ========================================
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(200) NOT NULL COMMENT 'Nome da empresa cliente',
  `slug` VARCHAR(50) UNIQUE NOT NULL COMMENT 'Subdomínio (j2s, cliente2...)',
  `razao_social` VARCHAR(255) DEFAULT NULL,
  `cnpj` VARCHAR(20) DEFAULT NULL,

  -- Branding
  `logo_url` VARCHAR(500) DEFAULT NULL COMMENT 'URL da logo do cliente',
  `primary_color` VARCHAR(7) DEFAULT '#CE0201',
  `secondary_color` VARCHAR(7) DEFAULT '#A00101',
  `favicon_url` VARCHAR(500) DEFAULT NULL,

  -- Licenciamento
  `license_key` VARCHAR(100) UNIQUE NOT NULL,
  `license_type` ENUM('trial', 'starter', 'professional', 'enterprise') DEFAULT 'trial',
  `license_expires_at` DATE DEFAULT NULL,
  `max_users` INT DEFAULT 10,
  `max_projects` INT DEFAULT 5,

  -- Status
  `status` ENUM('ativo', 'suspenso', 'cancelado', 'trial') DEFAULT 'trial',
  `trial_ends_at` DATE DEFAULT NULL,

  -- Contato
  `admin_name` VARCHAR(200) DEFAULT NULL,
  `admin_email` VARCHAR(200) NOT NULL,
  `admin_phone` VARCHAR(50) DEFAULT NULL,

  -- Configurações
  `timezone` VARCHAR(50) DEFAULT 'Europe/Madrid',
  `locale` VARCHAR(10) DEFAULT 'es_ES',
  `currency` VARCHAR(3) DEFAULT 'EUR',

  -- Metadata
  `custom_domain` VARCHAR(255) DEFAULT NULL COMMENT 'Domínio customizado (opcional)',
  `onboarding_completed` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,

  INDEX `idx_slug` (`slug`),
  INDEX `idx_status` (`status`),
  INDEX `idx_license_key` (`license_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 2. INSERIR J2S COMO PRIMEIRO TENANT
-- ========================================
-- Usar INSERT IGNORE para evitar erro se já existir
INSERT IGNORE INTO `tenants` (
  `id`,
  `nome`,
  `slug`,
  `razao_social`,
  `admin_name`,
  `admin_email`,
  `logo_url`,
  `primary_color`,
  `license_key`,
  `license_type`,
  `status`,
  `max_users`,
  `max_projects`,
  `onboarding_completed`
) VALUES (
  1,
  'J2S Construções',
  'j2s',
  'J2S Construções e Obras Ltda',
  'Administrador J2S',
  'admin@j2s.ad',
  '/tenants/j2s/logo.png',
  '#CE0201',
  'PK-J2S-2026-PILOT-001',
  'enterprise',
  'ativo',
  999,
  999,
  TRUE
);

-- Se já existir, atualizar para garantir configurações corretas
UPDATE `tenants` SET
  `nome` = 'J2S Construções',
  `slug` = 'j2s',
  `razao_social` = 'J2S Construções e Obras Ltda',
  `admin_name` = 'Administrador J2S',
  `admin_email` = 'admin@j2s.ad',
  `logo_url` = '/tenants/j2s/logo.png',
  `primary_color` = '#CE0201',
  `license_key` = 'PK-J2S-2026-PILOT-001',
  `license_type` = 'enterprise',
  `status` = 'ativo',
  `max_users` = 999,
  `max_projects` = 999,
  `onboarding_completed` = TRUE
WHERE `id` = 1;

-- ========================================
-- 3. ADICIONAR tenant_id EM TODAS TABELAS
-- ========================================

-- Helper para adicionar coluna apenas se não existir
DELIMITER $$

CREATE PROCEDURE add_tenant_id_if_not_exists(
  IN table_name VARCHAR(64)
)
BEGIN
  DECLARE column_exists INT;

  SELECT COUNT(*) INTO column_exists
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = table_name
    AND COLUMN_NAME = 'tenant_id';

  IF column_exists = 0 THEN
    SET @sql = CONCAT('ALTER TABLE `', table_name, '` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @sql = CONCAT('ALTER TABLE `', table_name, '` ADD INDEX `idx_tenant_id` (`tenant_id`)');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @sql = CONCAT('ALTER TABLE `', table_name, '` ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

-- Aplicar em todas as tabelas principais
CALL add_tenant_id_if_not_exists('usuarios');
CALL add_tenant_id_if_not_exists('clientes');
CALL add_tenant_id_if_not_exists('obras');
CALL add_tenant_id_if_not_exists('encarregados');
CALL add_tenant_id_if_not_exists('apontamentos');
CALL add_tenant_id_if_not_exists('funcoes');
CALL add_tenant_id_if_not_exists('faturamento');
CALL add_tenant_id_if_not_exists('folha_pagamento');
CALL add_tenant_id_if_not_exists('despesas_indiretas');
CALL add_tenant_id_if_not_exists('notificacoes');
CALL add_tenant_id_if_not_exists('configuracoes');
CALL add_tenant_id_if_not_exists('config_fiscal');
CALL add_tenant_id_if_not_exists('config_impostos');
CALL add_tenant_id_if_not_exists('config_valores');
CALL add_tenant_id_if_not_exists('config_valores_faturamento');
CALL add_tenant_id_if_not_exists('funcionario_obra');
CALL add_tenant_id_if_not_exists('obra_funcionarios');

-- Limpar procedure helper
DROP PROCEDURE IF EXISTS add_tenant_id_if_not_exists;

-- ========================================
-- 4. ATUALIZAR DADOS EXISTENTES PARA J2S
-- ========================================
UPDATE `usuarios` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `clientes` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `obras` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `encarregados` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `apontamentos` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `funcoes` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `faturamento` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `folha_pagamento` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `despesas_indiretas` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `notificacoes` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `configuracoes` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `config_fiscal` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `config_impostos` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `config_valores` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `config_valores_faturamento` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `funcionario_obra` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;
UPDATE `obra_funcionarios` SET `tenant_id` = 1 WHERE `tenant_id` IS NULL OR `tenant_id` = 0;

-- ========================================
-- 5. CRIAR ÍNDICES COMPOSTOS PARA PERFORMANCE
-- ========================================
-- Queries sempre filtram por tenant_id primeiro
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND INDEX_NAME = 'idx_tenant_email');
SET @sql := IF(@exist = 0, 'ALTER TABLE `usuarios` ADD INDEX `idx_tenant_email` (`tenant_id`, `email`)', 'SELECT "Index idx_tenant_email already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'obras' AND INDEX_NAME = 'idx_tenant_numero');
SET @sql := IF(@exist = 0, 'ALTER TABLE `obras` ADD INDEX `idx_tenant_numero` (`tenant_id`, `numero`)', 'SELECT "Index idx_tenant_numero already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'apontamentos' AND INDEX_NAME = 'idx_tenant_status');
SET @sql := IF(@exist = 0, 'ALTER TABLE `apontamentos` ADD INDEX `idx_tenant_status` (`tenant_id`, `status`)', 'SELECT "Index idx_tenant_status already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'apontamentos' AND INDEX_NAME = 'idx_tenant_semana');
SET @sql := IF(@exist = 0, 'ALTER TABLE `apontamentos` ADD INDEX `idx_tenant_semana` (`tenant_id`, `semana_inicio`)', 'SELECT "Index idx_tenant_semana already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 6. CRIAR VIEWS PARA ANALYTICS POR TENANT
-- ========================================
CREATE OR REPLACE VIEW `vw_tenant_stats` AS
SELECT
  t.id AS tenant_id,
  t.nome AS tenant_nome,
  t.slug,
  t.status,
  COUNT(DISTINCT u.id) AS total_usuarios,
  COUNT(DISTINCT o.id) AS total_obras,
  COUNT(DISTINCT a.id) AS total_apontamentos,
  SUM(CASE WHEN u.tipo = 'funcionario' THEN 1 ELSE 0 END) AS total_funcionarios,
  t.created_at AS cliente_desde
FROM tenants t
LEFT JOIN usuarios u ON u.tenant_id = t.id AND u.ativo = 1
LEFT JOIN obras o ON o.tenant_id = t.id AND o.ativa = 1
LEFT JOIN apontamentos a ON a.tenant_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id;

-- ========================================
-- 7. STORED PROCEDURES PARA GESTÃO DE TENANTS
-- ========================================

DELIMITER $$

-- Procedure: Criar novo tenant
CREATE PROCEDURE `sp_create_tenant`(
  IN p_nome VARCHAR(200),
  IN p_slug VARCHAR(50),
  IN p_logo_url VARCHAR(500),
  IN p_primary_color VARCHAR(7),
  IN p_admin_email VARCHAR(200),
  IN p_admin_name VARCHAR(200),
  IN p_admin_senha VARCHAR(255),
  OUT p_tenant_id INT,
  OUT p_admin_id INT,
  OUT p_license_key VARCHAR(100)
)
BEGIN
  DECLARE v_license VARCHAR(100);

  -- Gerar license key única
  SET v_license = CONCAT('PK-', UPPER(p_slug), '-', YEAR(NOW()), '-', UPPER(SUBSTRING(MD5(RAND()), 1, 8)));

  -- Inserir tenant
  INSERT INTO tenants (
    nome, slug, logo_url, primary_color,
    admin_email, admin_name,
    license_key, status, trial_ends_at,
    max_users, max_projects
  )
  VALUES (
    p_nome, p_slug, p_logo_url, IFNULL(p_primary_color, '#CE0201'),
    p_admin_email, p_admin_name,
    v_license, 'trial', DATE_ADD(CURDATE(), INTERVAL 14 DAY),
    10, 5
  );

  SET p_tenant_id = LAST_INSERT_ID();
  SET p_license_key = v_license;

  -- Criar usuário admin do tenant com senha hash
  INSERT INTO usuarios (tenant_id, nome, email, passaporte, tipo, senha_hash, ativo)
  VALUES (
    p_tenant_id,
    p_admin_name,
    p_admin_email,
    p_admin_email, -- passaporte inicial = email
    'admin',
    p_admin_senha, -- deve vir já hasheado do backend
    1
  );

  SET p_admin_id = LAST_INSERT_ID();

END$$

-- Procedure: Suspender tenant
CREATE PROCEDURE `sp_suspend_tenant`(IN p_tenant_id INT)
BEGIN
  UPDATE tenants SET status = 'suspenso' WHERE id = p_tenant_id;
END$$

-- Procedure: Reativar tenant
CREATE PROCEDURE `sp_activate_tenant`(IN p_tenant_id INT)
BEGIN
  UPDATE tenants SET status = 'ativo' WHERE id = p_tenant_id;
END$$

DELIMITER ;

-- ========================================
-- 8. TRIGGERS PARA AUDITORIA
-- ========================================

DELIMITER $$

CREATE TRIGGER `trg_tenant_status_change`
AFTER UPDATE ON `tenants`
FOR EACH ROW
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO notificacoes (tenant_id, tipo, titulo, mensagem, created_at)
    VALUES (
      NEW.id,
      'system',
      'Status da Conta Alterado',
      CONCAT('Status alterado de ', OLD.status, ' para ', NEW.status),
      NOW()
    );
  END IF;
END$$

DELIMITER ;

-- ========================================
-- MIGRATION COMPLETA ✅
-- J2S agora é tenant_id = 1
-- Pronto para adicionar novos clientes!
-- ========================================
