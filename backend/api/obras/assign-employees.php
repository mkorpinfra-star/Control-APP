<?php
/**
 * API: Atribuir funcionários a uma obra
 * POST /api/obras/assign-employees.php
 * MULTI-TENANT: Filtra por empresa_id
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);

if (!$payload || ($payload['tipo'] !== 'admin' && $payload['tipo'] !== 'encarregado')) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// Suportar tanto empresa_id (antigo) quanto tenant_id (novo)
$empresaId = $payload['empresa_id'] ?? $payload['tenant_id'] ?? null;
if (!$empresaId) {
    http_response_code(400);
    echo json_encode(['error' => 'empresa_id/tenant_id ausente no token']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['obra_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'obra_id é obrigatório']);
        exit;
    }

    $obraId = $data['obra_id'];
    $funcionarioIds = isset($data['funcionario_ids']) ? $data['funcionario_ids'] : [];

    $pdo = getConnection();

    // Verificar se a obra pertence à empresa do usuário
    $checkStmt = $pdo->prepare("SELECT id FROM obras WHERE id = ? AND tenant_id = ?");
    $checkStmt->execute([$obraId, $empresaId]);
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Obra não encontrada']);
        exit;
    }

    // Verificar se todos os funcionários pertencem à mesma empresa
    if (!empty($funcionarioIds)) {
        $placeholders = implode(',', array_fill(0, count($funcionarioIds), '?'));
        $checkFuncStmt = $pdo->prepare("
            SELECT COUNT(*) as total
            FROM usuarios
            WHERE id IN ($placeholders) AND tenant_id = ?
        ");
        $checkFuncStmt->execute(array_merge($funcionarioIds, [$empresaId]));
        $validCount = $checkFuncStmt->fetch(PDO::FETCH_ASSOC)['total'];

        if ($validCount !== count($funcionarioIds)) {
            http_response_code(400);
            echo json_encode(['error' => 'Um ou mais funcionários não pertencem à empresa']);
            exit;
        }
    }

    // Remove todas as atribuições atuais desta obra
    $stmt = $pdo->prepare("DELETE FROM funcionario_obra WHERE obra_id = ?");
    $stmt->execute([$obraId]);

    // Adiciona as novas atribuições
    if (!empty($funcionarioIds)) {
        $stmt = $pdo->prepare("INSERT INTO funcionario_obra (funcionario_id, obra_id, ativo) VALUES (?, ?, 1)");
        foreach ($funcionarioIds as $funcId) {
            $stmt->execute([$funcId, $obraId]);
        }
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
