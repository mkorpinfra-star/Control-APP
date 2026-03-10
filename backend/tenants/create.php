<?php
/**
 * API: Criar Novo Tenant
 * URL: /api/tenants/create.php
 * Method: POST
 * Auth: Requer super admin
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/tenant_middleware.php';

try {
    // Validar autenticação e exigir super admin
    $auth = validateTenantAccess();
    requireSuperAdmin($auth);

    // Receber dados
    $data = json_decode(file_get_contents('php://input'), true);

    // Validar campos obrigatórios
    $required = ['nome', 'slug', 'admin_email', 'admin_name'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Campo '{$field}' é obrigatório"
            ]);
            exit;
        }
    }

    $nome = trim($data['nome']);
    $slug = strtolower(trim($data['slug']));
    $admin_email = trim($data['admin_email']);
    $admin_name = trim($data['admin_name']);

    // Validar formato do slug
    if (!preg_match('/^[a-z0-9-]+$/', $slug)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Slug inválido. Use apenas letras minúsculas, números e hífens.'
        ]);
        exit;
    }

    // Validar email
    if (!filter_var($admin_email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email inválido'
        ]);
        exit;
    }

    // Verificar se slug já existe
    $stmt = $pdo->prepare("SELECT id FROM tenants WHERE slug = ? LIMIT 1");
    $stmt->execute([$slug]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Slug já está em uso. Escolha outro.'
        ]);
        exit;
    }

    // Gerar license key única
    $license_key = sprintf(
        'PK-%s-%s-%s',
        strtoupper($slug),
        date('Y'),
        strtoupper(substr(md5(uniqid($slug, true)), 0, 8))
    );

    // Dados opcionais
    $razao_social = $data['razao_social'] ?? null;
    $cnpj = $data['cnpj'] ?? null;
    $admin_phone = $data['admin_phone'] ?? null;
    $primary_color = $data['primary_color'] ?? '#CE0201';
    $secondary_color = $data['secondary_color'] ?? '#A00101';
    $license_type = $data['license_type'] ?? 'trial';
    $max_users = $data['max_users'] ?? ($license_type === 'trial' ? 5 : 10);
    $max_projects = $data['max_projects'] ?? ($license_type === 'trial' ? 3 : 5);

    // Calcular trial_ends_at (14 dias)
    $trial_ends_at = date('Y-m-d', strtotime('+14 days'));

    // Iniciar transação
    $pdo->beginTransaction();

    // 1. Criar tenant
    $stmt = $pdo->prepare("
        INSERT INTO tenants (
            nome, slug, razao_social, cnpj,
            admin_name, admin_email, admin_phone,
            logo_url, primary_color, secondary_color,
            license_key, license_type,
            max_users, max_projects,
            status, trial_ends_at
        ) VALUES (
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?,
            ?, ?,
            'trial', ?
        )
    ");

    $logo_url = "/tenants/{$slug}/logo.png"; // Logo padrão

    $stmt->execute([
        $nome, $slug, $razao_social, $cnpj,
        $admin_name, $admin_email, $admin_phone,
        $logo_url, $primary_color, $secondary_color,
        $license_key, $license_type,
        $max_users, $max_projects,
        $trial_ends_at
    ]);

    $tenant_id = $pdo->lastInsertId();

    // 2. Criar usuário admin do tenant
    $senha_hash = password_hash($data['admin_password'] ?? 'Admin@123', PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO usuarios (
            tenant_id, nome, email, passaporte, senha_hash,
            tipo, ativo
        ) VALUES (
            ?, ?, ?, ?, ?,
            'admin', 1
        )
    ");

    $stmt->execute([
        $tenant_id,
        $admin_name,
        $admin_email,
        $admin_email, // passaporte inicial = email
        $senha_hash
    ]);

    $admin_user_id = $pdo->lastInsertId();

    // 3. Criar configurações padrão do tenant
    $stmt = $pdo->prepare("
        INSERT INTO configuracoes (tenant_id, chave, valor)
        VALUES
            (?, 'timezone', 'Europe/Madrid'),
            (?, 'locale', 'es_ES'),
            (?, 'currency', 'EUR'),
            (?, 'company_name', ?),
            (?, 'primary_color', ?),
            (?, 'secondary_color', ?)
    ");

    $stmt->execute([
        $tenant_id,
        $tenant_id,
        $tenant_id,
        $tenant_id, $nome,
        $tenant_id, $primary_color,
        $tenant_id, $secondary_color
    ]);

    // Commit transação
    $pdo->commit();

    // Log de auditoria
    error_log("✅ Novo tenant criado: {$slug} (ID: {$tenant_id}) por user {$auth['user_id']}");

    // Enviar email de boas-vindas (TODO: implementar)
    // sendWelcomeEmail($admin_email, $tenant_id, $license_key);

    // Retornar sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Tenant criado com sucesso!',
        'tenant' => [
            'id' => $tenant_id,
            'nome' => $nome,
            'slug' => $slug,
            'license_key' => $license_key,
            'admin_user_id' => $admin_user_id,
            'trial_ends_at' => $trial_ends_at,
            'access_url' => "https://{$slug}.puntoclicks.com"
        ]
    ]);

} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("❌ Erro ao criar tenant: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criar tenant: ' . $e->getMessage()
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("❌ Erro inesperado: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro inesperado'
    ]);
}
