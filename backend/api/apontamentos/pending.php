<?php
/**
 * API: Listar apontamentos pendentes de aprovação
 * GET /api/apontamentos/pending.php
 * 
 * Fluxo de Dupla Aprovação:
 * - Encarregado vê registros com status 'enviado'
 * - Admin/RH vê registros com status 'aprovado_encarregado'
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

if ($payload['tipo'] !== 'admin' && $payload['tipo'] !== 'encarregado') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden', 'message' => 'Sem permissão para esta ação']);
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

    if ($auth['tipo'] === 'admin') {
        // Admin vê registros que já foram aprovados pelo encarregado
        // Status: 'aprovado_encarregado' - pendentes de aprovação final
        $stmt = $pdo->prepare("
            SELECT a.id, a.funcionario_id, a.obra_id, a.semana_inicio,
                   a.horas_diarias, a.total_horas, a.status, a.enviado_em,
                   a.aprovado_em, a.aprovado_por, a.assinatura_base64,
                   u.nome as funcionario_nome, u.passaporte as funcionario_passaporte, u.foto_url as funcionario_foto,
                   o.numero as obra_numero, o.nome as obra_nome,
                   enc.nome as encarregado_nome
            FROM apontamentos a
            INNER JOIN usuarios u ON u.id = a.funcionario_id AND u.tenant_id = ?
            INNER JOIN obras o ON o.id = a.obra_id AND o.tenant_id = ?
            LEFT JOIN usuarios enc ON enc.id = a.aprovado_por AND enc.tenant_id = ?
            WHERE a.status = 'aprovado_encarregado' AND a.tenant_id = ?
            ORDER BY a.aprovado_em ASC
        ");
        $stmt->execute([$tenant_id, $tenant_id, $tenant_id, $tenant_id]);
        $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // Encarregado vê registros enviados pelos funcionários das suas obras
        // Status: 'enviado' - pendentes de primeira aprovação
        $stmt = $pdo->prepare("
            SELECT a.id, a.funcionario_id, a.obra_id, a.semana_inicio,
                   a.horas_diarias, a.total_horas, a.status, a.enviado_em,
                   u.nome as funcionario_nome, u.passaporte as funcionario_passaporte, u.foto_url as funcionario_foto,
                   o.numero as obra_numero, o.nome as obra_nome
            FROM apontamentos a
            INNER JOIN usuarios u ON u.id = a.funcionario_id AND u.tenant_id = ?
            INNER JOIN obras o ON o.id = a.obra_id AND o.tenant_id = ?
            WHERE o.encarregado_id = ? AND a.status = 'enviado' AND a.tenant_id = ?
            ORDER BY a.enviado_em ASC
        ");
        $stmt->execute([$tenant_id, $tenant_id, $auth['user_id'], $tenant_id]);
        $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Decodificar JSON das horas
    foreach ($apontamentos as &$apt) {
        if (isset($apt['horas_diarias'])) {
            $apt['horas_diarias'] = json_decode($apt['horas_diarias'], true);
        }
    }

    echo json_encode([
        'success' => true,
        'apontamentos' => $apontamentos,
        'tipo_usuario' => $auth['tipo'],
        'status_buscado' => $auth['tipo'] === 'admin' ? 'aprovado_encarregado' : 'enviado'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
