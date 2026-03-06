<?php
/**
 * API para exportar Dashboard como PDF
 * GET /api/dashboard/export-pdf.php?mes=2024-01
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../vendor/autoload.php'; // TCPDF ou similar

use TCPDF;

try {
    // Validar token JWT
    $user = validateToken();
    if (!$user) {
        throw new Exception('Token inválido', 401);
    }

    // Apenas admin pode exportar
    if ($user['tipo'] !== 'admin') {
        throw new Exception('Apenas administradores podem exportar relatórios', 403);
    }

    $mes = isset($_GET['mes']) ? $_GET['mes'] : date('Y-m');

    $pdo = getConnection();

    // Buscar valores de hora configurados
    $stmt = $pdo->query("SELECT * FROM config_valores ORDER BY id DESC LIMIT 1");
    $config = $stmt->fetch(PDO::FETCH_ASSOC);

    $valorNormal = isset($config['valor_hora_normal']) ? floatval($config['valor_hora_normal']) : 21.00;
    $valorExtra = isset($config['valor_hora_extra']) ? floatval($config['valor_hora_extra']) : 28.00;
    $valorNoturna = isset($config['valor_hora_noturna']) ? floatval($config['valor_hora_noturna']) : 30.00;

    // Calcular inicio e fim do mês
    $mesInicio = $mes . '-01';
    $mesFim = date('Y-m-t', strtotime($mesInicio));

    // Buscar apontamentos aprovados do mês
    $stmt = $pdo->prepare("
        SELECT a.*,
               u.nome as funcionario_nome,
               u.passaporte as funcionario_passaporte,
               o.numero as obra_numero,
               o.nome as obra_nome
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        INNER JOIN obras o ON o.id = a.obra_id
        WHERE a.status IN ('aprovado', 'aprovado_encarregado')
        AND a.semana_inicio >= ?
        AND a.semana_inicio <= ?
        ORDER BY u.nome, o.numero
    ");
    $stmt->execute([$mesInicio, $mesFim]);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agrupar por funcionário
    $funcionarios = [];
    $totaisGeral = ['normal' => 0, 'extra' => 0, 'noturna' => 0, 'total' => 0];

    foreach ($apontamentos as $apt) {
        $funcId = $apt['funcionario_id'];

        if (!isset($funcionarios[$funcId])) {
            $funcionarios[$funcId] = [
                'nome' => $apt['funcionario_nome'],
                'passaporte' => $apt['funcionario_passaporte'],
                'horas_normal' => 0,
                'horas_extra' => 0,
                'horas_noturna' => 0,
            ];
        }

        $horasDiarias = json_decode($apt['horas_diarias'], true);

        if ($horasDiarias) {
            foreach ($horasDiarias as $dia) {
                if (is_array($dia)) {
                    // Festivo: empresa paga 8h normal, extra/noturna = 0
                    if (!empty($dia['festivo'])) {
                        $funcionarios[$funcId]['horas_normal'] += 8.0;
                    } else {
                        $funcionarios[$funcId]['horas_normal'] += isset($dia['normal']) ? floatval($dia['normal']) : 0;
                        $funcionarios[$funcId]['horas_extra'] += isset($dia['extra']) ? floatval($dia['extra']) : 0;
                        $funcionarios[$funcId]['horas_noturna'] += isset($dia['noturna']) ? floatval($dia['noturna']) : 0;
                    }
                } else {
                    $funcionarios[$funcId]['horas_normal'] += floatval($dia);
                }
            }
        }
    }

    // Calcular valores
    foreach ($funcionarios as &$func) {
        $func['valor_normal'] = $func['horas_normal'] * $valorNormal;
        $func['valor_extra'] = $func['horas_extra'] * $valorExtra;
        $func['valor_noturna'] = $func['horas_noturna'] * $valorNoturna;
        $func['valor_total'] = $func['valor_normal'] + $func['valor_extra'] + $func['valor_noturna'];
        $func['horas_total'] = $func['horas_normal'] + $func['horas_extra'] + $func['horas_noturna'];

        $totaisGeral['normal'] += $func['horas_normal'];
        $totaisGeral['extra'] += $func['horas_extra'];
        $totaisGeral['noturna'] += $func['horas_noturna'];
        $totaisGeral['total'] += $func['horas_total'];
    }

    $valorTotalNormal = $totaisGeral['normal'] * $valorNormal;
    $valorTotalExtra = $totaisGeral['extra'] * $valorExtra;
    $valorTotalNoturna = $totaisGeral['noturna'] * $valorNoturna;
    $valorTotal = $valorTotalNormal + $valorTotalExtra + $valorTotalNoturna;

    // Se TCPDF não estiver disponível, gerar CSV simples
    if (!class_exists('TCPDF')) {
        // Fallback: Gerar CSV
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="dashboard-' . $mes . '.csv"');

        $output = fopen('php://output', 'w');

        // Header
        fputcsv($output, ['DASHBOARD MENSAL - ' . $mes]);
        fputcsv($output, ['']);
        fputcsv($output, ['Empleado', 'Pasaporte', 'H. Normal', 'H. Extra', 'H. Nocturna', 'Total H', 'Valor Total']);

        // Dados
        foreach ($funcionarios as $func) {
            fputcsv($output, [
                $func['nome'],
                $func['passaporte'],
                $func['horas_normal'],
                $func['horas_extra'],
                $func['horas_noturna'],
                $func['horas_total'],
                '€' . number_format($func['valor_total'], 2)
            ]);
        }

        // Totais
        fputcsv($output, ['']);
        fputcsv($output, ['TOTALES', '', $totaisGeral['normal'], $totaisGeral['extra'], $totaisGeral['noturna'], $totaisGeral['total'], '€' . number_format($valorTotal, 2)]);

        fclose($output);
        exit;
    }

    // Se TCPDF disponível, gerar PDF
    $pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

    $pdf->SetCreator('J2S Enginyeria');
    $pdf->SetAuthor($user['nome']);
    $pdf->SetTitle('Dashboard Mensal - ' . $mes);

    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);

    $pdf->AddPage();

    $pdf->SetFont('helvetica', 'B', 20);
    $pdf->Cell(0, 10, 'DASHBOARD MENSAL', 0, 1, 'C');
    $pdf->SetFont('helvetica', '', 14);
    $pdf->Cell(0, 10, $mes, 0, 1, 'C');
    $pdf->Ln(5);

    // Tabela
    $html = '<table border="1" cellpadding="4">
        <thead>
            <tr style="background-color:#f0f0f0;">
                <th>Empleado</th>
                <th>Normal</th>
                <th>Extra</th>
                <th>Nocturna</th>
                <th>Total</th>
                <th>Valor</th>
            </tr>
        </thead>
        <tbody>';

    foreach ($funcionarios as $func) {
        $html .= '<tr>
            <td>' . htmlspecialchars($func['nome']) . '</td>
            <td>' . $func['horas_normal'] . 'h</td>
            <td>' . $func['horas_extra'] . 'h</td>
            <td>' . $func['horas_noturna'] . 'h</td>
            <td><b>' . $func['horas_total'] . 'h</b></td>
            <td><b>€' . number_format($func['valor_total'], 2) . '</b></td>
        </tr>';
    }

    $html .= '</tbody></table>';

    $pdf->writeHTML($html, true, false, true, false, '');

    $pdf->Output('dashboard-' . $mes . '.pdf', 'D');
    exit;

} catch (Exception $e) {
    $code = $e->getCode() ?: 400;
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
