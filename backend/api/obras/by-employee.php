<?php
/**
 * API: Obter obras do funcionário
 * GET /api/obras/by-employee.php?funcionario_id=X
 * MULTI-TENANT: Filtra por empresa_id
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';

$user = requireAuth();

$empresaId = $user['empresa_id'] ?? null;
if (!$empresaId) {
    http_response_code(400);
    echo json_encode(['error' => 'empresa_id ausente no token']);
    exit;
}

$funcionarioId = $_GET['funcionario_id'] ?? $user['id'];

// Se for funcionário, só pode ver suas próprias obras
if ($user['tipo'] === 'funcionario' && $funcionarioId != $user['id']) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// Verificar se o funcionário pertence à mesma empresa
$pdo = getConnection();
$checkStmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ? AND empresa_id = ?");
$checkStmt->execute([$funcionarioId, $empresaId]);
if (!$checkStmt->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'Funcionário não encontrado']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT o.id, o.numero, o.nome, o.endereco, o.ativa, o.data_inicio, o.data_fim,
               c.nome as cliente_nome,
               e.nome as encarregado_nome
        FROM obras o
        INNER JOIN funcionario_obra fo ON fo.obra_id = o.id
        LEFT JOIN clientes c ON c.id = o.cliente_id AND c.empresa_id = ?
        LEFT JOIN encarregados e ON e.id = o.encarregado_id AND e.empresa_id = ?
        WHERE fo.funcionario_id = ?
          AND o.empresa_id = ?
          AND (o.ativa = 1 OR o.ativo = 1)
        ORDER BY o.numero
    ");
    $stmt->execute([$empresaId, $empresaId, $funcionarioId, $empresaId]);
    $obras = $stmt->fetchAll();

    echo json_encode(['success' => true, 'obras' => $obras]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
