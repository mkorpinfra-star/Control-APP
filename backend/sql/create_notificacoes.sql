-- ========================================
-- SISTEMA DE NOTIFICAÇÕES COMPLETO
-- Registra todas as ações do sistema
-- ========================================

CREATE TABLE IF NOT EXISTS `notificacoes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tipo` VARCHAR(50) NOT NULL COMMENT 'obra_criada, funcionario_criado, cliente_criado, apontamento_aprovado, etc',
    `titulo` VARCHAR(255) NOT NULL,
    `mensagem` TEXT NOT NULL,
    `icone` VARCHAR(50) DEFAULT 'bell' COMMENT 'lucide icon name',
    `cor` VARCHAR(20) DEFAULT 'gray' COMMENT 'blue, green, red, orange, etc',

    -- Navegação
    `url` VARCHAR(255) NULL COMMENT 'URL para onde navegar ao clicar',
    `entidade_tipo` VARCHAR(50) NULL COMMENT 'obra, cliente, funcionario, apontamento, etc',
    `entidade_id` INT NULL COMMENT 'ID da entidade relacionada',

    -- Quem criou a ação
    `usuario_id` INT NULL,
    `usuario_nome` VARCHAR(255) NULL,
    `usuario_tipo` VARCHAR(50) NULL COMMENT 'admin, encarregado, funcionario',

    -- Status
    `lida` TINYINT(1) DEFAULT 0,
    `data_leitura` DATETIME NULL,

    -- Timestamps
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_lida` (`lida`),
    INDEX `idx_tipo` (`tipo`),
    INDEX `idx_created` (`created_at`),
    INDEX `idx_entidade` (`entidade_tipo`, `entidade_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TIPOS DE NOTIFICAÇÕES
-- ========================================
-- obra_criada, obra_editada, obra_finalizada
-- cliente_criado, cliente_editado
-- funcionario_criado, funcionario_editado
-- encarregado_criado, encarregado_editado
-- apontamento_submetido, apontamento_aprovado, apontamento_rejeitado
-- payroll_gerado, billing_gerado
-- funcionario_vinculado_obra, funcionario_desvinculado_obra
-- ========================================

-- Exemplo de notificação
INSERT INTO `notificacoes` (tipo, titulo, mensagem, icone, cor, url, entidade_tipo, entidade_id, usuario_nome, usuario_tipo)
VALUES (
    'obra_criada',
    'Nueva obra creada',
    'Obra #20260503 - CREAND BANK fue creada',
    'briefcase',
    'blue',
    '/projects',
    'obra',
    18,
    'Admin User',
    'admin'
);
