<?php
/**
 * EXPORTAR FATURAMENTO PARA EXCEL
 * GET /api/billing/export-excel.php?mes=YYYY-MM&obra_id=X
 */

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/tenant_middleware.php';

$auth = validateTenantAccess(['admin']);
$tenant_id = $auth['tenant_id'];

try {
    $mes = $_GET['mes'] ?? date('Y-m');
    $obraId = $_GET['obra_id'] ?? 'all';

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
        INNER JOIN obras o ON o.id = f.obra_id AND o.tenant_id = :tenant_id
        LEFT JOIN clientes c ON c.id = o.cliente_id AND c.tenant_id = :tenant_id
        WHERE f.tenant_id = :tenant_id
        AND f.mes_referencia = :mes
        $whereObra
        ORDER BY o.numero
    ";

    $stmt = $pdo->prepare($sql);
    $params = ['tenant_id' => $tenant_id, 'mes' => $mes];
    if ($obraId !== 'all') $params['obra_id'] = $obraId;
    $stmt->execute($params);
    $faturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($faturas)) {
        // Manter header JSON para erro
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode(['error' => 'No hay datos para exportar']);
        exit;
    }

    // Gerar CSV (mais simples que Excel real)
    $filename = "faturamento-{$mes}.csv";

    // Limpar headers anteriores e definir novos
    header_remove();
    header("Content-Disposition: attachment; filename=\"{$filename}\"");
    header('Content-Type: text/csv; charset=utf-8');
    header('Access-Control-Allow-Origin: *');

    $output = fopen('php://output', 'w');

    // BOM para UTF-8
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    // Cabeçalho
    fputcsv($output, [
        'Obra',
        'Cliente',
        'Horas Normales',
        'Horas Extra',
        'Horas Nocturnas',
        'Total Horas',
        'Subtotal €',
        'IGI (4.5%)',
        'Total con IGI'
    ], ';');

    // Dados
    $totalHoras = 0;
    $totalBruto = 0;
    $totalIGI = 0;
    $totalLiquido = 0;

    foreach ($faturas as $f) {
        $horas = floatval($f['total_horas'] ?? 0);
        $bruto = floatval($f['total_bruto'] ?? 0);
        $igi = floatval($f['igi_valor'] ?? 0);
        $liquido = floatval($f['total_liquido'] ?? 0);

        $totalHoras += $horas;
        $totalBruto += $bruto;
        $totalIGI += $igi;
        $totalLiquido += $liquido;

        fputcsv($output, [
            $f['obra_numero'] . ' - ' . $f['obra_nome'],
            $f['cliente_nome'] ?? 'N/A',
            '-',
            '-',
            '-',
            number_format($horas, 1, ',', ''),
            number_format($bruto, 2, ',', '.'),
            number_format($igi, 2, ',', '.'),
            number_format($liquido, 2, ',', '.')
        ], ';');
    }

    // Linha de totais
    fputcsv($output, [
        'TOTAL',
        '',
        '',
        '',
        '',
        number_format($totalHoras, 1, ',', ''),
        number_format($totalBruto, 2, ',', '.'),
        number_format($totalIGI, 2, ',', '.'),
        number_format($totalLiquido, 2, ',', '.')
    ], ';');

    fclose($output);
    exit;

} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao exportar: ' . $e->getMessage()]);
    error_log('Erro export-excel.php: ' . $e->getMessage());
}
