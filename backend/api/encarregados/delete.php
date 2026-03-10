<?php
/**
 * DELETAR ENCARREGADO - MULTI-TENANT
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../includes/tenant_middleware.php';

$auth = validateTenantAccess();
requireAdmin($auth);

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        throw new Exception('ID é obrigatório');
    }

    $pdo = getConnection();

    // Verificar se encarregado pertence ao tenant
    $checkOwner = $pdo->prepare("SELECT id FROM encarregados WHERE id = ? AND tenant_id = ?");
    $checkOwner->execute([$data['id'], $auth['tenant_id']]);
    if (!$checkOwner->fetch()) {
        throw new Exception('Encarregado não encontrado ou sem permissão');
    }

    // Verificar se tem obras vinculadas dentro do tenant
    $checkObras = $pdo->prepare("SELECT COUNT(*) as total FROM obras WHERE encarregado_id = ? AND tenant_id = ?");
    $checkObras->execute([$data['id'], $auth['tenant_id']]);
    $result = $checkObras->fetch(PDO::FETCH_ASSOC);

    if ($result['total'] > 0) {
        throw new Exception('Não é possível deletar. Encarregado vinculado a ' . $result['total'] . ' obra(s)');
    }

    $stmt = $pdo->prepare("DELETE FROM encarregados WHERE id = ? AND tenant_id = ?");
    $stmt->execute([$data['id'], $auth['tenant_id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Encarregado deletado com sucesso'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao deletar encarregado: ' . $e->getMessage()
    ]);
}
