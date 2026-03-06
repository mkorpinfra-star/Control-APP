<?php
/**
 * DASHBOARD FINANCEIRO POR OBRA
 * Mostra receita (faturamento) vs custo (folha) = lucro
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);

try {
    $mesReferencia = $_GET['mes'] ?? date('Y-m');

    $pdo = getConnection();

    // Buscar dados consolidados por obra
    $stmt = $pdo->prepare("
        SELECT
            o.id as obra_id,
            o.numero as obra_numero,
            o.nome as obra_nome,
            c.nome as cliente_nome,

            -- FATURAMENTO (Receita)
            COALESCE(f.valor_total_fatura, 0) as receita_total,
            COALESCE(f.valor_total_servicos, 0) as receita_servicos,
            COALESCE(f.igi_valor, 0) as receita_igi,

            -- FOLHA (Custo)
            COALESCE(SUM(fp.custo_total_empresa), 0) as custo_total,
            COALESCE(SUM(fp.liquido_a_pagar), 0) as custo_liquido_funcionarios,
            COALESCE(SUM(fp.cas_custo_empresa_valor), 0) as custo_cas_empresa,

            -- LUCRO
            (COALESCE(f.valor_total_fatura, 0) - COALESCE(SUM(fp.custo_total_empresa), 0)) as lucro,

            -- MARGEM
            CASE
                WHEN COALESCE(f.valor_total_fatura, 0) > 0 THEN
                    ((COALESCE(f.valor_total_fatura, 0) - COALESCE(SUM(fp.custo_total_empresa), 0)) / COALESCE(f.valor_total_fatura, 0) * 100)
                ELSE 0
            END as margem_percentual,

            -- HORAS
            COALESCE(f.horas_normais, 0) + COALESCE(f.horas_extra, 0) + COALESCE(f.horas_noturna, 0) as total_horas,
            COUNT(DISTINCT fp.funcionario_id) as total_funcionarios

        FROM obras o
        LEFT JOIN clientes c ON c.id = o.cliente_id
        LEFT JOIN faturamento f ON f.obra_id = o.id AND f.mes_referencia = :mes_referencia
        LEFT JOIN folha_pagamento fp ON fp.obra_id = o.id AND fp.mes_referencia = :mes_referencia
        WHERE o.ativa = 1
        GROUP BY o.id, f.id
        HAVING receita_total > 0 OR custo_total > 0
        ORDER BY lucro DESC
    ");
    $stmt->execute(['mes_referencia' => $mesReferencia]);
    $obras = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calcular totalizadores
    $totais = [
        'total_obras' => count($obras),
        'receita_total' => 0,
        'custo_total' => 0,
        'lucro_total' => 0,
        'total_horas' => 0,
        'total_funcionarios' => 0
    ];

    foreach ($obras as $obra) {
        $totais['receita_total'] += floatval($obra['receita_total']);
        $totais['custo_total'] += floatval($obra['custo_total']);
        $totais['lucro_total'] += floatval($obra['lucro']);
        $totais['total_horas'] += floatval($obra['total_horas']);
        $totais['total_funcionarios'] += intval($obra['total_funcionarios']);
    }

    // Margem geral
    $totais['margem_percentual'] = $totais['receita_total'] > 0
        ? ($totais['lucro_total'] / $totais['receita_total'] * 100)
        : 0;

    echo json_encode([
        'success' => true,
        'mes_referencia' => $mesReferencia,
        'obras' => $obras,
        'totais' => $totais
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar dashboard financeiro: ' . $e->getMessage()
    ]);
}
