<?php
/**
 * DEBUG - Ver todos os apontamentos disponíveis
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

try {
    $user = authMiddleware(['admin']);
    $pdo = getConnection();

    // Ver apontamentos aprovados agrupados por mês e obra
    $stmt = $pdo->query("
        SELECT
            DATE_FORMAT(a.semana_inicio, '%Y-%m') as mes,
            a.obra_id,
            o.nome as obra_nome,
            o.numero as obra_numero,
            a.status,
            COUNT(*) as total_apontamentos,
            COUNT(DISTINCT a.funcionario_id) as total_funcionarios
        FROM apontamentos a
        INNER JOIN obras o ON o.id = a.obra_id
        WHERE a.status IN ('aprovado', 'aprovado_encarregado')
        GROUP BY DATE_FORMAT(a.semana_inicio, '%Y-%m'), a.obra_id, o.nome, o.numero, a.status
        ORDER BY mes DESC, obra_nome
        LIMIT 20
    ");
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ver obras ativas
    $obrasStmt = $pdo->query("
        SELECT id, numero, nome, ativa
        FROM obras
        WHERE ativa = 1
        ORDER BY nome
    ");
    $obras = $obrasStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'debug' => 'Apontamentos aprovados disponíveis',
        'apontamentos_por_mes_obra' => $apontamentos,
        'obras_ativas' => $obras,
        'total_grupos' => count($apontamentos)
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
