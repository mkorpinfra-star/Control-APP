<?php
/**
 * API: Listar Clientes
 * GET /api/clientes/list.php
 * Multi-tenant enabled
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/tenant_middleware.php';

$auth = validateTenantAccess();

try {
    $pdo = getConnection();

    $sql = "SELECT id, nome, documento, nif, email, telefone, email_financeiro, endereco, pessoa_contato
            FROM clientes
            WHERE ativo = 1 AND tenant_id = ?
            ORDER BY nome";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$auth['tenant_id']]);
    $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($clientes);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
