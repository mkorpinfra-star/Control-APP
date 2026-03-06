<?php
/**
 * LISTAR FATURAMENTO
 * Exibe faturas com valores e IGI calculados
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);

try {
    $mesReferencia = $_GET['mes'] ?? date('Y-m');
    $obraId = isset($_GET['obra_id']) && $_GET['obra_id'] !== 'all' ? (int)$_GET['obra_id'] : null;

    $pdo = getConnection();

    $whereObra = $obraId ? " AND f.obra_id = :obra_id" : "";
    $params = ['mes_referencia' => $mesReferencia];
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
        INNER JOIN obras o ON o.id = f.obra_id
        LEFT JOIN clientes c ON c.id = o.cliente_id
        WHERE f.mes_referencia = :mes_referencia
        $whereObra
        ORDER BY o.nome
    ");
    $stmt->execute($params);
    $faturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Buscar totalizadores
    $totaisStmt = $pdo->prepare("
        SELECT
            COUNT(*) as total_obras,
            SUM(valor_total_servicos) as total_servicos,
            SUM(igi_valor) as total_igi,
            SUM(valor_total_fatura) as total_faturamento
        FROM faturamento
        WHERE mes_referencia = :mes_referencia
        $whereObra
    ");
    $totaisStmt->execute($params);
    $totais = $totaisStmt->fetch(PDO::FETCH_ASSOC);

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
