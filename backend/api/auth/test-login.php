<?php
/**
 * TESTE: Verificar se usuário existe no banco
 * GET /api/auth/test-login.php?email=email@exemplo.com
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../../config/database.php';

$email = $_GET['email'] ?? '';

if (empty($email)) {
    echo json_encode(['error' => 'Forneça ?email=seu@email.com']);
    exit;
}

try {
    $pdo = getConnection();

    // Buscar em usuarios COM tenant
    $stmt = $pdo->prepare("
        SELECT
            u.id, u.nome, u.email, u.tipo, u.tenant_id, u.ativo,
            t.slug as tenant_slug
        FROM usuarios u
        LEFT JOIN tenants t ON u.tenant_id = t.id
        WHERE u.email = ?
    ");
    $stmt->execute([$email]);
    $usuario_com_tenant = $stmt->fetch();

    // Buscar em usuarios SEM tenant
    $stmt = $pdo->prepare("
        SELECT id, nome, email, tipo, tenant_id, ativo
        FROM usuarios
        WHERE email = ?
          AND (tenant_id IS NULL OR tenant_id = 0)
    ");
    $stmt->execute([$email]);
    $usuario_sem_tenant = $stmt->fetch();

    // Buscar em encarregados COM tenant
    $stmt = $pdo->prepare("
        SELECT
            e.id, e.nome, e.email, 'encarregado' as tipo, e.tenant_id, e.ativo,
            t.slug as tenant_slug
        FROM encarregados e
        LEFT JOIN tenants t ON e.tenant_id = t.id
        WHERE e.email = ?
    ");
    $stmt->execute([$email]);
    $encarregado_com_tenant = $stmt->fetch();

    // Buscar em encarregados SEM tenant
    $stmt = $pdo->prepare("
        SELECT id, nome, email, 'encarregado' as tipo, tenant_id, ativo
        FROM encarregados
        WHERE email = ?
          AND (tenant_id IS NULL OR tenant_id = 0)
    ");
    $stmt->execute([$email]);
    $encarregado_sem_tenant = $stmt->fetch();

    echo json_encode([
        'email_buscado' => $email,
        'usuario_com_tenant' => $usuario_com_tenant ?: null,
        'usuario_sem_tenant' => $usuario_sem_tenant ?: null,
        'encarregado_com_tenant' => $encarregado_com_tenant ?: null,
        'encarregado_sem_tenant' => $encarregado_sem_tenant ?: null,
        'encontrado' => (bool)($usuario_com_tenant || $usuario_sem_tenant || $encarregado_com_tenant || $encarregado_sem_tenant)
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
