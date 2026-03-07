-- ========================================
-- FIX: Garantir exclusão em cascata quando obra é deletada
-- Todas as tabelas relacionadas devem ter ON DELETE CASCADE
-- ========================================

-- 1. Remover constraint antiga de apontamentos
ALTER TABLE `apontamentos` DROP FOREIGN KEY `fk_apontamentos_obra`;

-- 2. Adicionar constraint com CASCADE
ALTER TABLE `apontamentos`
ADD CONSTRAINT `fk_apontamentos_obra`
FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 3. Verificar funcionario_obra (associação funcionários <-> obras)
-- Se existir constraint, remover e recriar
ALTER TABLE `funcionario_obra` DROP FOREIGN KEY IF EXISTS `funcionario_obra_ibfk_2`;
ALTER TABLE `funcionario_obra` DROP FOREIGN KEY IF EXISTS `fk_funcionario_obra_obra`;

ALTER TABLE `funcionario_obra`
ADD CONSTRAINT `fk_funcionario_obra_obra`
FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 4. Verificar payroll (se existir)
-- Remover constraint antiga se existir
SET @query = (
    SELECT CONCAT('ALTER TABLE `payroll` DROP FOREIGN KEY `', CONSTRAINT_NAME, '`;')
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'payroll'
      AND COLUMN_NAME = 'obra_id'
      AND REFERENCED_TABLE_NAME = 'obras'
    LIMIT 1
);
PREPARE stmt FROM IFNULL(@query, 'SELECT 1');
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar constraint com CASCADE
ALTER TABLE `payroll`
ADD CONSTRAINT `fk_payroll_obra`
FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 5. Verificar billing (se existir)
SET @query2 = (
    SELECT CONCAT('ALTER TABLE `billing` DROP FOREIGN KEY `', CONSTRAINT_NAME, '`;')
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'billing'
      AND COLUMN_NAME = 'obra_id'
      AND REFERENCED_TABLE_NAME = 'obras'
    LIMIT 1
);
PREPARE stmt2 FROM IFNULL(@query2, 'SELECT 1');
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

ALTER TABLE `billing`
ADD CONSTRAINT `fk_billing_obra`
FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- ========================================
-- Verificar constraints aplicadas
-- ========================================
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME = 'obras'
ORDER BY TABLE_NAME;
