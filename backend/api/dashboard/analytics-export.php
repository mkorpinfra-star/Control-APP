<?php
/**
 * Export Analytics to CSV/Excel
 * Gera arquivo CSV com dados completos de analytics (usa horas_diarias JSON)
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';
require_once __DIR__ . '/../../includes/horas_helper.php';

$user = authMiddleware(['admin', 'encarregado']);

try {
    $pdo = getConnection();

    $startDate  = $_GET['start_date'] ?? date('Y-m-01');
    $endDate    = $_GET['end_date']   ?? date('Y-m-t');
    $obraId     = isset($_GET['obra_id'])     && $_GET['obra_id']     !== 'all' ? (int)$_GET['obra_id']     : null;
    $employeeId = isset($_GET['employee_id']) && $_GET['employee_id'] !== 'all' ? (int)$_GET['employee_id'] : null;

    $where  = "a.status IN ('aprovado','aprovado_encarregado') AND a.semana_inicio >= ? AND a.semana_inicio <= ?";
    $params = [$startDate, $endDate];
    if ($obraId)     { $where .= " AND a.obra_id = ?";        $params[] = $obraId; }
    if ($employeeId) { $where .= " AND a.funcionario_id = ?"; $params[] = $employeeId; }

    $stmt = $pdo->prepare("
        SELECT a.semana_inicio, a.horas_diarias, a.status,
               u.nome as funcionario, u.passaporte,
               o.nome as obra, o.numero as obra_numero
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        INNER JOIN obras o ON o.id = a.obra_id
        WHERE $where
        ORDER BY a.semana_inicio DESC, u.nome ASC
    ");
    $stmt->execute($params);
    $rawRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calcular horas via JSON e agregar estatísticas
    $totalNormal = 0; $totalExtra = 0; $totalNoturna = 0;
    $funcIds = []; $obraIds = [];
    $apontamentos = [];

    foreach ($rawRows as $r) {
        $h = calcularHorasJson($r['horas_diarias'], false); // empresa: festivo=8h
        $totalNormal  += $h['normais'];
        $totalExtra   += $h['extra'];
        $totalNoturna += $h['noturna'];
        $funcIds[$r['funcionario']] = true;
        $obraIds[$r['obra']] = true;

        $r['horas_normais'] = $h['normais'];
        $r['horas_extra']   = $h['extra'];
        $r['horas_noturna'] = $h['noturna'];
        $r['horas_total']   = $h['normais'] + $h['extra'] + $h['noturna'];
        $r['festivos']      = $h['festivos'];
        unset($r['horas_diarias']);
        $apontamentos[] = $r;
    }

    $stats = [
        'total_funcionarios' => count($funcIds),
        'total_obras'        => count($obraIds),
        'total_normal'       => $totalNormal,
        'total_extra'        => $totalExtra,
        'total_noturna'      => $totalNoturna,
        'total_horas'        => $totalNormal + $totalExtra + $totalNoturna,
        'total_registros'    => count($apontamentos)
    ];

    // Criar CSV com UTF-8 BOM
    if (!is_dir(__DIR__ . '/../../temp')) {
        mkdir(__DIR__ . '/../../temp', 0755, true);
    }
    $filename = "analytics_" . date('Y-m-d_His') . ".csv";
    $filepath = __DIR__ . '/../../temp/' . $filename;
    $file = fopen($filepath, 'w');
    fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($file, ['RELATÓRIO DE ANALYTICS - J2S ENGINYERIA'], ';');
    fputcsv($file, ['Período:', $startDate . ' até ' . $endDate], ';');
    fputcsv($file, ['Gerado em:', date('d/m/Y H:i:s')], ';');
    fputcsv($file, [''], ';');

    fputcsv($file, ['RESUMO EXECUTIVO'], ';');
    fputcsv($file, ['Total de Funcionários:', $stats['total_funcionarios']], ';');
    fputcsv($file, ['Total de Obras:', $stats['total_obras']], ';');
    fputcsv($file, ['Total de Registros:', $stats['total_registros']], ';');
    fputcsv($file, ['Horas Normais:', number_format($stats['total_normal'], 2, ',', '.') . 'h'], ';');
    fputcsv($file, ['Horas Extra:', number_format($stats['total_extra'], 2, ',', '.') . 'h'], ';');
    fputcsv($file, ['Horas Noturna:', number_format($stats['total_noturna'], 2, ',', '.') . 'h'], ';');
    fputcsv($file, ['TOTAL DE HORAS:', number_format($stats['total_horas'], 2, ',', '.') . 'h'], ';');
    fputcsv($file, [''], ';');
    fputcsv($file, [''], ';');

    fputcsv($file, ['DETALHAMENTO POR APONTAMENTO'], ';');
    fputcsv($file, ['Semana', 'Funcionário', 'Passaporte', 'Obra', 'H. Normais', 'H. Extra', 'H. Noturna', 'Total Horas', 'Festivos', 'Status'], ';');

    foreach ($apontamentos as $apt) {
        fputcsv($file, [
            date('d/m/Y', strtotime($apt['semana_inicio'])),
            $apt['funcionario'],
            $apt['passaporte'],
            $apt['obra'],
            number_format($apt['horas_normais'], 2, ',', '.'),
            number_format($apt['horas_extra'],   2, ',', '.'),
            number_format($apt['horas_noturna'], 2, ',', '.'),
            number_format($apt['horas_total'],   2, ',', '.'),
            $apt['festivos'],
            $apt['status'] === 'aprovado' ? 'Aprovado' : 'Aprovado (Enc.)'
        ], ';');
    }

    fclose($file);

    $fileUrl = '/backend/api/dashboard/download-export.php?file=' . urlencode($filename);

    echo json_encode([
        'success'      => true,
        'filename'     => $filename,
        'download_url' => $fileUrl,
        'stats'        => $stats
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao gerar exportação: ' . $e->getMessage()]);
}
