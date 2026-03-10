<?php
/**
 * LISTAR FATURAMENTO
 * Exibe faturas com valores e IGI calculados
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../includes/tenant_middleware.php';
require_once '../../config/database.php';

$auth = validateTenantAccess(['admin']);
$tenant_id = $auth['tenant_id'];

try {
    $mesReferencia = $_GET['mes'] ?? date('Y-m');
    $obraId = isset($_GET['obra_id']) && $_GET['obra_id'] !== 'all' ? (int)$_GET['obra_id'] : null;

    $pdo = getConnection();

    $whereObra = $obraId ? " AND f.obra_id = :obra_id" : "";
    $params = ['tenant_id' => $tenant_id, 'mes_referencia' => $mesReferencia];
    if ($obraId) $params['obra_id'] = $obraId;

    $stmt = $pdo->prepare("
        SELECT
            f.*,
            o.nome as obra_nome,
            o.numero as obra_numero,
            c.nome as cliente_nome,

            -- Valores calculados (GENERATED columns)
            f.igi_valor,
            f.valor_total_fatura

        FROM faturamento f
        INNER JOIN obras o ON o.id = f.obra_id AND o.tenant_id = :tenant_id
        LEFT JOIN clientes c ON c.id = o.cliente_id AND c.tenant_id = :tenant_id
        WHERE f.tenant_id = :tenant_id
        AND f.mes_referencia = :mes_referencia
        $whereObra
        ORDER BY o.nome
    ");
    $stmt->execute($params);
    $faturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Buscar totalizadores
    $totaisStmt = $pdo->prepare("
        SELECT
            COUNT(*) as total_obras,
            COALESCE(SUM(valor_total_servicos), 0) as total_servicos,
            COALESCE(SUM(igi_valor), 0) as total_igi,
            COALESCE(SUM(valor_total_fatura), 0) as total_faturamento
        FROM faturamento
        WHERE tenant_id = :tenant_id
        AND mes_referencia = :mes_referencia
        $whereObra
    ");
    $totaisStmt->execute($params);
    $totais = $totaisStmt->fetch(PDO::FETCH_ASSOC);

    // Garantir que totais nunca sejam NULL
    if (!$totais || $totais['total_obras'] == 0) {
        $totais = [
            'total_obras' => 0,
            'total_servicos' => 0,
            'total_igi' => 0,
            'total_faturamento' => 0
        ];
    }

    echo json_encode([
        'success' => true,
        'mes_referencia' => $mesReferencia,
        'faturas' => $faturas,
        'totais' => $totais
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar faturamento: ' . $e->getMessage()
    ]);
}
