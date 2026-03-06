<?php
/**
 * RELATÓRIO SEMANAL — envia por email ao encarregado logado
 * Semanas 1-3: apenas HORAS (sem valores €)
 * Semana 4: completo com valores e IGI
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';
require_once __DIR__ . '/../../includes/email.php';

$user = authMiddleware(['admin', 'encarregado']);

try {
    $semanaInicio = $_GET['semana_inicio'] ?? null;
    $obraId = isset($_GET['obra_id']) ? (int)$_GET['obra_id'] : null;

    if (!$semanaInicio) {
        throw new Exception('Parâmetro semana_inicio é obrigatório');
    }

    $pdo = getConnection();

    // Calcular semana do mês
    $dataInicio = new DateTime($semanaInicio);
    $diaDoMes = (int)$dataInicio->format('d');
    $semanaDoMes = ceil($diaDoMes / 7);
    $mostrarValores = ($semanaDoMes == 4);

    // Buscar config fiscal (para semana 4)
    $config = null;
    if ($mostrarValores) {
        $configStmt = $pdo->query("SELECT * FROM config_fiscal ORDER BY id DESC LIMIT 1");
        $config = $configStmt->fetch(PDO::FETCH_ASSOC);
    }

    // Buscar apontamentos aprovados da semana
    $stmt = $pdo->prepare("
        SELECT
            a.*,
            u.nome as funcionario_nome,
            u.passaporte,
            u.funcao,
            u.valor_hora_venda,
            o.numero as obra_numero,
            o.nome as obra_nome
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        INNER JOIN obras o ON o.id = a.obra_id
        LEFT JOIN funcoes f ON f.id = u.funcao_id
        WHERE a.semana_inicio = :semana_inicio
        " . ($obraId ? " AND a.obra_id = :obra_id" : "") . "
        AND a.status IN ('aprovado', 'aprovado_encarregado')
        ORDER BY o.numero, u.nome
    ");

    $params = ['semana_inicio' => $semanaInicio];
    if ($obraId) $params['obra_id'] = $obraId;
    $stmt->execute($params);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($apontamentos)) {
        echo json_encode([
            'success' => true,
            'semana_inicio' => $semanaInicio,
            'semana_do_mes' => $semanaDoMes,
            'mostrar_valores' => false,
            'tipo_relatorio' => 'vazio',
            'obras' => [],
            'email_enviado' => false,
            'message' => 'Nenhum apontamento aprovado encontrado para esta semana'
        ]);
        exit;
    }

    // Organizar dados por obra
    $obrasDados = [];
    $totalGeralH = 0;
    $totalGeralValor = 0;

    foreach ($apontamentos as $apt) {
        $oid = $apt['obra_id'];
        if (!isset($obrasDados[$oid])) {
            $obrasDados[$oid] = [
                'obra_numero' => $apt['obra_numero'],
                'obra_nome'   => $apt['obra_nome'],
                'funcionarios' => [],
                'total_horas_normais' => 0,
                'total_horas_extra'   => 0,
                'total_horas_noturna' => 0,
                'total_horas'  => 0,
                'total_valor'  => 0
            ];
        }

        $horasDiarias = json_decode($apt['horas_diarias'], true) ?: [];
        $horasNormais = 0; $horasExtra = 0; $horasNoturna = 0; $festivos = 0;

        foreach ($horasDiarias as $dia => $dados) {
            if (is_array($dados)) {
                if (!empty($dados['festivo'])) {
                    $horasNormais += 8.0;
                    $festivos++;
                } else {
                    $horasNormais += floatval($dados['normal'] ?? 0);
                    $horasExtra   += floatval($dados['extra']  ?? 0);
                    $horasNoturna += floatval($dados['noturna'] ?? 0);
                }
            }
        }

        $totalHoras = $horasNormais + $horasExtra + $horasNoturna;
        $valorHora  = floatval($apt['valor_hora_venda']) ?: 24.00;
        $valorTotal = $totalHoras * $valorHora;

        $obrasDados[$oid]['funcionarios'][] = [
            'nome'          => $apt['funcionario_nome'],
            'passaporte'    => $apt['passaporte'],
            'horas_normais' => $horasNormais,
            'horas_extra'   => $horasExtra,
            'horas_noturna' => $horasNoturna,
            'festivos'      => $festivos,
            'total_horas'   => $totalHoras,
            'valor_hora'    => $valorHora,
            'valor_total'   => $valorTotal
        ];

        $obrasDados[$oid]['total_horas_normais'] += $horasNormais;
        $obrasDados[$oid]['total_horas_extra']   += $horasExtra;
        $obrasDados[$oid]['total_horas_noturna'] += $horasNoturna;
        $obrasDados[$oid]['total_horas']         += $totalHoras;
        $obrasDados[$oid]['total_valor']         += $valorTotal;
        $totalGeralH     += $totalHoras;
        $totalGeralValor += $valorTotal;
    }

    // ── Construir HTML do email ──────────────────────────────────────────────
    $semanaFim = (new DateTime($semanaInicio))->modify('+5 days')->format('d/m/Y');
    $semanaInicioFmt = $dataInicio->format('d/m/Y');
    $tipoLabel = $mostrarValores ? 'COMPLETO (con valores €)' : 'HORAS (semanas 1-3)';

    $obrasHtml = '';
    foreach ($obrasDados as $obra) {
        $linhasFuncionarios = '';
        foreach ($obra['funcionarios'] as $f) {
            $festivoBadge = $f['festivos'] > 0
                ? "<span style='background:#fef3c7;color:#92400e;padding:2px 6px;border-radius:4px;font-size:11px;margin-left:4px;'>🎉 {$f['festivos']}F</span>"
                : '';
            $valorCell = $mostrarValores
                ? "<td style='padding:8px 10px;text-align:right;font-weight:700;color:#16a34a;'>€" . number_format($f['valor_total'], 2) . "</td>"
                : '';
            $linhasFuncionarios .= "
            <tr style='border-bottom:1px solid #f3f4f6;'>
                <td style='padding:8px 10px;'>
                    <div style='font-weight:600;color:#111827;'>{$f['nome']}{$festivoBadge}</div>
                    <div style='font-size:11px;color:#6b7280;'>{$f['passaporte']}</div>
                </td>
                <td style='padding:8px 10px;text-align:center;color:#166534;font-weight:600;'>{$f['horas_normais']}h</td>
                <td style='padding:8px 10px;text-align:center;color:#92400e;font-weight:600;'>{$f['horas_extra']}h</td>
                <td style='padding:8px 10px;text-align:center;color:#1e40af;font-weight:600;'>{$f['horas_noturna']}h</td>
                <td style='padding:8px 10px;text-align:center;font-weight:700;'>{$f['total_horas']}h</td>
                {$valorCell}
            </tr>";
        }

        $totalValorCell = $mostrarValores
            ? "<td style='padding:10px;text-align:right;font-weight:700;color:#16a34a;font-size:15px;'>€" . number_format($obra['total_valor'], 2) . "</td>"
            : '';
        $valorHeader = $mostrarValores ? "<th style='padding:10px;text-align:right;background:#f8f9fa;'>Valor</th>" : '';

        $obrasHtml .= "
        <div style='margin-bottom:30px;'>
            <div style='background:#CE0201;color:white;padding:10px 16px;border-radius:8px 8px 0 0;font-weight:700;font-size:15px;'>
                📋 {$obra['obra_numero']} — {$obra['obra_nome']}
            </div>
            <table style='width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-top:none;background:white;'>
                <thead>
                    <tr>
                        <th style='padding:10px;text-align:left;background:#f8f9fa;font-size:13px;'>Empleado</th>
                        <th style='padding:10px;text-align:center;background:#dcfce7;font-size:13px;'>Normal</th>
                        <th style='padding:10px;text-align:center;background:#fef3c7;font-size:13px;'>Extra</th>
                        <th style='padding:10px;text-align:center;background:#dbeafe;font-size:13px;'>Noct.</th>
                        <th style='padding:10px;text-align:center;background:#f8f9fa;font-size:13px;'>Total</th>
                        {$valorHeader}
                    </tr>
                </thead>
                <tbody>
                    {$linhasFuncionarios}
                </tbody>
                <tfoot>
                    <tr style='background:#f8f9fa;border-top:2px solid #e5e7eb;'>
                        <td style='padding:10px;font-weight:700;'>TOTAL OBRA</td>
                        <td style='padding:10px;text-align:center;font-weight:700;color:#166534;'>{$obra['total_horas_normais']}h</td>
                        <td style='padding:10px;text-align:center;font-weight:700;color:#92400e;'>{$obra['total_horas_extra']}h</td>
                        <td style='padding:10px;text-align:center;font-weight:700;color:#1e40af;'>{$obra['total_horas_noturna']}h</td>
                        <td style='padding:10px;text-align:center;font-weight:700;'>{$obra['total_horas']}h</td>
                        {$totalValorCell}
                    </tr>
                </tfoot>
            </table>
        </div>";
    }

    $valorTotalHtml = $mostrarValores
        ? "<div style='margin-top:20px;background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:16px;text-align:center;'>
               <div style='font-size:13px;color:#166534;font-weight:600;'>VALOR TOTAL DA SEMANA</div>
               <div style='font-size:36px;font-weight:700;color:#16a34a;'>€" . number_format($totalGeralValor, 2) . "</div>
           </div>"
        : "<div style='margin-top:10px;font-size:12px;color:#6b7280;text-align:center;'>
               ℹ️ Valores € disponibles na semana 4 do mês
           </div>";

    $igiHtml = '';
    if ($mostrarValores && $config) {
        $igiPct = floatval($config['igi_percentual'] ?? 4.5);
        $igiValor = $totalGeralValor * ($igiPct / 100);
        $liquido = $totalGeralValor - $igiValor;
        $igiHtml = "
        <div style='margin-top:20px;background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;padding:16px;'>
            <div style='font-weight:600;color:#1e40af;margin-bottom:8px;'>📊 Cálculo IGI</div>
            <table style='width:100%;'>
                <tr><td style='color:#374151;padding:4px 0;'>Total Bruto:</td><td style='text-align:right;font-weight:600;'>€" . number_format($totalGeralValor, 2) . "</td></tr>
                <tr><td style='color:#374151;padding:4px 0;'>IGI ({$igiPct}%):</td><td style='text-align:right;color:#dc2626;font-weight:600;'>−€" . number_format($igiValor, 2) . "</td></tr>
                <tr style='border-top:1px solid #bfdbfe;'><td style='color:#1e40af;padding:8px 0 0;font-weight:700;'>Total Líquido:</td><td style='text-align:right;color:#1e40af;font-weight:700;font-size:17px;padding-top:8px;'>€" . number_format($liquido, 2) . "</td></tr>
            </table>
        </div>";
    }

    $html = "
    <!DOCTYPE html>
    <html><head><meta charset='UTF-8'></head>
    <body style='font-family:Inter,Arial,sans-serif;color:#1f2937;background:#f9fafb;margin:0;padding:0;'>
        <div style='max-width:720px;margin:0 auto;padding:20px;'>

            <div style='background:linear-gradient(135deg,#CE0201 0%,#8a0000 100%);color:white;padding:28px;border-radius:12px 12px 0 0;text-align:center;'>
                <div style='font-size:28px;font-weight:700;margin-bottom:4px;'>📊 Relatório Semanal</div>
                <div style='opacity:.9;font-size:15px;'>{$semanaInicioFmt} — {$semanaFim}</div>
                <div style='margin-top:8px;background:rgba(255,255,255,.2);display:inline-block;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600;'>{$tipoLabel}</div>
            </div>

            <div style='background:white;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;'>

                <div style='display:flex;gap:12px;margin-bottom:24px;'>
                    <div style='flex:1;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px;text-align:center;'>
                        <div style='font-size:28px;font-weight:700;color:#16a34a;'>{$totalGeralH}h</div>
                        <div style='font-size:12px;color:#166534;text-transform:uppercase;font-weight:600;margin-top:4px;'>Total Horas</div>
                    </div>
                    <div style='flex:1;background:#f0f9ff;border:1px solid #93c5fd;border-radius:8px;padding:14px;text-align:center;'>
                        <div style='font-size:28px;font-weight:700;color:#1e40af;'>" . count($apontamentos) . "</div>
                        <div style='font-size:12px;color:#1e40af;text-transform:uppercase;font-weight:600;margin-top:4px;'>Registros</div>
                    </div>
                    <div style='flex:1;background:#fafafa;border:1px solid #e5e7eb;border-radius:8px;padding:14px;text-align:center;'>
                        <div style='font-size:28px;font-weight:700;color:#374151;'>" . count($obrasDados) . "</div>
                        <div style='font-size:12px;color:#6b7280;text-transform:uppercase;font-weight:600;margin-top:4px;'>Obras</div>
                    </div>
                </div>

                {$obrasHtml}
                {$valorTotalHtml}
                {$igiHtml}

            </div>

            <div style='text-align:center;padding:16px;font-size:12px;color:#9ca3af;'>
                Enviado por <strong>{$user['nome']}</strong> — J2S Enginyeria &amp; Instal·lacions
            </div>
        </div>
    </body></html>";

    // ── Buscar email do encarregado logado ───────────────────────────────────
    $emailStmt = $pdo->prepare("SELECT email FROM usuarios WHERE id = ?");
    $emailStmt->execute([$user['id']]);
    $emailEncarregado = $emailStmt->fetchColumn();

    $emailEnviado = false;
    $emailDestino = null;

    if ($emailEncarregado) {
        $subject = "📊 Relatório Semanal — {$semanaInicioFmt} a {$semanaFim} ({$totalGeralH}h)";
        $emailEnviado = sendEmail($emailEncarregado, $subject, $html);
        $emailDestino = $emailEncarregado;
    }

    // Se for semana 4 e houver email_financeiro da obra, enviar também ao financeiro
    if ($mostrarValores && $obraId) {
        $obraEmailStmt = $pdo->prepare("SELECT email_financeiro FROM obras WHERE id = ?");
        $obraEmailStmt->execute([$obraId]);
        $emailFinanceiro = $obraEmailStmt->fetchColumn();
        if ($emailFinanceiro && $emailFinanceiro !== $emailEncarregado) {
            sendEmail($emailFinanceiro, $subject ?? "📊 Relatório Semanal — {$semanaInicioFmt}", $html);
        }
    }

    echo json_encode([
        'success'          => true,
        'semana_inicio'    => $semanaInicio,
        'semana_do_mes'    => $semanaDoMes,
        'mostrar_valores'  => $mostrarValores,
        'tipo_relatorio'   => $mostrarValores ? 'completo' : 'apenas_horas',
        'obras'            => array_values($obrasDados),
        'total_horas'      => $totalGeralH,
        'email_enviado'    => $emailEnviado,
        'email_destino'    => $emailDestino,
        'config'           => $config
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao gerar relatório: ' . $e->getMessage()
    ]);
}
