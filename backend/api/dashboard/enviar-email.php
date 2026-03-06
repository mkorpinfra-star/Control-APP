<?php
/**
 * API para enviar relatório de Dashboard por email
 * POST /api/dashboard/enviar-email.php
 * Body: { "mes": "2024-01" }
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/db.php';
require_once __DIR__ . '/../../includes/email.php';

try {
    // Validar token JWT
    $user = validateToken();
    if (!$user) {
        throw new Exception('Token inválido', 401);
    }

    // Apenas admin pode enviar emails
    if ($user['tipo'] !== 'admin') {
        throw new Exception('Apenas administradores podem enviar relatórios por email', 403);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $mes = isset($input['mes']) ? $input['mes'] : date('Y-m');
    $emailTo = isset($input['email_to']) ? $input['email_to'] : ($user['email'] ?: 'contactes@j2s.ad');

    if (!$emailTo) {
        $emailTo = 'contactes@j2s.ad';
    }

    if (!filter_var($emailTo, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email inválido');
    }

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

    // Buscar apontamentos aprovados
    $stmt = $pdo->prepare("
        SELECT a.*,
               u.nome as funcionario_nome,
               u.passaporte as funcionario_passaporte,
               o.numero as obra_numero,
               o.nome as obra_nome,
               c.nome as cliente_nome
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        INNER JOIN obras o ON o.id = a.obra_id
        LEFT JOIN clientes c ON o.cliente_id = c.id
        WHERE a.status IN ('aprovado', 'aprovado_encarregado')
        AND a.semana_inicio >= ?
        AND a.semana_inicio <= ?
        ORDER BY u.nome, o.numero
    ");
    $stmt->execute([$mesInicio, $mesFim]);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($apontamentos) === 0) {
        throw new Exception('No hay registros aprobados para este período');
    }

    // Agrupar por funcionário
    $funcionarios = [];
    $obras = [];
    $totaisGeral = ['normal' => 0, 'extra' => 0, 'noturna' => 0, 'total' => 0];

    foreach ($apontamentos as $apt) {
        $funcId = $apt['funcionario_id'];
        $obraId = $apt['obra_id'];

        if (!isset($funcionarios[$funcId])) {
            $funcionarios[$funcId] = [
                'nome' => $apt['funcionario_nome'],
                'passaporte' => $apt['funcionario_passaporte'],
                'horas_normal' => 0,
                'horas_extra' => 0,
                'horas_noturna' => 0,
            ];
        }

        if (!isset($obras[$obraId])) {
            $obras[$obraId] = [
                'numero' => $apt['obra_numero'],
                'nome' => $apt['obra_nome'],
                'cliente' => $apt['cliente_nome']
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
        $func['valor_total'] = ($func['horas_normal'] * $valorNormal) +
                               ($func['horas_extra'] * $valorExtra) +
                               ($func['horas_noturna'] * $valorNoturna);
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

    // Construir HTML de funcionários
    $funcionariosHtml = "";
    foreach ($funcionarios as $func) {
        $eficiencia = $func['horas_total'] > 0 ? ($func['horas_normal'] / $func['horas_total']) * 100 : 0;
        $eficienciaColor = $eficiencia >= 80 ? '#16a34a' : ($eficiencia >= 60 ? '#3b82f6' : '#f59e0b');

        $funcionariosHtml .= "<tr style='border-bottom:1px solid #e5e7eb;'>
            <td style='padding:10px 8px;'>
                <div style='font-weight:600;'>{$func['nome']}</div>
                <div style='font-size:11px;color:#6b7280;'>{$func['passaporte']}</div>
            </td>
            <td style='padding:10px 8px;text-align:center;color:#166534;'>{$func['horas_normal']}h</td>
            <td style='padding:10px 8px;text-align:center;color:#92400e;'>{$func['horas_extra']}h</td>
            <td style='padding:10px 8px;text-align:center;color:#3730a3;'>{$func['horas_noturna']}h</td>
            <td style='padding:10px 8px;text-align:center;font-weight:700;'>{$func['horas_total']}h</td>
            <td style='padding:10px 8px;text-align:center;'>
                <span style='padding:4px 8px;background:{$eficienciaColor}20;color:{$eficienciaColor};border-radius:4px;font-size:11px;font-weight:600;'>
                    " . round($eficiencia) . "%
                </span>
            </td>
            <td style='padding:10px 8px;text-align:right;font-weight:700;color:#16a34a;'>€" . number_format($func['valor_total'], 2) . "</td>
        </tr>";
    }

    $emailSubject = "📊 DASHBOARD MENSUAL - {$mes} - TOTAL €" . number_format($valorTotal, 2);

    $html = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #CE0201 0%, #a00 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 20px 0; }
            th { padding: 12px 8px; text-align: center; font-weight: 600; background: #f8f9fa; border-bottom: 2px solid #e5e7eb; }
            .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
            .kpi-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
            .kpi-value { font-size: 28px; font-weight: 700; color: #1f2937; }
            .kpi-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 4px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='margin:0;font-size:28px;'>📊 DASHBOARD MENSUAL</h1>
                <p style='margin:8px 0 0;opacity:0.95;font-size:18px;'>{$mes}</p>
            </div>
            <div class='content'>
                <div style='background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:20px;margin-bottom:25px;text-align:center;'>
                    <div style='font-size:14px;color:#166534;margin-bottom:8px;font-weight:600;'>VALOR TOTAL DEL PERÍODO</div>
                    <div style='font-size:42px;font-weight:700;color:#16a34a;'>€" . number_format($valorTotal, 2) . "</div>
                    <div style='font-size:13px;color:#166534;margin-top:8px;'>{$totaisGeral['total']} horas totales • " . count($funcionarios) . " empleados • " . count($obras) . " obras</div>
                </div>

                <div class='kpi-grid'>
                    <div class='kpi-card' style='background:#dcfce7;border-color:#86efac;'>
                        <div class='kpi-value' style='color:#166534;'>{$totaisGeral['normal']}h</div>
                        <div class='kpi-label'>Horas Normales</div>
                        <div style='font-size:11px;color:#166534;margin-top:4px;'>€" . number_format($valorTotalNormal, 2) . "</div>
                    </div>
                    <div class='kpi-card' style='background:#fef3c7;border-color:#fcd34d;'>
                        <div class='kpi-value' style='color:#92400e;'>{$totaisGeral['extra']}h</div>
                        <div class='kpi-label'>Horas Extras</div>
                        <div style='font-size:11px;color:#92400e;margin-top:4px;'>€" . number_format($valorTotalExtra, 2) . "</div>
                    </div>
                    <div class='kpi-card' style='background:#e0e7ff;border-color:#93c5fd;'>
                        <div class='kpi-value' style='color:#3730a3;'>{$totaisGeral['noturna']}h</div>
                        <div class='kpi-label'>Horas Nocturnas</div>
                        <div style='font-size:11px;color:#3730a3;margin-top:4px;'>€" . number_format($valorTotalNoturna, 2) . "</div>
                    </div>
                </div>

                <h3 style='margin-top:30px;margin-bottom:15px;font-size:18px;'>👥 Análisis por Empleado</h3>
                <table>
                    <thead>
                        <tr>
                            <th style='text-align:left;'>Empleado</th>
                            <th>Normal</th>
                            <th>Extra</th>
                            <th>Noct</th>
                            <th>Total</th>
                            <th>Efic.</th>
                            <th style='text-align:right;'>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$funcionariosHtml}
                    </tbody>
                </table>

                <div style='background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:16px;margin-top:25px;'>
                    <div style='font-weight:600;color:#1e40af;margin-bottom:8px;font-size:14px;'>ℹ️ Eficiencia</div>
                    <div style='color:#1e40af;font-size:13px;'>
                        Muestra el porcentaje de horas normales sobre el total.
                        <strong>80%+ = Excelente</strong>, 60-79% = Bueno, &lt;60% = Revisar
                    </div>
                </div>
            </div>
            <div class='footer'>
                <p>Enviado por <strong>{$user['nome']}</strong> desde el Sistema de Control Horario</p>
                <p style='color:#CE0201;font-weight:700;font-size:14px;margin-top:8px;'>J2S Enginyeria & Instal·lacions</p>
            </div>
        </div>
    </body>
    </html>
    ";

    // Enviar email
    $enviado = sendEmail($emailTo, $emailSubject, $html);

    if ($enviado) {
        echo json_encode([
            'success' => true,
            'message' => 'Email enviado correctamente',
            'email_to' => $emailTo,
            'total_funcionarios' => count($funcionarios),
            'total_horas' => $totaisGeral['total'],
            'valor_total' => $valorTotal
        ]);
    } else {
        throw new Exception('Error al enviar email');
    }

} catch (Exception $e) {
    $code = $e->getCode() ?: 400;
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
