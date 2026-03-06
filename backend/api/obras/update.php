<?php
/**
 * API: Atualizar Obra
 * PUT /api/obras/update.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

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
$payload = validateJWT($token);

if (!$payload || $payload['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $pdo = getConnection();

    $updates = [];
    $params = [];

    // Usa array_key_exists para detectar campos enviados mesmo quando null
    if (!empty($data['numero'])) {
        $updates[] = "numero = ?";
        $params[] = strtoupper($data['numero']);
    }
    if (!empty($data['nome'])) {
        $updates[] = "nome = ?";
        $params[] = $data['nome'];
    }
    if (array_key_exists('endereco', $data)) {
        $updates[] = "endereco = ?";
        $params[] = $data['endereco'] ?: null;
    }
    if (array_key_exists('email_financeiro', $data)) {
        $updates[] = "email_financeiro = ?";
        $params[] = $data['email_financeiro'] ?: null;
    }
    if (array_key_exists('email_encarregado', $data)) {
        $updates[] = "email_encarregado = ?";
        $params[] = $data['email_encarregado'] ?: null;
    }
    if (array_key_exists('cliente_id', $data)) {
        $updates[] = "cliente_id = ?";
        $params[] = $data['cliente_id'] ?: null;
    }
    if (array_key_exists('encarregado_id', $data)) {
        $updates[] = "encarregado_id = ?";
        $params[] = $data['encarregado_id'] ?: null;
    }
    if (array_key_exists('data_inicio', $data)) {
        $updates[] = "data_inicio = ?";
        $params[] = $data['data_inicio'] ?: null;
    }
    if (array_key_exists('data_fim', $data)) {
        $updates[] = "data_fim = ?";
        $params[] = $data['data_fim'] ?: null;
    }
    if (array_key_exists('dias_desativados', $data)) {
        // Garantir coluna
        $checkCol = $pdo->query("SHOW COLUMNS FROM obras LIKE 'dias_desativados'");
        if ($checkCol->rowCount() === 0) {
            $pdo->exec("ALTER TABLE obras ADD COLUMN dias_desativados TEXT NULL");
        }
        $updates[] = "dias_desativados = ?";
        $diasArr = $data['dias_desativados'];
        $params[] = (!empty($diasArr) && is_array($diasArr)) ? json_encode($diasArr) : null;
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        exit;
    }

    $sql = "UPDATE obras SET " . implode(', ', $updates) . " WHERE id = ?";
    $params[] = $data['id'];

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
