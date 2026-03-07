<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware();

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $pdo = getConnection();

    // Se receber IDs específicos, marca esses
    if (!empty($data['ids']) && is_array($data['ids'])) {
        $placeholders = str_repeat('?,', count($data['ids']) - 1) . '?';
        $sql = "UPDATE notificacoes SET lida = 1, data_leitura = NOW() WHERE id IN ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($data['ids']);

        echo json_encode([
            'success' => true,
            'message' => 'Notificações marcadas como lidas',
            'affected' => $stmt->rowCount()
        ]);
    }
    // Se receber ID único
    elseif (!empty($data['id'])) {
        $sql = "UPDATE notificacoes SET lida = 1, data_leitura = NOW() WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $data['id']]);

        echo json_encode([
            'success' => true,
            'message' => 'Notificação marcada como lida'
        ]);
    }
    // Se receber 'all', marca todas
    elseif (isset($data['all']) && $data['all'] === true) {
        $sql = "UPDATE notificacoes SET lida = 1, data_leitura = NOW() WHERE lida = 0";
        $stmt = $pdo->query($sql);

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
