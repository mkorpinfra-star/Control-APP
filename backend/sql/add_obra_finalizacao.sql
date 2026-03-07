-- ========================================
-- SISTEMA DE FINALIZAÇÃO DE OBRAS
-- Adiciona campo para marcar obra como finalizada manualmente
-- ========================================

-- Adicionar coluna de status/finalização
ALTER TABLE `obras`
ADD COLUMN `finalizada` TINYINT(1) DEFAULT 0 COMMENT 'Obra finalizada pelo admin (0=ativa, 1=finalizada)',
ADD COLUMN `data_finalizacao` DATE NULL COMMENT 'Data em que a obra foi marcada como finalizada',
ADD COLUMN `finalizada_por` INT NULL COMMENT 'ID do usuário que finalizou',
ADD INDEX `idx_finalizada` (`finalizada`);

-- ========================================
-- FUTURO: Endpoint para finalizar obra
-- POST /obras/finalizar.php { obra_id: X }
-- ========================================
-- Vai setar:
-- - finalizada = 1
-- - data_finalizacao = hoje
-- - finalizada_por = user_id
--
-- E pedir confirmação se data_fim ainda não passou
-- ========================================
