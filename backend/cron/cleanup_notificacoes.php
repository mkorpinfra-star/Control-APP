<?php
/**
 * CRON JOB: Auto-limpeza de notificações antigas
 *
 * Este script deleta notificações com mais de 30 dias automaticamente.
 *
 * CONFIGURAÇÃO NO CRONTAB:
 * Adicionar a seguinte linha no crontab do servidor (executa diariamente às 3h):
 * 0 3 * * * /usr/bin/php /caminho/completo/backend/cron/cleanup_notificacoes.php >> /var/log/cleanup_notificacoes.log 2>&1
 *
 * OU executar manualmente:
 * php /caminho/completo/backend/cron/cleanup_notificacoes.php
 */

// Definir diretório base
$baseDir = dirname(__DIR__);

// Incluir configuração do banco de dados
require_once $baseDir . '/config/database.php';

// Log de início
echo "[" . date('Y-m-d H:i:s') . "] Iniciando limpeza de notificações antigas...\n";

try {
    $pdo = getConnection();

    // Executar stored procedure
    $stmt = $pdo->query("CALL limpar_notificacoes_antigas()");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // Log de sucesso
    $removed = $result['notificacoes_removidas'] ?? 0;
    echo "[" . date('Y-m-d H:i:s') . "] ✅ Limpeza concluída com sucesso!\n";
    echo "[" . date('Y-m-d H:i:s') . "] 🗑️  {$removed} notificações antigas removidas\n";

    // Se removeu notificações, logar mais detalhes
    if ($removed > 0) {
        echo "[" . date('Y-m-d H:i:s') . "] 💾 Espaço liberado no banco de dados\n";
    } else {
        echo "[" . date('Y-m-d H:i:s') . "] ℹ️  Nenhuma notificação antiga encontrada (< 30 dias)\n";
    }

} catch (PDOException $e) {
    // Log de erro
    echo "[" . date('Y-m-d H:i:s') . "] ❌ Erro ao executar limpeza: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    // Erro genérico
    echo "[" . date('Y-m-d H:i:s') . "] ❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}

echo "[" . date('Y-m-d H:i:s') . "] Processo finalizado.\n";
exit(0);
