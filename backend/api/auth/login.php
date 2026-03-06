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

if (empty($passport) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad request', 'message' => 'Pasaporte y contraseña son obligatorios']);
    exit;
}

try {
    $pdo = getConnection();

    // Buscar usuário pelo passaporte
    $stmt = $pdo->prepare("SELECT id, passaporte, senha_hash, nome, email, tipo, foto_url FROM usuarios WHERE passaporte = ? AND ativo = 1");
    $stmt->execute([$passport]);
    $user = $stmt->fetch();

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
