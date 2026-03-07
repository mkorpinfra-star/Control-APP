<?php
/**
 * API: Listar Obras
 * GET /api/obras/list.php
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
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
}

try {
    $pdo = getConnection();

    $sql = "
        SELECT o.id, o.numero, o.nome, o.endereco,
               o.email_financeiro, o.email_encarregado,
               o.data_inicio, o.data_fim,
               o.cliente_id, o.encarregado_id,
               o.pais,
               o.fatura_hora_normal, o.fatura_hora_extra, o.fatura_hora_noturna,
               o.multiplicador_extra, o.multiplicador_noturna,
               o.imposto_igi, o.imposto_cas_funcionario, o.imposto_cas_empresa, o.imposto_irpc,
               c.nome as cliente_nome,
               e.nome as encarregado_nome,
               (SELECT COUNT(*) FROM funcionario_obra WHERE obra_id = o.id) as funcionarios_count
        FROM obras o
        LEFT JOIN clientes c ON o.cliente_id = c.id
        LEFT JOIN encarregados e ON o.encarregado_id = e.id
        WHERE (o.ativo = 1 OR o.ativa = 1)
        ORDER BY o.numero DESC
    ";

    $stmt = $pdo->query($sql);
    $obras = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'obras' => $obras,
        'total' => count($obras)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
