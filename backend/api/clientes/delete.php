<?php
/**
 * API: Deletar Cliente
 * DELETE /api/clientes/delete.php
 * Multi-tenant enabled
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/tenant_middleware.php';

$auth = validateTenantAccess();
requireAdmin($auth);

$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID es obligatorio']);
    exit;
}

try {
    $pdo = getConnection();

    // Soft delete - apenas desativa (com filtro por tenant_id)
    $stmt = $pdo->prepare("UPDATE clientes SET ativo = 0 WHERE id = ? AND tenant_id = ?");
    $stmt->execute([$id, $auth['tenant_id']]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Cliente não encontrado ou sem permissão']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Cliente eliminado'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
