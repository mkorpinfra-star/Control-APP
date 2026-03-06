<?php
/**
 * Serviço de Envio de E-mails via SMTP
 * Sistema de Marcação de Ponto
 * 
 * Usando PHPMailer-like socket connection para SSL/TLS
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Envia e-mail usando SMTP com SSL
 */
function sendEmail($to, $subject, $htmlBody, $plainBody = null)
{
    // Obter configurações SMTP do banco
    $smtpHost = getConfig('smtp_host');
    $smtpPort = getConfig('smtp_port') ?: 465;
    $smtpUser = getConfig('smtp_user');
    $smtpPass = getConfig('smtp_password');
    $smtpFrom = getConfig('smtp_from') ?: $smtpUser;

    if (empty($smtpHost) || empty($smtpUser) || empty($smtpPass)) {
        error_log("[SMTP] Configuração incompleta. E-mail não enviado para: $to");
        return false;
    }

    try {
        // Conectar ao servidor SMTP com SSL
        $context = stream_context_create([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ]);

        $socket = stream_socket_client(
            "ssl://{$smtpHost}:{$smtpPort}",
            $errno,
            $errstr,
            30,
            STREAM_CLIENT_CONNECT,
            $context
        );

        if (!$socket) {
            error_log("[SMTP] Falha ao conectar: $errstr ($errno)");
            return false;
        }

        // Ler resposta inicial
        $response = fgets($socket, 512);
        if (substr($response, 0, 3) != '220') {
            error_log("[SMTP] Resposta inesperada: $response");
            fclose($socket);
            return false;
        }

        // EHLO
        fputs($socket, "EHLO j2s.ad\r\n");
        while ($line = fgets($socket, 512)) {
            if (substr($line, 3, 1) == ' ')
                break;
        }

        // AUTH LOGIN
        fputs($socket, "AUTH LOGIN\r\n");
        fgets($socket, 512);

        fputs($socket, base64_encode($smtpUser) . "\r\n");
        fgets($socket, 512);

        fputs($socket, base64_encode($smtpPass) . "\r\n");
        $authResponse = fgets($socket, 512);
        if (substr($authResponse, 0, 3) != '235') {
            error_log("[SMTP] Autenticação falhou: $authResponse");
            fclose($socket);
            return false;
        }

        // MAIL FROM
        fputs($socket, "MAIL FROM:<{$smtpFrom}>\r\n");
        fgets($socket, 512);

        // RCPT TO
        fputs($socket, "RCPT TO:<{$to}>\r\n");
        fgets($socket, 512);

        // DATA
        fputs($socket, "DATA\r\n");
        fgets($socket, 512);

        // Headers
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: Sistema de Control Horario <{$smtpFrom}>\r\n";
        $headers .= "To: {$to}\r\n";
        $headers .= "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=\r\n";
        $headers .= "Date: " . date('r') . "\r\n";
        $headers .= "\r\n";

        // Enviar headers + corpo
        fputs($socket, $headers);
        fputs($socket, $htmlBody);
        fputs($socket, "\r\n.\r\n");

        $dataResponse = fgets($socket, 512);
        if (substr($dataResponse, 0, 3) != '250') {
            error_log("[SMTP] Erro ao enviar dados: $dataResponse");
            fclose($socket);
            return false;
        }

        // QUIT
        fputs($socket, "QUIT\r\n");
        fclose($socket);

        error_log("[SMTP] E-mail enviado com sucesso para: $to");
        return true;

    } catch (Exception $e) {
        error_log("[SMTP] Exceção: " . $e->getMessage());
        return false;
    }
}

/**
 * Template de e-mail para notificação ao encarregado
 */
function sendApprovalNotification($encarregadoEmail, $funcionarioNome, $obraNumero, $semana, $totalHoras)
{
    $subject = "Nuevo registro de horas pendiente de aprobación";

    $html = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
            .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .value { font-size: 16px; font-weight: 600; color: #1f2937; }
            .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='margin:0;'>Sistema de Control Horario</h1>
            </div>
            <div class='content'>
                <h2>Nuevo registro pendiente de aprobación</h2>
                <p>Se ha recibido un nuevo registro de horas que requiere su aprobación.</p>
                
                <div class='info-box'>
                    <div class='label'>Empleado</div>
                    <div class='value'>$funcionarioNome</div>
                </div>
                
                <div class='info-box'>
                    <div class='label'>Obra</div>
                    <div class='value'>$obraNumero</div>
                </div>
                
                <div class='info-box'>
                    <div class='label'>Semana</div>
                    <div class='value'>$semana</div>
                </div>
                
                <div class='info-box'>
                    <div class='label'>Total de horas</div>
                    <div class='value'>{$totalHoras}h</div>
                </div>
                
                <p>Por favor, acceda al sistema para revisar y aprobar este registro.</p>
            </div>
            <div class='footer'>
                <p>Este es un mensaje automático del Sistema de Control Horario.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    return sendEmail($encarregadoEmail, $subject, $html);
}

/**
 * Envia relatório CONSOLIDADO da semana para o financeiro
 * Formato da planilha: todos os funcionários da obra, dias detalhados, assinatura, APROVADO
 * Semanas 1-3: SEM valores €
 * Semana 4 (última do mês): COM valores € + resumo fatura cumulativo do mês
 *
 * IMPORTANTE: Chamado após aprovação do encarregado.
 * Busca TODOS os apontamentos aprovados da semana/obra (não só o individual).
 * Inclui semanas anteriores do mês (relatório cumulativo).
 */
function sendToFinance($apontamento, $assinatura, $emailDestino = null)
{
    $financeEmail = $emailDestino ?: getConfig('email_financeiro') ?: 'contactes@j2s.ad';
    $pdo = getConnection();

    $obraId      = $apontamento['obra_id'];
    $semanaAtual = $apontamento['semana_inicio']; // ex: "2025-12-01"

    // ── Determinar semana do mês e se é a última ─────────────────────────────
    $dtSemanaAtual  = new DateTime($semanaAtual);
    $mesAtual       = $dtSemanaAtual->format('Y-m');
    $mesInicioDt    = new DateTime($mesAtual . '-01');
    $mesFimDt       = clone $mesInicioDt;
    $mesFimDt->modify('last day of this month');

    // Calcular as semanas (segundas-feiras) do mês.
    // Regra: só conta semanas cuja segunda-feira cai DENTRO do mês atual.
    // Ex: fev/2026 começa num domingo → a segunda 26/jan não entra; a 1ª semana é 02/fev.
    $semanasDoMes = [];
    $cursor = clone $mesInicioDt;
    $diaSemana = (int)$cursor->format('N'); // 1=Mon … 7=Sun
    if ($diaSemana !== 1) {
        // Avançar para a PRÓXIMA segunda dentro do mês
        $cursor->modify('next monday');
    }
    // Adicionar apenas semanas cuja segunda-feira está dentro do mês
    while ($cursor <= $mesFimDt) {
        $semanasDoMes[] = $cursor->format('Y-m-d');
        $cursor->modify('+7 days');
    }
    // Garantir que a semana atual está na lista (caso o apontamento use uma data ligeiramente diferente)
    if (!in_array($semanaAtual, $semanasDoMes)) {
        $semanasDoMes[] = $semanaAtual;
        sort($semanasDoMes);
    }

    $numeroSemanaAtual = array_search($semanaAtual, $semanasDoMes) + 1;
    $totalSemanasNoMes = count($semanasDoMes);
    $isUltimaSemana    = ($numeroSemanaAtual >= $totalSemanasNoMes);

    // Também verifica se a próxima segunda-feira cai no mês seguinte
    $proximaSemana = clone $dtSemanaAtual;
    $proximaSemana->modify('+7 days');
    if ($proximaSemana->format('Y-m') !== $mesAtual) {
        $isUltimaSemana = true;
    }

    // ── Config de valores de hora ─────────────────────────────────────────────
    $cfgStmt = $pdo->query("SELECT * FROM config_valores ORDER BY id DESC LIMIT 1");
    $config  = $cfgStmt->fetch(PDO::FETCH_ASSOC);
    $valorNormal  = isset($config['valor_hora_normal'])  ? floatval($config['valor_hora_normal'])  : 21.00;
    $valorExtra   = isset($config['valor_hora_extra'])   ? floatval($config['valor_hora_extra'])   : 28.00;
    $valorNoturna = isset($config['valor_hora_noturna']) ? floatval($config['valor_hora_noturna']) : 30.00;

    // ── Buscar dados da obra e encarregado ────────────────────────────────────
    $obraStmt = $pdo->prepare("
        SELECT o.*, c.nome as cliente_nome,
               o.numero as numero_contrato,
               enc.nome as encarregado_nome
        FROM obras o
        LEFT JOIN clientes c ON c.id = o.cliente_id
        LEFT JOIN usuarios enc ON enc.id = o.encarregado_id
        WHERE o.id = ?
    ");
    $obraStmt->execute([$obraId]);
    $obra = $obraStmt->fetch(PDO::FETCH_ASSOC);

    // ── Buscar TODAS as semanas aprovadas do mês para esta obra (cumulativo) ──
    $semanasParaExibir = array_slice($semanasDoMes, 0, $numeroSemanaAtual);

    $placeholders = implode(',', array_fill(0, count($semanasParaExibir), '?'));
    $aptStmt = $pdo->prepare("
        SELECT a.*,
               u.nome  as funcionario_nome,
               u.passaporte,
               u.foto_url as funcionario_foto,
               u.funcao,
               a.assinatura_base64 as assinatura_encarregado,
               a.aprovado_por as aprovado_por_id
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        WHERE a.obra_id = ?
          AND a.status IN ('aprovado', 'aprovado_encarregado')
          AND a.semana_inicio IN ($placeholders)
        ORDER BY u.nome, a.semana_inicio
    ");
    $aptStmt->execute(array_merge([$obraId], $semanasParaExibir));
    $todosApontamentos = $aptStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($todosApontamentos)) {
        // Nada aprovado ainda — não envia
        return false;
    }

    $dias = ['mon' => 'Lun', 'tue' => 'Mar', 'wed' => 'Mié', 'thu' => 'Jue', 'fri' => 'Vie', 'sat' => 'Sáb'];

    // ── Organizar apontamentos por funcionário + semana ───────────────────────
    // estrutura: $funcMap[func_id][semana_inicio] = dados
    $funcMap   = [];
    $funcOrder = []; // manter ordem de exibição

    foreach ($todosApontamentos as $apt) {
        $fid  = $apt['funcionario_id'];
        $sem  = $apt['semana_inicio'];

        if (!isset($funcMap[$fid])) {
            $funcMap[$fid] = [
                'nome'     => $apt['funcionario_nome'],
                'passaporte' => $apt['passaporte'],
                'foto'     => $apt['funcionario_foto'],
                'semanas'  => [],
                'total_normal'  => 0,
                'total_extra'   => 0,
                'total_noturna' => 0,
            ];
            $funcOrder[] = $fid;
        }

        // Processar horas da semana
        $horasDiarias = json_decode($apt['horas_diarias'], true) ?: [];
        $sNormal = 0; $sExtra = 0; $sNoturna = 0;
        $diasDetalhes = [];

        foreach ($dias as $key => $label) {
            $dayData = isset($horasDiarias[$key]) ? $horasDiarias[$key] : ['normal' => 0, 'extra' => 0, 'noturna' => 0, 'fecha' => ''];
            if (!is_array($dayData)) {
                $dayData = ['normal' => floatval($dayData), 'extra' => 0, 'noturna' => 0, 'fecha' => ''];
            }
            $dn = floatval($dayData['normal']  ?? 0);
            $de = floatval($dayData['extra']   ?? 0);
            $dt = floatval($dayData['noturna'] ?? 0);
            $df = $dayData['fecha'] ?? '';

            // festivo: conta 8h normais
            if (!empty($dayData['festivo'])) { $dn = 8; $de = 0; $dt = 0; }

            $sNormal  += $dn;
            $sExtra   += $de;
            $sNoturna += $dt;

            // Data do dia para exibir no cabeçalho
            $diasDetalhes[$key] = [
                'normal'  => $dn,
                'extra'   => $de,
                'noturna' => $dt,
                'fecha'   => $df,
                'festivo' => !empty($dayData['festivo']),
            ];
        }

        $funcMap[$fid]['semanas'][$sem] = [
            'dias'            => $diasDetalhes,
            'normal'          => $sNormal,
            'extra'           => $sExtra,
            'noturna'         => $sNoturna,
            'total'           => $sNormal + $sExtra + $sNoturna,
            'assinatura'      => $apt['assinatura_encarregado'] ?: $assinatura,
            'aprovado_em'     => $apt['aprovado_em'] ?? date('d/m/Y'),
        ];

        $funcMap[$fid]['total_normal']  += $sNormal;
        $funcMap[$fid]['total_extra']   += $sExtra;
        $funcMap[$fid]['total_noturna'] += $sNoturna;
    }

    // ── Totais gerais do relatório ────────────────────────────────────────────
    $totalGeralNormal  = 0;
    $totalGeralExtra   = 0;
    $totalGeralNoturna = 0;
    foreach ($funcMap as $f) {
        $totalGeralNormal  += $f['total_normal'];
        $totalGeralExtra   += $f['total_extra'];
        $totalGeralNoturna += $f['total_noturna'];
    }
    $totalGeralHoras = $totalGeralNormal + $totalGeralExtra + $totalGeralNoturna;

    // ── Formatação das datas das semanas para o cabeçalho ────────────────────
    $semanaLabels = [];
    foreach ($semanasParaExibir as $idx => $semData) {
        $dtS = new DateTime($semData);
        $dtE = clone $dtS;
        $dtE->modify('+5 days');
        $semanaLabels[$semData] = ($idx + 1) . "ª Semana (" . $dtS->format('d/m') . " - " . $dtE->format('d/m') . ")";
    }

    // ── Cor do cabeçalho (vermelho J2S para última semana, azul para demais) ──
    $headerColor   = $isUltimaSemana ? '#CE0201' : '#1e3a5f';
    $tipoLabel     = $isUltimaSemana
        ? "SEMANA " . $numeroSemanaAtual . " — RELATÓRIO FINAL COM VALORES"
        : "SEMANA " . $numeroSemanaAtual . " — CONFERÊNCIA DE HORAS";

    $clienteNome   = $obra['cliente_nome']        ?? 'N/A';
    $contratoNum   = $obra['numero_contrato']      ?? ($obra['numero'] ?? 'N/A');
    $obraNumero    = $obra['numero']               ?? 'N/A';
    $obraNome      = $obra['nome']                 ?? '';
    $encarregadoNome = $obra['encarregado_nome']   ?? $apontamento['aprovado_por_nome'] ?? '';

    $mesesEs = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    $mesNum  = (int)(new DateTime($mesAtual . '-01'))->format('m');
    $anoNum  = (new DateTime($mesAtual . '-01'))->format('Y');
    $mesNome = $mesesEs[$mesNum] . ' ' . $anoNum;

    // ── Montar o HTML no formato da planilha ──────────────────────────────────
    $funcionariosHtml = '';

    foreach ($funcOrder as $fid) {
        $func = $funcMap[$fid];

        // Cabeçalho do funcionário
        $funcionariosHtml .= "
        <div style='margin-bottom:24px;border:1px solid #d1d5db;border-radius:0;'>
            <!-- Nome do funcionário -->
            <div style='background:#fef3c7;padding:8px 12px;border-bottom:1px solid #d1d5db;'>
                <strong style='font-size:13px;color:#111;text-transform:uppercase;'>{$func['nome']}</strong>
                " . ($func['passaporte'] ? "<span style='font-size:11px;color:#6b7280;margin-left:8px;'>{$func['passaporte']}</span>" : "") . "
            </div>
            <table style='width:100%;border-collapse:collapse;font-size:12px;'>
                <thead>
                    <!-- Linha de semanas -->
                    <tr style='background:#c8d8e8;'>
                        <td style='padding:5px 8px;font-weight:600;width:110px;border:1px solid #b0bec5;'>Días / Semana</td>";

        foreach ($semanasParaExibir as $semData) {
            $funcionariosHtml .= "<td colspan='7' style='padding:5px 8px;text-align:center;font-weight:600;border:1px solid #b0bec5;'>" . $semanaLabels[$semData] . "</td>";
        }

        $funcionariosHtml .= "
                        <td style='padding:5px 8px;text-align:center;font-weight:700;background:#e8c4c4;border:1px solid #b0bec5;'>TOTAL DE HORAS</td>
                    </tr>
                    <!-- Sub-cabeçalho dias -->
                    <tr style='background:#dce8f0;font-size:11px;'>
                        <td style='padding:4px 8px;border:1px solid #b0bec5;'></td>";

        foreach ($semanasParaExibir as $semData) {
            // Para cada semana mostrar os dias (Seg, Ter... Sáb + Domingo header)
            $dtBase = new DateTime($semData);
            foreach ($dias as $key => $label) {
                $dtDia = clone $dtBase;
                switch ($key) {
                    case 'mon': break;
                    case 'tue': $dtDia->modify('+1 day'); break;
                    case 'wed': $dtDia->modify('+2 days'); break;
                    case 'thu': $dtDia->modify('+3 days'); break;
                    case 'fri': $dtDia->modify('+4 days'); break;
                    case 'sat': $dtDia->modify('+5 days'); break;
                }
                $diaNum = $dtDia->format('d');
                $bgDia  = ($key === 'sat') ? "background:#ffe4b5;" : "background:#dce8f0;";
                $funcionariosHtml .= "<td style='padding:3px 4px;text-align:center;border:1px solid #b0bec5;{$bgDia}'><strong>{$label}</strong><br><span style='font-size:10px;color:#555;'>{$diaNum}</span></td>";
            }
            // Domingo (vazio, mas marcado)
            $dtDom = new DateTime($semData);
            $dtDom->modify('+6 days');
            $funcionariosHtml .= "<td style='padding:3px 4px;text-align:center;background:#ffcccc;border:1px solid #b0bec5;'><strong style='font-size:11px;'>Dom</strong><br><span style='font-size:10px;color:#555;'>{$dtDom->format('d')}</span></td>";
        }

        $funcionariosHtml .= "
                        <td style='border:1px solid #b0bec5;'></td>
                    </tr>
                </thead>
                <tbody>";

        // Linha de Hora Normal
        $funcionariosHtml .= "<tr><td style='padding:4px 8px;font-size:11px;color:#166534;font-weight:600;background:#f0fdf4;border:1px solid #e5e7eb;'>Hora normal</td>";
        $totalNormalFunc = 0;
        foreach ($semanasParaExibir as $semData) {
            $semDados = $func['semanas'][$semData] ?? null;
            foreach ($dias as $key => $label) {
                $val = $semDados ? ($semDados['dias'][$key]['normal'] ?? 0) : 0;
                $bg  = ($key === 'sat') ? "background:#fffacd;" : "";
                $txt = $val > 0 ? $val : '';
                $funcionariosHtml .= "<td style='padding:4px;text-align:center;border:1px solid #e5e7eb;{$bg}'>{$txt}</td>";
                $totalNormalFunc += $val;
            }
            // Domingo — sempre 0
            $funcionariosHtml .= "<td style='padding:4px;text-align:center;background:#ffe0e0;border:1px solid #e5e7eb;'></td>";
        }
        $funcionariosHtml .= "<td style='padding:4px 8px;text-align:center;font-weight:700;background:#c8e6c9;border:1px solid #b0bec5;'>{$totalNormalFunc}</td></tr>";

        // Linha de Hora Extra
        $funcionariosHtml .= "<tr><td style='padding:4px 8px;font-size:11px;color:#92400e;font-weight:600;background:#fffbf0;border:1px solid #e5e7eb;'>Hora extra</td>";
        $totalExtraFunc = 0;
        foreach ($semanasParaExibir as $semData) {
            $semDados = $func['semanas'][$semData] ?? null;
            foreach ($dias as $key => $label) {
                $val = $semDados ? ($semDados['dias'][$key]['extra'] ?? 0) : 0;
                $bg  = ($key === 'sat') ? "background:#fffacd;" : "";
                $txt = $val > 0 ? $val : '';
                $funcionariosHtml .= "<td style='padding:4px;text-align:center;border:1px solid #e5e7eb;{$bg}'>{$txt}</td>";
                $totalExtraFunc += $val;
            }
            $funcionariosHtml .= "<td style='padding:4px;text-align:center;background:#ffe0e0;border:1px solid #e5e7eb;'></td>";
        }
        $funcionariosHtml .= "<td style='padding:4px 8px;text-align:center;font-weight:700;background:#fff9c4;border:1px solid #b0bec5;'>{$totalExtraFunc}</td></tr>";

        // Pegar a assinatura e data da semana mais recente do funcionário (que pode não ser a última semana)
        $assinaturaFunc  = '';
        $aprovadoEmFunc  = date('d/m/Y');
        foreach (array_reverse($semanasParaExibir) as $semRev) {
            if (isset($func['semanas'][$semRev])) {
                if (!empty($func['semanas'][$semRev]['assinatura'])) {
                    $assinaturaFunc = $func['semanas'][$semRev]['assinatura'];
                }
                $aprovadoEmFunc = $func['semanas'][$semRev]['aprovado_em'] ?: $aprovadoEmFunc;
                break;
            }
        }
        if (empty($assinaturaFunc) && !empty($assinatura)) {
            $assinaturaFunc = $assinatura;
        }

        $totalHorasFunc = ($func['total_normal'] + $func['total_extra'] + $func['total_noturna']);

        $funcionariosHtml .= "
                </tbody>
                <tfoot>
                    <tr style='background:#f3f4f6;'>
                        <td colspan='" . (count($semanasParaExibir) * 7 + 1) . "' style='padding:6px 10px;border:1px solid #d1d5db;'>
                            <table style='width:100%;border-collapse:collapse;'>
                                <tr>
                                    <td style='width:60%;padding:4px;'>
                                        <div style='font-size:11px;color:#374151;margin-bottom:4px;'>✅ Aprovado pelo encarregado: <strong>{$encarregadoNome}</strong></div>
                                        " . ($assinaturaFunc ? "<img src='{$assinaturaFunc}' alt='Assinatura' style='height:40px;border:1px solid #d1d5db;background:white;padding:2px;border-radius:4px;' />" : "<span style='font-style:italic;color:#9ca3af;font-size:11px;'>Sem assinatura</span>") . "
                                    </td>
                                    <td style='width:20%;text-align:center;padding:4px;'>
                                        <div style='font-size:10px;color:#374151;margin-bottom:4px;'>☑ De acordo com as informações</div>
                                        <div style='display:inline-block;background:#16a34a;color:white;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:700;'>APROVADO</div>
                                    </td>
                                    <td style='width:20%;text-align:right;padding:4px;font-size:11px;color:#374151;'>
                                        Data: {$aprovadoEmFunc}
                                    </td>
                                </tr>
                            </table>
                        </td>
                        <td style='padding:6px 8px;text-align:center;font-weight:700;font-size:14px;background:#e8c4c4;border:1px solid #b0bec5;'>{$totalHorasFunc}</td>
                    </tr>
                </tfoot>
            </table>
        </div>";
    }

    // ── Seção de valores (APENAS semana 4) ───────────────────────────────────
    $valoresHtml = '';
    if ($isUltimaSemana) {
        $vNormal  = $totalGeralNormal  * $valorNormal;
        $vExtra   = $totalGeralExtra   * $valorExtra;
        $vNoturna = $totalGeralNoturna * $valorNoturna;
        $vTotal   = $vNormal + $vExtra + $vNoturna;

        // Tabela por funcionário com valores
        $linhasValores = '';
        foreach ($funcOrder as $fid) {
            $f = $funcMap[$fid];
            $fvN = $f['total_normal']  * $valorNormal;
            $fvE = $f['total_extra']   * $valorExtra;
            $fvT = $f['total_noturna'] * $valorNoturna;
            $fvTotal = $fvN + $fvE + $fvT;
            $fhTotal = $f['total_normal'] + $f['total_extra'] + $f['total_noturna'];
            $linhasValores .= "
            <tr style='border-bottom:1px solid #e5e7eb;'>
                <td style='padding:8px;font-weight:500;'>{$f['nome']}</td>
                <td style='padding:8px;text-align:center;color:#166534;'>{$f['total_normal']}h</td>
                <td style='padding:8px;text-align:center;color:#92400e;'>{$f['total_extra']}h</td>
                <td style='padding:8px;text-align:center;font-weight:600;'>{$fhTotal}h</td>
                <td style='padding:8px;text-align:right;font-weight:600;color:#16a34a;'>€" . number_format($fvTotal, 2) . "</td>
            </tr>";
        }

        $valoresHtml = "
        <div style='margin-top:30px;border:2px solid #CE0201;border-radius:8px;overflow:hidden;'>
            <div style='background:#CE0201;color:white;padding:12px 16px;font-weight:700;font-size:15px;text-transform:uppercase;'>
                💰 RESUMO DA FATURA — {$mesNome}
            </div>
            <div style='padding:16px;background:white;'>
                <table style='width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e5e7eb;'>
                    <thead>
                        <tr style='background:#f8f9fa;'>
                            <th style='padding:10px;text-align:left;border-bottom:2px solid #e5e7eb;'>Empleado</th>
                            <th style='padding:10px;text-align:center;background:#dcfce7;color:#166534;border-bottom:2px solid #e5e7eb;'>H. Normal<br><span style='font-size:10px;font-weight:400;'>€" . number_format($valorNormal, 2) . "/h</span></th>
                            <th style='padding:10px;text-align:center;background:#fef3c7;color:#92400e;border-bottom:2px solid #e5e7eb;'>H. Extra<br><span style='font-size:10px;font-weight:400;'>€" . number_format($valorExtra, 2) . "/h</span></th>
                            <th style='padding:10px;text-align:center;border-bottom:2px solid #e5e7eb;'>Total Horas</th>
                            <th style='padding:10px;text-align:right;border-bottom:2px solid #e5e7eb;'>V. TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$linhasValores}
                    </tbody>
                    <tfoot>
                        <tr style='background:#f8f9fa;font-weight:700;border-top:2px solid #e5e7eb;'>
                            <td style='padding:10px;'>TOTAL GERAL</td>
                            <td style='padding:10px;text-align:center;color:#166534;'>{$totalGeralNormal}h</td>
                            <td style='padding:10px;text-align:center;color:#92400e;'>{$totalGeralExtra}h</td>
                            <td style='padding:10px;text-align:center;'>{$totalGeralHoras}h</td>
                            <td style='padding:10px;text-align:right;font-size:16px;color:#CE0201;'>€" . number_format($vTotal, 2) . "</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>";
    }

    // ── Montar o HTML completo ────────────────────────────────────────────────
    $semanaFimFmt  = (clone $dtSemanaAtual)->modify('+5 days')->format('d/m/Y');
    $semanaInicFmt = $dtSemanaAtual->format('d/m/Y');

    $avisoHtml = $isUltimaSemana
        ? "<div style='background:#fef3c7;border-left:4px solid #f59e0b;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#92400e;'><strong>📋 Última semana do mês</strong> — Este relatório inclui os valores para faturamento.</div>"
        : "<div style='background:#eff6ff;border-left:4px solid #3b82f6;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#1e40af;'>📋 Relatório de conferência de horas — Sem valores monetários. Os valores serão enviados na última semana do mês.</div>";

    $html = "
    <!DOCTYPE html>
    <html>
    <head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head>
    <body style='font-family:Arial,sans-serif;color:#1f2937;background:#f1f5f9;margin:0;padding:0;'>
    <div style='max-width:900px;margin:0 auto;padding:16px;'>

        <!-- Cabeçalho estilo planilha -->
        <table style='width:100%;border-collapse:collapse;border:2px solid #374151;margin-bottom:0;background:white;'>
            <tr>
                <td style='padding:10px 14px;border:2px solid #374151;width:15%;'>
                    <div style='font-size:10px;color:#6b7280;text-transform:uppercase;'>CLIENTE:</div>
                    <div style='font-size:18px;font-weight:700;'>{$clienteNome}</div>
                </td>
                <td style='padding:10px 14px;border:2px solid #374151;width:30%;'>
                    <div style='font-size:10px;color:#6b7280;text-transform:uppercase;'>OBRA:</div>
                    <div style='font-size:16px;font-weight:700;'>{$obraNome}</div>
                    <div style='font-size:12px;color:#6b7280;'>{$obraNumero}</div>
                </td>
                <td colspan='2' style='padding:10px 14px;border:2px solid #374151;text-align:center;'>
                    <div style='font-size:10px;color:#6b7280;text-transform:uppercase;'>N. CONTRATO</div>
                    <div style='font-size:20px;font-weight:700;'>{$contratoNum}</div>
                </td>
                <td style='padding:10px 14px;border:2px solid #374151;text-align:center;background:{$headerColor};color:white;width:15%;'>
                    <div style='font-size:11px;font-weight:700;'>RESUMO DA<br>FACTURA</div>
                </td>
            </tr>
        </table>

        <!-- Barra de título -->
        <div style='background:{$headerColor};color:white;padding:10px 16px;font-weight:700;font-size:14px;text-align:center;border-left:2px solid #374151;border-right:2px solid #374151;'>
            {$tipoLabel} &nbsp;|&nbsp; Período: {$semanaInicFmt} — {$semanaFimFmt} &nbsp;|&nbsp; Mês: {$mesNome}
        </div>

        <!-- Cabeçalho das semanas -->
        <table style='width:100%;border-collapse:collapse;border:2px solid #374151;border-top:none;background:white;margin-bottom:16px;'>
            <tr style='background:#c8d8e8;font-weight:700;font-size:13px;text-align:center;'>
                <td style='padding:8px 12px;border:1px solid #374151;width:12%;text-align:left;'>SEMANAS</td>";

    foreach ($semanasParaExibir as $idx => $semData) {
        $html .= "<td style='padding:8px 12px;border:1px solid #374151;'>" . $semanaLabels[$semData] . "</td>";
    }
    // Colunas em branco para semanas restantes (até 5ª semana)
    $semanasRestantes = 5 - count($semanasParaExibir);
    for ($i = 0; $i < $semanasRestantes; $i++) {
        $html .= "<td style='padding:8px 12px;border:1px solid #374151;color:#9ca3af;'>" . (count($semanasParaExibir) + $i + 1) . "ª Semana</td>";
    }

    $html .= "
            </tr>
        </table>

        {$avisoHtml}

        <!-- Funcionários -->
        {$funcionariosHtml}

        <!-- Resumo valores (apenas última semana) -->
        {$valoresHtml}

        <!-- Totais gerais -->
        <table style='width:100%;border-collapse:collapse;border:2px solid #374151;background:white;margin-top:16px;'>
            <tr style='background:#e8c4c4;font-weight:700;font-size:14px;'>
                <td style='padding:10px 14px;border:1px solid #374151;'>TOTAL GERAL DE HORAS — " . count($funcOrder) . " Empleados</td>
                <td style='padding:10px 14px;border:1px solid #374151;text-align:center;color:#166534;'>Normal: {$totalGeralNormal}h</td>
                <td style='padding:10px 14px;border:1px solid #374151;text-align:center;color:#92400e;'>Extra: {$totalGeralExtra}h</td>
                <td style='padding:10px 14px;border:1px solid #374151;text-align:center;'>TOTAL: {$totalGeralHoras}h</td>
            </tr>
        </table>

        <!-- Rodapé -->
        <div style='text-align:center;padding:12px;font-size:11px;color:#9ca3af;margin-top:8px;'>
            Gerado automaticamente — J2S Enginyeria &amp; Instal·lacions
        </div>
    </div>
    </body>
    </html>";

    // ── Determinar assunto do email ───────────────────────────────────────────
    $subjectTipo = $isUltimaSemana ? '💰 RELATÓRIO FINAL COM VALORES' : '📋 Conferência de Horas';
    $subject = "{$subjectTipo} — {$obraNumero} — {$mesNome} — Semana {$numeroSemanaAtual} ({$totalGeralHoras}h)";

    // ── Enviar email ──────────────────────────────────────────────────────────
    return sendEmail($financeEmail, $subject, $html);
}

/**
 * Envia relatório mensal consolidado COM VALORES para o financeiro
 * Chamado automaticamente na última semana do mês
 */
function sendMonthlyReportToFinance($obraId, $mes, $emailDestino)
{
    $pdo = getConnection();

    // Buscar valores de hora configurados
    $stmt = $pdo->query("SELECT * FROM config_valores ORDER BY id DESC LIMIT 1");
    $config = $stmt->fetch(PDO::FETCH_ASSOC);

    $valorNormal = isset($config['valor_hora_normal']) ? floatval($config['valor_hora_normal']) : 21.00;
    $valorExtra = isset($config['valor_hora_extra']) ? floatval($config['valor_hora_extra']) : 28.00;
    $valorNoturna = isset($config['valor_hora_noturna']) ? floatval($config['valor_hora_noturna']) : 30.00;

    // Buscar dados da obra e cliente
    $stmt = $pdo->prepare("
        SELECT o.*, c.nome as cliente_nome
        FROM obras o
        LEFT JOIN clientes c ON o.cliente_id = c.id
        WHERE o.id = ?
    ");
    $stmt->execute([$obraId]);
    $obra = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$obra)
        return false;

    // Calcular inicio e fim do mês
    $mesInicio = $mes . '-01';
    $mesFim = date('Y-m-t', strtotime($mesInicio));
    $mesesEsM = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    $mesNome = $mesesEsM[(int)date('m', strtotime($mesInicio))] . ' ' . date('Y', strtotime($mesInicio));

    // Buscar TODOS os apontamentos aprovados do mês para esta obra
    $stmt = $pdo->prepare("
        SELECT a.*, u.nome as funcionario_nome, u.passaporte as funcionario_passaporte
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        WHERE a.obra_id = ? 
        AND a.status IN ('aprovado', 'aprovado_encarregado')
        AND a.semana_inicio >= ?
        AND a.semana_inicio <= ?
        ORDER BY u.nome, a.semana_inicio
    ");
    $stmt->execute([$obraId, $mesInicio, $mesFim]);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($apontamentos) === 0)
        return false;

    // Agrupar por funcionário e calcular totais
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
                    $funcionarios[$funcId]['horas_normal'] += isset($dia['normal']) ? floatval($dia['normal']) : 0;
                    $funcionarios[$funcId]['horas_extra'] += isset($dia['extra']) ? floatval($dia['extra']) : 0;
                    $funcionarios[$funcId]['horas_noturna'] += isset($dia['noturna']) ? floatval($dia['noturna']) : 0;
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

    // Construir tabela de funcionários
    $funcionariosHtml = "";
    foreach ($funcionarios as $func) {
        $funcionariosHtml .= "<tr style='border-bottom:1px solid #e5e7eb;'>
            <td style='padding:10px 8px;'>
                <div style='font-weight:500;'>{$func['nome']}</div>
                <div style='font-size:11px;color:#6b7280;'>{$func['passaporte']}</div>
            </td>
            <td style='padding:10px 8px;text-align:center;color:#166534;'>{$func['horas_normal']}h</td>
            <td style='padding:10px 8px;text-align:center;color:#92400e;'>{$func['horas_extra']}h</td>
            <td style='padding:10px 8px;text-align:center;color:#3730a3;'>{$func['horas_noturna']}h</td>
            <td style='padding:10px 8px;text-align:center;font-weight:600;'>{$func['horas_total']}h</td>
            <td style='padding:10px 8px;text-align:right;font-weight:600;color:#16a34a;'>€" . number_format($func['valor_total'], 2) . "</td>
        </tr>";
    }

    $clienteNome = $obra['cliente_nome'] ?: 'N/A';
    $subject = "💰 INFORME MENSUAL - {$obra['numero']} - {$mes} - TOTAL €" . number_format($valorTotal, 2);

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
                            <th style='border-bottom:2px solid #e5e7eb;background:#dcfce7;color:#166534;'>Normal<br><span style='font-size:10px;font-weight:400;'>€{$valorNormal}/h</span></th>
                            <th style='border-bottom:2px solid #e5e7eb;background:#fef3c7;color:#92400e;'>Extra<br><span style='font-size:10px;font-weight:400;'>€{$valorExtra}/h</span></th>
                            <th style='border-bottom:2px solid #e5e7eb;background:#e0e7ff;color:#3730a3;'>Nocturna<br><span style='font-size:10px;font-weight:400;'>€{$valorNoturna}/h</span></th>
                            <th style='border-bottom:2px solid #e5e7eb;'>Total h</th>
                            <th style='border-bottom:2px solid #e5e7eb;text-align:right;'>Valor €</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$funcionariosHtml}
                    </tbody>
                </table>

                <h3 style='margin-top:25px;margin-bottom:15px;'>💰 Resumen de Valores</h3>
                <table>
                    <tr style='background:#dcfce7;'>
                        <td style='padding:12px;color:#166534;font-weight:500;'>Horas Normales (8-17h)</td>
                        <td style='padding:12px;text-align:center;color:#166534;'>{$totaisGeral['normal']}h × €" . number_format($valorNormal, 2) . "</td>
                        <td style='padding:12px;text-align:right;color:#166534;font-weight:600;'>€" . number_format($valorTotalNormal, 2) . "</td>
                    </tr>
                    <tr style='background:#fef3c7;'>
                        <td style='padding:12px;color:#92400e;font-weight:500;'>Horas Extra (17-22h)</td>
                        <td style='padding:12px;text-align:center;color:#92400e;'>{$totaisGeral['extra']}h × €" . number_format($valorExtra, 2) . "</td>
                        <td style='padding:12px;text-align:right;color:#92400e;font-weight:600;'>€" . number_format($valorTotalExtra, 2) . "</td>
                    </tr>
                    <tr style='background:#e0e7ff;'>
                        <td style='padding:12px;color:#3730a3;font-weight:500;'>Horas Nocturnas (22-6h)</td>
                        <td style='padding:12px;text-align:center;color:#3730a3;'>{$totaisGeral['noturna']}h × €" . number_format($valorNoturna, 2) . "</td>
                        <td style='padding:12px;text-align:right;color:#3730a3;font-weight:600;'>€" . number_format($valorTotalNoturna, 2) . "</td>
                    </tr>
                </table>

                <div class='total-box' style='text-align:center;'>
                    <div style='font-size:14px;opacity:0.9;margin-bottom:8px;'>TOTAL GENERAL - {$totaisGeral['total']} HORAS</div>
                    <div style='font-size:40px;font-weight:700;'>€" . number_format($valorTotal, 2) . "</div>
                </div>
            </div>
            <div class='footer'>
                <p>Este es un informe mensual automático consolidando todas las semanas aprobadas.</p>
                <p style='color:#16a34a;font-weight:600;'>J2S Enginyeria & Instal·lacions</p>
            </div>
        </div>
    </body>
    </html>
    ";

    return sendEmail($emailDestino, $subject, $html);
}

/**
 * Notifica funcionário sobre rejeição
 */
function sendRejectionNotification($funcionarioEmail, $funcionarioNome, $obraNumero, $semana, $motivo)
{
    $subject = "Registro de horas rechazado - Semana $semana";

    $html = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
            .reason-box { background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 15px; margin: 15px 0; }
            .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .value { font-size: 16px; font-weight: 600; color: #1f2937; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='margin:0;'>Registro Rechazado</h1>
            </div>
            <div class='content'>
                <p>Hola $funcionarioNome,</p>
                <p>Su registro de horas ha sido rechazado y requiere corrección.</p>
                
                <div class='info-box'>
                    <div class='label'>Obra</div>
                    <div class='value'>$obraNumero</div>
                </div>
                
                <div class='info-box'>
                    <div class='label'>Semana</div>
                    <div class='value'>$semana</div>
                </div>
                
                <div class='reason-box'>
                    <div class='label'>Motivo del rechazo</div>
                    <div class='value'>$motivo</div>
                </div>
                
                <p>Por favor, acceda al sistema para revisar y corregir su registro.</p>
            </div>
            <div class='footer'>
                <p>Este es un mensaje automático del Sistema de Control Horario.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    return sendEmail($funcionarioEmail, $subject, $html);
}

/**
 * Notifica Admin/RH que há registro pendente de aprovação final
 */
function sendAdminNotification($apontamento, $adminEmail)
{
    $subject = "Registro pendiente de aprobación final - {$apontamento['funcionario_nome']}";

    $html = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
            .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .value { font-size: 16px; font-weight: 600; color: #1f2937; }
            .badge { display: inline-block; background: #f59e0b; color: white; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='margin:0;'>Pendiente de Aprobación Final</h1>
            </div>
            <div class='content'>
                <p><span class='badge'>APROBADO POR ENCARGADO</span></p>
                <p>Un registro de horas ha sido aprobado por el encargado y está pendiente de su aprobación final.</p>
                
                <div class='info-box'>
                    <div class='label'>Empleado</div>
                    <div class='value'>{$apontamento['funcionario_nome']}</div>
                </div>
                
                <div class='info-box'>
                    <div class='label'>Obra</div>
                    <div class='value'>{$apontamento['obra_numero']} - {$apontamento['obra_nome']}</div>
                </div>
                
                <div class='info-box'>
                    <div class='label'>Semana</div>
                    <div class='value'>{$apontamento['semana_inicio']}</div>
                </div>
                
                <div class='info-box'>
                    <div class='label'>Aprobado por (Encargado)</div>
                    <div class='value'>{$apontamento['aprovado_por_nome']}</div>
                    <div style='font-size:12px;color:#6b7280;'>{$apontamento['aprovado_em']}</div>
                </div>
                
                <p>Por favor, acceda al sistema para revisar y dar la aprobación final.</p>
            </div>
            <div class='footer'>
                <p>Este es un mensaje automático del Sistema de Control Horario.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    return sendEmail($adminEmail, $subject, $html);
}

/**
 * Email final após aprovação do Admin/RH (para J2S)
 */
function sendFinalApproval($apontamento, $assinatura, $emailDestino)
{
    $subject = "✓ APROBACIÓN FINAL - {$apontamento['funcionario_nome']} - Semana {$apontamento['semana_inicio']}";

    // Montar URL completa da foto se existir
    $fotoUrl = isset($apontamento['funcionario_foto']) && !empty($apontamento['funcionario_foto'])
        ? 'https://j2s.ad/login/backend/' . $apontamento['funcionario_foto']
        : '';

    $fotoHtml = '';
    if ($fotoUrl) {
        $fotoHtml = "<div style='text-align:center;margin-bottom:15px;'>
            <img src='{$fotoUrl}' alt='Foto del empleado' style='width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid #16a34a;' />
        </div>";
    }

    $horasJson = json_decode($apontamento['horas_diarias'], true);
    $dias = ['mon' => 'Lunes', 'tue' => 'Martes', 'wed' => 'Miércoles', 'thu' => 'Jueves', 'fri' => 'Viernes', 'sat' => 'Sábado'];

    // Verificar formato e calcular totais
    $isNewFormat = false;
    if ($horasJson && is_array($horasJson)) {
        $firstValue = reset($horasJson);
        $isNewFormat = is_array($firstValue);
    }

    $totalNormal = 0;
    $totalExtra = 0;
    $totalNoturna = 0;
    $horasHtml = '';

    if ($isNewFormat) {
        $horasHtml = "<tr style='background:#f8f9fa;'>
            <th style='padding:8px;text-align:left;'>Día</th>
            <th style='padding:8px;text-align:center;background:#dcfce7;color:#166534;'>Normal</th>
            <th style='padding:8px;text-align:center;background:#fef3c7;color:#92400e;'>Extra</th>
            <th style='padding:8px;text-align:center;background:#e0e7ff;color:#3730a3;'>Noct.</th>
        </tr>";

        foreach ($dias as $key => $nome) {
            $dayData = isset($horasJson[$key]) ? $horasJson[$key] : array('normal' => 0, 'extra' => 0, 'noturna' => 0);
            $normal = isset($dayData['normal']) ? floatval($dayData['normal']) : 0;
            $extra = isset($dayData['extra']) ? floatval($dayData['extra']) : 0;
            $noturna = isset($dayData['noturna']) ? floatval($dayData['noturna']) : 0;

            $totalNormal += $normal;
            $totalExtra += $extra;
            $totalNoturna += $noturna;

            $horasHtml .= "<tr style='border-bottom:1px solid #e5e7eb;'>
                <td style='padding:6px 8px;'>{$nome}</td>
                <td style='padding:6px 8px;text-align:center;'>{$normal}h</td>
                <td style='padding:6px 8px;text-align:center;'>{$extra}h</td>
                <td style='padding:6px 8px;text-align:center;'>{$noturna}h</td>
            </tr>";
        }

        $totalGeral = $totalNormal + $totalExtra + $totalNoturna;
        $horasHtml .= "<tr style='background:#f8f9fa;font-weight:600;'>
            <td style='padding:8px;'>TOTAL</td>
            <td style='padding:8px;text-align:center;color:#166534;'>{$totalNormal}h</td>
            <td style='padding:8px;text-align:center;color:#92400e;'>{$totalExtra}h</td>
            <td style='padding:8px;text-align:center;color:#3730a3;'>{$totalNoturna}h</td>
        </tr>";
    } else {
        foreach ($dias as $key => $nome) {
            $h = isset($horasJson[$key]) ? floatval($horasJson[$key]) : 0;
            $totalNormal += $h;
            $horasHtml .= "<tr><td style='padding:8px;border-bottom:1px solid #e5e7eb;'>{$nome}</td><td style='padding:8px;text-align:right;font-weight:600;'>{$h}h</td></tr>";
        }
        $totalGeral = $totalNormal;
    }

    $encarregadoNome = isset($apontamento['encarregado_nome']) ? $apontamento['encarregado_nome'] : $apontamento['aprovado_por_nome'];

    $html = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1f2937; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .employee-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 15px 0; text-align: center; }
            .info-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
            .label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 600; color: #1f2937; }
            table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #e5e7eb; border-radius: 8px; }
            .signature { margin-top: 20px; text-align: center; }
            .signature img { max-width: 200px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; }
            .badge { display: inline-block; background: #16a34a; color: white; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
            .total-box { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
            .approvals-box { display: flex; gap: 15px; margin-top: 20px; }
            .approval-item { flex: 1; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1 style='margin:0;'>✓ APROBACIÓN FINAL</h1>
                <p style='margin:10px 0 0 0;opacity:0.9;'>Registro completamente aprobado</p>
            </div>
            <div class='content'>
                <p><span class='badge'>APROBADO</span></p>
                
                <div class='employee-card'>
                    {$fotoHtml}
                    <div class='label'>Empleado</div>
                    <div class='value' style='font-size:20px;'>{$apontamento['funcionario_nome']}</div>
                </div>
                
                <div class='info-box'>
                    <div class='label'>Obra</div>
                    <div class='value'>{$apontamento['obra_numero']} - {$apontamento['obra_nome']}</div>
                </div>
                
                <div class='info-box'>
                    <div class='label'>Semana</div>
                    <div class='value'>{$apontamento['semana_inicio']}</div>
                </div>
                
                <h3 style='margin-top:25px;'>Detalle de Horas</h3>
                <table>
                    {$horasHtml}
                </table>
                
                <div class='total-box'>
                    <span style='font-weight:600;'>TOTAL GENERAL</span>
                    <span style='font-size:24px;font-weight:700;'>{$totalGeral}h</span>
                </div>
                
                <h3 style='margin-top:25px;'>Aprobaciones</h3>
                <div class='approvals-box'>
                    <div class='approval-item'>
                        <div class='label'>Encargado</div>
                        <div class='value'>{$encarregadoNome}</div>
                        <div class='signature'>
                            <img src='{$apontamento['assinatura_base64']}' alt='Firma encargado' style='max-width:150px;' />
                        </div>
                    </div>
                    <div class='approval-item'>
                        <div class='label'>Admin/RH</div>
                        <div class='value'>{$apontamento['aprovado_admin_por_nome']}</div>
                        <div class='signature'>
                            <img src='{$assinatura}' alt='Firma admin' style='max-width:150px;' />
                        </div>
                    </div>
                </div>
            </div>
            <div class='footer'>
                <p>Este es un informe automático del Sistema de Control Horario J2S.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    return sendEmail($emailDestino, $subject, $html);
}
