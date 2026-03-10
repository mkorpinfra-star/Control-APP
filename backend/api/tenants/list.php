<?php
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

try {
    $auth = validateTenantAccess();
    requireSuperAdmin($auth);

    $pdo = getConnection();

    // Buscar todos os tenants com estatísticas
    $sql = "
        SELECT
            t.id,
            t.nome,
            t.slug,
            t.email,
            t.telefone,
            t.logo_url,
            t.primary_color,
            t.status,
            t.plan,
            t.trial_ends_at,
            t.license_expires_at,
            t.created_at,
            (SELECT COUNT(*) FROM usuarios WHERE tenant_id = t.id AND ativo = 1) as total_usuarios,
            (SELECT COUNT(*) FROM obras WHERE tenant_id = t.id AND ativa = 1) as total_obras,
            (SELECT COUNT(*) FROM apontamentos WHERE tenant_id = t.id AND status = 'aprovado') as total_apontamentos
        FROM tenants t
        WHERE t.deleted_at IS NULL
        ORDER BY t.created_at DESC
    ";

    $stmt = $pdo->query($sql);
    $tenants = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'tenants' => $tenants
    ]);

} catch (Exception $e) {
    error_log("Erro ao listar tenants: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar tenants']);
}
