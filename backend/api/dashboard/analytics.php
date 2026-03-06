<?php
/**
 * API: Dashboard Analytics - Dados completos para IA e gráficos
 * GET /api/dashboard/analytics.php?mes=2026-02&obra_id=X
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

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Apenas admin pode ver dashboard completo
if ($user['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$mes = isset($_GET['mes']) ? $_GET['mes'] : date('Y-m');
$obraId = isset($_GET['obra_id']) ? intval($_GET['obra_id']) : null;

try {
    $pdo = getConnection();

    // Buscar valores configurados
    $stmt = $pdo->query("SELECT * FROM config_valores ORDER BY id DESC LIMIT 1");
    $config = $stmt->fetch(PDO::FETCH_ASSOC);
    $valorNormal = isset($config['valor_hora_normal']) ? floatval($config['valor_hora_normal']) : 21.00;
    $valorExtra = isset($config['valor_hora_extra']) ? floatval($config['valor_hora_extra']) : 28.00;
    $valorNoturna = isset($config['valor_hora_noturna']) ? floatval($config['valor_hora_noturna']) : 30.00;

    // Calcular período
    $mesInicio = $mes . '-01';
    $mesFim = date('Y-m-t', strtotime($mesInicio));

    // QUERY PRINCIPAL: Buscar todos apontamentos aprovados do mês
    $whereClause = "a.status IN ('aprovado', 'aprovado_encarregado')
                    AND a.semana_inicio >= ?
                    AND a.semana_inicio <= ?";
    $params = [$mesInicio, $mesFim];

    if ($obraId) {
        $whereClause .= " AND a.obra_id = ?";
        $params[] = $obraId;
    }

    $sql = "SELECT
                a.*,
                u.nome as funcionario_nome,
                u.passaporte as funcionario_passaporte,
                u.foto_url,
                o.nome as obra_nome,
                o.numero as obra_numero,
                DATE(a.criado_em) as data_registro,
                DATEDIFF(a.aprovado_em, a.enviado_em) as dias_para_aprovacao
            FROM apontamentos a
            INNER JOIN usuarios u ON u.id = a.funcionario_id
            INNER JOIN obras o ON o.id = a.obra_id
            WHERE $whereClause
            ORDER BY a.semana_inicio DESC, u.nome";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // === PROCESSAMENTO DE DADOS ===

    $funcionariosData = [];
    $obrasData = [];
    $totaisGerais = ['normal' => 0, 'extra' => 0, 'noturna' => 0, 'total' => 0];
    $custosGerais = ['normal' => 0, 'extra' => 0, 'noturna' => 0, 'total' => 0];
    $diasSemana = ['mon' => 0, 'tue' => 0, 'wed' => 0, 'thu' => 0, 'fri' => 0, 'sat' => 0];
    $registrosPorDia = [];
    $alertas = [];

    foreach ($apontamentos as $apt) {
        $funcId = $apt['funcionario_id'];
        $obraIdLocal = $apt['obra_id'];

        // Inicializar funcionário
        if (!isset($funcionariosData[$funcId])) {
            $funcionariosData[$funcId] = [
                'id' => $funcId,
                'nome' => $apt['funcionario_nome'],
                'passaporte' => $apt['funcionario_passaporte'],
                'foto_url' => $apt['foto_url'],
                'horas_normal' => 0,
                'horas_extra' => 0,
                'horas_noturna' => 0,
                'horas_total' => 0,
                'custo_total' => 0,
                'semanas_trabalhadas' => 0,
                'media_horas_semana' => 0,
                'obras' => []
            ];
        }

        // Inicializar obra
        if (!isset($obrasData[$obraIdLocal])) {
            $obrasData[$obraIdLocal] = [
                'id' => $obraIdLocal,
                'nome' => $apt['obra_nome'],
                'numero' => $apt['obra_numero'],
                'horas_total' => 0,
                'custo_total' => 0,
                'funcionarios_count' => 0
            ];
        }

        // Processar horas diárias
        $horasDiarias = json_decode($apt['horas_diarias'], true);
        $semanaHoras = ['normal' => 0, 'extra' => 0, 'noturna' => 0];

        if ($horasDiarias) {
            foreach ($horasDiarias as $dia => $horas) {
                if (is_array($horas)) {
                    // Festivo: empresa paga 8h normal
                    if (!empty($horas['festivo'])) {
                        $semanaHoras['normal'] += 8.0;
                        if (isset($diasSemana[$dia])) {
                            $diasSemana[$dia] += 8.0;
                        }
                    } else {
                        $n = floatval($horas['normal'] ?? 0);
                        $e = floatval($horas['extra'] ?? 0);
                        $t = floatval($horas['noturna'] ?? 0);
                        $semanaHoras['normal']  += $n;
                        $semanaHoras['extra']   += $e;
                        $semanaHoras['noturna'] += $t;
                        // Mapa de calor (dias da semana)
                        if (isset($diasSemana[$dia])) {
                            $diasSemana[$dia] += $n + $e + $t;
                        }
                    }
                } else {
                    $semanaHoras['normal'] += floatval($horas);
                }
            }
        }

        $totalSemana = $semanaHoras['normal'] + $semanaHoras['extra'] + $semanaHoras['noturna'];

        // Atualizar funcionário
        $funcionariosData[$funcId]['horas_normal'] += $semanaHoras['normal'];
        $funcionariosData[$funcId]['horas_extra'] += $semanaHoras['extra'];
        $funcionariosData[$funcId]['horas_noturna'] += $semanaHoras['noturna'];
        $funcionariosData[$funcId]['horas_total'] += $totalSemana;
        $funcionariosData[$funcId]['semanas_trabalhadas']++;

        $custoSemana = ($semanaHoras['normal'] * $valorNormal) +
                       ($semanaHoras['extra'] * $valorExtra) +
                       ($semanaHoras['noturna'] * $valorNoturna);
        $funcionariosData[$funcId]['custo_total'] += $custoSemana;

        // Atualizar obra
        $obrasData[$obraIdLocal]['horas_total'] += $totalSemana;
        $obrasData[$obraIdLocal]['custo_total'] += $custoSemana;

        // Totais gerais
        $totaisGerais['normal'] += $semanaHoras['normal'];
        $totaisGerais['extra'] += $semanaHoras['extra'];
        $totaisGerais['noturna'] += $semanaHoras['noturna'];
        $totaisGerais['total'] += $totalSemana;

        $custosGerais['normal'] += $semanaHoras['normal'] * $valorNormal;
        $custosGerais['extra'] += $semanaHoras['extra'] * $valorExtra;
        $custosGerais['noturna'] += $semanaHoras['noturna'] * $valorNoturna;
        $custosGerais['total'] += $custoSemana;

        // Registros por dia (para timeline)
        $diaRegistro = substr($apt['data_registro'], 0, 10);
        if (!isset($registrosPorDia[$diaRegistro])) {
            $registrosPorDia[$diaRegistro] = 0;
        }
        $registrosPorDia[$diaRegistro]++;

        // === DETECÇÃO DE ANOMALIAS (IA) ===

        // Alerta: Mais de 60h na semana (fadiga)
        if ($totalSemana > 60) {
            $alertas[] = [
                'tipo' => 'fadiga',
                'gravidade' => 'alta',
                'funcionario' => $apt['funcionario_nome'],
                'mensagem' => "Risco de fadiga: {$totalSemana}h na semana " . date('d/m', strtotime($apt['semana_inicio'])),
                'data' => $apt['semana_inicio']
            ];
        }

        // Alerta: Excesso de horas extras (>40% do total)
        if ($totalSemana > 0 && ($semanaHoras['extra'] / $totalSemana) > 0.4) {
            $alertas[] = [
                'tipo' => 'custo_alto',
                'gravidade' => 'media',
                'funcionario' => $apt['funcionario_nome'],
                'mensagem' => "Excesso de horas extras: " . round(($semanaHoras['extra'] / $totalSemana) * 100) . "%",
                'data' => $apt['semana_inicio']
            ];
        }

        // Alerta: Demora na aprovação (>5 dias)
        if ($apt['dias_para_aprovacao'] > 5) {
            $alertas[] = [
                'tipo' => 'aprovacao_lenta',
                'gravidade' => 'baixa',
                'mensagem' => "Aprovação demorada: {$apt['dias_para_aprovacao']} dias",
                'obra' => $apt['obra_nome'],
                'data' => $apt['semana_inicio']
            ];
        }
    }

    // Calcular médias e rankings
    foreach ($funcionariosData as &$func) {
        $func['media_horas_semana'] = $func['semanas_trabalhadas'] > 0
            ? round($func['horas_total'] / $func['semanas_trabalhadas'], 1)
            : 0;
        $func['percentual_extras'] = $func['horas_total'] > 0
            ? round(($func['horas_extra'] / $func['horas_total']) * 100, 1)
            : 0;
    }

    // Ordenar rankings
    $funcionariosArray = array_values($funcionariosData);

    usort($funcionariosArray, function($a, $b) {
        return $b['horas_total'] <=> $a['horas_total'];
    });
    $topPerformers = array_slice($funcionariosArray, 0, 5);

    usort($funcionariosArray, function($a, $b) {
        return $b['custo_total'] <=> $a['custo_total'];
    });
    $maisCustosos = array_slice($funcionariosArray, 0, 5);

    // KPIs
    $totalFuncionarios = count($funcionariosData);
    $percentualNormal = $totaisGerais['total'] > 0
        ? round(($totaisGerais['normal'] / $totaisGerais['total']) * 100, 1)
        : 0;
    $custoMedioHora = $totaisGerais['total'] > 0
        ? round($custosGerais['total'] / $totaisGerais['total'], 2)
        : 0;

    // Resposta
    echo json_encode([
        'success' => true,
        'periodo' => $mes,
        'kpis' => [
            'total_funcionarios' => $totalFuncionarios,
            'total_obras' => count($obrasData),
            'horas_totais' => round($totaisGerais['total'], 1),
            'custo_total' => round($custosGerais['total'], 2),
            'custo_medio_hora' => $custoMedioHora,
            'eficiencia_operacional' => $percentualNormal,
            'total_alertas' => count($alertas)
        ],
        'totais' => $totaisGerais,
        'custos' => $custosGerais,
        'distribuicao' => [
            'normal' => round($totaisGerais['normal'], 1),
            'extra' => round($totaisGerais['extra'], 1),
            'noturna' => round($totaisGerais['noturna'], 1)
        ],
        'mapa_calor' => $diasSemana,
        'timeline_registros' => $registrosPorDia,
        'rankings' => [
            'top_performers' => $topPerformers,
            'mais_custosos' => $maisCustosos
        ],
        'obras' => array_values($obrasData),
        'funcionarios' => $funcionariosArray,
        'alertas' => $alertas,
        'config' => [
            'valor_normal' => $valorNormal,
            'valor_extra' => $valorExtra,
            'valor_noturna' => $valorNoturna
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
