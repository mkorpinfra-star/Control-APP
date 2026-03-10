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
    $tenantId = $user['tenant_id'];

    // Ver apontamentos aprovados agrupados por mês e obra
    $stmt = $pdo->prepare("
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
        AND a.tenant_id = :tenant_id
        AND o.tenant_id = :tenant_id
        GROUP BY DATE_FORMAT(a.semana_inicio, '%Y-%m'), a.obra_id, o.nome, o.numero, a.status
        ORDER BY mes DESC, obra_nome
        LIMIT 20
    ");
    $stmt->execute(['tenant_id' => $tenantId]);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ver obras ativas
    $obrasStmt = $pdo->prepare("
        SELECT id, numero, nome, ativa
        FROM obras
        WHERE ativa = 1
        AND tenant_id = :tenant_id
        ORDER BY nome
    ");
    $obrasStmt->execute(['tenant_id' => $tenantId]);
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
