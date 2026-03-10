<?php
/**
 * API: Deletar (desativar) Usuário
 * DELETE /api/usuarios/delete.php
 * MULTI-TENANT: Isolado por tenant_id
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
require_once __DIR__ . '/../../includes/tenant_middleware.php';

// Validar acesso multi-tenant e permissão de admin
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id'];
requireAdmin($auth);

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    // Não permitir auto-exclusão
    if ($data['id'] == $auth['user_id']) {
        http_response_code(400);
        echo json_encode(['error' => 'Não é possível deletar o próprio usuário']);
        exit;
    }

    $pdo = getConnection();

    // Verificar se usuário pertence ao tenant
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ? AND tenant_id = ?");
    $stmt->execute([$data['id'], $tenant_id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuário não encontrado ou não pertence a este tenant']);
        exit;
    }

    // VERIFICAR SE TEM APONTAMENTOS - PRESERVAR HISTÓRICO (filtrado por tenant)
    $checkStmt = $pdo->prepare("SELECT COUNT(*) as total FROM apontamentos WHERE funcionario_id = ? AND tenant_id = ?");
    $checkStmt->execute([$data['id'], $tenant_id]);
    $apontamentosCount = $checkStmt->fetch(PDO::FETCH_ASSOC)['total'];

    if ($apontamentosCount > 0) {
        http_response_code(400);
        echo json_encode([
            'error' => 'No se puede desactivar este empleado',
            'message' => "Este empleado tiene {$apontamentosCount} registros de horas en el sistema. Los datos históricos deben ser preservados. Si necesita removerlo, contacte al administrador del sistema."
        ]);
        exit;
    }

    // Soft delete - apenas se não tiver apontamentos (filtrado por tenant)
    $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 0 WHERE id = ? AND tenant_id = ?");
    $stmt->execute([$data['id'], $tenant_id]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
