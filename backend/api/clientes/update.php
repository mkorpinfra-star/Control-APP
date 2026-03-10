<?php
/**
 * API: Atualizar Cliente
 * PUT /api/clientes/update.php
 * Multi-tenant enabled
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
require_once __DIR__ . '/../../includes/tenant_middleware.php';

$auth = validateTenantAccess();
requireAdmin($auth);

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
        WHERE id = ? AND tenant_id = ?
    ");
    $stmt->execute([$nome, $documento, $nif, $email, $telefone, $email_financeiro, $endereco, $pessoa_contato, $id, $auth['tenant_id']]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Cliente não encontrado ou sem permissão']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Cliente actualizado'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
