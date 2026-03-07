<?php
/**
 * LISTAR FOLHA DE PAGAMENTO
 * Exibe folha com valores calculados
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);

try {
    $mesReferencia = $_GET['mes'] ?? date('Y-m');
    $obraId = isset($_GET['obra_id']) && $_GET['obra_id'] !== 'all' ? (int)$_GET['obra_id'] : null;

    $pdo = getConnection();

    $whereObra = $obraId ? " AND fp.obra_id = :obra_id" : "";
    $params = ['mes_referencia' => $mesReferencia];
    if ($obraId) $params['obra_id'] = $obraId;

    $stmt = $pdo->prepare("
        SELECT
            fp.*,
            u.nome as funcionario_nome,
            u.passaporte as funcionario_passaporte,
            u.funcao as funcionario_funcao,
            o.nome as obra_nome,
            o.numero as obra_numero,

            -- FASE 4: Valores calculados com multipliers e CAS
            -- Usar os novos campos se existirem, senão usar GENERATED columns
            COALESCE(fp.total_bruto, fp.subtotal_horas) as subtotal_horas,
            COALESCE(fp.cas_funcionario_valor, fp.cas_desconto_funcionario_valor) as cas_desconto_funcionario_valor,
            COALESCE(fp.total_liquido, fp.liquido_a_pagar) as liquido_a_pagar,
            fp.custo_total_empresa as custo_total_empresa,

            -- Provimentos e descontos (ainda usam GENERATED)
            fp.total_provimentos,
            fp.total_descontos,

            -- Valores detalhados das horas
            fp.valor_horas_normais,
            fp.valor_horas_extra,
            fp.valor_horas_noturna

        FROM folha_pagamento fp
        INNER JOIN usuarios u ON u.id = fp.funcionario_id
        INNER JOIN obras o ON o.id = fp.obra_id
        WHERE fp.mes_referencia = :mes_referencia
        $whereObra
        ORDER BY o.nome, u.nome
    ");
    $stmt->execute($params);
    $folhas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Buscar totalizadores (FASE 4: usar novos campos)
    $totaisStmt = $pdo->prepare("
        SELECT
            COUNT(*) as total_funcionarios,
            SUM(COALESCE(total_liquido, liquido_a_pagar)) as total_liquido,
            SUM(custo_total_empresa) as total_custo_empresa
        FROM folha_pagamento
        WHERE mes_referencia = :mes_referencia
        $whereObra
    ");
    $totaisStmt->execute($params);
    $totais = $totaisStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'mes_referencia' => $mesReferencia,
        'folhas' => $folhas,
        'totais' => $totais
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar folha: ' . $e->getMessage()
    ]);
}
