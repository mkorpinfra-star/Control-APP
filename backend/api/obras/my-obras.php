<?php
/**
 * API: Minhas Obras
 * GET /api/obras/my-obras.php
 * MULTI-TENANT: Filtra por empresa_id
 */

header('Content-Type: application/json; charset=utf-8');

require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware();

$empresaId = $user['empresa_id'] ?? null;
if (!$empresaId) {
    http_response_code(400);
    echo json_encode(['error' => 'empresa_id ausente no token']);
    exit;
}

try {

    $pdo = getConnection();
    $funcionarioId = $user['id'];

    // Admin vê todas as obras da empresa
    if ($user['tipo'] === 'admin') {
        $stmt = $pdo->prepare("
            SELECT
                o.*,
                c.nome as cliente_nome,
                enc.nome as encarregado_nome
            FROM obras o
            LEFT JOIN clientes c ON c.id = o.cliente_id AND c.empresa_id = ?
            LEFT JOIN encarregados enc ON enc.id = o.encarregado_id AND enc.empresa_id = ?
            WHERE o.ativa = 1 AND o.empresa_id = ?
            ORDER BY o.numero
        ");
        $stmt->execute([$empresaId, $empresaId, $empresaId]);
    } else {
        // Funcionário vê apenas obras vinculadas da mesma empresa
        $stmt = $pdo->prepare("
            SELECT DISTINCT
                o.*,
                c.nome as cliente_nome,
                enc.nome as encarregado_nome
            FROM obras o
            INNER JOIN funcionario_obra fo ON fo.obra_id = o.id
            LEFT JOIN clientes c ON c.id = o.cliente_id AND c.empresa_id = ?
            LEFT JOIN encarregados enc ON enc.id = o.encarregado_id AND enc.empresa_id = ?
            WHERE fo.funcionario_id = ?
            AND o.ativa = 1
            AND o.empresa_id = ?
            ORDER BY o.numero
        ");
        $stmt->execute([$empresaId, $empresaId, $funcionarioId, $empresaId]);
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
