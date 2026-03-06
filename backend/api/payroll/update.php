<?php
/**
 * ATUALIZAR CAMPOS MANUAIS DA FOLHA
 * Permite atualizar: salario_base, salario_hora, vale_moradia, ibf
 * Os demais campos são calculados automaticamente
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

    // Atualizar apenas campos manuais (roxos)
    $updates = [];
    $params = ['id' => $data['id']];

    if (isset($data['salario_base'])) {
        $updates[] = 'salario_base = :salario_base';
        $params['salario_base'] = $data['salario_base'];
    }
    if (isset($data['salario_hora'])) {
        $updates[] = 'salario_hora = :salario_hora';
        $params['salario_hora'] = $data['salario_hora'];
    }
    if (isset($data['vale_moradia'])) {
        $updates[] = 'vale_moradia = :vale_moradia';
        $params['vale_moradia'] = $data['vale_moradia'];
    }
    if (isset($data['ibf'])) {
        $updates[] = 'ibf = :ibf';
        $params['ibf'] = $data['ibf'];
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nenhum campo para atualizar']);
        exit;
    }

    $sql = "UPDATE folha_pagamento SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Buscar registro atualizado com valores calculados
    $selectStmt = $pdo->prepare("
        SELECT
            fp.*,
            fp.valor_horas_normais,
            fp.valor_horas_extra,
            fp.valor_horas_noturna,
            fp.subtotal_horas,
            fp.cas_desconto_funcionario_valor,
            fp.cas_custo_empresa_valor,
            fp.total_provimentos,
            fp.total_descontos,
            fp.liquido_a_pagar,
            fp.custo_total_empresa
        FROM folha_pagamento fp
        WHERE fp.id = ?
    ");
    $selectStmt->execute([$data['id']]);
    $updated = $selectStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'folha' => $updated
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao atualizar folha: ' . $e->getMessage()
    ]);
}
