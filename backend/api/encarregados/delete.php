<?php
/**
 * DELETAR ENCARREGADO
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        throw new Exception('ID é obrigatório');
    }

    $pdo = getConnection();

    // Verificar se tem obras vinculadas
    $checkObras = $pdo->prepare("SELECT COUNT(*) as total FROM obras WHERE encarregado_id = ?");
    $checkObras->execute([$data['id']]);
    $result = $checkObras->fetch(PDO::FETCH_ASSOC);

    if ($result['total'] > 0) {
        throw new Exception('Não é possível deletar. Encarregado vinculado a ' . $result['total'] . ' obra(s)');
    }

    $stmt = $pdo->prepare("DELETE FROM encarregados WHERE id = ?");
    $stmt->execute([$data['id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Encarregado deletado com sucesso'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao deletar encarregado: ' . $e->getMessage()
    ]);
}
