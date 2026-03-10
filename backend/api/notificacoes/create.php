<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware();

try {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validações
    if (empty($data['tipo']) || empty($data['titulo']) || empty($data['mensagem'])) {
        throw new Exception('Campos obrigatórios: tipo, titulo, mensagem');
    }

    $pdo = getConnection();

    $sql = "INSERT INTO notificacoes (
        tenant_id, tipo, titulo, mensagem, icone, cor,
        url, entidade_tipo, entidade_id,
        usuario_id, usuario_nome, usuario_tipo
    ) VALUES (
        :tenant_id, :tipo, :titulo, :mensagem, :icone, :cor,
        :url, :entidade_tipo, :entidade_id,
        :usuario_id, :usuario_nome, :usuario_tipo
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'tenant_id' => $user['tenant_id'],
        'tipo' => $data['tipo'],
        'titulo' => $data['titulo'],
        'mensagem' => $data['mensagem'],
        'icone' => $data['icone'] ?? 'bell',
        'cor' => $data['cor'] ?? 'gray',
        'url' => $data['url'] ?? null,
        'entidade_tipo' => $data['entidade_tipo'] ?? null,
        'entidade_id' => $data['entidade_id'] ?? null,
        'usuario_id' => $data['usuario_id'] ?? null,
        'usuario_nome' => $data['usuario_nome'] ?? null,
        'usuario_tipo' => $data['usuario_tipo'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Notificação criada com sucesso',
        'id' => $pdo->lastInsertId()
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criar notificação: ' . $e->getMessage()
    ]);
}
