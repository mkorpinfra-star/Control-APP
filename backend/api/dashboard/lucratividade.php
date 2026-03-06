<?php
/**
 * API: Dashboard de Lucratividade por Obra (FASE 6)
 * GET /api/dashboard/lucratividade.php?mes=YYYY-MM
 * Retorna análise de lucratividade por obra para o mês especificado
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
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token inválido']);
    exit;
}

// Apenas admin pode acessar
if ($user['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permissão negada']);
    exit;
}

try {
    $pdo = getConnection();

    // Parâmetro de mês (padrão: mês atual)
    $mes = isset($_GET['mes']) ? $_GET['mes'] : date('Y-m');

    // Detectar coluna de ativo/ativa na tabela obras
    $colObras = $pdo->query("SHOW COLUMNS FROM obras")->fetchAll(PDO::FETCH_COLUMN);
    $obraAtivaCol = in_array('ativa', $colObras) ? 'o.ativa' : 'o.ativo';

    // Detectar coluna de total em faturamento
    $colFat = $pdo->query("SHOW COLUMNS FROM faturamento")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('valor_total_fatura', $colFat))        $colFatTotal = 'valor_total_fatura';
    elseif (in_array('total_liquido', $colFat))         $colFatTotal = 'total_liquido';
    else                                                 $colFatTotal = 'total_faturado';

    $colFatIgi  = in_array('igi_valor', $colFat)  ? 'igi_valor'  : '0';
    $colFatBrut = in_array('valor_total_servicos', $colFat) ? 'valor_total_servicos' : $colFatTotal;

    // Detectar coluna de total em folha_pagamento
    $colFolha = $pdo->query("SHOW COLUMNS FROM folha_pagamento")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('total_liquido', $colFolha))           $colFolhaTot = 'total_liquido';
    elseif (in_array('liquido_a_pagar', $colFolha))     $colFolhaTot = 'liquido_a_pagar';
    else                                                 $colFolhaTot = 'total_geral';

    $colFolhaCas  = in_array('cas_empresa_valor', $colFolha)   ? 'cas_empresa_valor'  : '0';
    $colFolhaMor  = in_array('vale_moradia', $colFolha)        ? 'vale_moradia'        : '0';
    $colFolhaIbf  = in_array('ibf', $colFolha)                 ? 'ibf'                 : '0';

    // Detectar coluna mes em faturamento e folha
    $colFatMes   = in_array('mes_referencia', $colFat)   ? 'mes_referencia'   : 'mes';
    $colFolhaMes = in_array('mes_referencia', $colFolha) ? 'mes_referencia'   : 'mes';

    $sql = "
        SELECT
            o.id as obra_id,
            o.numero as obra_numero,
            o.nome as obra_nome,
            c.nome as cliente_nome,

            -- FATURAMENTO
            COALESCE(SUM(f.{$colFatBrut}), 0) as faturamento_bruto,
            COALESCE(SUM(f.{$colFatIgi}), 0) as igi_valor,
            COALESCE(SUM(f.{$colFatTotal}), 0) as faturamento_liquido,

            -- CUSTOS
            COALESCE(SUM(fp.{$colFolhaTot}), 0) as custo_folha,
            COALESCE(SUM(fp.{$colFolhaCas}), 0) as cas_empresa,
            COALESCE(SUM(fp.{$colFolhaMor}), 0) as vale_moradia_total,
            COALESCE(SUM(fp.{$colFolhaIbf}), 0) as ibf_total,

            -- LUCRO
            (COALESCE(SUM(f.{$colFatTotal}), 0) - COALESCE(SUM(fp.{$colFolhaTot}), 0) - COALESCE(SUM(fp.{$colFolhaCas}), 0) - COALESCE(SUM(fp.{$colFolhaMor}), 0) - COALESCE(SUM(fp.{$colFolhaIbf}), 0)) as lucro_liquido,

            -- MARGEM %
            CASE
                WHEN COALESCE(SUM(f.{$colFatTotal}), 0) > 0 THEN
                    ROUND(((COALESCE(SUM(f.{$colFatTotal}), 0) - COALESCE(SUM(fp.{$colFolhaTot}), 0) - COALESCE(SUM(fp.{$colFolhaCas}), 0) - COALESCE(SUM(fp.{$colFolhaMor}), 0) - COALESCE(SUM(fp.{$colFolhaIbf}), 0)) / COALESCE(SUM(f.{$colFatTotal}), 0) * 100), 2)
                ELSE 0
            END as margem_percentual

        FROM obras o
        LEFT JOIN clientes c ON c.id = o.cliente_id
        LEFT JOIN faturamento f ON f.obra_id = o.id AND f.{$colFatMes} = ?
        LEFT JOIN folha_pagamento fp ON fp.obra_id = o.id AND fp.{$colFolhaMes} = ?
        WHERE {$obraAtivaCol} = 1
        GROUP BY o.id
        HAVING faturamento_bruto > 0 OR custo_folha > 0
        ORDER BY lucro_liquido DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$mes, $mes]);
    $lucratividade = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calcular totais gerais
    $totais = [
        'faturamento_bruto' => 0,
        'igi_valor' => 0,
        'faturamento_liquido' => 0,
        'custo_folha' => 0,
        'cas_empresa' => 0,
        'vale_moradia_total' => 0,
        'ibf_total' => 0,
        'lucro_liquido' => 0
    ];

    foreach ($lucratividade as $item) {
        foreach ($totais as $key => $value) {
            $totais[$key] += floatval($item[$key]);
        }
    }

    $totais['margem_percentual'] = $totais['faturamento_liquido'] > 0
        ? round(($totais['lucro_liquido'] / $totais['faturamento_liquido']) * 100, 2)
        : 0;

    echo json_encode([
        'success' => true,
        'mes' => $mes,
        'obras' => $lucratividade,
        'totais' => $totais
    ]);

} catch (Exception $e) {
    // Log error mas retorna resposta vazia ao invés de 500
    error_log('Erro lucratividade.php: ' . $e->getMessage());

    echo json_encode([
        'success' => true,
        'mes' => $mes ?? date('Y-m'),
        'obras' => [],
        'totais' => [
            'faturamento_bruto' => 0,
            'igi_valor' => 0,
            'faturamento_liquido' => 0,
            'custo_folha' => 0,
            'cas_empresa' => 0,
            'vale_moradia_total' => 0,
            'ibf_total' => 0,
            'lucro_liquido' => 0,
            'margem_percentual' => 0
        ]
    ]);
}
