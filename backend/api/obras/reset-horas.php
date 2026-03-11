<?php
/**
 * API: Resetar horas de uma obra
 * POST /api/obras/reset-horas.php
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
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid token']);
    exit;
}

$tenant_id = $payload['tenant_id'] ?? $payload['empresa_id'] ?? null;
if (!$tenant_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'tenant_id ausente no token']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['obra_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'obra_id é obrigatório']);
        exit;
    }

    $obra_id = (int)$data['obra_id'];
    $funcionario_id = isset($data['funcionario_id']) && $data['funcionario_id'] !== 'all' ? (int)$data['funcionario_id'] : null;

    $pdo = getConnection();

    // Verificar se a obra pertence ao tenant
    $stmt = $pdo->prepare("SELECT id FROM obras WHERE id = ? AND tenant_id = ?");
    $stmt->execute([$obra_id, $tenant_id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Obra não encontrada']);
        exit;
    }

    if ($funcionario_id) {
        // Resetar apenas de um funcionário específico nesta obra
        $stmt = $pdo->prepare("
            DELETE FROM apontamentos
            WHERE obra_id = ? AND funcionario_id = ? AND tenant_id = ?
        ");
        $stmt->execute([$obra_id, $funcionario_id, $tenant_id]);
        $count = $stmt->rowCount();

        echo json_encode([
            'success' => true,
            'message' => "Se eliminaron {$count} registro(s) de horas del funcionario en esta obra",
            'count' => $count
        ]);
    } else {
        // Resetar de TODOS os funcionários nesta obra
        $stmt = $pdo->prepare("
            DELETE FROM apontamentos
            WHERE obra_id = ? AND tenant_id = ?
        ");
        $stmt->execute([$obra_id, $tenant_id]);
        $count = $stmt->rowCount();

        echo json_encode([
            'success' => true,
            'message' => "Se eliminaron {$count} registro(s) de horas de todos los funcionarios en esta obra",
            'count' => $count
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}
