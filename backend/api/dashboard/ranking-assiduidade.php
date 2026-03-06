<?php
/**
 * API: Ranking de Assiduidade (FASE 6)
 * GET /api/dashboard/ranking-assiduidade.php
 * Retorna ranking de presença dos funcionários dos últimos 3 meses
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

// Verificar autenticação
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token inválido']);
    exit;
}

// Apenas admin pode acessar
if ($user['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permissão negada']);
    exit;
}

try {
    $pdo = getConnection();

    // Calcular % de presença dos últimos 3 meses
    $sql = "
        SELECT
            u.id,
            u.nome,
            u.passaporte,
            COUNT(DISTINCT a.semana_inicio) as total_semanas,
            SUM(CASE WHEN a.status IN ('aprovado', 'aprovado_admin') THEN 1 ELSE 0 END) as semanas_aprovadas,
            ROUND((SUM(CASE WHEN a.status IN ('aprovado', 'aprovado_admin') THEN 1 ELSE 0 END) / COUNT(DISTINCT a.semana_inicio) * 100), 1) as percentual_presenca
        FROM usuarios u
        LEFT JOIN apontamentos a ON a.funcionario_id = u.id
            AND a.semana_inicio >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        WHERE u.tipo = 'funcionario' AND u.ativo = 1
        GROUP BY u.id
        HAVING total_semanas > 0
        ORDER BY percentual_presenca DESC, u.nome
    ";

    $stmt = $pdo->query($sql);
    $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'ranking' => $ranking
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
}
