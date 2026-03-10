<?php
/**
 * RESUMO DA OBRA - Relatório Consolidado Mensal
 * GET /api/payroll/resumo-obra.php?obra_id=X&mes=YYYY-MM
 *
 * Retorna:
 *  - funcionarios[]  (folha individual)
 *  - totais_folha    (soma folha da obra)
 *  - faturamento     (dados de faturamento da obra)
 *  - despesas        (despesas indiretas do mês)
 *  - resumo_valores  (bloco final: fatura + IGI + folha + CASS + despesas = total líquido)
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);
$tenantId = $user['tenant_id'];

try {
    $obraId        = isset($_GET['obra_id']) ? (int)$_GET['obra_id'] : 0;
    $mesReferencia = $_GET['mes'] ?? date('Y-m');

    if (!$obraId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'obra_id obrigatório']);
        exit;
    }

    $pdo = getConnection();

    // ── 1. Garantir que tabela despesas_indiretas existe ────────────────────
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS despesas_indiretas (
            id                  INT AUTO_INCREMENT PRIMARY KEY,
            tenant_id           INT NOT NULL,
            obra_id             INT NOT NULL,
            mes_referencia      CHAR(7) NOT NULL,
            locacao_escritorio  DECIMAL(12,2) DEFAULT 0,
            locacao_deposito    DECIMAL(12,2) DEFAULT 0,
            fornecedores        DECIMAL(12,2) DEFAULT 0,
            ferramentas         DECIMAL(12,2) DEFAULT 0,
            uniformes           DECIMAL(12,2) DEFAULT 0,
            taxa_imigracao      DECIMAL(12,2) DEFAULT 0,
            cartao_transporte   DECIMAL(12,2) DEFAULT 0,
            outros              DECIMAL(12,2) DEFAULT 0,
            total               DECIMAL(12,2) GENERATED ALWAYS AS (
                locacao_escritorio + locacao_deposito + fornecedores +
                ferramentas + uniformes + taxa_imigracao +
                cartao_transporte + outros
            ) STORED,
            created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_tenant_obra_mes (tenant_id, obra_id, mes_referencia),
            INDEX idx_tenant (tenant_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // ── 1b. Migração automática de colunas ───────────────────────────────────
    $colsFolha = $pdo->query("SHOW COLUMNS FROM folha_pagamento")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('bonificacao', $colsFolha)) {
        $pdo->exec("ALTER TABLE folha_pagamento ADD COLUMN bonificacao DECIMAL(10,2) DEFAULT 0");
    }

    // ── 2. Obra info ─────────────────────────────────────────────────────────
    $obraStmt = $pdo->prepare("
        SELECT o.*, c.nome as cliente_nome
        FROM obras o
        LEFT JOIN clientes c ON c.id = o.cliente_id
        WHERE o.id = :id
        AND o.tenant_id = :tenant_id
    ");
    $obraStmt->execute([':id' => $obraId, ':tenant_id' => $tenantId]);
    $obra = $obraStmt->fetch(PDO::FETCH_ASSOC);

    if (!$obra) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Obra não encontrada']);
        exit;
    }

    // ── 3. Folha de pagamento dos funcionários desta obra/mês ────────────────
    $folhaStmt = $pdo->prepare("
        SELECT
            fp.*,
            u.nome                  AS funcionario_nome,
            u.passaporte            AS funcionario_passaporte,
            u.funcao                AS funcionario_funcao,
            u.salario_base          AS salario_base_declarado,

            -- Campos com fallback para versões antigas da tabela
            COALESCE(fp.subtotal_horas,   fp.total_bruto,  0)             AS subtotal_horas_calc,
            COALESCE(fp.bonificacao,       0)                              AS bonificacao_calc,
            COALESCE(fp.total_bruto,       fp.subtotal_horas, 0)          AS total_bruto_calc,
            COALESCE(fp.cas_funcionario_valor, fp.cas_desconto_funcionario_valor, 0) AS cas_func_valor_calc,
            COALESCE(fp.total_liquido,     fp.liquido_a_pagar, 0)         AS total_liquido_calc,
            COALESCE(fp.custo_total_empresa, 0)                            AS custo_empresa_calc,
            COALESCE(fp.cas_empresa_valor, 0)                              AS cas_empresa_valor_calc,
            COALESCE(fp.vale_moradia,      0)                              AS vale_moradia_calc,
            COALESCE(fp.ibf,               0)                              AS prima_calc,
            COALESCE(fp.salario_base_hora, fp.salario_hora, 0)            AS salario_hora_calc,
            COALESCE(fp.cas_funcionario_percentual, 6.50)                  AS cas_func_perc_calc,
            COALESCE(fp.cas_empresa_percentual,     15.50)                 AS cas_emp_perc_calc
        FROM folha_pagamento fp
        INNER JOIN usuarios u ON u.id = fp.funcionario_id
        WHERE fp.obra_id = :obra_id
          AND fp.mes_referencia = :mes
          AND fp.tenant_id = :tenant_id
          AND u.tenant_id = :tenant_id
        ORDER BY u.nome
    ");
    $folhaStmt->execute([':obra_id' => $obraId, ':mes' => $mesReferencia, ':tenant_id' => $tenantId]);
    $funcionarios = $folhaStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── 4. Totais da folha ───────────────────────────────────────────────────
    $totaisFolha = [
        'total_subtotal_horas'   => 0,
        'total_bonificacao'      => 0,
        'total_vale_moradia'     => 0,
        'total_bruto'            => 0,
        'total_cas_funcionario'  => 0,
        'total_liquido'          => 0,
        'total_cas_empresa'      => 0,
        'total_custo_empresa'    => 0,
        'total_horas_normais'    => 0,
        'total_horas_extra'      => 0,
        'total_horas_noturna'    => 0,
    ];

    foreach ($funcionarios as $f) {
        $totaisFolha['total_subtotal_horas']  += floatval($f['subtotal_horas_calc']);
        $totaisFolha['total_bonificacao']     += floatval($f['bonificacao_calc']);
        $totaisFolha['total_vale_moradia']    += floatval($f['vale_moradia_calc']);
        $totaisFolha['total_bruto']           += floatval($f['total_bruto_calc']);
        $totaisFolha['total_cas_funcionario'] += floatval($f['cas_func_valor_calc']);
        $totaisFolha['total_liquido']         += floatval($f['total_liquido_calc']);
        $totaisFolha['total_cas_empresa']     += floatval($f['cas_empresa_valor_calc']);
        $totaisFolha['total_custo_empresa']   += floatval($f['custo_empresa_calc']);
        $totaisFolha['total_horas_normais']   += floatval($f['horas_normais'] ?? 0);
        $totaisFolha['total_horas_extra']     += floatval($f['horas_extra']   ?? 0);
        $totaisFolha['total_horas_noturna']   += floatval($f['horas_noturna'] ?? 0);
    }

    // ── 5. Faturamento desta obra/mês ────────────────────────────────────────
    $fatStmt = $pdo->prepare("
        SELECT
            f.*,
            COALESCE(f.igi_percentual,    4.50)                           AS igi_perc,
            COALESCE(f.igi_valor,
                     f.valor_total_servicos * COALESCE(f.igi_percentual, 4.50) / 100,
                     0)                                                    AS igi_valor_calc,
            COALESCE(f.valor_total_fatura,
                     f.valor_total_servicos * (1 + COALESCE(f.igi_percentual, 4.50) / 100),
                     f.valor_total_servicos,
                     0)                                                    AS valor_total_fatura_calc
        FROM faturamento f
        WHERE f.obra_id = :obra_id
          AND f.mes_referencia = :mes
          AND f.tenant_id = :tenant_id
        LIMIT 1
    ");
    $fatStmt->execute([':obra_id' => $obraId, ':mes' => $mesReferencia, ':tenant_id' => $tenantId]);
    $faturamento = $fatStmt->fetch(PDO::FETCH_ASSOC);

    // Se não tem faturamento, criar objeto zero
    if (!$faturamento) {
        $faturamento = [
            'valor_total_servicos'  => 0,
            'igi_perc'              => 4.50,
            'igi_valor_calc'        => 0,
            'valor_total_fatura_calc' => 0,
            'horas_normais'         => 0,
            'horas_extra'           => 0,
            'horas_noturna'         => 0,
            'valor_hora_normal'     => 0,
            'valor_hora_extra'      => 0,
            'valor_hora_noturna'    => 0,
        ];
    }

    // ── 6. Despesas Indiretas ────────────────────────────────────────────────
    $despStmt = $pdo->prepare("
        SELECT * FROM despesas_indiretas
        WHERE obra_id = :obra_id AND mes_referencia = :mes AND tenant_id = :tenant_id
        LIMIT 1
    ");
    $despStmt->execute([':obra_id' => $obraId, ':mes' => $mesReferencia, ':tenant_id' => $tenantId]);
    $despesas = $despStmt->fetch(PDO::FETCH_ASSOC);

    if (!$despesas) {
        $despesas = [
            'id'                  => null,
            'obra_id'             => $obraId,
            'mes_referencia'      => $mesReferencia,
            'locacao_escritorio'  => 0,
            'locacao_deposito'    => 0,
            'fornecedores'        => 0,
            'ferramentas'         => 0,
            'uniformes'           => 0,
            'taxa_imigracao'      => 0,
            'cartao_transporte'   => 0,
            'outros'              => 0,
            'total'               => 0,
        ];
    }

    $totalDespesas = floatval($despesas['total'] ?? 0);

    // ── 7. RESUMO DE VALORES (bloco final da planilha) ───────────────────────
    $vFatura          = floatval($faturamento['valor_total_servicos'] ?? 0);
    $igiValor         = floatval($faturamento['igi_valor_calc']       ?? ($vFatura * 0.045));
    $igiPerc          = floatval($faturamento['igi_perc']             ?? 4.50);
    $folhaPagamento   = floatval($totaisFolha['total_liquido']);
    $cassTotal        = floatval($totaisFolha['total_cas_funcionario'])
                      + floatval($totaisFolha['total_cas_empresa']);
    $totalMoradia     = floatval($totaisFolha['total_vale_moradia']);

    // TOTAL LÍQUIDO = V.FATURA - IGI - FOLHA - CASS - DESPESAS
    $totalLiquidoFinal = $vFatura - $igiValor - $folhaPagamento - $cassTotal - $totalDespesas;

    $resumoValores = [
        'v_fatura'           => round($vFatura,        2),
        'igi_percentual'     => $igiPerc,
        'igi_valor'          => round($igiValor,       2),
        'folha_pagamento'    => round($folhaPagamento, 2),
        'cass_total'         => round($cassTotal,      2),
        'cass_funcionario'   => round($totaisFolha['total_cas_funcionario'], 2),
        'cass_empresa'       => round($totaisFolha['total_cas_empresa'],     2),
        'despesas_indiretas' => round($totalDespesas,  2),
        'moradia'            => round($totalMoradia,   2),
        'total_liquido'      => round($totalLiquidoFinal, 2),
    ];

    // ── 8. Resposta ──────────────────────────────────────────────────────────
    echo json_encode([
        'success'        => true,
        'obra'           => $obra,
        'mes_referencia' => $mesReferencia,
        'funcionarios'   => $funcionarios,
        'totais_folha'   => $totaisFolha,
        'faturamento'    => $faturamento,
        'despesas'       => $despesas,
        'resumo_valores' => $resumoValores,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage()
    ]);
}
