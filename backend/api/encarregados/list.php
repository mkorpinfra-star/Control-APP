<?php
/**
 * LISTAR ENCARREGADOS
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);

try {
    $pdo = getConnection();

    $stmt = $pdo->query("
        SELECT
            e.id,
            e.nome,
            e.email,
            e.telefone,
            e.passaporte,
            e.ativo,
            e.criado_em,
            COUNT(DISTINCT o.id) as total_obras
        FROM encarregados e
        LEFT JOIN obras o ON o.encarregado_id = e.id AND o.ativa = 1
        GROUP BY e.id, e.nome, e.email, e.telefone, e.passaporte, e.ativo, e.criado_em
        ORDER BY e.nome
    ");

    $encarregados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'encarregados' => $encarregados
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar encarregados: ' . $e->getMessage()
    ]);
}
