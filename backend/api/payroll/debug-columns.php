<?php
/**
 * DIAGNÓSTICO - Verificar estrutura da tabela folha_pagamento
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
require_once '../../config/database.php';

try {
    $pdo = getConnection();

    // Listar todas as colunas da tabela
    $stmt = $pdo->query("SHOW COLUMNS FROM folha_pagamento");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Verificar se existe algum registro
    $countStmt = $pdo->query("SELECT COUNT(*) as total FROM folha_pagamento");
    $count = $countStmt->fetch(PDO::FETCH_ASSOC);

    // Tentar SELECT simples
    $testStmt = $pdo->query("SELECT * FROM folha_pagamento LIMIT 1");
    $sample = $testStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total_registros' => $count['total'],
        'colunas' => $columns,
        'sample_data' => $sample
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
