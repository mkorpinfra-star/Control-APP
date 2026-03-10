<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo = getConnection();

    // Se receber IDs específicos, marca esses (com filtro de tenant)
    if (!empty($data['ids']) && is_array($data['ids'])) {
        $placeholders = str_repeat('?,', count($data['ids']) - 1) . '?';
        $sql = "UPDATE notificacoes SET lida = 1, data_leitura = NOW() WHERE tenant_id = ? AND id IN ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $params = array_merge([$user['tenant_id']], $data['ids']);
        $stmt->execute($params);

        echo json_encode([
            'success' => true,
            'message' => 'Notificações marcadas como lidas',
            'affected' => $stmt->rowCount()
        ]);
    }
    // Se receber ID único (com filtro de tenant)
    elseif (!empty($data['id'])) {
        $sql = "UPDATE notificacoes SET lida = 1, data_leitura = NOW() WHERE tenant_id = :tenant_id AND id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'tenant_id' => $user['tenant_id'],
            'id' => $data['id']
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Notificação marcada como lida'
        ]);
    }
    // Se receber 'all', marca todas do tenant
    elseif (isset($data['all']) && $data['all'] === true) {
        $sql = "UPDATE notificacoes SET lida = 1, data_leitura = NOW() WHERE tenant_id = :tenant_id AND lida = 0";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['tenant_id' => $user['tenant_id']]);

        echo json_encode([
            'success' => true,
            'message' => 'Todas as notificações marcadas como lidas',
            'affected' => $stmt->rowCount()
        ]);
    } else {
        throw new Exception('Parâmetro inválido: forneça id, ids[] ou all=true');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao marcar notificação: ' . $e->getMessage()
    ]);
}
