<?php
/**
 * DELETAR FATURAMENTO
 * DELETE /api/billing/delete.php
 * Body: { "id": 5 }           → deleta uma linha
 *       { "mes": "2026-02" }  → deleta todas do mês
 *       { "all": true }       → deleta TUDO
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);

$input = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    $pdo = getConnection();

    if (!empty($input['all'])) {
        $stmt = $pdo->query("DELETE FROM faturamento");
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount(), 'message' => 'Todo o faturamento foi apagado']);

    } elseif (!empty($input['mes'])) {
        $colFat = $pdo->query("SHOW COLUMNS FROM faturamento")->fetchAll(PDO::FETCH_COLUMN);
        $colMes = in_array('mes_referencia', $colFat) ? 'mes_referencia' : 'mes';
        $stmt = $pdo->prepare("DELETE FROM faturamento WHERE {$colMes} = ?");
        $stmt->execute([$input['mes']]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount(), 'message' => "Faturamento do mês {$input['mes']} apagado"]);

    } elseif (!empty($input['id'])) {
        $stmt = $pdo->prepare("DELETE FROM faturamento WHERE id = ?");
        $stmt->execute([(int)$input['id']]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount(), 'message' => 'Registro apagado']);

    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Forneça id, mes ou all:true']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
