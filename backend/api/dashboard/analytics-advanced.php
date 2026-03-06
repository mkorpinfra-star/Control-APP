<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once __DIR__ . '/../../includes/horas_helper.php';

// Autenticação — suporta tanto includes/auth.php quanto middleware/auth.php
if (file_exists(__DIR__ . '/../../includes/auth.php')) {
    require_once __DIR__ . '/../../includes/auth.php';
    $user = authMiddleware(['admin', 'encarregado']);
} elseif (file_exists(__DIR__ . '/../../middleware/auth.php')) {
    require_once __DIR__ . '/../../middleware/auth.php';
    $auth = authenticate();
    if (!$auth['success']) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => $auth['error']]);
        exit;
    }
    $user = $auth['user'];
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Auth module not found']);
    exit;
}

try {
    $pdo = getConnection();

    // Parâmetros
    $startDate = $_GET['start_date'] ?? date('Y-m-01');
    $endDate   = $_GET['end_date']   ?? date('Y-m-t');
    $obraId    = isset($_GET['obra_id'])     && $_GET['obra_id']     !== 'all' ? (int)$_GET['obra_id']     : null;
    $employeeId= isset($_GET['employee_id']) && $_GET['employee_id'] !== 'all' ? (int)$_GET['employee_id'] : null;
    $compareStartDate = $_GET['compare_start_date'] ?? null;
    $compareEndDate   = $_GET['compare_end_date']   ?? null;

    // Buscar valores configurados (tenta config_valores primeiro, depois config)
    $valores = ['valor_hora_normal' => 21.0, 'valor_hora_extra' => 28.0, 'valor_hora_noturna' => 30.0];
    try {
        $vStmt = $pdo->query("SELECT tipo_hora, valor_euro FROM config_valores WHERE ativo = 1");
        while ($row = $vStmt->fetch(PDO::FETCH_ASSOC)) {
            if ($row['tipo_hora'] === 'normal')   $valores['valor_hora_normal']  = (float)$row['valor_euro'];
            if ($row['tipo_hora'] === 'extra')    $valores['valor_hora_extra']   = (float)$row['valor_euro'];
            if ($row['tipo_hora'] === 'noturna')  $valores['valor_hora_noturna'] = (float)$row['valor_euro'];
        }
    } catch (Exception $e) { /* usa defaults */ }

    // ── Helper: busca apontamentos e calcula horas via JSON ──────────────────
    function fetchAndCalcHoras(PDO $pdo, string $start, string $end, ?int $obraId, ?int $empId): array {
        $where = "a.status IN ('aprovado','aprovado_encarregado') AND a.semana_inicio >= ? AND a.semana_inicio <= ?";
        $params = [$start, $end];
        if ($obraId)  { $where .= " AND a.obra_id = ?";       $params[] = $obraId; }
        if ($empId)   { $where .= " AND a.funcionario_id = ?"; $params[] = $empId; }

        $stmt = $pdo->prepare("
            SELECT a.funcionario_id, a.obra_id, a.semana_inicio, a.horas_diarias,
                   u.nome as func_nome, o.id as o_id, o.numero as o_num, o.nome as o_nome
            FROM apontamentos a
            JOIN usuarios u ON u.id = a.funcionario_id
            JOIN obras    o ON o.id = a.obra_id
            WHERE $where
        ");
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $rows = fetchAndCalcHoras($pdo, $startDate, $endDate, $obraId, $employeeId);

    // Agregar totais
    $totaisNormal = 0; $totaisExtra = 0; $totaisNoturna = 0;
    $funcMap = []; $obraMap = []; $semanaMap = [];
    $totalRegistros = count($rows);

    foreach ($rows as $r) {
        $h = calcularHorasJson($r['horas_diarias'], false); // empresa: festivo=8h

        $totaisNormal  += $h['normais'];
        $totaisExtra   += $h['extra'];
        $totaisNoturna += $h['noturna'];

        $fid = $r['funcionario_id'];
        if (!isset($funcMap[$fid])) {
            $funcMap[$fid] = ['id'=>$fid,'nome'=>$r['func_nome'],'horas_normal'=>0,'horas_extra'=>0,'horas_noturna'=>0,'horas_total'=>0,'registros'=>0];
        }
        $funcMap[$fid]['horas_normal']  += $h['normais'];
        $funcMap[$fid]['horas_extra']   += $h['extra'];
        $funcMap[$fid]['horas_noturna'] += $h['noturna'];
        $funcMap[$fid]['horas_total']   += $h['normais'] + $h['extra'] + $h['noturna'];
        $funcMap[$fid]['registros']++;

        $oid = $r['obra_id'];
        if (!isset($obraMap[$oid])) {
            $obraMap[$oid] = ['id'=>$oid,'numero'=>$r['o_num'],'nome'=>$r['o_nome'],'horas_normal'=>0,'horas_extra'=>0,'horas_noturna'=>0,'horas_total'=>0,'funcionarios'=>[]];
        }
        $obraMap[$oid]['horas_normal']  += $h['normais'];
        $obraMap[$oid]['horas_extra']   += $h['extra'];
        $obraMap[$oid]['horas_noturna'] += $h['noturna'];
        $obraMap[$oid]['horas_total']   += $h['normais'] + $h['extra'] + $h['noturna'];
        $obraMap[$oid]['funcionarios'][$fid] = true;

        $semana = $r['semana_inicio'];
        if (!isset($semanaMap[$semana])) $semanaMap[$semana] = ['normal'=>0,'extra'=>0,'noturna'=>0];
        $semanaMap[$semana]['normal']  += $h['normais'];
        $semanaMap[$semana]['extra']   += $h['extra'];
        $semanaMap[$semana]['noturna'] += $h['noturna'];
    }

    // Calcular custos
    $vN = $valores['valor_hora_normal'];
    $vE = $valores['valor_hora_extra'];
    $vT = $valores['valor_hora_noturna'];

    $custoNormal  = $totaisNormal  * $vN;
    $custoExtra   = $totaisExtra   * $vE;
    $custoNoturna = $totaisNoturna * $vT;
    $custoTotal   = $custoNormal + $custoExtra + $custoNoturna;
    $totalHoras   = $totaisNormal + $totaisExtra + $totaisNoturna;

    // Top funcionários
    foreach ($funcMap as &$f) {
        $f['custo_total'] = ($f['horas_normal']*$vN) + ($f['horas_extra']*$vE) + ($f['horas_noturna']*$vT);
        $f['eficiencia']  = $f['horas_total'] > 0 ? round(($f['horas_normal']/$f['horas_total'])*100, 1) : 0;
    }
    $funcionarios = array_values($funcMap);
    usort($funcionarios, fn($a,$b) => $b['horas_total'] <=> $a['horas_total']);
    $funcionarios = array_slice($funcionarios, 0, 20);

    // Top obras
    foreach ($obraMap as &$o) {
        $o['custo_total'] = ($o['horas_normal']*$vN) + ($o['horas_extra']*$vE) + ($o['horas_noturna']*$vT);
        $o['total_funcionarios'] = count($o['funcionarios']);
        unset($o['funcionarios']);
    }
    $obras = array_values($obraMap);
    usort($obras, fn($a,$b) => $b['horas_total'] <=> $a['horas_total']);
    $obras = array_slice($obras, 0, 10);

    // Evolução temporal por semana (últimas 7 semanas a partir de endDate)
    $evol = [];
    $start = new DateTime($startDate);
    $end   = new DateTime($endDate);
    $diff  = (int)$start->diff($end)->days;

    if ($diff > 30) {
        // Agrupar por semana
        for ($i = 6; $i >= 0; $i--) {
            $wEnd   = clone $end; $wEnd->modify("-{$i} weeks");
            $wStart = clone $wEnd; $wStart->modify('-6 days');
            $label  = $wStart->format('d/m');
            $n=0; $e=0; $t=0;
            foreach ($semanaMap as $sem => $sh) {
                if ($sem >= $wStart->format('Y-m-d') && $sem <= $wEnd->format('Y-m-d')) {
                    $n += $sh['normal']; $e += $sh['extra']; $t += $sh['noturna'];
                }
            }
            $evol[] = ['label'=>$label,'total'=>round($n+$e+$t,1),'normal'=>round($n,1),'extra'=>round($e,1),'noturna'=>round($t,1)];
        }
    } else {
        ksort($semanaMap);
        foreach ($semanaMap as $sem => $sh) {
            $evol[] = [
                'label'   => date('d/m', strtotime($sem)),
                'total'   => round($sh['normal']+$sh['extra']+$sh['noturna'],1),
                'normal'  => round($sh['normal'],1),
                'extra'   => round($sh['extra'],1),
                'noturna' => round($sh['noturna'],1)
            ];
        }
    }

    // Comparação com período anterior (se solicitado)
    $comparison = null;
    if ($compareStartDate && $compareEndDate) {
        $cRows = fetchAndCalcHoras($pdo, $compareStartDate, $compareEndDate, $obraId, $employeeId);
        $cN=0; $cE=0; $cT=0;
        $cFuncs=[]; $cObras=[];
        foreach ($cRows as $r) {
            $h = calcularHorasJson($r['horas_diarias'], false);
            $cN += $h['normais']; $cE += $h['extra']; $cT += $h['noturna'];
            $cFuncs[$r['funcionario_id']] = true;
            $cObras[$r['obra_id']] = true;
        }
        $comparison = [
            'total_normal'      => round($cN,1),
            'total_extra'       => round($cE,1),
            'total_noturna'     => round($cT,1),
            'total_horas'       => round($cN+$cE+$cT,1),
            'total_funcionarios'=> count($cFuncs),
            'total_obras'       => count($cObras),
            'custo_total'       => round(($cN*$vN)+($cE*$vE)+($cT*$vT),2)
        ];
    }

    echo json_encode([
        'success' => true,
        'period'  => ['start'=>$startDate,'end'=>$endDate,'days'=>$diff+1],
        'totals'  => [
            'horas_normal'   => round($totaisNormal,1),
            'horas_extra'    => round($totaisExtra,1),
            'horas_noturna'  => round($totaisNoturna,1),
            'horas_total'    => round($totalHoras,1),
            'funcionarios'   => count($funcMap),
            'obras'          => count($obraMap),
            'registros'      => $totalRegistros
        ],
        'costs' => [
            'normal'  => round($custoNormal,2),
            'extra'   => round($custoExtra,2),
            'noturna' => round($custoNoturna,2),
            'total'   => round($custoTotal,2)
        ],
        'evolution'    => $evol,
        'top_employees'=> $funcionarios,
        'top_obras'    => $obras,
        'comparison'   => $comparison
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao processar analytics: ' . $e->getMessage()]);
}
