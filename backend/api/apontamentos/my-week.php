<?php
/**
 * API: Obter apontamento da semana do funcionário
 * GET /api/apontamentos/my-week.php?semana_inicio=YYYY-MM-DD
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
require_once __DIR__ . '/../../includes/tenant_middleware.php';

// Autenticação e validação de tenant
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id'];

$semanaInicio = isset($_GET['semana_inicio']) ? $_GET['semana_inicio'] : date('Y-m-d', strtotime('monday this week'));
$obraId = isset($_GET['obra_id']) ? (int)$_GET['obra_id'] : null;

try {
    $pdo = getConnection();

    // ISOLAMENTO POR OBRA: filtrar por obra_id quando fornecido
    if ($obraId) {
        $stmt = $pdo->prepare("
            SELECT a.id, a.funcionario_id, a.obra_id, a.semana_inicio,
                   a.horas_diarias, a.total_horas, a.status,
                   a.observacao_rejeicao, a.enviado_em, a.aprovado_em,
                   o.numero as obra_numero, o.nome as obra_nome
            FROM apontamentos a
            INNER JOIN obras o ON o.id = a.obra_id AND o.tenant_id = ?
            WHERE a.funcionario_id = ? AND a.obra_id = ? AND a.semana_inicio = ? AND a.tenant_id = ?
            LIMIT 1
        ");
        $stmt->execute([$tenant_id, $auth['user_id'], $obraId, $semanaInicio, $tenant_id]);
    } else {
        $stmt = $pdo->prepare("
            SELECT a.id, a.funcionario_id, a.obra_id, a.semana_inicio,
                   a.horas_diarias, a.total_horas, a.status,
                   a.observacao_rejeicao, a.enviado_em, a.aprovado_em,
                   o.numero as obra_numero, o.nome as obra_nome
            FROM apontamentos a
            INNER JOIN obras o ON o.id = a.obra_id AND o.tenant_id = ?
            WHERE a.funcionario_id = ? AND a.semana_inicio = ? AND a.tenant_id = ?
            LIMIT 1
        ");
        $stmt->execute([$tenant_id, $auth['user_id'], $semanaInicio, $tenant_id]);
    }
    $apontamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($apontamento && isset($apontamento['horas_diarias'])) {
        $apontamento['horas_diarias'] = json_decode($apontamento['horas_diarias'], true);
    }

    echo json_encode(['success' => true, 'apontamento' => $apontamento ? $apontamento : null]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
