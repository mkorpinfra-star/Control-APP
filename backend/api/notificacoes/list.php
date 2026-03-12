<?php
/**
 * API: Listar Notificações do Usuário
 * GET /api/notificacoes/list.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

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

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

$tenant_id = $payload['empresa_id'] ?? $payload['tenant_id'] ?? null;
$user_id = $payload['user_id'] ?? $payload['id'] ?? null;

if (!$tenant_id || !$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'tenant_id/user_id ausente no token']);
    exit;
}

try {
    $pdo = getConnection();

    // Verificar se a tabela existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'notificacoes'");
    $tableExists = $stmt->rowCount() > 0;

    if (!$tableExists) {
        // Tabela não existe ainda - retornar array vazio
        echo json_encode([
            'success' => true,
            'notificacoes' => [],
            'info' => 'Tabela notificacoes ainda não foi criada. Execute database/create_notificacoes_table.sql'
        ]);
        exit;
    }

    // Verificar se a coluna lida_em existe
    $stmt = $pdo->query("SHOW COLUMNS FROM notificacoes LIKE 'lida_em'");
    $columnExists = $stmt->rowCount() > 0;

    // Montar query baseado nas colunas disponíveis
    if ($columnExists) {
        $sql = "SELECT id, tipo, titulo, mensagem, lida, lida_em, criado_em FROM notificacoes WHERE usuario_id = ? AND tenant_id = ? ORDER BY criado_em DESC LIMIT 50";
    } else {
        $sql = "SELECT id, tipo, titulo, mensagem, lida, criado_em FROM notificacoes WHERE usuario_id = ? AND tenant_id = ? ORDER BY criado_em DESC LIMIT 50";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id, $tenant_id]);
    $notificacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'notificacoes' => $notificacoes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
