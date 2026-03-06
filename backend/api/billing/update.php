<?php
/**
 * ATUALIZAR FATURAMENTO
 * Permite ajustes manuais em valores de faturamento
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID obrigatório']);
        exit;
    }

    $pdo = getConnection();

    // Atualizar campos permitidos
    $updates = [];
    $params = ['id' => $data['id']];

    if (isset($data['valor_total_servicos'])) {
        $updates[] = 'valor_total_servicos = :valor_total_servicos';
        $params['valor_total_servicos'] = $data['valor_total_servicos'];
    }
    if (isset($data['observacoes'])) {
        $updates[] = 'observacoes = :observacoes';
        $params['observacoes'] = $data['observacoes'];
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nenhum campo para atualizar']);
        exit;
    }

    $sql = "UPDATE faturamento SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Buscar registro atualizado com valores calculados
    $selectStmt = $pdo->prepare("
        SELECT
            f.*,
            f.igi_valor,
            f.valor_total_fatura
        FROM faturamento f
        WHERE f.id = ?
    ");
    $selectStmt->execute([$data['id']]);
    $updated = $selectStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'fatura' => $updated
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao atualizar faturamento: ' . $e->getMessage()
    ]);
}
