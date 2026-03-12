<?php
/**
 * API: Monitoramento em Tempo Real
 * GET /api/monitoramento/real-time.php
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

// Apenas admin pode acessar
if ($payload['tipo'] !== 'admin' && $payload['tipo'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden - Admin only']);
    exit;
}

$tenant_id = $payload['empresa_id'] ?? $payload['tenant_id'] ?? null;
if (!$tenant_id) {
    http_response_code(400);
    echo json_encode(['error' => 'tenant_id ausente no token']);
    exit;
}

try {
    $pdo = getConnection();

    // Semana atual (segunda-feira)
    $hoje = date('Y-m-d');
    $diaSemana = date('N'); // 1=segunda, 7=domingo
    $diasAtéSegunda = ($diaSemana == 1) ? 0 : 1 - $diaSemana;
    $semanaInicio = date('Y-m-d', strtotime("$diasAtéSegunda days", strtotime($hoje)));

    // 1. Buscar TODOS os apontamentos da semana atual
    $stmt = $pdo->prepare("
        SELECT
            a.id,
            a.funcionario_id,
            a.obra_id,
            a.semana_inicio,
            a.total_horas,
            a.horas_normais,
            a.horas_extra,
            a.horas_noturna,
            a.status,
            a.observacao_rejeicao,
            a.enviado_em,
            a.aprovado_em,
            u.nome as funcionario_nome,
            u.telefone as funcionario_telefone,
            o.nome as obra_nome,
            o.numero as obra_numero
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id AND u.tenant_id = ?
        INNER JOIN obras o ON o.id = a.obra_id AND o.tenant_id = ?
        WHERE a.semana_inicio = ?
          AND a.tenant_id = ?
        ORDER BY
            CASE a.status
                WHEN 'rascunho' THEN 1
                WHEN 'rejeitado' THEN 2
                WHEN 'enviado' THEN 3
                WHEN 'aprovado' THEN 4
            END,
            a.enviado_em DESC
    ");
    $stmt->execute([$tenant_id, $tenant_id, $semanaInicio, $tenant_id]);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Buscar funcionários SEM apontamento HOJE (ou com apontamento vazio)
    $stmt = $pdo->prepare("
        SELECT
            u.id,
            u.nome,
            u.telefone,
            u.email,
            o.nome as obra_nome,
            o.id as obra_id,
            a.id as apontamento_id
        FROM usuarios u
        LEFT JOIN funcionario_obra fo ON fo.funcionario_id = u.id
        LEFT JOIN obras o ON o.id = fo.obra_id AND o.tenant_id = ?
        LEFT JOIN apontamentos a ON a.funcionario_id = u.id AND a.semana_inicio = ? AND a.tenant_id = ?
        WHERE u.tipo = 'funcionario'
          AND u.ativo = 1
          AND u.tenant_id = ?
          AND (a.id IS NULL OR a.total_horas = 0)
        GROUP BY u.id
        ORDER BY u.nome
    ");
    $stmt->execute([$tenant_id, $semanaInicio, $tenant_id, $tenant_id]);
    $funcionariosPendentes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Marcar quem tem apontamento hoje
    foreach ($funcionariosPendentes as &$func) {
        $func['apontamento_hoje'] = $func['apontamento_id'] ? true : false;
    }

    echo json_encode([
        'success' => true,
        'apontamentos' => $apontamentos,
        'funcionarios' => $funcionariosPendentes,
        'semana_atual' => $semanaInicio,
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
