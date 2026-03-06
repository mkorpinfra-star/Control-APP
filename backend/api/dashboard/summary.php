<?php
/**
 * DASHBOARD SUMMARY
 * GET /api/dashboard/summary.php
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
$authHeader = isset($headers['Authorization']) ? $headers['Authorization']
    : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);

if (!$user || !in_array($user['tipo'], ['admin', 'encarregado'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permissão negada']);
    exit;
}

// Helper: lista colunas de uma tabela
function getCols($pdo, $table) {
    try {
        return $pdo->query("SHOW COLUMNS FROM `{$table}`")->fetchAll(PDO::FETCH_COLUMN);
    } catch (Exception $e) {
        return [];
    }
}

// Helper: soma horas de um JSON horas_diarias (festivo = 8h normal para empresa)
function somarHorasJson($raw) {
    $n = 0; $e = 0; $nt = 0;
    $hd = is_string($raw) ? json_decode($raw, true) : $raw;
    if (!is_array($hd)) return ['n' => 0, 'e' => 0, 'nt' => 0];
    foreach ($hd as $day => $h) {
        if (is_array($h)) {
            if (!empty($h['festivo'])) {
                $n += 8.0; // empresa paga 8h normal em dia festivo
            } else {
                $n  += floatval($h['normal']  ?? 0);
                $e  += floatval($h['extra']   ?? 0);
                $nt += floatval($h['noturna'] ?? 0);
            }
        } elseif (is_numeric($h)) {
            $n += floatval($h);
        }
    }
    return ['n' => $n, 'e' => $e, 'nt' => $nt];
}

try {
    $pdo = getConnection();
    $mesAtual = date('Y-m');
    $erros = [];

    $kpis = [
        'total_obras_ativas'        => 0,
        'total_funcionarios_ativos' => 0,
        'total_clientes'            => 0,
        'horas_mes_atual'           => 0,
        'faturamento_mes_atual'     => 0,
        'folha_mes_atual'           => 0,
        'lucro_mes_atual'           => 0,
        'margem_mes_atual'          => 0
    ];

    // ── Obras ativas ────────────────────────────────────────────────────────
    try {
        $colObras = getCols($pdo, 'obras');
        $whereAtiva = '';
        if (in_array('ativa', $colObras) && in_array('ativo', $colObras)) {
            $whereAtiva = "WHERE ativo = 1 OR ativa = 1";
        } elseif (in_array('ativa', $colObras)) {
            $whereAtiva = "WHERE ativa = 1";
        } elseif (in_array('ativo', $colObras)) {
            $whereAtiva = "WHERE ativo = 1";
        }
        $kpis['total_obras_ativas'] = (int)$pdo->query("SELECT COUNT(*) FROM obras {$whereAtiva}")->fetchColumn();
    } catch (Exception $e) {
        $erros[] = 'obras: ' . $e->getMessage();
    }

    // ── Funcionários ativos (excluindo admin) ────────────────────────────────
    try {
        $colUsers = getCols($pdo, 'usuarios');
        $whereFunc = '';
        $conditions = [];
        if (in_array('ativo', $colUsers))  $conditions[] = "ativo = 1";
        if (in_array('tipo', $colUsers))   $conditions[] = "tipo != 'admin'";
        if ($conditions) $whereFunc = "WHERE " . implode(" AND ", $conditions);
        $kpis['total_funcionarios_ativos'] = (int)$pdo->query("SELECT COUNT(*) FROM usuarios {$whereFunc}")->fetchColumn();
    } catch (Exception $e) {
        $erros[] = 'usuarios: ' . $e->getMessage();
    }

    // ── Clientes ─────────────────────────────────────────────────────────────
    try {
        $colClientes = getCols($pdo, 'clientes');
        $whereClientes = in_array('ativo', $colClientes) ? "WHERE ativo = 1" : "";
        $kpis['total_clientes'] = (int)$pdo->query("SELECT COUNT(*) FROM clientes {$whereClientes}")->fetchColumn();
    } catch (Exception $e) {
        $erros[] = 'clientes: ' . $e->getMessage();
    }

    // ── Horas do mês via JSON horas_diarias ──────────────────────────────────
    $distHoras = ['normais' => 0, 'extra' => 0, 'noturna' => 0];
    try {
        $stmtH = $pdo->prepare("
            SELECT horas_diarias
            FROM apontamentos
            WHERE DATE_FORMAT(semana_inicio, '%Y-%m') = ?
              AND status IN ('aprovado', 'aprovado_encarregado')
        ");
        $stmtH->execute([$mesAtual]);
        $horasRows = $stmtH->fetchAll(PDO::FETCH_COLUMN);

        $totalHoras = 0;
        foreach ($horasRows as $raw) {
            $r = somarHorasJson($raw);
            $totalHoras             += $r['n'] + $r['e'] + $r['nt'];
            $distHoras['normais']   += $r['n'];
            $distHoras['extra']     += $r['e'];
            $distHoras['noturna']   += $r['nt'];
        }
        $kpis['horas_mes_atual'] = round($totalHoras, 1);
    } catch (Exception $e) {
        $erros[] = 'horas: ' . $e->getMessage();
    }

    // ── Faturamento do mês ───────────────────────────────────────────────────
    $colFatNome = null;
    $colFatMes  = 'mes_referencia';
    try {
        $colFat = getCols($pdo, 'faturamento');
        // coluna de valor total
        if (in_array('valor_total_fatura', $colFat))  $colFatNome = 'valor_total_fatura';
        elseif (in_array('total_liquido', $colFat))   $colFatNome = 'total_liquido';
        elseif (in_array('total_faturado', $colFat))  $colFatNome = 'total_faturado';
        // coluna do mês
        $colFatMes = in_array('mes_referencia', $colFat) ? 'mes_referencia' : 'mes';

        if ($colFatNome) {
            $s = $pdo->prepare("SELECT COALESCE(SUM({$colFatNome}), 0) FROM faturamento WHERE {$colFatMes} = ?");
            $s->execute([$mesAtual]);
            $kpis['faturamento_mes_atual'] = (float)$s->fetchColumn();
        }
    } catch (Exception $e) {
        $erros[] = 'faturamento: ' . $e->getMessage();
    }

    // ── Folha do mês ─────────────────────────────────────────────────────────
    $colFolhaNome = null;
    $colFolhaMes  = 'mes_referencia';
    try {
        $colFolha = getCols($pdo, 'folha_pagamento');
        // coluna de valor líquido
        if (in_array('total_liquido', $colFolha))      $colFolhaNome = 'total_liquido';
        elseif (in_array('liquido_a_pagar', $colFolha)) $colFolhaNome = 'liquido_a_pagar';
        elseif (in_array('total_geral', $colFolha))    $colFolhaNome = 'total_geral';
        // coluna do mês
        $colFolhaMes = in_array('mes_referencia', $colFolha) ? 'mes_referencia' : 'mes';

        if ($colFolhaNome) {
            $s = $pdo->prepare("SELECT COALESCE(SUM({$colFolhaNome}), 0) FROM folha_pagamento WHERE {$colFolhaMes} = ?");
            $s->execute([$mesAtual]);
            $kpis['folha_mes_atual'] = (float)$s->fetchColumn();
        }
    } catch (Exception $e) {
        $erros[] = 'folha: ' . $e->getMessage();
    }

    // ── Lucro e margem ───────────────────────────────────────────────────────
    $kpis['lucro_mes_atual'] = $kpis['faturamento_mes_atual'] - $kpis['folha_mes_atual'];
    if ($kpis['faturamento_mes_atual'] > 0) {
        $kpis['margem_mes_atual'] = round(($kpis['lucro_mes_atual'] / $kpis['faturamento_mes_atual']) * 100, 2);
    }

    // ── Top obras por horas aprovadas ────────────────────────────────────────
    $topObrasData = [];
    try {
        $stmtTop = $pdo->prepare("
            SELECT a.obra_id, o.numero, o.nome, a.horas_diarias
            FROM apontamentos a
            INNER JOIN obras o ON o.id = a.obra_id
            WHERE DATE_FORMAT(a.semana_inicio, '%Y-%m') = ?
              AND a.status IN ('aprovado', 'aprovado_encarregado')
        ");
        $stmtTop->execute([$mesAtual]);
        $topRows = $stmtTop->fetchAll(PDO::FETCH_ASSOC);

        $obraHoras = []; $obraInfo = [];
        foreach ($topRows as $ar) {
            $oid = $ar['obra_id'];
            $obraInfo[$oid] = ['numero' => $ar['numero'], 'nome' => $ar['nome']];
            if (!isset($obraHoras[$oid])) $obraHoras[$oid] = 0;
            $r = somarHorasJson($ar['horas_diarias']);
            $obraHoras[$oid] += $r['n'] + $r['e'] + $r['nt'];
        }
        arsort($obraHoras);
        $cnt = 0;
        foreach ($obraHoras as $oid => $hTotal) {
            if ($cnt >= 5) break;
            $topObrasData[] = [
                'numero'      => $obraInfo[$oid]['numero'],
                'nome'        => $obraInfo[$oid]['nome'],
                'horas_total' => round($hTotal, 1)
            ];
            $cnt++;
        }
    } catch (Exception $e) {
        $erros[] = 'top_obras: ' . $e->getMessage();
    }

    // ── Evolução mensal (últimos 6 meses) ────────────────────────────────────
    $evolucao = [];
    for ($i = 5; $i >= 0; $i--) {
        $mes = date('Y-m', strtotime("-$i months"));
        $evHoras = 0;
        $fat = 0; $folha = 0;

        try {
            $stmtEv = $pdo->prepare("
                SELECT horas_diarias
                FROM apontamentos
                WHERE DATE_FORMAT(semana_inicio, '%Y-%m') = ?
                  AND status IN ('aprovado', 'aprovado_encarregado')
            ");
            $stmtEv->execute([$mes]);
            foreach ($stmtEv->fetchAll(PDO::FETCH_COLUMN) as $raw) {
                $r = somarHorasJson($raw);
                $evHoras += $r['n'] + $r['e'] + $r['nt'];
            }
        } catch (Exception $e) {}

        try {
            if ($colFatNome) {
                $s = $pdo->prepare("SELECT COALESCE(SUM({$colFatNome}), 0) FROM faturamento WHERE {$colFatMes} = ?");
                $s->execute([$mes]); $fat = (float)$s->fetchColumn();
            }
        } catch (Exception $e) {}

        try {
            if ($colFolhaNome) {
                $s = $pdo->prepare("SELECT COALESCE(SUM({$colFolhaNome}), 0) FROM folha_pagamento WHERE {$colFolhaMes} = ?");
                $s->execute([$mes]); $folha = (float)$s->fetchColumn();
            }
        } catch (Exception $e) {}

        $evolucao[] = [
            'mes'         => $mes,
            'mes_label'   => date('M/y', strtotime($mes . '-01')),
            'faturamento' => $fat,
            'folha'       => $folha,
            'lucro'       => $fat - $folha,
            'horas'       => round($evHoras, 1)
        ];
    }

    // ── Mapa de calor (últimos 90 dias) ──────────────────────────────────────
    $heatmap = [];
    try {
        $dt90 = date('Y-m-d', strtotime('-90 days'));
        $stmtHM = $pdo->prepare("
            SELECT horas_diarias, semana_inicio
            FROM apontamentos
            WHERE semana_inicio >= ?
              AND status IN ('aprovado', 'aprovado_encarregado')
            ORDER BY semana_inicio ASC
        ");
        $stmtHM->execute([$dt90]);
        $hmRows = $stmtHM->fetchAll(PDO::FETCH_ASSOC);

        $dayNames = ['mon'=>0,'tue'=>1,'wed'=>2,'thu'=>3,'fri'=>4,'sat'=>5,'sun'=>6];
        $byDay = [];
        foreach ($hmRows as $row) {
            $hd = is_string($row['horas_diarias']) ? json_decode($row['horas_diarias'], true) : $row['horas_diarias'];
            if (!is_array($hd)) continue;
            foreach ($hd as $dayKey => $h) {
                if (is_array($h) && !empty($h['fecha'])) {
                    $date  = $h['fecha'];
                    $total = !empty($h['festivo']) ? 8.0 : (floatval($h['normal'] ?? 0) + floatval($h['extra'] ?? 0) + floatval($h['noturna'] ?? 0));
                } elseif (is_array($h)) {
                    $off   = $dayNames[$dayKey] ?? 0;
                    $date  = date('Y-m-d', strtotime($row['semana_inicio'] . " +{$off} days"));
                    $total = !empty($h['festivo']) ? 8.0 : (floatval($h['normal'] ?? 0) + floatval($h['extra'] ?? 0) + floatval($h['noturna'] ?? 0));
                } elseif (is_numeric($h)) {
                    $off   = $dayNames[$dayKey] ?? 0;
                    $date  = date('Y-m-d', strtotime($row['semana_inicio'] . " +{$off} days"));
                    $total = floatval($h);
                } else {
                    continue;
                }
                $byDay[$date] = ($byDay[$date] ?? 0) + $total;
            }
        }
        for ($i = 89; $i >= 0; $i--) {
            $d = date('Y-m-d', strtotime("-$i days"));
            $heatmap[] = ['date' => $d, 'value' => round($byDay[$d] ?? 0, 1)];
        }
    } catch (Exception $e) {
        $erros[] = 'heatmap: ' . $e->getMessage();
    }

    echo json_encode([
        'success'            => true,
        'kpis'               => $kpis,
        'top_obras'          => $topObrasData,
        'distribuicao_horas' => $distHoras,
        'evolucao_mensal'    => $evolucao,
        'heatmap'            => $heatmap,
        '_debug_errors'      => $erros   // visível apenas em desenvolvimento
    ]);

} catch (Exception $e) {
    error_log('Erro summary.php: ' . $e->getMessage());
    echo json_encode([
        'success' => true,
        'kpis' => [
            'total_obras_ativas' => 0, 'total_funcionarios_ativos' => 0,
            'total_clientes' => 0, 'horas_mes_atual' => 0,
            'faturamento_mes_atual' => 0, 'folha_mes_atual' => 0,
            'lucro_mes_atual' => 0, 'margem_mes_atual' => 0
        ],
        'top_obras' => [],
        'distribuicao_horas' => ['normais' => 0, 'extra' => 0, 'noturna' => 0],
        'evolucao_mensal' => [],
        'heatmap' => [],
        '_debug_errors' => [$e->getMessage()]
    ]);
}
