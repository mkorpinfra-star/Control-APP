<?php
/**
 * API: Registrar Biometria (WebAuthn)
 * POST /api/biometria/registrar.php
 * Body: { credential_id, public_key }
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

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['credential_id']) || !isset($data['public_key'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Dados incompletos']);
    exit;
}

try {
    $pdo = getConnection();

    // Verificar se já tem biometria cadastrada
    $stmt = $pdo->prepare("SELECT biometria_credential_id FROM usuarios WHERE id = ?");
    $stmt->execute([$user['id']]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing && !empty($existing['biometria_credential_id'])) {
        // Atualizar biometria existente
        $stmt = $pdo->prepare("
            UPDATE usuarios
            SET biometria_credential_id = ?,
                biometria_public_key = ?,
                biometria_cadastrada = 1,
                atualizado_em = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $data['credential_id'],
            $data['public_key'],
            $user['id']
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Biometria atualizada com sucesso'
        ]);
    } else {
        // Cadastrar nova biometria
        $stmt = $pdo->prepare("
            UPDATE usuarios
            SET biometria_credential_id = ?,
                biometria_public_key = ?,
                biometria_cadastrada = 1,
                atualizado_em = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $data['credential_id'],
            $data['public_key'],
            $user['id']
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Biometria cadastrada com sucesso'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
