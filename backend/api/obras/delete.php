<?php
/**
 * API: Deletar (desativar) Obra
 * DELETE /api/obras/delete.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);

if (!$payload || $payload['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $pdo = getConnection();

    // VERIFICAR SE TEM APONTAMENTOS - PRESERVAR HISTÓRICO
    $checkStmt = $pdo->prepare("SELECT COUNT(*) as total FROM apontamentos WHERE obra_id = ?");
    $checkStmt->execute([$data['id']]);
    $apontamentosCount = $checkStmt->fetch(PDO::FETCH_ASSOC)['total'];

    if ($apontamentosCount > 0 && empty($data['force'])) {
        // Return 200 so frontend can handle the confirmation flow
        echo json_encode([
            'success' => false,
            'error' => 'has_records',
            'count' => $apontamentosCount,
            'message' => "Esta obra tiene {$apontamentosCount} registros de horas en el sistema."
        ]);
        exit;
    }

    // Hard delete em cascata — apaga todos os rastros
    $id = (int)$data['id'];
    $pdo->beginTransaction();

    // Tabelas que podem ter obra_id
    $tables = ['apontamentos', 'folha_pagamento', 'faturamento', 'funcionario_obra', 'despesas_indiretas'];
    $existingTables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $tbl) {
        if (in_array($tbl, $existingTables)) {
            $pdo->prepare("DELETE FROM `{$tbl}` WHERE obra_id = ?")->execute([$id]);
        }
    }

    $pdo->prepare("DELETE FROM obras WHERE id = ?")->execute([$id]);
    $pdo->commit();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
