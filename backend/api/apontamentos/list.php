<?php
/**
 * LISTAR APONTAMENTOS
 * Retorna todos os apontamentos (opcionalmente filtrados)
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware();

try {
    $pdo = getConnection();

    // Filtros opcionais
    $status = $_GET['status'] ?? null;
    $obraId = $_GET['obra_id'] ?? null;
    $funcionarioId = $_GET['funcionario_id'] ?? null;

    // Construir query
    $sql = "
        SELECT
            a.*,
            u.nome as funcionario_nome,
            o.numero as obra_numero,
            o.nome as obra_nome
        FROM apontamentos a
        LEFT JOIN usuarios u ON u.id = a.funcionario_id
        LEFT JOIN obras o ON o.id = a.obra_id
        WHERE 1=1
    ";

    $params = [];

    if ($status) {
        $sql .= " AND a.status = :status";
        $params['status'] = $status;
    }

    if ($obraId) {
        $sql .= " AND a.obra_id = :obra_id";
        $params['obra_id'] = $obraId;
    }

    if ($funcionarioId) {
        $sql .= " AND a.funcionario_id = :funcionario_id";
        $params['funcionario_id'] = $funcionarioId;
    }

    $sql .= " ORDER BY a.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'apontamentos' => $apontamentos
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar apontamentos: ' . $e->getMessage()
    ]);
}
