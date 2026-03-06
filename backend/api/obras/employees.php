<?php
/**
 * API: Listar funcionários de uma obra
 * GET /api/obras/employees.php?obra_id=1
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

$obraId = isset($_GET['obra_id']) ? $_GET['obra_id'] : null;

if (!$obraId) {
    http_response_code(400);
    echo json_encode(['error' => 'obra_id é obrigatório']);
    exit;
}

try {
    $pdo = getConnection();

    $sql = "
        SELECT u.id, u.passaporte, u.nome, u.email, u.tipo, u.foto_url
        FROM usuarios u
        INNER JOIN funcionario_obra fo ON u.id = fo.funcionario_id
        WHERE fo.obra_id = ? AND u.ativo = 1
        ORDER BY u.nome
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$obraId]);
    $funcionarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($funcionarios);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
