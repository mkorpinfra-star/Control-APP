<?php
/**
 * API: Listar Funções/Cargos
 * GET /api/funcoes/list.php
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
require_once __DIR__ . '/../../includes/tenant_middleware.php';

// Validar acesso multi-tenant
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id'];

try {
    $pdo = getConnection();

    // Multi-tenant: filtrar por tenant_id
    $stmt = $pdo->prepare("SELECT * FROM funcoes WHERE tenant_id = :tenant_id AND ativo = 1 ORDER BY nome");
    $stmt->execute(['tenant_id' => $tenant_id]);
    $funcoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'funcoes' => $funcoes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
}
