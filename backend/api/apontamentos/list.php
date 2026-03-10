<?php
/**
 * LISTAR APONTAMENTOS - Multi-Tenant
 * Retorna todos os apontamentos do tenant (opcionalmente filtrados)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../includes/jwt.php';

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
if (!$tenant_id) {
    http_response_code(400);
    echo json_encode(['error' => 'tenant_id ausente no token']);
    exit;
}

$auth = [
    'tenant_id' => $tenant_id,
    'tipo' => $payload['tipo'],
    'user_id' => $payload['id']
];

try {
    $pdo = getConnection();

    // Filtros opcionais
    $status = $_GET['status'] ?? null;
    $obraId = $_GET['obra_id'] ?? null;
    $funcionarioId = $_GET['funcionario_id'] ?? null;

    // Construir query COM tenant_id
    $sql = "
        SELECT
            a.*,
            u.nome as funcionario_nome,
            o.numero as obra_numero,
            o.nome as obra_nome
        FROM apontamentos a
        LEFT JOIN usuarios u ON u.id = a.funcionario_id AND u.tenant_id = :tenant_id_u
        LEFT JOIN obras o ON o.id = a.obra_id AND o.tenant_id = :tenant_id_o
        WHERE a.tenant_id = :tenant_id
    ";

    $params = [
        'tenant_id' => $tenant_id,
        'tenant_id_u' => $tenant_id,
        'tenant_id_o' => $tenant_id
    ];

    if ($status) {
        $sql .= " AND a.status = :status";
        $params['status'] = $status;
    }

    if ($obraId) {
        $sql .= " AND a.obra_id = :obra_id";
        $params['obra_id'] = $obraId;
    }

    if ($funcionarioId) {
        $sql .= " AND a.funcionario_id = :funcionario_id";
        $params['funcionario_id'] = $funcionarioId;
    }

    $sql .= " ORDER BY a.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'apontamentos' => $apontamentos
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar apontamentos: ' . $e->getMessage()
    ]);
}
