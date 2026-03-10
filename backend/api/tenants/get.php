<?php
/**
 * API: Get Tenant by Slug
 * GET /api/tenants/get.php?slug=j2s
 *
 * Retorna dados do tenant para aplicar branding
 */

// CORS Headers - SEMPRE NO TOPO ANTES DE QUALQUER OUTPUT
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 3600');
header('Content-Type: application/json; charset=utf-8');

// Responder OPTIONS (preflight) imediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

// Apenas GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Obter slug
$slug = trim($_GET['slug'] ?? '');

if (empty($slug)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Slug é obrigatório']);
    exit;
}

try {
    $pdo = getConnection();

    // Buscar tenant
    $stmt = $pdo->prepare("
        SELECT
            id,
            slug,
            nome,
            logo_url,
            favicon_url,
            primary_color,
            secondary_color,
            status,
            license_type,
            license_key,
            trial_ends_at,
            license_expires_at,
            created_at
        FROM tenants
        WHERE slug = ?
          AND deleted_at IS NULL
    ");
    $stmt->execute([$slug]);
    $tenant = $stmt->fetch();

    if (!$tenant) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Tenant não encontrado'
        ]);
        exit;
    }

    // Verificar status
    if ($tenant['status'] === 'suspenso') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Conta suspensa. Entre em contato com o suporte.',
            'error_code' => 'TENANT_SUSPENDED'
        ]);
        exit;
    }

    if ($tenant['status'] === 'cancelado') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Conta cancelada.',
            'error_code' => 'TENANT_CANCELLED'
        ]);
        exit;
    }

    // Verificar trial expirado
    if ($tenant['status'] === 'trial' && $tenant['trial_ends_at']) {
        $trial_end = new DateTime($tenant['trial_ends_at']);
        if (new DateTime() > $trial_end) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Período de teste expirado.',
                'error_code' => 'TRIAL_EXPIRED',
                'trial_ends_at' => $tenant['trial_ends_at']
            ]);
            exit;
        }
    }

    // Verificar licença expirada
    if ($tenant['license_expires_at']) {
        $license_end = new DateTime($tenant['license_expires_at']);
        if (new DateTime() > $license_end) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Licença expirada. Renove sua assinatura.',
                'error_code' => 'LICENSE_EXPIRED',
                'license_expires_at' => $tenant['license_expires_at']
            ]);
            exit;
        }
    }

    // Retornar dados do tenant (sem dados sensíveis)
    echo json_encode([
        'success' => true,
        'tenant' => [
            'id' => $tenant['id'],
            'slug' => $tenant['slug'],
            'nome' => $tenant['nome'],
            'logo_url' => $tenant['logo_url'],
            'favicon_url' => $tenant['favicon_url'],
            'primary_color' => $tenant['primary_color'] ?? '#CE0201',
            'secondary_color' => $tenant['secondary_color'] ?? '#A00101',
            'status' => $tenant['status'],
            'license_type' => $tenant['license_type'],
            'created_at' => $tenant['created_at']
        ]
    ]);

} catch (Exception $e) {
    error_log("❌ Erro ao buscar tenant: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro no servidor',
        'error' => $e->getMessage()
    ]);
}
