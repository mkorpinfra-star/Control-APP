<?php
/**
 * API: Listar Todos Tenants
 * URL: /api/tenants/list.php
 * Method: GET
 * Auth: Requer super admin
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Authorization');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

try {
    // Verificar autenticação
    $user = verifyToken();

    // Apenas super admin pode listar tenants
    if ($user['tipo'] !== 'super_admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Acesso negado'
        ]);
        exit;
    }

    // Query base
    $query = "
        SELECT
            t.*,
            (SELECT COUNT(*) FROM usuarios WHERE tenant_id = t.id AND deletado_em IS NULL) as total_users,
            (SELECT COUNT(*) FROM obras WHERE tenant_id = t.id AND deletado_em IS NULL) as total_projects,
            (SELECT COUNT(*) FROM apontamentos WHERE tenant_id = t.id) as total_timesheets
        FROM tenants t
        WHERE t.deleted_at IS NULL
    ";

    // Filtros opcionais
    $params = [];

    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $query .= " AND t.status = ?";
        $params[] = $_GET['status'];
    }

    if (isset($_GET['search']) && !empty($_GET['search'])) {
        $query .= " AND (t.nome LIKE ? OR t.slug LIKE ? OR t.admin_email LIKE ?)";
        $search = '%' . $_GET['search'] . '%';
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    // Ordenação
    $orderBy = $_GET['order_by'] ?? 'created_at';
    $orderDir = strtoupper($_GET['order_dir'] ?? 'DESC');

    $allowedOrders = ['created_at', 'nome', 'slug', 'status'];
    if (!in_array($orderBy, $allowedOrders)) {
        $orderBy = 'created_at';
    }

    if (!in_array($orderDir, ['ASC', 'DESC'])) {
        $orderDir = 'DESC';
    }

    $query .= " ORDER BY t.{$orderBy} {$orderDir}";

    // Executar query
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $tenants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Adicionar informações extras
    foreach ($tenants as &$tenant) {
        // Calcular dias do trial
        if ($tenant['status'] === 'trial' && $tenant['trial_ends_at']) {
            $trialEnd = new DateTime($tenant['trial_ends_at']);
            $now = new DateTime();
            $diff = $now->diff($trialEnd);

            if ($diff->invert) {
                $tenant['trial_status'] = 'expired';
                $tenant['trial_days_remaining'] = 0;
            } else {
                $tenant['trial_status'] = 'active';
                $tenant['trial_days_remaining'] = $diff->days;
            }
        }

        // Status da licença
        if ($tenant['license_expires_at']) {
            $licenseEnd = new DateTime($tenant['license_expires_at']);
            $now = new DateTime();

            if ($now > $licenseEnd) {
                $tenant['license_status'] = 'expired';
            } else {
                $tenant['license_status'] = 'active';
                $tenant['license_days_remaining'] = $now->diff($licenseEnd)->days;
            }
        } else {
            $tenant['license_status'] = 'lifetime';
        }

        // Uso de recursos
        $tenant['resource_usage'] = [
            'users' => [
                'current' => (int)$tenant['total_users'],
                'max' => (int)$tenant['max_users'],
                'percentage' => ((int)$tenant['max_users'] > 0)
                    ? round(((int)$tenant['total_users'] / (int)$tenant['max_users']) * 100, 2)
                    : 0
            ],
            'projects' => [
                'current' => (int)$tenant['total_projects'],
                'max' => (int)$tenant['max_projects'],
                'percentage' => ((int)$tenant['max_projects'] > 0)
                    ? round(((int)$tenant['total_projects'] / (int)$tenant['max_projects']) * 100, 2)
                    : 0
            ]
        ];

        // URL de acesso
        $tenant['access_url'] = "https://{$tenant['slug']}.puntoclicks.com";
    }

    // Estatísticas gerais
    $stats = [
        'total_tenants' => count($tenants),
        'active' => count(array_filter($tenants, fn($t) => $t['status'] === 'ativo')),
        'trial' => count(array_filter($tenants, fn($t) => $t['status'] === 'trial')),
        'suspended' => count(array_filter($tenants, fn($t) => $t['status'] === 'suspenso')),
        'total_users' => array_sum(array_column($tenants, 'total_users')),
        'total_projects' => array_sum(array_column($tenants, 'total_projects')),
    ];

    echo json_encode([
        'success' => true,
        'tenants' => $tenants,
        'stats' => $stats
    ]);

} catch (PDOException $e) {
    error_log("Erro ao listar tenants: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar tenants'
    ]);
}
