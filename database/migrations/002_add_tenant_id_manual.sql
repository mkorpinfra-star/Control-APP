-- =========================================
-- ADICIONAR tenant_id MANUALMENTE
-- Executar se 001_multi_tenant.sql não adicionou
-- =========================================

-- 1. Verificar se tabelas existem antes de alterar
SET @tables_to_update = 'usuarios,clientes,obras,encarregados,apontamentos,funcoes,faturamento,folha_pagamento,despesas_indiretas,notificacoes,configuracoes,config_fiscal,config_impostos,config_valores,config_valores_faturamento,funcionario_obra,obra_funcionarios';

-- ========================================
-- USUARIOS
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `usuarios` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "usuarios.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- CLIENTES
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clientes' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `clientes` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "clientes.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- OBRAS
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'obras' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `obras` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "obras.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- ENCARREGADOS
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'encarregados' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `encarregados` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "encarregados.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- APONTAMENTOS
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'apontamentos' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `apontamentos` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "apontamentos.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- FUNCOES
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'funcoes' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `funcoes` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "funcoes.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- FATURAMENTO
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'faturamento' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `faturamento` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "faturamento.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- FOLHA_PAGAMENTO
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'folha_pagamento' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `folha_pagamento` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "folha_pagamento.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- DESPESAS_INDIRETAS
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'despesas_indiretas' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `despesas_indiretas` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "despesas_indiretas.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- NOTIFICACOES
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'notificacoes' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `notificacoes` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "notificacoes.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- CONFIGURACOES
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'configuracoes' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `configuracoes` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "configuracoes.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- CONFIG_FISCAL
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'config_fiscal' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `config_fiscal` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "config_fiscal.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- CONFIG_IMPOSTOS
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'config_impostos' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `config_impostos` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "config_impostos.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- CONFIG_VALORES
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'config_valores' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `config_valores` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "config_valores.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- CONFIG_VALORES_FATURAMENTO
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'config_valores_faturamento' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `config_valores_faturamento` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "config_valores_faturamento.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- FUNCIONARIO_OBRA
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'funcionario_obra' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `funcionario_obra` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "funcionario_obra.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- OBRA_FUNCIONARIOS
-- ========================================
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'obra_funcionarios' AND COLUMN_NAME = 'tenant_id');
SET @sql := IF(@exist = 0,
    'ALTER TABLE `obra_funcionarios` ADD COLUMN `tenant_id` INT NOT NULL DEFAULT 1 AFTER `id`, ADD INDEX `idx_tenant_id` (`tenant_id`), ADD FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT',
    'SELECT "obra_funcionarios.tenant_id já existe" as status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================
SELECT '✅ tenant_id adicionado com sucesso!' as resultado;

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME = 'tenant_id'
ORDER BY TABLE_NAME;
