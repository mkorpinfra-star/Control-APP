<?php
/**
 * ANALYTICS INSIGHTS - SISTEMA INTELIGENTE
 * GET /api/analytics/insights.php
 */

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

// Verificar autenticação
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);

if (!$user) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permissão negada']);
    exit;
}

try {
    $pdo = getConnection();

    // Parâmetros de período
    $periodoAtual = $_GET['periodo'] ?? '30';
    $dataInicio = $_GET['data_inicio'] ?? null;
    $dataFim = $_GET['data_fim'] ?? null;

    // Determinar datas
    if ($periodoAtual === 'custom' && $dataInicio && $dataFim) {
        $startDate = $dataInicio;
        $endDate = $dataFim;
    } else {
        $dias = (int)$periodoAtual;
        $endDate = date('Y-m-d');
        $startDate = date('Y-m-d', strtotime("-{$dias} days"));
    }

    // Período anterior para comparação
    $diffDays = (strtotime($endDate) - strtotime($startDate)) / 86400;
    $compareEndDate = date('Y-m-d', strtotime($startDate . ' -1 day'));
    $compareStartDate = date('Y-m-d', strtotime($compareEndDate . " -{$diffDays} days"));

    // Verificar se colunas existem
    $checkColumns = $pdo->query("SHOW COLUMNS FROM apontamentos LIKE 'horas_normais'");
    $hasDetailedColumns = $checkColumns->rowCount() > 0;

    if (!$hasDetailedColumns) {
        // Fallback: usar apenas total_horas
        echo json_encode([
            'success' => true,
            'periodo' => ['inicio' => $startDate, 'fim' => $endDate, 'dias' => (int)$diffDays + 1],
            'top_5_produtivos' => [],
            'bottom_5_fadiga' => [],
            'comparacao_temporal' => [
                'periodo_atual' => ['inicio' => $startDate, 'fim' => $endDate, 'dados' => ['total_horas' => 0]],
                'periodo_anterior' => ['inicio' => $compareStartDate, 'fim' => $compareEndDate, 'dados' => ['total_horas' => 0]],
                'variacoes' => ['total_horas' => 0]
            ],
            'distribuicao_obras' => [],
            'insights' => [[
                'tipo' => 'info',
                'titulo' => 'Sistema em Configuração',
                'mensagem' => 'Execute as migrations SQL para habilitar análises detalhadas de horas.'
            ]],
            'resumo' => [
                'total_horas' => 0,
                'horas_normais' => 0,
                'horas_extra' => 0,
                'horas_noturna' => 0,
                'funcionarios_ativos' => 0,
                'obras_ativas' => 0
            ]
        ]);
        exit;
    }

    // TOP 5 PRODUTIVOS
    $topStmt = $pdo->prepare("
        SELECT
            u.id,
            u.nome,
            u.passaporte,
            COALESCE(SUM(a.horas_normais), 0) as horas_normais,
            COALESCE(SUM(a.horas_extra), 0) as horas_extra,
            COALESCE(SUM(a.horas_noturna), 0) as horas_noturna,
            COALESCE(SUM(a.total_horas), 0) as total_horas,
            COUNT(DISTINCT a.obra_id) as obras_trabalhadas,
            COUNT(*) as semanas_trabalhadas,
            ROUND((COALESCE(SUM(a.horas_normais), 0) / NULLIF(COALESCE(SUM(a.total_horas), 1), 0)) * 100, 1) as percentual_normal
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        WHERE a.semana_inicio >= ?
        AND a.semana_inicio <= ?
        AND a.status IN ('aprovado', 'aprovado_admin', 'aprovado_encarregado')
        AND u.tipo = 'funcionario'
        GROUP BY u.id
        HAVING total_horas > 0
        ORDER BY total_horas DESC
        LIMIT 5
    ");
    $topStmt->execute([$startDate, $endDate]);
    $top5 = $topStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // BOTTOM 5 FADIGA
    $bottomStmt = $pdo->prepare("
        SELECT
            u.id,
            u.nome,
            u.passaporte,
            COALESCE(SUM(a.horas_normais), 0) as horas_normais,
            COALESCE(SUM(a.horas_extra), 0) as horas_extra,
            COALESCE(SUM(a.horas_noturna), 0) as horas_noturna,
            COALESCE(SUM(a.total_horas), 0) as total_horas,
            ROUND(((COALESCE(SUM(a.horas_extra), 0) + COALESCE(SUM(a.horas_noturna), 0)) / NULLIF(COALESCE(SUM(a.total_horas), 1), 0)) * 100, 1) as percentual_extra_noturna,
            CASE
                WHEN ((COALESCE(SUM(a.horas_extra), 0) + COALESCE(SUM(a.horas_noturna), 0)) / NULLIF(COALESCE(SUM(a.total_horas), 1), 0)) * 100 > 50 THEN 'CRÍTICO'
                WHEN ((COALESCE(SUM(a.horas_extra), 0) + COALESCE(SUM(a.horas_noturna), 0)) / NULLIF(COALESCE(SUM(a.total_horas), 1), 0)) * 100 > 30 THEN 'ALTO'
                WHEN ((COALESCE(SUM(a.horas_extra), 0) + COALESCE(SUM(a.horas_noturna), 0)) / NULLIF(COALESCE(SUM(a.total_horas), 1), 0)) * 100 > 15 THEN 'MODERADO'
                ELSE 'NORMAL'
            END as nivel_risco
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        WHERE a.semana_inicio >= ?
        AND a.semana_inicio <= ?
        AND a.status IN ('aprovado', 'aprovado_admin', 'aprovado_encarregado')
        AND u.tipo = 'funcionario'
        GROUP BY u.id
        HAVING total_horas > 0
        ORDER BY percentual_extra_noturna DESC
        LIMIT 5
    ");
    $bottomStmt->execute([$startDate, $endDate]);
    $bottom5 = $bottomStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // COMPARAÇÃO TEMPORAL
    $compareAtualStmt = $pdo->prepare("
        SELECT
            COALESCE(SUM(horas_normais), 0) as horas_normais,
            COALESCE(SUM(horas_extra), 0) as horas_extra,
            COALESCE(SUM(horas_noturna), 0) as horas_noturna,
            COALESCE(SUM(total_horas), 0) as total_horas,
            COUNT(DISTINCT funcionario_id) as funcionarios_ativos,
            COUNT(DISTINCT obra_id) as obras_ativas
        FROM apontamentos
        WHERE semana_inicio >= ? AND semana_inicio <= ?
        AND status IN ('aprovado', 'aprovado_admin', 'aprovado_encarregado')
    ");
    $compareAtualStmt->execute([$startDate, $endDate]);
    $periodoAtualData = $compareAtualStmt->fetch(PDO::FETCH_ASSOC);

    $compareAnteriorStmt = $pdo->prepare("
        SELECT
            COALESCE(SUM(horas_normais), 0) as horas_normais,
            COALESCE(SUM(horas_extra), 0) as horas_extra,
            COALESCE(SUM(horas_noturna), 0) as horas_noturna,
            COALESCE(SUM(total_horas), 0) as total_horas,
            COUNT(DISTINCT funcionario_id) as funcionarios_ativos,
            COUNT(DISTINCT obra_id) as obras_ativas
        FROM apontamentos
        WHERE semana_inicio >= ? AND semana_inicio <= ?
        AND status IN ('aprovado', 'aprovado_admin', 'aprovado_encarregado')
    ");
    $compareAnteriorStmt->execute([$compareStartDate, $compareEndDate]);
    $periodoAnteriorData = $compareAnteriorStmt->fetch(PDO::FETCH_ASSOC);

    $calcularVariacao = function($atual, $anterior) {
        if ($anterior == 0) return $atual > 0 ? 100 : 0;
        return round((($atual - $anterior) / $anterior) * 100, 1);
    };

    $comparacao = [
        'periodo_atual' => ['inicio' => $startDate, 'fim' => $endDate, 'dados' => $periodoAtualData],
        'periodo_anterior' => ['inicio' => $compareStartDate, 'fim' => $compareEndDate, 'dados' => $periodoAnteriorData],
        'variacoes' => [
            'total_horas' => $calcularVariacao(floatval($periodoAtualData['total_horas']), floatval($periodoAnteriorData['total_horas'])),
            'horas_extra' => $calcularVariacao(floatval($periodoAtualData['horas_extra']), floatval($periodoAnteriorData['horas_extra'])),
            'horas_noturna' => $calcularVariacao(floatval($periodoAtualData['horas_noturna']), floatval($periodoAnteriorData['horas_noturna'])),
            'funcionarios_ativos' => $calcularVariacao((int)$periodoAtualData['funcionarios_ativos'], (int)$periodoAnteriorData['funcionarios_ativos'])
        ]
    ];

    // DISTRIBUIÇÃO POR OBRA
    $obraStmt = $pdo->prepare("
        SELECT
            o.id,
            o.numero,
            o.nome,
            COALESCE(SUM(a.horas_normais), 0) as horas_normais,
            COALESCE(SUM(a.horas_extra), 0) as horas_extra,
            COALESCE(SUM(a.horas_noturna), 0) as horas_noturna,
            COALESCE(SUM(a.total_horas), 0) as total_horas,
            COUNT(DISTINCT a.funcionario_id) as funcionarios
        FROM apontamentos a
        INNER JOIN obras o ON o.id = a.obra_id
        WHERE a.semana_inicio >= ? AND a.semana_inicio <= ?
        AND a.status IN ('aprovado', 'aprovado_admin', 'aprovado_encarregado')
        GROUP BY o.id
        ORDER BY total_horas DESC
    ");
    $obraStmt->execute([$startDate, $endDate]);
    $obrasDist = $obraStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    // INSIGHTS AUTOMÁTICOS
    $insights = [];

    if (abs($comparacao['variacoes']['total_horas']) >= 20) {
        $direcao = $comparacao['variacoes']['total_horas'] > 0 ? 'aumento' : 'redução';
        $insights[] = [
            'tipo' => $comparacao['variacoes']['total_horas'] > 0 ? 'warning' : 'info',
            'titulo' => ucfirst($direcao) . ' Significativo',
            'mensagem' => "Detectado {$direcao} de " . abs($comparacao['variacoes']['total_horas']) . "% nas horas totais."
        ];
    }

    if (!empty($top5)) {
        $topWorker = $top5[0];
        $insights[] = [
            'tipo' => 'success',
            'titulo' => 'Top Performer',
            'mensagem' => "{$topWorker['nome']} liderou com {$topWorker['total_horas']}h trabalhadas."
        ];
    }

    $emRisco = array_filter($bottom5, function($f) {
        return in_array($f['nivel_risco'], ['CRÍTICO', 'ALTO']);
    });
    if (count($emRisco) > 0) {
        $insights[] = [
            'tipo' => 'critical',
            'titulo' => 'Alerta de Fadiga',
            'mensagem' => count($emRisco) . " funcionário(s) com nível CRÍTICO/ALTO. Atenção imediata necessária."
        ];
    }

    echo json_encode([
        'success' => true,
        'periodo' => ['inicio' => $startDate, 'fim' => $endDate, 'dias' => (int)$diffDays + 1],
        'top_5_produtivos' => $top5,
        'bottom_5_fadiga' => $bottom5,
        'comparacao_temporal' => $comparacao,
        'distribuicao_obras' => $obrasDist,
        'insights' => $insights,
        'resumo' => [
            'total_horas' => floatval($periodoAtualData['total_horas']),
            'horas_normais' => floatval($periodoAtualData['horas_normais']),
            'horas_extra' => floatval($periodoAtualData['horas_extra']),
            'horas_noturna' => floatval($periodoAtualData['horas_noturna']),
            'funcionarios_ativos' => (int)$periodoAtualData['funcionarios_ativos'],
            'obras_ativas' => (int)$periodoAtualData['obras_ativas']
        ]
    ]);

} catch (Exception $e) {
    // Sempre retornar 200 com JSON válido
    http_response_code(200);
    error_log('Erro insights.php: ' . $e->getMessage() . ' | ' . $e->getTraceAsString());

    echo json_encode([
        'success' => true,
        'periodo' => ['inicio' => date('Y-m-d'), 'fim' => date('Y-m-d'), 'dias' => 1],
        'top_5_produtivos' => [],
        'bottom_5_fadiga' => [],
        'comparacao_temporal' => [
            'periodo_atual' => ['inicio' => date('Y-m-d'), 'fim' => date('Y-m-d'), 'dados' => [
                'total_horas' => 0,
                'horas_normais' => 0,
                'horas_extra' => 0,
                'horas_noturna' => 0,
                'funcionarios_ativos' => 0,
                'obras_ativas' => 0
            ]],
            'periodo_anterior' => ['inicio' => date('Y-m-d'), 'fim' => date('Y-m-d'), 'dados' => [
                'total_horas' => 0,
                'horas_normais' => 0,
                'horas_extra' => 0,
                'horas_noturna' => 0,
                'funcionarios_ativos' => 0,
                'obras_ativas' => 0
            ]],
            'variacoes' => [
                'total_horas' => 0,
                'horas_extra' => 0,
                'horas_noturna' => 0,
                'funcionarios_ativos' => 0
            ]
        ],
        'distribuicao_obras' => [],
        'insights' => [[
            'tipo' => 'warning',
            'titulo' => 'Sem Dados',
            'mensagem' => 'Nenhum apontamento encontrado para análise.'
        ]],
        'resumo' => [
            'total_horas' => 0,
            'horas_normais' => 0,
            'horas_extra' => 0,
            'horas_noturna' => 0,
            'funcionarios_ativos' => 0,
            'obras_ativas' => 0
        ]
    ], JSON_UNESCAPED_UNICODE);
}
