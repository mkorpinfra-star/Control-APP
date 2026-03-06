<?php
/**
 * API: Deletar (desativar) Usuário
 * DELETE /api/usuarios/delete.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
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

if (!$payload || $payload['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden - Only admin']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    // Não permitir auto-exclusão
    if ($data['id'] == $payload['id']) {
        http_response_code(400);
        echo json_encode(['error' => 'Não é possível deletar o próprio usuário']);
        exit;
    }

    $pdo = getConnection();

    // VERIFICAR SE TEM APONTAMENTOS - PRESERVAR HISTÓRICO
    $checkStmt = $pdo->prepare("SELECT COUNT(*) as total FROM apontamentos WHERE funcionario_id = ?");
    $checkStmt->execute([$data['id']]);
    $apontamentosCount = $checkStmt->fetch(PDO::FETCH_ASSOC)['total'];

    if ($apontamentosCount > 0) {
        http_response_code(400);
        echo json_encode([
            'error' => 'No se puede desactivar este empleado',
            'message' => "Este empleado tiene {$apontamentosCount} registros de horas en el sistema. Los datos históricos deben ser preservados. Si necesita removerlo, contacte al administrador del sistema."
        ]);
        exit;
    }

    // Soft delete - apenas se não tiver apontamentos
    $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 0 WHERE id = ?");
    $stmt->execute([$data['id']]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
