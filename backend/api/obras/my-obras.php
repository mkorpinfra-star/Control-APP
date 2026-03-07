<?php
header('Content-Type: application/json; charset=utf-8');

require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware();

try {

    $pdo = getConnection();
    $funcionarioId = $user['id'];

    // Admin vê todas as obras
    if ($user['tipo'] === 'admin') {
        $stmt = $pdo->prepare("
            SELECT
                o.*,
                c.nome as cliente_nome,
                enc.nome as encarregado_nome
            FROM obras o
            LEFT JOIN clientes c ON c.id = o.cliente_id
            LEFT JOIN encarregados enc ON enc.id = o.encarregado_id
            WHERE o.ativa = 1
            ORDER BY o.numero
        ");
        $stmt->execute();
    } else {
        // Funcionário vê apenas obras vinculadas
        $stmt = $pdo->prepare("
            SELECT DISTINCT
                o.*,
                c.nome as cliente_nome,
                enc.nome as encarregado_nome
            FROM obras o
            INNER JOIN funcionario_obra fo ON fo.obra_id = o.id
            LEFT JOIN clientes c ON c.id = o.cliente_id
            LEFT JOIN encarregados enc ON enc.id = o.encarregado_id
            WHERE fo.funcionario_id = ?
            AND o.ativa = 1
            ORDER BY o.numero
        ");
        $stmt->execute([$funcionarioId]);
    }

    $obras = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'obras' => $obras,
        'user_tipo' => $user['tipo']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar obras: ' . $e->getMessage()
    ]);
}
