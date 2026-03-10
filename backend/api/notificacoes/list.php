<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware();

try {
    $pdo = getConnection();

    // Parâmetros opcionais
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $somenteNaoLidas = isset($_GET['nao_lidas']) && $_GET['nao_lidas'] === 'true';

    // Query base com filtro de tenant
    $sql = "SELECT * FROM notificacoes WHERE tenant_id = :tenant_id";
    $params = ['tenant_id' => $user['tenant_id']];

    if ($somenteNaoLidas) {
        $sql .= " AND lida = 0";
    }

    $sql .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':tenant_id', $user['tenant_id'], PDO::PARAM_INT);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $notificacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar total não lidas do tenant
    $stmtCount = $pdo->prepare("SELECT COUNT(*) as total FROM notificacoes WHERE tenant_id = :tenant_id AND lida = 0");
    $stmtCount->execute(['tenant_id' => $user['tenant_id']]);
    $countResult = $stmtCount->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'notificacoes' => $notificacoes,
        'total_nao_lidas' => (int)$countResult['total']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao listar notificações: ' . $e->getMessage()
    ]);
}
