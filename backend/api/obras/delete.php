<?php
/**
 * API: Deletar (desativar) Obra
 * DELETE /api/obras/delete.php
 * MULTI-TENANT: Filtra por empresa_id
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

// Support both empresa_id and tenant_id
$empresaId = $payload['empresa_id'] ?? $payload['tenant_id'] ?? null;
if (!$empresaId) {
    http_response_code(400);
    echo json_encode(['error' => 'empresa_id/tenant_id ausente no token']);
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

    // Verificar se a obra pertence à empresa do usuário
    $checkStmt = $pdo->prepare("SELECT id FROM obras WHERE id = ? AND tenant_id = ?");
    $checkStmt->execute([$data['id'], $empresaId]);
    $obraExists = $checkStmt->fetch();

    if (!$obraExists) {
        http_response_code(404);
        echo json_encode([
            'error' => 'Obra não encontrada',
            'debug' => [
                'obra_id' => $data['id'],
                'tenant_id' => $empresaId,
                'force' => $data['force'] ?? false
            ]
        ]);
        exit;
    }

    // VERIFICAR SE TEM APONTAMENTOS - PRESERVAR HISTÓRICO
    $checkStmt = $pdo->prepare("
        SELECT COUNT(*) as total
        FROM apontamentos a
        INNER JOIN obras o ON o.id = a.obra_id
        WHERE a.obra_id = ? AND o.tenant_id = ?
    ");
    $checkStmt->execute([$data['id'], $empresaId]);
    $apontamentosCount = $checkStmt->fetch(PDO::FETCH_ASSOC)['total'];

    if ($apontamentosCount > 0 && empty($data['force'])) {
        // Return 200 so frontend can handle the confirmation flow
        http_response_code(200);
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

    // Tabelas que podem ter obra_id - deletar apenas da mesma empresa
    $tables = ['apontamentos', 'folha_pagamento', 'faturamento', 'funcionario_obra', 'despesas_indiretas'];
    $existingTables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tables as $tbl) {
        if (in_array($tbl, $existingTables)) {
            // Garantir que deleta apenas registros da mesma empresa
            $pdo->prepare("
                DELETE t FROM `{$tbl}` t
                INNER JOIN obras o ON o.id = t.obra_id
                WHERE t.obra_id = ? AND o.tenant_id = ?
            ")->execute([$id, $empresaId]);
        }
    }

    $pdo->prepare("DELETE FROM obras WHERE id = ? AND tenant_id = ?")->execute([$id, $empresaId]);
    $pdo->commit();

    http_response_code(200);
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
