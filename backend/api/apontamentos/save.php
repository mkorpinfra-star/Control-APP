<?php
/**
 * API: Salvar apontamento (criar ou atualizar rascunho)
 * POST /api/apontamentos/save.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

$input = json_decode(file_get_contents('php://input'), true);

$obraId = isset($input['obra_id']) ? $input['obra_id'] : null;
$semanaInicio = isset($input['semana_inicio']) ? $input['semana_inicio'] : null;
$horasDiarias = isset($input['horas_diarias']) ? $input['horas_diarias'] : null;

if (!$obraId || !$semanaInicio || !$horasDiarias) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad request', 'message' => 'Datos incompletos']);
    exit;
}

try {
    $pdo = getConnection();

    // Verificar se já existe apontamento
    $stmt = $pdo->prepare("
        SELECT id, status FROM apontamentos
        WHERE funcionario_id = ? AND obra_id = ? AND semana_inicio = ? AND tenant_id = ?
    ");
    $stmt->execute([$auth['user_id'], $obraId, $semanaInicio, $tenant_id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    // Não permitir edição se já foi enviado/aprovado
    if ($existing && !in_array($existing['status'], ['rascunho', 'rejeitado'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden', 'message' => 'Este registro ya ha sido enviado y no puede ser modificado']);
        exit;
    }

    // Calcular totais a partir do JSON
    $horasData = json_decode($horasDiarias, true);
    $totalNormal = 0;
    $totalExtra = 0;
    $totalNoturna = 0;

    foreach ($horasData as $dia => $horas) {
        if (is_array($horas)) {
            $totalNormal += floatval($horas['normal'] ?? 0);
            $totalExtra += floatval($horas['extra'] ?? 0);
            $totalNoturna += floatval($horas['noturna'] ?? 0);
        }
    }

    $totalHoras = $totalNormal + $totalExtra + $totalNoturna;
    // $horasDiarias já é uma string JSON — armazenar direto, sem re-encode
    $horasJson = is_string($horasDiarias) ? $horasDiarias : json_encode($horasDiarias);

    if ($existing) {
        // Atualizar
        $stmt = $pdo->prepare("
            UPDATE apontamentos
            SET horas_diarias = ?,
                horas_normais = ?,
                horas_extra = ?,
                horas_noturna = ?,
                total_horas = ?,
                status = 'rascunho',
                observacao_rejeicao = NULL
            WHERE id = ? AND tenant_id = ?
        ");
        $stmt->execute([$horasJson, $totalNormal, $totalExtra, $totalNoturna, $totalHoras, $existing['id'], $tenant_id]);
        $id = $existing['id'];
    } else {
        // Criar novo
        $stmt = $pdo->prepare("
            INSERT INTO apontamentos (funcionario_id, obra_id, semana_inicio, horas_diarias, horas_normais, horas_extra, horas_noturna, total_horas, status, tenant_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'rascunho', ?)
        ");
        $stmt->execute([$auth['user_id'], $obraId, $semanaInicio, $horasJson, $totalNormal, $totalExtra, $totalNoturna, $totalHoras, $tenant_id]);
        $id = $pdo->lastInsertId();
    }

    // Buscar o apontamento completo para retornar
    $stmt = $pdo->prepare("
        SELECT
            a.*,
            o.nome as obra_nome,
            o.numero as obra_numero
        FROM apontamentos a
        INNER JOIN obras o ON o.id = a.obra_id AND o.tenant_id = ?
        WHERE a.id = ? AND a.tenant_id = ?
    ");
    $stmt->execute([$tenant_id, $id, $tenant_id]);
    $apontamento = $stmt->fetch(PDO::FETCH_ASSOC);

    // Decodificar horas_diarias JSON
    if ($apontamento && $apontamento['horas_diarias']) {
        $apontamento['horas_diarias'] = json_decode($apontamento['horas_diarias'], true);
    }

    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Registro guardado',
        'apontamento' => $apontamento
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
