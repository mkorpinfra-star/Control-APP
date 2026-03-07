-- ══════════════════════════════════════════════════════════════════════════════
-- AUTO-LIMPEZA DE NOTIFICAÇÕES ANTIGAS - VERSÃO SEM PRIVILÉGIO SUPER
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

    SELECT rows_deleted AS notificacoes_removidas;
END$$

DELIMITER ;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. EVENT SCHEDULER (apenas se você tiver privilégios)
-- ─────────────────────────────────────────────────────────────────────────────

-- ⚠️ ATENÇÃO: Se der erro de privilégio SUPER, pule esta parte!
-- Você pode executar manualmente ou via cronjob externo

-- Criar evento de limpeza diária (OPCIONAL)
DROP EVENT IF EXISTS event_limpar_notificacoes;

CREATE EVENT IF NOT EXISTS event_limpar_notificacoes
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 3 HOUR)
DO
    CALL limpar_notificacoes_antigas();

-- ══════════════════════════════════════════════════════════════════════════════
-- ALTERNATIVA: EXECUTAR MANUALMENTE VIA CRON JOB
-- ══════════════════════════════════════════════════════════════════════════════

-- Se você não tem privilégio SUPER, crie um arquivo PHP e agende via cron:

-- Arquivo: backend/cron/cleanup_notificacoes.php
-- Conteúdo:
/*
<?php
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getConnection();
    $stmt = $pdo->query("CALL limpar_notificacoes_antigas()");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo date('Y-m-d H:i:s') . " - Limpeza executada: {$result['notificacoes_removidas']} notificações removidas\n";
} catch (Exception $e) {
    echo date('Y-m-d H:i:s') . " - Erro: " . $e->getMessage() . "\n";
}
?>
*/

-- Depois adicione no crontab do servidor:
-- 0 3 * * * /usr/bin/php /caminho/para/backend/cron/cleanup_notificacoes.php >> /var/log/cleanup_notificacoes.log 2>&1

-- ══════════════════════════════════════════════════════════════════════════════
-- EXECUÇÃO MANUAL (funciona SEMPRE, sem privilégios especiais)
-- ══════════════════════════════════════════════════════════════════════════════

-- Para executar manualmente a limpeza:
-- CALL limpar_notificacoes_antigas();

-- ══════════════════════════════════════════════════════════════════════════════
-- RESUMO:
-- ══════════════════════════════════════════════════════════════════════════════
-- ✅ Stored Procedure criado com sucesso
-- ⚠️ Event Scheduler requer privilégio SUPER (se der erro, ignorar)
-- ✅ Alternativa: executar manualmente ou via cron job PHP
-- ✅ Sistema não vai infestar o banco de dados
-- ══════════════════════════════════════════════════════════════════════════════
