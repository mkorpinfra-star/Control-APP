<?php
/**
 * API: Buscar Tenant por Slug
 * URL: /api/tenants/get.php?slug=j2s
 * Method: GET
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

try {
    // Validar parâmetro slug
    if (!isset($_GET['slug']) || empty($_GET['slug'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Slug do tenant é obrigatório'
        ]);
        exit;
    }

    $slug = trim($_GET['slug']);

    // Validar formato do slug
    if (!preg_match('/^[a-z0-9-]+$/', $slug)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Slug inválido. Use apenas letras minúsculas, números e hífens.'
        ]);
        exit;
    }

    // Buscar tenant no banco
    $stmt = $pdo->prepare("
        SELECT
            id,
            nome,
            slug,
            razao_social,
            logo_url,
            primary_color,
            secondary_color,
            favicon_url,
            license_key,
            license_type,
            license_expires_at,
            max_users,
            max_projects,
            status,
            trial_ends_at,
            timezone,
            locale,
            currency,
            custom_domain,
            onboarding_completed,
            created_at
        FROM tenants
        WHERE slug = ? AND deleted_at IS NULL
        LIMIT 1
    ");

    $stmt->execute([$slug]);
    $tenant = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$tenant) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Tenant não encontrado'
        ]);
        exit;
    }

    // Verificar status do tenant
    if ($tenant['status'] === 'cancelado' || $tenant['status'] === 'suspenso') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Conta suspensa ou cancelada. Entre em contato com o suporte.',
            'status' => $tenant['status']
        ]);
        exit;
    }

    // Verificar se trial expirou
    if ($tenant['status'] === 'trial' && $tenant['trial_ends_at']) {
        $trialEnd = new DateTime($tenant['trial_ends_at']);
        $now = new DateTime();

        if ($now > $trialEnd) {
            // Trial expirado - suspender tenant
            $stmt = $pdo->prepare("UPDATE tenants SET status = 'suspenso' WHERE id = ?");
            $stmt->execute([$tenant['id']]);

            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Período de trial expirado. Faça upgrade do seu plano.',
                'status' => 'trial_expired'
            ]);
            exit;
        }

        // Calcular dias restantes do trial
        $tenant['trial_days_remaining'] = $now->diff($trialEnd)->days;
    }

    // Verificar se licença expirou
    if ($tenant['license_expires_at']) {
        $licenseEnd = new DateTime($tenant['license_expires_at']);
        $now = new DateTime();

        if ($now > $licenseEnd) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Licença expirada. Renove sua assinatura.',
                'status' => 'license_expired'
            ]);
            exit;
        }
    }

    // Buscar estatísticas do tenant
    $statsStmt = $pdo->prepare("
        SELECT
            (SELECT COUNT(*) FROM usuarios WHERE tenant_id = ? AND deletado_em IS NULL) as total_users,
            (SELECT COUNT(*) FROM obras WHERE tenant_id = ? AND deletado_em IS NULL) as total_projects,
            (SELECT COUNT(*) FROM usuarios WHERE tenant_id = ? AND tipo = 'funcionario' AND deletado_em IS NULL) as total_employees
    ");

    $statsStmt->execute([$tenant['id'], $tenant['id'], $tenant['id']]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    // Adicionar stats ao tenant
    $tenant['stats'] = $stats;

    // Verificar limites do plano
    $tenant['limits'] = [
        'users' => [
            'current' => (int)$stats['total_users'],
            'max' => (int)$tenant['max_users'],
            'reached' => (int)$stats['total_users'] >= (int)$tenant['max_users']
        ],
        'projects' => [
            'current' => (int)$stats['total_projects'],
            'max' => (int)$tenant['max_projects'],
            'reached' => (int)$stats['total_projects'] >= (int)$tenant['max_projects']
        ]
    ];

    // Remover informações sensíveis
    unset($tenant['license_key']);

    // Retornar tenant
    echo json_encode([
        'success' => true,
        'tenant' => $tenant
    ]);

} catch (PDOException $e) {
    error_log("Erro ao buscar tenant: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar tenant'
    ]);
} catch (Exception $e) {
    error_log("Erro inesperado: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro inesperado'
    ]);
}
