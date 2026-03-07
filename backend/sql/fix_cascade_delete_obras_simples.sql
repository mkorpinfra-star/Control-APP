-- ========================================
-- FIX: Garantir exclusão em cascata quando obra é deletada
-- Versão simplificada sem information_schema
-- ========================================

-- 1. APONTAMENTOS
ALTER TABLE `apontamentos` DROP FOREIGN KEY `fk_apontamentos_obra`;

ALTER TABLE `apontamentos`
ADD CONSTRAINT `fk_apontamentos_obra`
FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 2. FUNCIONARIO_OBRA (pode dar erro se constraint não existir - ignorar)
-- ALTER TABLE `funcionario_obra` DROP FOREIGN KEY `funcionario_obra_ibfk_2`;

ALTER TABLE `funcionario_obra`
ADD CONSTRAINT `fk_funcionario_obra_obra`
FOREIGN KEY (`obra_id`) REFERENCES `obras`(`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- ========================================
-- PRONTO! Agora ao deletar uma obra, os apontamentos e
-- vínculos de funcionarios serão deletados automaticamente
-- ========================================
