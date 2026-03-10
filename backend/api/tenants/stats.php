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

    // Estatísticas gerais
    $stats = [];

    // Total de tenants
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM tenants WHERE deleted_at IS NULL");
    $stats['total_tenants'] = $stmt->fetch()['total'];

    // Tenants ativos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM tenants WHERE status = 'ativo' AND deleted_at IS NULL");
    $stats['tenants_ativos'] = $stmt->fetch()['total'];

    // Tenants em trial
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM tenants WHERE plan = 'trial' AND deleted_at IS NULL");
    $stats['tenants_trial'] = $stmt->fetch()['total'];

    // Tenants suspensos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM tenants WHERE status = 'suspenso' AND deleted_at IS NULL");
    $stats['tenants_suspensos'] = $stmt->fetch()['total'];

    // Total de usuários
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE ativo = 1");
    $stats['total_usuarios'] = $stmt->fetch()['total'];

    // Total de obras
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM obras WHERE ativa = 1");
    $stats['total_obras'] = $stmt->fetch()['total'];

    // Total de apontamentos
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM apontamentos");
    $stats['total_apontamentos'] = $stmt->fetch()['total'];

    // Apontamentos por status
    $stmt = $pdo->query("
        SELECT status, COUNT(*) as total
        FROM apontamentos
        GROUP BY status
    ");
    $stats['apontamentos_por_status'] = $stmt->fetchAll();

    // Crescimento mensal (últimos 6 meses)
    $stmt = $pdo->query("
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') as mes,
            COUNT(*) as total
        FROM tenants
        WHERE deleted_at IS NULL
            AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY mes
        ORDER BY mes ASC
    ");
    $stats['crescimento_mensal'] = $stmt->fetchAll();

    // Distribuição por plano
    $stmt = $pdo->query("
        SELECT plan, COUNT(*) as total
        FROM tenants
        WHERE deleted_at IS NULL
        GROUP BY plan
    ");
    $stats['distribuicao_planos'] = $stmt->fetchAll();

    // Trials expirando em 7 dias
    $stmt = $pdo->query("
        SELECT COUNT(*) as total
        FROM tenants
        WHERE plan = 'trial'
            AND trial_ends_at IS NOT NULL
            AND trial_ends_at <= DATE_ADD(NOW(), INTERVAL 7 DAY)
            AND trial_ends_at > NOW()
            AND deleted_at IS NULL
    ");
    $stats['trials_expirando'] = $stmt->fetch()['total'];

    // Licenças expirando em 30 dias
    $stmt = $pdo->query("
        SELECT COUNT(*) as total
        FROM tenants
        WHERE plan != 'trial'
            AND license_expires_at IS NOT NULL
            AND license_expires_at <= DATE_ADD(NOW(), INTERVAL 30 DAY)
            AND license_expires_at > NOW()
            AND deleted_at IS NULL
    ");
    $stats['licencas_expirando'] = $stmt->fetch()['total'];

    echo json_encode([
        'success' => true,
        'stats' => $stats
    ]);

} catch (Exception $e) {
    error_log("Erro ao buscar estatísticas: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao buscar estatísticas']);
}
