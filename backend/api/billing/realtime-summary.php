<?php
/**
 * FATURAMENTO REAL-TIME
 * Calcula faturamento ao vivo baseado nos apontamentos salvos (inclusive rascunhos)
 * Não depende de geração manual - calcula tudo automaticamente
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../includes/tenant_middleware.php';
require_once '../../config/database.php';

$auth = validateTenantAccess(['admin']);
$tenant_id = $auth['tenant_id'];

try {
    $mesReferencia = $_GET['mes'] ?? date('Y-m');
    $obraId = isset($_GET['obra_id']) && $_GET['obra_id'] !== 'all' ? (int)$_GET['obra_id'] : null;

    $pdo = getConnection();

    // Buscar configurações de faturamento do tenant
    $configStmt = $pdo->prepare("
        SELECT
            cvf.valor_hora_normal_faturamento as valor_hora_normal,
            cvf.valor_hora_extra_faturamento as valor_hora_extra,
            cvf.valor_hora_noturna_faturamento as valor_hora_noturna,
            cf.igi_percentual
        FROM config_valores_faturamento cvf
        LEFT JOIN config_fiscal cf ON cf.tenant_id = cvf.tenant_id
        WHERE cvf.tenant_id = :tenant_id
        LIMIT 1
    ");
    $configStmt->execute(['tenant_id' => $tenant_id]);
    $config = $configStmt->fetch(PDO::FETCH_ASSOC);

    if (!$config) {
        echo json_encode([
            'success' => false,
            'message' => 'Configure os valores de faturamento primeiro em Configuração → Valores de Faturamento'
        ]);
        exit;
    }

    // Query principal: agrupa apontamentos por obra, somando horas
    // Considera TODOS os apontamentos (rascunho, enviado, aprovado, rejeitado)
    $whereObra = $obraId ? " AND o.id = :obra_id" : "";
    $params = [
        'tenant_id' => $tenant_id,
        'mes_inicio' => $mesReferencia . '-01'
    ];
    if ($obraId) $params['obra_id'] = $obraId;

    $stmt = $pdo->prepare("
        SELECT
            o.id as obra_id,
            o.nome as obra_nome,
            o.numero as obra_numero,
            c.nome as cliente_nome,
            o.permite_hora_extra,
            o.permite_hora_noturna,

            -- Somar horas (respeitar permissões da obra)
            COALESCE(SUM(a.horas_normais), 0) as total_horas_normais,
            COALESCE(SUM(CASE WHEN o.permite_hora_extra = 1 THEN a.horas_extra ELSE 0 END), 0) as total_horas_extra,
            COALESCE(SUM(CASE WHEN o.permite_hora_noturna = 1 THEN a.horas_noturna ELSE 0 END), 0) as total_horas_noturna

        FROM obras o
        LEFT JOIN apontamentos a ON a.obra_id = o.id
            AND a.tenant_id = ?
            AND DATE_FORMAT(a.semana_inicio, '%Y-%m') = DATE_FORMAT(?, '%Y-%m')
            AND a.deletado_em IS NULL
        LEFT JOIN clientes c ON c.id = o.cliente_id
        WHERE o.tenant_id = ?
        $whereObra
        GROUP BY o.id, o.nome, o.numero, c.nome, o.permite_hora_extra, o.permite_hora_noturna
        HAVING total_horas_normais > 0 OR total_horas_extra > 0 OR total_horas_noturna > 0
        ORDER BY o.nome
    ");

    // Executar com array posicional (? ? ?)
    $executeParams = [$tenant_id, $mesReferencia . '-01', $tenant_id];
    if ($obraId) {
        $executeParams[] = $obraId;
    }
    $stmt->execute($executeParams);
    $obras = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calcular valores para cada obra
    $faturas = [];
    $totalServicos = 0;
    $totalIGI = 0;
    $totalFaturamento = 0;

    foreach ($obras as $obra) {
        $horasNormais = floatval($obra['total_horas_normais'] ?? 0);
        $horasExtra = floatval($obra['total_horas_extra'] ?? 0);
        $horasNoturna = floatval($obra['total_horas_noturna'] ?? 0);

        // Valores de faturamento (o que cobramos do cliente)
        $valorHoraNormal = floatval($config['valor_hora_normal'] ?? 0);
        $valorHoraExtra = floatval($config['valor_hora_extra'] ?? 0);
        $valorHoraNoturna = floatval($config['valor_hora_noturna'] ?? 0);

        // Cálculos
        $valorServicosNormais = $horasNormais * $valorHoraNormal;
        $valorServicosExtra = $horasExtra * $valorHoraExtra;
        $valorServicosNoturna = $horasNoturna * $valorHoraNoturna;
        $valorTotalServicos = $valorServicosNormais + $valorServicosExtra + $valorServicosNoturna;

        // IGI (imposto)
        $igiPercentual = floatval($config['igi_percentual'] ?? 0);
        $igiValor = ($valorTotalServicos * $igiPercentual) / 100;

        // Total da fatura
        $valorTotalFatura = $valorTotalServicos + $igiValor;

        $fatura = [
            'obra_id' => $obra['obra_id'],
            'obra_nome' => $obra['obra_nome'],
            'obra_numero' => $obra['obra_numero'],
            'cliente_nome' => $obra['cliente_nome'],
            'horas_normais' => $horasNormais,
            'horas_extra' => $horasExtra,
            'horas_noturna' => $horasNoturna,
            'valor_hora_normal' => $valorHoraNormal,
            'valor_hora_extra' => $valorHoraExtra,
            'valor_hora_noturna' => $valorHoraNoturna,
            'valor_total_servicos' => $valorTotalServicos,
            'igi_percentual' => $igiPercentual,
            'igi_valor' => $igiValor,
            'valor_total_fatura' => $valorTotalFatura,
        ];

        $faturas[] = $fatura;
        $totalServicos += $valorTotalServicos;
        $totalIGI += $igiValor;
        $totalFaturamento += $valorTotalFatura;
    }

    echo json_encode([
        'success' => true,
        'mes_referencia' => $mesReferencia,
        'faturas' => $faturas,
        'totais' => [
            'total_obras' => count($faturas),
            'total_servicos' => $totalServicos,
            'total_igi' => $totalIGI,
            'total_faturamento' => $totalFaturamento
        ],
        'config' => [
            'valor_hora_normal' => floatval($config['valor_hora_normal'] ?? 0),
            'valor_hora_extra' => floatval($config['valor_hora_extra'] ?? 0),
            'valor_hora_noturna' => floatval($config['valor_hora_noturna'] ?? 0),
            'igi_percentual' => floatval($config['igi_percentual'] ?? 0)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao calcular faturamento: ' . $e->getMessage()
    ]);
}
