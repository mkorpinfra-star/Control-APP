<?php
/**
 * DELETAR APONTAMENTOS
 * DELETE /api/apontamentos/delete.php
 * Body: { "id": 5 }                  → deleta um apontamento
 *       { "mes": "2026-02" }         → deleta todos do mês
 *       { "semana": "2026-02-09" }   → deleta todos da semana
 *       { "all": true }              → deleta TUDO (cuidado!)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once '../../includes/tenant_middleware.php';
require_once '../../config/database.php';

$auth = validateTenantAccess(['admin']);
$tenant_id = $auth['tenant_id'];

$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    $pdo = getConnection();

    if (!empty($input['all'])) {
        $stmt = $pdo->prepare("DELETE FROM apontamentos WHERE tenant_id = ?");
        $stmt->execute([$tenant_id]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount(), 'message' => 'Todos os apontamentos foram apagados']);

    } elseif (!empty($input['mes'])) {
        $stmt = $pdo->prepare("DELETE FROM apontamentos WHERE DATE_FORMAT(semana_inicio, '%Y-%m') = ? AND tenant_id = ?");
        $stmt->execute([$input['mes'], $tenant_id]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount(), 'message' => "Apontamentos do mês {$input['mes']} apagados"]);

    } elseif (!empty($input['semana'])) {
        $stmt = $pdo->prepare("DELETE FROM apontamentos WHERE semana_inicio = ? AND tenant_id = ?");
        $stmt->execute([$input['semana'], $tenant_id]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount(), 'message' => "Apontamentos da semana {$input['semana']} apagados"]);

    } elseif (!empty($input['id'])) {
        $stmt = $pdo->prepare("DELETE FROM apontamentos WHERE id = ? AND tenant_id = ?");
        $stmt->execute([(int)$input['id'], $tenant_id]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount(), 'message' => 'Apontamento apagado']);

    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Forneça id, semana, mes ou all:true']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
