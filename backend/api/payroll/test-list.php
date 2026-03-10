<?php
/**
 * TESTE DE DIAGNÓSTICO - Payroll List
 * Ver erro detalhado
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

try {
    $user = authMiddleware(['admin']);
    $tenantId = $user['tenant_id'];

    $mesReferencia = $_GET['mes'] ?? date('Y-m');
    $obraId = isset($_GET['obra_id']) && $_GET['obra_id'] !== 'all' ? (int)$_GET['obra_id'] : null;

    $pdo = getConnection();

    $whereObra = $obraId ? " AND fp.obra_id = :obra_id" : "";
    $params = ['mes_referencia' => $mesReferencia, 'tenant_id' => $tenantId];
    if ($obraId) $params['obra_id'] = $obraId;

    // Testar query simples primeiro
    $testStmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM folha_pagamento fp
        WHERE fp.mes_referencia = :mes_referencia
        AND fp.tenant_id = :tenant_id
        $whereObra
    ");
    $testStmt->execute($params);
    $count = $testStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'debug' => 'Query simples OK',
        'mes' => $mesReferencia,
        'obra_id' => $obraId,
        'total_registros' => $count['total']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
