<?php
/**
 * API: Atribuir funcionários a uma obra
 * POST /api/obras/assign-employees.php
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

    // Remove todas as atribuições atuais
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
