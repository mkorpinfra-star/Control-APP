<?php
/**
 * API: Criar Cliente
 * POST /api/clientes/create.php
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
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);

if (!$user || $user['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$nome = isset($input['nome']) ? trim($input['nome']) : '';
$documento = isset($input['documento']) ? trim(strtoupper($input['documento'])) : '';
$nif = isset($input['nif']) ? trim(strtoupper($input['nif'])) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$telefone = isset($input['telefone']) ? trim($input['telefone']) : '';
$email_financeiro = isset($input['email_financeiro']) ? trim($input['email_financeiro']) : '';
$endereco = isset($input['endereco']) ? trim($input['endereco']) : '';
$pessoa_contato = isset($input['pessoa_contato']) ? trim($input['pessoa_contato']) : '';

if (empty($nome)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nombre es obligatorio']);
    exit;
}

try {
    $pdo = getConnection();

    $stmt = $pdo->prepare("
        INSERT INTO clientes (nome, documento, nif, email, telefone, email_financeiro, endereco, pessoa_contato, ativo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    ");
    $stmt->execute([$nome, $documento, $nif, $email, $telefone, $email_financeiro, $endereco, $pessoa_contato]);

    $id = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'message' => 'Cliente creado',
        'id' => $id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
