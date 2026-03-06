<?php
/**
 * Send Analytics Report by Email (usa horas_diarias JSON)
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../includes/email.php';
require_once '../../config/database.php';
require_once __DIR__ . '/../../includes/horas_helper.php';

$user = authMiddleware(['admin', 'encarregado']);

try {
    $pdo = getConnection();

    $data       = json_decode(file_get_contents('php://input'), true);
    $to         = $data['email']       ?? '';
    $startDate  = $data['start_date']  ?? date('Y-m-01');
    $endDate    = $data['end_date']    ?? date('Y-m-t');
    $obraId     = isset($data['obra_id'])     && $data['obra_id']     !== 'all' ? (int)$data['obra_id']     : null;
    $employeeId = isset($data['employee_id']) && $data['employee_id'] !== 'all' ? (int)$data['employee_id'] : null;

    if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email inválido');
    }

    $where  = "a.status IN ('aprovado','aprovado_encarregado') AND a.semana_inicio >= ? AND a.semana_inicio <= ?";
    $params = [$startDate, $endDate];
    if ($obraId)     { $where .= " AND a.obra_id = ?";        $params[] = $obraId; }
    if ($employeeId) { $where .= " AND a.funcionario_id = ?"; $params[] = $employeeId; }

    $stmt = $pdo->prepare("
        SELECT a.horas_diarias, a.funcionario_id,
               u.nome as func_nome
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        WHERE $where
    ");
    $stmt->execute($params);
    $rawRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agregar por funcionário e totais gerais
    $totalNormal = 0; $totalExtra = 0; $totalNoturna = 0;
    $funcMap = []; $obraIdsCount = 0; $obraIdsSet = [];

    // Buscar count de obras
    $obraStmt = $pdo->prepare("SELECT COUNT(DISTINCT obra_id) as cnt FROM apontamentos a WHERE $where");
    $obraStmt->execute($params);
    $obraIdsCount = (int)$obraStmt->fetchColumn();

    foreach ($rawRows as $r) {
        $h = calcularHorasJson($r['horas_diarias'], false); // empresa: festivo=8h
        $totalNormal  += $h['normais'];
        $totalExtra   += $h['extra'];
        $totalNoturna += $h['noturna'];

        $fid = $r['funcionario_id'];
        if (!isset($funcMap[$fid])) $funcMap[$fid] = ['nome' => $r['func_nome'], 'total' => 0];
        $funcMap[$fid]['total'] += $h['normais'] + $h['extra'] + $h['noturna'];
    }

    $totalHoras = $totalNormal + $totalExtra + $totalNoturna;

    // Top 5 funcionários
    uasort($funcMap, fn($a,$b) => $b['total'] <=> $a['total']);
    $topEmployees = array_slice(array_values($funcMap), 0, 5);

    // Info de filtros
    $obraName = 'Todas';
    if ($obraId) {
        $os = $pdo->prepare("SELECT nome FROM obras WHERE id = ?");
        $os->execute([$obraId]);
        $obraName = $os->fetchColumn() ?: 'N/A';
    }
    $empName = 'Todos';
    if ($employeeId) {
        $es = $pdo->prepare("SELECT nome FROM usuarios WHERE id = ?");
        $es->execute([$employeeId]);
        $empName = $es->fetchColumn() ?: 'N/A';
    }

    $htmlBody = "
    <!DOCTYPE html><html><head><meta charset='UTF-8'><style>
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#333}
        .container{max-width:600px;margin:0 auto;padding:20px}
        .header{background:linear-gradient(135deg,#CE0201 0%,#a00101 100%);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}
        .header h1{margin:0;font-size:28px}.header p{margin:10px 0 0;opacity:.9}
        .content{background:#fff;padding:30px;border:1px solid #e5e7eb}
        .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:20px 0}
        .stat-box{background:#f9fafb;padding:15px;border-radius:6px;border-left:4px solid #CE0201}
        .stat-label{font-size:13px;color:#6b7280;text-transform:uppercase;font-weight:600;margin-bottom:5px}
        .stat-value{font-size:24px;font-weight:bold;color:#111827}
        .section{margin:25px 0}.section-title{font-size:18px;font-weight:600;color:#111827;margin-bottom:15px;border-bottom:2px solid #CE0201;padding-bottom:8px}
        .top-list{list-style:none;padding:0;margin:0}.top-list li{padding:10px;background:#f9fafb;margin-bottom:8px;border-radius:4px;display:flex;justify-content:space-between}
        .footer{background:#f9fafb;padding:20px;text-align:center;color:#6b7280;font-size:13px;border-radius:0 0 8px 8px}
        .filter-info{background:#eff6ff;border:1px solid #dbeafe;padding:15px;border-radius:6px;margin-bottom:20px}
        .filter-info strong{color:#1e40af}
    </style></head><body><div class='container'>
        <div class='header'><h1>📊 Relatório de Analytics</h1><p>J2S Enginyeria</p></div>
        <div class='content'>
            <div class='filter-info'>
                <strong>Período:</strong> " . date('d/m/Y', strtotime($startDate)) . " até " . date('d/m/Y', strtotime($endDate)) . "<br>
                <strong>Obra:</strong> $obraName<br>
                <strong>Empleado:</strong> $empName
            </div>
            <div class='section'><div class='section-title'>Resumo Executivo</div>
                <div class='stat-grid'>
                    <div class='stat-box'><div class='stat-label'>Total de Horas</div><div class='stat-value'>" . number_format($totalHoras, 2, ',', '.') . "h</div></div>
                    <div class='stat-box'><div class='stat-label'>Empleados</div><div class='stat-value'>" . count($funcMap) . "</div></div>
                    <div class='stat-box'><div class='stat-label'>Obras</div><div class='stat-value'>$obraIdsCount</div></div>
                    <div class='stat-box'><div class='stat-label'>Registros</div><div class='stat-value'>" . count($rawRows) . "</div></div>
                </div>
            </div>
            <div class='section'><div class='section-title'>Distribuição de Horas</div>
                <ul class='top-list'>
                    <li><span><strong>Horas Normales</strong></span><span>" . number_format($totalNormal, 2, ',', '.') . "h</span></li>
                    <li><span><strong>Horas Extra</strong></span><span>" . number_format($totalExtra, 2, ',', '.') . "h</span></li>
                    <li><span><strong>Horas Nocturna</strong></span><span>" . number_format($totalNoturna, 2, ',', '.') . "h</span></li>
                </ul>
            </div>
            <div class='section'><div class='section-title'>Top 5 Empleados</div><ul class='top-list'>";

    foreach ($topEmployees as $idx => $emp) {
        $htmlBody .= "<li><span><strong>" . ($idx + 1) . ".</strong> " . htmlspecialchars($emp['nome']) . "</span><span>" . number_format($emp['total'], 2, ',', '.') . "h</span></li>";
    }

    $htmlBody .= "</ul></div></div>
        <div class='footer'><p>Relatório gerado em " . date('d/m/Y H:i:s') . "</p><p>J2S Enginyeria - Sistema de Gestión de Obras</p></div>
    </div></body></html>";

    $subject = "Relatório de Analytics - " . date('d/m/Y', strtotime($startDate)) . " a " . date('d/m/Y', strtotime($endDate));
    $emailSent = sendEmail($to, $subject, $htmlBody);

    if (!$emailSent) {
        throw new Exception('Falha ao enviar email. Verifique as configurações SMTP.');
    }

    echo json_encode(['success' => true, 'message' => 'Relatório enviado com sucesso para ' . $to]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao enviar email: ' . $e->getMessage()]);
}
