<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware();

try {
    $pdo = getConnection();

    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM notificacoes WHERE tenant_id = :tenant_id AND lida = 0");
    $stmt->execute(['tenant_id' => $user['tenant_id']]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total' => (int)$result['total']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao contar notificações: ' . $e->getMessage()
    ]);
}
