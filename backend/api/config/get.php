<?php
/**
 * API: Obter configurações do sistema
 * GET /api/config/get.php
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
require_once __DIR__ . '/../../includes/jwt.php';

$user = requireAuth();

try {
    $pdo = getConnection();

    $stmt = $pdo->query("SELECT chave, valor FROM configuracoes");
    $rows = $stmt->fetchAll();

    $config = [];
    foreach ($rows as $row) {
        // Não expor senha do SMTP
        if ($row['chave'] === 'smtp_password') {
            $config[$row['chave']] = $row['valor'] ? '********' : '';
        } else {
            $config[$row['chave']] = $row['valor'];
        }
    }

    echo json_encode(['success' => true, 'config' => $config]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
