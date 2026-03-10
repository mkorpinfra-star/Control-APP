<?php
/**
 * API: Login
 * POST /api/auth/login.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Obter dados do request
$input = json_decode(file_get_contents('php://input'), true);
$passport = trim($input['passport'] ?? '');
$password = $input['password'] ?? '';
$tenant_slug = trim($input['tenant_slug'] ?? '');

if (empty($passport) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad request', 'message' => 'Pasaporte y contraseña son obligatorios']);
    exit;
}

if (empty($tenant_slug)) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad request', 'message' => 'Tenant inválido']);
    exit;
}

try {
    $pdo = getConnection();

    // Buscar tenant primeiro
    $stmt = $pdo->prepare("SELECT id, nome, status FROM tenants WHERE slug = ? AND deleted_at IS NULL");
    $stmt->execute([$tenant_slug]);
    $tenant = $stmt->fetch();

    if (!$tenant) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found', 'message' => 'Tenant não encontrado']);
        exit;
    }

    if ($tenant['status'] !== 'ativo' && $tenant['status'] !== 'trial') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden', 'message' => 'Tenant suspenso ou inativo']);
        exit;
    }

    $tenant_id = $tenant['id'];

    // Tentar buscar em usuarios primeiro (com tenant_id)
    $stmt = $pdo->prepare("SELECT id, passaporte, senha_hash, nome, email, tipo, foto_url, tenant_id, 'usuario' as tabela FROM usuarios WHERE passaporte = ? AND tenant_id = ? AND ativo = 1");
    $stmt->execute([$passport, $tenant_id]);
    $user = $stmt->fetch();

    // Se não encontrou em usuarios, tentar em encarregados
    if (!$user) {
        $stmt = $pdo->prepare("SELECT id, passaporte, senha as senha_hash, nome, email, 'encarregado' as tipo, NULL as foto_url, tenant_id, 'encarregado' as tabela FROM encarregados WHERE passaporte = ? AND tenant_id = ? AND ativo = 1");
        $stmt->execute([$passport, $tenant_id]);
        $user = $stmt->fetch();
    }

    if (!$user || !password_verify($password, $user['senha_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized', 'message' => 'Pasaporte o contraseña incorrectos']);
        exit;
    }

    // Gerar token JWT
    $payload = [
        'id' => $user['id'],
        'passaporte' => $user['passaporte'],
        'nome' => $user['nome'],
        'email' => $user['email'],
        'tipo' => $user['tipo'],
        'tabela' => $user['tabela'], // 'usuario' ou 'encarregado'
        'tenant_id' => $user['tenant_id'],
    ];

    $token = generateJWT($payload);

    // Remover senha do retorno
    unset($user['senha_hash']);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => $user,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
