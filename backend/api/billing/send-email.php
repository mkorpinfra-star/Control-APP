<?php
/**
 * ENVIAR FATURAMENTO POR EMAIL
 * POST /api/billing/send-email.php
 * Body: { mes: "YYYY-MM", obra_id: "X" }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';
require_once __DIR__ . '/../../includes/email.php';

// Verificar autenticação
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);

if (!$user || $user['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Permissão negada']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    $mes = $input['mes'] ?? date('Y-m');
    $obraId = $input['obra_id'] ?? 'all';

    $pdo = getConnection();

    // Buscar faturas
    $whereObra = $obraId !== 'all' ? " AND f.obra_id = :obra_id" : "";
    $sql = "
        SELECT
            f.*,
            o.numero as obra_numero,
            o.nome as obra_nome,
            c.nome as cliente_nome
        FROM faturamento f
        INNER JOIN obras o ON o.id = f.obra_id
        LEFT JOIN clientes c ON c.id = o.cliente_id
        WHERE f.mes_referencia = :mes
        $whereObra
        ORDER BY o.numero
    ";

    $stmt = $pdo->prepare($sql);
    $params = ['mes' => $mes];
    if ($obraId !== 'all') $params['obra_id'] = $obraId;
    $stmt->execute($params);
    $faturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($faturas)) {
        echo json_encode(['success' => false, 'message' => 'No hay datos para enviar']);
        exit;
    }

    // Calcular totais
    $totais = [
        'total_horas' => 0,
        'total_bruto' => 0,
        'igi_valor' => 0,
        'total_liquido' => 0
    ];

    foreach ($faturas as $f) {
        $totais['total_horas'] += floatval($f['total_horas'] ?? 0);
        $totais['total_bruto'] += floatval($f['total_bruto'] ?? 0);
        $totais['igi_valor'] += floatval($f['igi_valor'] ?? 0);
        $totais['total_liquido'] += floatval($f['total_liquido'] ?? 0);
    }

    // Construir tabela HTML
    $faturasHtml = "";
    foreach ($faturas as $f) {
        $faturasHtml .= "<tr style='border-bottom:1px solid #e5e7eb;'>
            <td style='padding:10px 8px;'>
                <div style='font-weight:500;'>{$f['obra_numero']}</div>
                <div style='font-size:11px;color:#6b7280;'>{$f['obra_nome']}</div>
            </td>
            <td style='padding:10px 8px;text-align:right;'>" . number_format($f['total_horas'] ?? 0, 1) . "h</td>
            <td style='padding:10px 8px;text-align:right;font-weight:600;'>€" . number_format($f['total_bruto'] ?? 0, 2) . "</td>
            <td style='padding:10px 8px;text-align:right;color:#dc2626;'>€" . number_format($f['igi_valor'] ?? 0, 2) . "</td>
            <td style='padding:10px 8px;text-align:right;font-weight:700;color:#16a34a;'>€" . number_format($f['total_liquido'] ?? 0, 2) . "</td>
        </tr>";
    }

    $html = "<!DOCTYPE html><html><head><meta charset='UTF-8'><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#1f2937}.container{max-width:700px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%);color:white;padding:25px;text-align:center;border-radius:12px 12px 0 0}.content{background:#f9fafb;padding:30px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px}table{width:100%;border-collapse:collapse;background:white;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden}th{padding:12px 8px;text-align:left;font-weight:600;background:#f8f9fa;border-bottom:2px solid #e5e7eb}.footer{text-align:center;padding:20px;font-size:12px;color:#6b7280}</style></head><body><div class='container'><div class='header'><h1 style='margin:0;font-size:24px'>💰 RESUMEN FATURAMENTO</h1><p style='margin:8px 0 0;opacity:0.95;font-size:16px'>{$mes}</p></div><div class='content'><div style='background:#dcfce7;border:2px solid #16a34a;border-radius:8px;padding:16px;margin-bottom:20px;text-align:center'><div style='font-size:14px;color:#166534;margin-bottom:4px'>TOTAL A FATURAR (con IGI)</div><div style='font-size:36px;font-weight:700;color:#16a34a'>€" . number_format($totais['total_liquido'], 2) . "</div></div><h3 style='margin-top:25px;margin-bottom:15px'>📊 Detalle por Obra</h3><table><thead><tr><th>Obra</th><th style='text-align:right'>Horas</th><th style='text-align:right'>Subtotal</th><th style='text-align:right'>IGI (4.5%)</th><th style='text-align:right'>Total</th></tr></thead><tbody>{$faturasHtml}</tbody><tfoot><tr style='background:#16a34a;color:white'><td style='padding:12px 8px;font-weight:700'>TOTAL</td><td style='padding:12px 8px;text-align:right;font-weight:600'>" . number_format($totais['total_horas'], 1) . "h</td><td style='padding:12px 8px;text-align:right;font-weight:600'>€" . number_format($totais['total_bruto'], 2) . "</td><td style='padding:12px 8px;text-align:right;font-weight:600'>€" . number_format($totais['igi_valor'], 2) . "</td><td style='padding:12px 8px;text-align:right;font-weight:700;font-size:18px'>€" . number_format($totais['total_liquido'], 2) . "</td></tr></tfoot></table></div><div class='footer'><p>Enviado por {$user['nome']} desde el Sistema de Faturamento</p><p style='color:#dc2626;font-weight:600'>J2S Enginyeria & Instal·lacions</p></div></div></body></html>";

    // Enviar email
    $emailTo = 'contactes@j2s.ad';
    $subject = "📊 Resumen Faturamento - {$mes}";

    $enviado = sendEmail($emailTo, $subject, $html);

    if ($enviado) {
        echo json_encode([
            'success' => true,
            'message' => 'Email enviado correctamente a contactes@j2s.ad'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al enviar email'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
    error_log('Erro send-email.php: ' . $e->getMessage());
}
