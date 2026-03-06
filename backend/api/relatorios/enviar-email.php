<?php
/**
 * API para enviar relatório mensal por email
 * POST /api/relatorios/enviar-email.php
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

    $obraId = isset($input['obra_id']) ? intval($input['obra_id']) : 0;
    $mes = isset($input['mes']) ? $input['mes'] : '';
    $emailTo = isset($input['email_to']) ? trim($input['email_to']) : '';
    $subject = isset($input['subject']) ? trim($input['subject']) : '';
    $customMessage = isset($input['message']) ? trim($input['message']) : '';

    if (!$obraId || !$mes || !$emailTo) {
        throw new Exception('Parâmetros obrigatórios: obra_id, mes, email_to');
    }

    if (!filter_var($emailTo, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email inválido');
    }

    $pdo = getConnection();

    // Buscar dados da obra
    $stmt = $pdo->prepare("
        SELECT o.*, c.nome as cliente_nome
        FROM obras o
        LEFT JOIN clientes c ON o.cliente_id = c.id
        WHERE o.id = ?
    ");
    $stmt->execute([$obraId]);
    $obra = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$obra) {
        throw new Exception('Obra não encontrada');
    }

    // Calcular inicio e fim do mês
    $mesInicio = $mes . '-01';
    $mesFim = date('Y-m-t', strtotime($mesInicio));

    // Buscar apontamentos aprovados com valor_hora_venda individual
    $stmt = $pdo->prepare("
        SELECT a.*, u.nome as funcionario_nome, u.passaporte as funcionario_passaporte,
               u.funcao, f.nome as funcao_nome, u.valor_hora_venda
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        LEFT JOIN funcoes f ON f.id = u.funcao_id
        WHERE a.obra_id = ?
        AND a.status IN ('aprovado', 'aprovado_encarregado')
        AND a.semana_inicio >= ?
        AND a.semana_inicio <= ?
        ORDER BY u.nome, a.semana_inicio
    ");
    $stmt->execute([$obraId, $mesInicio, $mesFim]);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($apontamentos) === 0) {
        throw new Exception('No hay registros aprobados para este período');
    }

    // Agrupar por funcionário
    $funcionarios = [];
    $totaisGeral = ['normal' => 0, 'extra' => 0, 'noturna' => 0, 'total' => 0];

    foreach ($apontamentos as $apt) {
        $funcId = $apt['funcionario_id'];

        if (!isset($funcionarios[$funcId])) {
            $funcionarios[$funcId] = [
                'nome' => $apt['funcionario_nome'],
                'passaporte' => $apt['funcionario_passaporte'],
                'funcao' => $apt['funcao_nome'] ?? $apt['funcao'] ?? 'N/A',
                'horas_normal' => 0,
                'horas_extra' => 0,
                'horas_noturna' => 0,
                'valor_hora_venda' => floatval($apt['valor_hora_venda']) ?: 24.00
            ];
        }

        $horasDiarias = json_decode($apt['horas_diarias'], true);

        if ($horasDiarias) {
            foreach ($horasDiarias as $dia) {
                if (is_array($dia)) {
                    $funcionarios[$funcId]['horas_normal'] += isset($dia['normal']) ? floatval($dia['normal']) : 0;
                    $funcionarios[$funcId]['horas_extra'] += isset($dia['extra']) ? floatval($dia['extra']) : 0;
                    $funcionarios[$funcId]['horas_noturna'] += isset($dia['noturna']) ? floatval($dia['noturna']) : 0;
                } else {
                    $funcionarios[$funcId]['horas_normal'] += floatval($dia);
                }
            }
        }
    }

    // Calcular valores usando valor_hora_venda individual (cliente paga o mesmo preço independente do tipo de hora)
    $valorTotal = 0;
    foreach ($funcionarios as &$func) {
        $valorHora = $func['valor_hora_venda'];

        // Cliente paga o MESMO valor por hora, independente do tipo
        $func['valor_normal'] = $func['horas_normal'] * $valorHora;
        $func['valor_extra'] = $func['horas_extra'] * $valorHora;
        $func['valor_noturna'] = $func['horas_noturna'] * $valorHora;
        $func['valor_total'] = $func['valor_normal'] + $func['valor_extra'] + $func['valor_noturna'];
        $func['horas_total'] = $func['horas_normal'] + $func['horas_extra'] + $func['horas_noturna'];

        $totaisGeral['normal'] += $func['horas_normal'];
        $totaisGeral['extra'] += $func['horas_extra'];
        $totaisGeral['noturna'] += $func['horas_noturna'];
        $totaisGeral['total'] += $func['horas_total'];

        $valorTotal += $func['valor_total'];
    }

    // Construir tabela de funcionários
    $funcionariosHtml = "";
    foreach ($funcionarios as $func) {
        $funcionariosHtml .= "<tr style='border-bottom:1px solid #e5e7eb;'>
            <td style='padding:10px 8px;'>
                <div style='font-weight:500;'>{$func['nome']}</div>
                <div style='font-size:11px;color:#6b7280;'>{$func['passaporte']}</div>
                <div style='font-size:10px;color:#9ca3af;font-style:italic;'>{$func['funcao']}</div>
            </td>
            <td style='padding:10px 8px;text-align:center;color:#166534;'>{$func['horas_normal']}h</td>
            <td style='padding:10px 8px;text-align:center;color:#92400e;'>{$func['horas_extra']}h</td>
            <td style='padding:10px 8px;text-align:center;color:#3730a3;'>{$func['horas_noturna']}h</td>
            <td style='padding:10px 8px;text-align:center;font-weight:600;'>{$func['horas_total']}h</td>
            <td style='padding:10px 8px;text-align:right;font-weight:600;color:#16a34a;'>€" . number_format($func['valor_total'], 2) . "</td>
        </tr>";
    }

    $clienteNome = isset($obra['cliente_nome']) && $obra['cliente_nome'] ? $obra['cliente_nome'] : 'N/A';
    $emailSubject = $subject ?: "💰 INFORME MENSUAL - {$obra['numero']} - {$mes} - TOTAL €" . number_format($valorTotal, 2);

    // Mensagem personalizada
    $customMessageHtml = '';
    if ($customMessage) {
        $customMessage = nl2br(htmlspecialchars($customMessage));
        $customMessageHtml = "<div style='background:#f0f9ff;border:1px solid #0ea5e9;border-radius:8px;padding:16px;margin-bottom:20px;'>
            <div style='font-weight:600;color:#0369a1;margin-bottom:8px;'>📝 Mensaje:</div>
            <div style='color:#0c4a6e;'>{$customMessage}</div>
        </div>";
    }

    $html = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
            .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
            .label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 600; color: #1f2937; }
            table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
            th { padding: 12px 8px; text-align: center; font-weight: 600; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
            .total-box { background: linear-gradient(135deg, #CE0201 0%, #a00 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='margin:0;font-size:24px;'>💰 INFORME MENSUAL</h1>
                <p style='margin:8px 0 0;opacity:0.95;font-size:16px;'>Listo para facturación</p>
            </div>
            <div class='content'>
                {$customMessageHtml}
                
                <div style='background:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:16px;margin-bottom:20px;text-align:center;'>
                    <div style='font-size:14px;color:#166534;margin-bottom:4px;'>TOTAL A FACTURAR</div>
                    <div style='font-size:36px;font-weight:700;color:#16a34a;'>€" . number_format($valorTotal, 2) . "</div>
                </div>
                
                <div style='display:flex;gap:15px;flex-wrap:wrap;margin-bottom:20px;'>
                    <div class='info-box' style='flex:1;min-width:150px;'>
                        <div class='label'>Obra</div>
                        <div class='value'>{$obra['numero']}</div>
                        <div style='font-size:13px;color:#6b7280;'>{$obra['nome']}</div>
                    </div>
                    <div class='info-box' style='flex:1;min-width:150px;'>
                        <div class='label'>Cliente</div>
                        <div class='value'>{$clienteNome}</div>
                    </div>
                    <div class='info-box' style='flex:1;min-width:150px;'>
                        <div class='label'>Período</div>
                        <div class='value'>{$mes}</div>
                        <div style='font-size:13px;color:#6b7280;'>" . count($funcionarios) . " empleados</div>
                    </div>
                </div>

                <h3 style='margin-top:25px;margin-bottom:15px;'>👥 Detalle por Empleado</h3>
                <table>
                    <thead>
                        <tr style='background:#f8f9fa;'>
                            <th style='text-align:left;border-bottom:2px solid #e5e7eb;'>Empleado</th>
                            <th style='border-bottom:2px solid #e5e7eb;background:#dcfce7;color:#166534;'>Normal<br><span style='font-size:10px;font-weight:400;'>(8-17h)</span></th>
                            <th style='border-bottom:2px solid #e5e7eb;background:#fef3c7;color:#92400e;'>Extra<br><span style='font-size:10px;font-weight:400;'>(17-22h)</span></th>
                            <th style='border-bottom:2px solid #e5e7eb;background:#e0e7ff;color:#3730a3;'>Nocturna<br><span style='font-size:10px;font-weight:400;'>(22-6h)</span></th>
                            <th style='border-bottom:2px solid #e5e7eb;'>Total h</th>
                            <th style='border-bottom:2px solid #e5e7eb;text-align:right;'>Valor €</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$funcionariosHtml}
                    </tbody>
                </table>

                <h3 style='margin-top:25px;margin-bottom:15px;'>💰 Resumen de Horas</h3>
                <table>
                    <tr style='background:#dcfce7;'>
                        <td style='padding:12px;color:#166534;font-weight:500;'>Horas Normales (8-17h)</td>
                        <td style='padding:12px;text-align:center;color:#166534;font-weight:600;'>{$totaisGeral['normal']}h</td>
                    </tr>
                    <tr style='background:#fef3c7;'>
                        <td style='padding:12px;color:#92400e;font-weight:500;'>Horas Extra (17-22h)</td>
                        <td style='padding:12px;text-align:center;color:#92400e;font-weight:600;'>{$totaisGeral['extra']}h</td>
                    </tr>
                    <tr style='background:#e0e7ff;'>
                        <td style='padding:12px;color:#3730a3;font-weight:500;'>Horas Nocturnas (22-6h)</td>
                        <td style='padding:12px;text-align:center;color:#3730a3;font-weight:600;'>{$totaisGeral['noturna']}h</td>
                    </tr>
                    <tr style='background:#f3f4f6;'>
                        <td style='padding:12px;font-weight:700;'>TOTAL HORAS</td>
                        <td style='padding:12px;text-align:center;font-weight:700;'>{$totaisGeral['total']}h</td>
                    </tr>
                </table>

                <div style='background:#fffbeb;border:1px solid #fbbf24;border-radius:8px;padding:12px;margin:15px 0;'>
                    <div style='font-size:12px;color:#92400e;'>
                        <strong>ℹ️ Nota:</strong> Cada empleado tiene una tarifa individual de facturación. Los valores mostrados ya incluyen el cálculo personalizado.
                    </div>
                </div>

                <div class='total-box' style='text-align:center;'>
                    <div style='font-size:14px;opacity:0.9;margin-bottom:8px;'>TOTAL GENERAL - {$totaisGeral['total']} HORAS</div>
                    <div style='font-size:40px;font-weight:700;'>€" . number_format($valorTotal, 2) . "</div>
                </div>
            </div>
            <div class='footer'>
                <p>Enviado por {$user['nome']} desde el Sistema de Control Horario</p>
                <p style='color:#16a34a;font-weight:600;'>J2S Enginyeria & Instal·lacions</p>
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
            'email_to' => $emailTo
        ]);
    } else {
        throw new Exception('Error al enviar email');
    }

} catch (Exception $e) {
    $code = $e->getCode() ?: 400;
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
