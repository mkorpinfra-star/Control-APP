<?php
/**
 * API: Atualizar Cliente
 * PUT /api/clientes/update.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
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

$id = isset($input['id']) ? intval($input['id']) : 0;
$nome = isset($input['nome']) ? trim($input['nome']) : '';
$documento = isset($input['documento']) ? trim(strtoupper($input['documento'])) : '';
$nif = isset($input['nif']) ? trim(strtoupper($input['nif'])) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$telefone = isset($input['telefone']) ? trim($input['telefone']) : '';
$email_financeiro = isset($input['email_financeiro']) ? trim($input['email_financeiro']) : '';
$endereco = isset($input['endereco']) ? trim($input['endereco']) : '';
$pessoa_contato = isset($input['pessoa_contato']) ? trim($input['pessoa_contato']) : '';

if (!$id || empty($nome)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID y nombre son obligatorios']);
    exit;
}

try {
    $pdo = getConnection();

    $stmt = $pdo->prepare("
        UPDATE clientes
        SET nome = ?, documento = ?, nif = ?, email = ?, telefone = ?, email_financeiro = ?, endereco = ?, pessoa_contato = ?
        WHERE id = ?
    ");
    $stmt->execute([$nome, $documento, $nif, $email, $telefone, $email_financeiro, $endereco, $pessoa_contato, $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Cliente actualizado'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
