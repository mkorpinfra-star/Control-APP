<?php
/**
 * API: Atualizar FCM Token do Usuário
 * POST /api/usuarios/update-fcm-token.php
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

if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

$tenant_id = $payload['empresa_id'] ?? $payload['tenant_id'] ?? null;
$user_id = $payload['user_id'] ?? $payload['id'] ?? null;

if (!$tenant_id || !$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'tenant_id/user_id ausente no token']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$fcm_token = isset($input['fcm_token']) ? trim($input['fcm_token']) : null;

if (empty($fcm_token)) {
    http_response_code(400);
    echo json_encode(['error' => 'fcm_token obrigatório']);
    exit;
}

try {
    $pdo = getConnection();

    $stmt = $pdo->prepare("
        UPDATE usuarios
        SET fcm_token = ?
        WHERE id = ? AND tenant_id = ?
    ");
    $stmt->execute([$fcm_token, $user_id, $tenant_id]);

    echo json_encode([
        'success' => true,
        'message' => 'FCM token atualizado com sucesso'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
