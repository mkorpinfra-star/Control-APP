<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

try {
    $pdo = getConnection();
    $input = json_decode(file_get_contents('php://input'), true);

    // Validações
    $nome = trim($input['nome'] ?? '');
    $slug = trim($input['slug'] ?? '');
    $email = trim($input['email'] ?? '');
    $telefone = trim($input['telefone'] ?? '');
    $admin_nome = trim($input['admin_nome'] ?? '');
    $admin_email = trim($input['admin_email'] ?? '');
    $admin_password = $input['admin_password'] ?? '';
    $plan = $input['plan'] ?? 'trial';

    if (empty($nome) || empty($slug) || empty($admin_nome) || empty($admin_email) || empty($admin_password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Campos obrigatórios faltando']);
        exit;
    }

    // Validar slug único
    $stmt = $pdo->prepare("SELECT id FROM tenants WHERE slug = ?");
    $stmt->execute([$slug]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Este identificador já está em uso']);
        exit;
    }

    // Validar email admin único
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmt->execute([$admin_email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Este email já está cadastrado']);
        exit;
    }

    // Determinar datas baseado no plano
    $trial_ends_at = null;
    $license_expires_at = null;

    if ($plan === 'trial') {
        $trial_ends_at = date('Y-m-d H:i:s', strtotime('+14 days'));
    } else {
        $license_expires_at = date('Y-m-d H:i:s', strtotime('+1 year'));
    }

    // Começar transação
    $pdo->beginTransaction();

    // 1. Criar tenant
    $stmt = $pdo->prepare("
        INSERT INTO tenants (
            nome, slug, email, telefone,
            primary_color, status, plan,
            trial_ends_at, license_expires_at,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");

    $stmt->execute([
        $nome,
        $slug,
        $email,
        $telefone,
        '#CE0201', // Cor padrão
        'ativo',
        $plan,
        $trial_ends_at,
        $license_expires_at
    ]);

    $tenant_id = $pdo->lastInsertId();

    // 2. Criar usuário admin
    $senha_hash = password_hash($admin_password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare("
        INSERT INTO usuarios (
            tenant_id, nome, email, senha_hash,
            tipo, ativo, created_at
        ) VALUES (?, ?, ?, ?, 'admin', 1, NOW())
    ");

    $stmt->execute([
        $tenant_id,
        $admin_nome,
        $admin_email,
        $senha_hash
    ]);

    $admin_id = $pdo->lastInsertId();

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Conta criada com sucesso',
        'tenant' => [
            'id' => $tenant_id,
            'nome' => $nome,
            'slug' => $slug,
            'plan' => $plan
        ],
        'admin' => [
            'id' => $admin_id,
            'nome' => $admin_nome,
            'email' => $admin_email
        ]
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Erro ao criar tenant: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao criar conta. Tente novamente.']);
}
