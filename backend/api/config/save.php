<?php
/**
 * API: Salvar configurações do sistema
 * POST /api/config/save.php
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

// Por enquanto apenas encarregado pode modificar (futuramente: admin)
$user = requireRole('encarregado');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$allowedKeys = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from', 'email_financeiro'];

try {
    foreach ($input as $key => $value) {
        // Só processar chaves permitidas
        if (!in_array($key, $allowedKeys)) {
            continue;
        }

        // Não atualizar senha se vier mascarada
        if ($key === 'smtp_password' && ($value === '********' || $value === '')) {
            continue;
        }

        setConfig($key, $value);
    }

    echo json_encode(['success' => true, 'message' => 'Configuración guardada']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
