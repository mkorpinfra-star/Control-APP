<?php
/**
 * API: Verificar Biometria (WebAuthn)
 * POST /api/biometria/verificar.php
 * Body: { passaporte, credential_id, signature }
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

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['passaporte']) || !isset($data['credential_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados incompletos']);
    exit;
}

try {
    $pdo = getConnection();

    // Buscar usuário por passaporte
    $stmt = $pdo->prepare("
        SELECT id, passaporte, nome, email, tipo, foto_url, biometria_credential_id, biometria_public_key, biometria_cadastrada
        FROM usuarios
        WHERE passaporte = ? AND ativo = 1
    ");
    $stmt->execute([$data['passaporte']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Usuário não encontrado']);
        exit;
    }

    // Verificar se o credential_id bate
    if ($user['biometria_credential_id'] !== $data['credential_id']) {
        http_response_code(401);
        echo json_encode(['error' => 'Biometria não reconhecida']);
        exit;
    }

    // Gerar JWT token
    $token = generateJWT([
        'id' => $user['id'],
        'passaporte' => $user['passaporte'],
        'nome' => $user['nome'],
        'tipo' => $user['tipo'],
        'email' => $user['email']
    ]);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'passaporte' => $user['passaporte'],
            'nome' => $user['nome'],
            'email' => $user['email'],
            'tipo' => $user['tipo'],
            'foto_url' => $user['foto_url']
        ],
        'message' => 'Login com biometria realizado com sucesso'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
