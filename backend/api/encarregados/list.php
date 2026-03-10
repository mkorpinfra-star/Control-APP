<?php
/**
 * LISTAR ENCARREGADOS - MULTI-TENANT
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../includes/tenant_middleware.php';

$auth = validateTenantAccess();

try {
    $pdo = getConnection();

    $stmt = $pdo->prepare("
        SELECT
            e.id,
            e.nome,
            e.email,
            e.telefone,
            e.passaporte,
            e.ativo,
            e.criado_em,
            COUNT(DISTINCT o.id) as total_obras
        FROM encarregados e
        LEFT JOIN obras o ON o.encarregado_id = e.id AND o.ativa = 1 AND o.tenant_id = e.tenant_id
        WHERE e.tenant_id = ?
        GROUP BY e.id, e.nome, e.email, e.telefone, e.passaporte, e.ativo, e.criado_em
        ORDER BY e.nome
    ");

    $stmt->execute([$auth['tenant_id']]);
    $encarregados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'encarregados' => $encarregados
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar encarregados: ' . $e->getMessage()
    ]);
}
