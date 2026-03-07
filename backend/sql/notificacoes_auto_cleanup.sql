-- ══════════════════════════════════════════════════════════════════════════════
-- AUTO-LIMPEZA DE NOTIFICAÇÕES ANTIGAS
-- Sistema inteligente para manter apenas notificações recentes (últimos 30 dias)
-- ══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. STORED PROCEDURE: Limpar notificações antigas
-- ─────────────────────────────────────────────────────────────────────────────

DELIMITER $$

DROP PROCEDURE IF EXISTS limpar_notificacoes_antigas$$

CREATE PROCEDURE limpar_notificacoes_antigas()
BEGIN
    DECLARE rows_deleted INT DEFAULT 0;

    -- Deletar notificações com mais de 30 dias
    DELETE FROM notificacoes
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

    SET rows_deleted = ROW_COUNT();

    -- Log da limpeza (opcional - criar tabela de logs se necessário)
    -- INSERT INTO system_logs (action, details, created_at)
    -- VALUES ('cleanup_notifications', CONCAT('Removidas ', rows_deleted, ' notificações antigas'), NOW());

    SELECT rows_deleted AS notificacoes_removidas;
END$$

DELIMITER ;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. EVENT SCHEDULER: Executar limpeza automaticamente todos os dias às 3h da manhã
-- ─────────────────────────────────────────────────────────────────────────────

-- Habilitar event scheduler (se não estiver ativo)
SET GLOBAL event_scheduler = ON;

-- Criar evento de limpeza diária
DROP EVENT IF EXISTS event_limpar_notificacoes;

CREATE EVENT event_limpar_notificacoes
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 3 HOUR)
DO
    CALL limpar_notificacoes_antigas();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. EXECUÇÃO MANUAL (para testar)
-- ─────────────────────────────────────────────────────────────────────────────

-- Para executar manualmente a limpeza:
-- CALL limpar_notificacoes_antigas();

-- Para verificar se o event scheduler está ativo:
-- SHOW VARIABLES LIKE 'event_scheduler';

-- Para ver todos os eventos agendados:
-- SHOW EVENTS;

-- Para desabilitar a limpeza automática (se necessário):
-- ALTER EVENT event_limpar_notificacoes DISABLE;

-- Para re-habilitar:
-- ALTER EVENT event_limpar_notificacoes ENABLE;

-- ══════════════════════════════════════════════════════════════════════════════
-- RESUMO DO SISTEMA:
-- ══════════════════════════════════════════════════════════════════════════════
-- ✅ Notificações antigas (30+ dias) deletadas automaticamente
-- ✅ Execução diária às 3h da manhã
-- ✅ Não sobrecarrega o banco de dados
-- ✅ Mantém sistema leve e rápido
-- ✅ Procedure pode ser executado manualmente quando necessário
-- ══════════════════════════════════════════════════════════════════════════════
