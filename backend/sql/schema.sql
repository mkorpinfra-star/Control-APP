-- ============================================
-- SISTEMA DE MARCAÇÃO DE PONTO
-- Schema do Banco de Dados MySQL
-- ============================================

-- Configurações do sistema
CREATE TABLE IF NOT EXISTS `configuracoes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `chave` VARCHAR(100) NOT NULL UNIQUE,
    `valor` TEXT,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuários (funcionários e encarregados)
CREATE TABLE IF NOT EXISTS `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `passaporte` VARCHAR(50) NOT NULL UNIQUE,
    `senha_hash` VARCHAR(255) NOT NULL,
    `nome` VARCHAR(200) NOT NULL,
    `email` VARCHAR(200),
    `tipo` ENUM('funcionario', 'encarregado') NOT NULL DEFAULT 'funcionario',
    `encarregado_id` INT NULL,
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_tipo` (`tipo`),
    INDEX `idx_ativo` (`ativo`),
    INDEX `idx_encarregado` (`encarregado_id`),
    FOREIGN KEY (`encarregado_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clientes
CREATE TABLE IF NOT EXISTS `clientes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nome` VARCHAR(200) NOT NULL,
    `documento` VARCHAR(50),
    `email` VARCHAR(200),
    `telefone` VARCHAR(50),
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_ativo` (`ativo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Obras / Projetos
CREATE TABLE IF NOT EXISTS `obras` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `numero` VARCHAR(50) NOT NULL UNIQUE,
    `nome` VARCHAR(200) NOT NULL,
    `cliente_id` INT NULL,
    `encarregado_id` INT NULL,
    `endereco` TEXT,
    `ativa` TINYINT(1) NOT NULL DEFAULT 1,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_ativa` (`ativa`),
    INDEX `idx_cliente` (`cliente_id`),
    INDEX `idx_encarregado` (`encarregado_id`),
    FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`encarregado_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relação Funcionário <-> Obra
CREATE TABLE IF NOT EXISTS `funcionario_obra` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `funcionario_id` INT NOT NULL,
    `obra_id` INT NOT NULL,
    `vinculado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_funcionario_obra` (`funcionario_id`, `obra_id`),
    FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Apontamentos de Horas
CREATE TABLE IF NOT EXISTS `apontamentos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `funcionario_id` INT NOT NULL,
    `obra_id` INT NOT NULL,
    `semana_inicio` DATE NOT NULL COMMENT 'Segunda-feira da semana',
    `horas_diarias` JSON NOT NULL COMMENT '{"mon": 8, "tue": 8, ...}',
    `total_horas` DECIMAL(5,1) GENERATED ALWAYS AS (
        CAST(JSON_UNQUOTE(JSON_EXTRACT(horas_diarias, '$.mon')) AS DECIMAL(5,1)) +
        CAST(JSON_UNQUOTE(JSON_EXTRACT(horas_diarias, '$.tue')) AS DECIMAL(5,1)) +
        CAST(JSON_UNQUOTE(JSON_EXTRACT(horas_diarias, '$.wed')) AS DECIMAL(5,1)) +
        CAST(JSON_UNQUOTE(JSON_EXTRACT(horas_diarias, '$.thu')) AS DECIMAL(5,1)) +
        CAST(JSON_UNQUOTE(JSON_EXTRACT(horas_diarias, '$.fri')) AS DECIMAL(5,1)) +
        CAST(JSON_UNQUOTE(JSON_EXTRACT(horas_diarias, '$.sat')) AS DECIMAL(5,1))
    ) STORED,
    `status` ENUM('rascunho', 'enviado', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'rascunho',
    `observacao_rejeicao` TEXT,
    `enviado_em` DATETIME,
    `aprovado_em` DATETIME,
    `aprovado_por` INT NULL,
    `assinatura_base64` LONGTEXT,
    `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_funcionario_semana_obra` (`funcionario_id`, `obra_id`, `semana_inicio`),
    INDEX `idx_funcionario` (`funcionario_id`),
    INDEX `idx_obra` (`obra_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_semana` (`semana_inicio`),
    FOREIGN KEY (`funcionario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`aprovado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Configurações padrão (SMTP já configurado)
INSERT INTO `configuracoes` (`chave`, `valor`) VALUES
('smtp_host', 'email-ssl.com.br'),
('smtp_port', '465'),
('smtp_user', 'contactes@j2s.ad'),
('smtp_password', 'cassio321Cr#'),
('smtp_from', 'contactes@j2s.ad'),
('email_financeiro', 'contactes@j2s.ad')
ON DUPLICATE KEY UPDATE `chave` = `chave`;

-- Usuários de teste (senha: 123456)
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO `usuarios` (`passaporte`, `senha_hash`, `nome`, `email`, `tipo`) VALUES
('ENC001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Supervisor', 'carlos@j2s.ad', 'encarregado'),
('FUNC001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Juan García', 'juan@j2s.ad', 'funcionario'),
('FUNC002', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria López', 'maria@j2s.ad', 'funcionario')
ON DUPLICATE KEY UPDATE `passaporte` = `passaporte`;

-- Vincular funcionários ao encarregado
UPDATE `usuarios` SET `encarregado_id` = (SELECT id FROM (SELECT id FROM usuarios WHERE tipo = 'encarregado' LIMIT 1) AS t) 
WHERE `tipo` = 'funcionario';

-- Cliente de teste
INSERT INTO `clientes` (`nome`, `documento`, `email`, `telefone`) VALUES
('Construcciones ABC', 'B12345678', 'info@abc.ad', '+376 123 456')
ON DUPLICATE KEY UPDATE `nome` = `nome`;

-- Obras de teste
INSERT INTO `obras` (`numero`, `nome`, `cliente_id`, `encarregado_id`, `endereco`) VALUES
('OB-001', 'Edificio Central', 1, 1, 'Av. Principal, 123'),
('OB-002', 'Residencial Norte', 1, 1, 'Calle Norte, 45')
ON DUPLICATE KEY UPDATE `numero` = `numero`;

-- Vincular funcionários a obras
INSERT INTO `funcionario_obra` (`funcionario_id`, `obra_id`) VALUES
(2, 1), (2, 2), (3, 1)
ON DUPLICATE KEY UPDATE `funcionario_id` = `funcionario_id`;
