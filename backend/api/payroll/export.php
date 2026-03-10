<?php
/**
 * EXPORTAR FOLHA DE PAGAMENTO
 * GET  /api/payroll/export.php?mes=YYYY-MM&obra_id=X&formato=csv|pdf|email
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);
$tenantId = $user['tenant_id'];

$mesReferencia = $_GET['mes']      ?? date('Y-m');
$obraId        = isset($_GET['obra_id']) && $_GET['obra_id'] !== 'all' ? (int)$_GET['obra_id'] : null;
$formato       = $_GET['formato']  ?? 'csv';
$emailDestino  = $_GET['email']    ?? '';

try {
    $pdo = getConnection();

    $whereObra = $obraId ? " AND fp.obra_id = :obra_id" : "";
    $params = ['mes_referencia' => $mesReferencia, 'tenant_id' => $tenantId];
    if ($obraId) $params['obra_id'] = $obraId;

    $stmt = $pdo->prepare("
        SELECT
            fp.*,
            u.nome as funcionario_nome,
            u.passaporte as funcionario_passaporte,
            u.funcao as funcionario_funcao,
            o.nome as obra_nome,
            o.numero as obra_numero,
            COALESCE(fp.total_bruto, fp.subtotal_horas) as subtotal_horas_val,
            COALESCE(fp.cas_funcionario_valor, fp.cas_desconto_funcionario_valor) as cas_desc_val,
            COALESCE(fp.total_liquido, fp.liquido_a_pagar) as liquido_val,
            COALESCE(fp.custo_total_empresa, 0) as custo_empresa_val
        FROM folha_pagamento fp
        INNER JOIN usuarios u ON u.id = fp.funcionario_id
        INNER JOIN obras o ON o.id = fp.obra_id
        WHERE fp.mes_referencia = :mes_referencia
        AND fp.tenant_id = :tenant_id
        AND u.tenant_id = :tenant_id
        AND o.tenant_id = :tenant_id
        $whereObra
        ORDER BY o.nome, u.nome
    ");
    $stmt->execute($params);
    $folhas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Totais
    $totLiquido = 0; $totCusto = 0;
    foreach ($folhas as $f) {
        $totLiquido += floatval($f['liquido_val']);
        $totCusto   += floatval($f['custo_empresa_val']);
    }

    $fmt = function($v) { return number_format(floatval($v), 2, '.', ''); };
    $fmtEur = function($v) { return number_format(floatval($v), 2, ',', '.') . ' €'; };

    // ── CSV ─────────────────────────────────────────────────────────────────
    if ($formato === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="folha_' . $mesReferencia . '.csv"');
        // UTF-8 BOM
        echo "\xEF\xBB\xBF";

        $out = fopen('php://output', 'w');
        fputcsv($out, [
            'Funcionário','Passaporte','Função','Obra','Número Obra',
            'Horas Normais','Horas Extra','Horas Noturnas',
            'Salário Base','Salário/Hora','Vale Moradia','IBF',
            'Subtotal Horas','CAS Desc (-)','Total Provimentos','Total Descontos',
            'Líquido a Pagar','Custo Empresa'
        ], ';');

        foreach ($folhas as $f) {
            fputcsv($out, [
                $f['funcionario_nome'],
                $f['funcionario_passaporte'],
                $f['funcionario_funcao'] ?? '',
                $f['obra_nome'],
                $f['obra_numero'],
                $fmt($f['horas_normais']),
                $fmt($f['horas_extra']),
                $fmt($f['horas_noturna']),
                $fmt($f['salario_base']),
                $fmt($f['salario_hora']),
                $fmt($f['vale_moradia']),
                $fmt($f['ibf']),
                $fmt($f['subtotal_horas_val']),
                $fmt($f['cas_desc_val']),
                $fmt($f['total_provimentos']),
                $fmt($f['total_descontos']),
                $fmt($f['liquido_val']),
                $fmt($f['custo_empresa_val'])
            ], ';');
        }

        // Linha de totais
        fputcsv($out, [
            'TOTAL','','','','','','','','','','','','','','','',
            $fmt($totLiquido),
            $fmt($totCusto)
        ], ';');
        fclose($out);
        exit;
    }

    // ── PDF (HTML → resposta JSON com HTML para imprimir) ───────────────────
    if ($formato === 'pdf') {
        $html = gerarHtmlFolha($folhas, $mesReferencia, $totLiquido, $totCusto, $fmtEur);
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'html' => $html]);
        exit;
    }

    // ── EMAIL ────────────────────────────────────────────────────────────────
    if ($formato === 'email') {
        require_once '../../includes/email.php';

        if (empty($emailDestino)) {
            // Tentar buscar email do admin logado
            $stmtU = $pdo->prepare("SELECT email FROM usuarios WHERE id = ? AND tenant_id = ?");
            $stmtU->execute([$user['id'], $tenantId]);
            $emailDestino = $stmtU->fetchColumn() ?: '';
        }

        if (empty($emailDestino)) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Email de destino não configurado']);
            exit;
        }

        $html = gerarHtmlFolha($folhas, $mesReferencia, $totLiquido, $totCusto, $fmtEur);
        $assunto = "Folha de Pagamento – {$mesReferencia}";
        $enviado = sendEmail($emailDestino, $assunto, $html);

        header('Content-Type: application/json');
        echo json_encode([
            'success'       => $enviado,
            'email_enviado' => $enviado,
            'email_destino' => $emailDestino,
            'message'       => $enviado ? 'Email enviado com sucesso' : 'Falha ao enviar email'
        ]);
        exit;
    }

    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Formato inválido. Use: csv, pdf, email']);

} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// ── Gerador de HTML da folha ─────────────────────────────────────────────────
function gerarHtmlFolha($folhas, $mesReferencia, $totLiquido, $totCusto, $fmtEur) {
    $mesLabel = date('F Y', strtotime($mesReferencia . '-01'));
    $totalFunc = count($folhas);

    $linhas = '';
    foreach ($folhas as $f) {
        $bg = (count((array)$folhas) % 2 === 0) ? '#f9fafb' : '#ffffff';
        $linhas .= "
        <tr style='border-bottom:1px solid #e5e7eb;'>
            <td style='padding:8px 10px;'>
                <strong>{$f['funcionario_nome']}</strong><br>
                <span style='font-size:11px;color:#6b7280;'>{$f['funcionario_passaporte']}</span>
            </td>
            <td style='padding:8px 10px;font-size:12px;'>{$f['obra_numero']}<br><span style='color:#6b7280;font-size:11px;'>{$f['obra_nome']}</span></td>
            <td style='padding:8px 10px;text-align:center;'>{$f['horas_normais']}h</td>
            <td style='padding:8px 10px;text-align:center;'>{$f['horas_extra']}h</td>
            <td style='padding:8px 10px;text-align:center;'>{$f['horas_noturna']}h</td>
            <td style='padding:8px 10px;text-align:right;color:#7c3aed;'>{$fmtEur($f['salario_base'])}</td>
            <td style='padding:8px 10px;text-align:right;color:#7c3aed;'>{$fmtEur($f['salario_hora'])}</td>
            <td style='padding:8px 10px;text-align:right;color:#7c3aed;'>{$fmtEur($f['vale_moradia'])}</td>
            <td style='padding:8px 10px;text-align:right;color:#7c3aed;'>{$fmtEur($f['ibf'])}</td>
            <td style='padding:8px 10px;text-align:right;'>{$fmtEur($f['subtotal_horas_val'])}</td>
            <td style='padding:8px 10px;text-align:right;color:#dc2626;'>-{$fmtEur($f['cas_desc_val'])}</td>
            <td style='padding:8px 10px;text-align:right;color:#15803d;font-weight:700;'>{$fmtEur($f['liquido_val'])}</td>
            <td style='padding:8px 10px;text-align:right;color:#ea580c;font-weight:700;'>{$fmtEur($f['custo_empresa_val'])}</td>
        </tr>";
    }

    return "<!DOCTYPE html>
<html lang='pt'>
<head><meta charset='UTF-8'><title>Folha de Pagamento {$mesReferencia}</title></head>
<body style='font-family:Arial,sans-serif;margin:0;padding:20px;color:#111;'>

<div style='background:linear-gradient(135deg,#CE0201,#8a0000);color:#fff;padding:20px 24px;border-radius:8px;margin-bottom:24px;'>
    <h1 style='margin:0;font-size:22px;'>Folha de Pagamento</h1>
    <p style='margin:4px 0 0;opacity:.85;font-size:14px;'>{$mesLabel} &nbsp;·&nbsp; {$totalFunc} funcionário(s)</p>
</div>

<div style='background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;display:flex;gap:32px;'>
    <div>
        <div style='font-size:12px;color:#6b7280;'>Total Líquido a Pagar</div>
        <div style='font-size:22px;font-weight:700;color:#15803d;'>{$fmtEur($totLiquido)}</div>
    </div>
    <div>
        <div style='font-size:12px;color:#6b7280;'>Custo Total Empresa</div>
        <div style='font-size:22px;font-weight:700;color:#ea580c;'>{$fmtEur($totCusto)}</div>
    </div>
</div>

<div style='overflow-x:auto;'>
<table style='width:100%;border-collapse:collapse;font-size:12px;'>
<thead>
    <tr style='background:#f3f4f6;border-bottom:2px solid #d1d5db;'>
        <th style='padding:8px 10px;text-align:left;'>Funcionário</th>
        <th style='padding:8px 10px;text-align:left;'>Obra</th>
        <th style='padding:8px 10px;text-align:center;'>H. Norm</th>
        <th style='padding:8px 10px;text-align:center;'>H. Extra</th>
        <th style='padding:8px 10px;text-align:center;'>H. Noct</th>
        <th style='padding:8px 10px;text-align:right;background:#f5f3ff;'>Sal. Base</th>
        <th style='padding:8px 10px;text-align:right;background:#f5f3ff;'>Sal./Hora</th>
        <th style='padding:8px 10px;text-align:right;background:#f5f3ff;'>V. Moradia</th>
        <th style='padding:8px 10px;text-align:right;background:#f5f3ff;'>IBF</th>
        <th style='padding:8px 10px;text-align:right;'>Subtotal</th>
        <th style='padding:8px 10px;text-align:right;'>CAS Desc</th>
        <th style='padding:8px 10px;text-align:right;background:#f0fdf4;'>Líquido</th>
        <th style='padding:8px 10px;text-align:right;background:#fff7ed;'>Custo Emp.</th>
    </tr>
</thead>
<tbody>
    {$linhas}
    <tr style='background:#f3f4f6;border-top:2px solid #d1d5db;font-weight:700;'>
        <td colspan='11' style='padding:10px;text-align:right;'>TOTAIS:</td>
        <td style='padding:10px;text-align:right;color:#15803d;font-size:14px;'>{$fmtEur($totLiquido)}</td>
        <td style='padding:10px;text-align:right;color:#ea580c;font-size:14px;'>{$fmtEur($totCusto)}</td>
    </tr>
</tbody>
</table>
</div>

<p style='margin-top:24px;font-size:11px;color:#9ca3af;'>
    Gerado em " . date('d/m/Y H:i') . " &nbsp;·&nbsp; J2S Enginyeria
</p>
</body>
</html>";
}
