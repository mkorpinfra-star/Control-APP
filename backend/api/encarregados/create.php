<?php
/**
 * CRIAR ENCARREGADO
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';
require_once '../../includes/notificacao_helper.php';

$user = authMiddleware(['admin']);

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['nome'])) {
        throw new Exception('Nome é obrigatório');
    }

    $pdo = getConnection();

    // Verificar email duplicado
    if (!empty($data['email'])) {
        $checkEmail = $pdo->prepare("SELECT id FROM encarregados WHERE email = ?");
        $checkEmail->execute([$data['email']]);
        if ($checkEmail->fetch()) {
            throw new Exception('Email já cadastrado');
        }
    }

    // Hash da senha se fornecida
    $senhaHash = null;
    if (!empty($data['senha'])) {
        $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);
    }

    $stmt = $pdo->prepare("
        INSERT INTO encarregados (
            nome, email, telefone, passaporte, senha, ativo
        ) VALUES (
            :nome, :email, :telefone, :passaporte, :senha, :ativo
        )
    ");

    $stmt->execute([
        'nome' => $data['nome'],
        'email' => $data['email'] ?? null,
        'telefone' => $data['telefone'] ?? null,
        'passaporte' => $data['passaporte'] ?? null,
        'senha' => $senhaHash,
        'ativo' => $data['ativo'] ?? 1
    ]);

    $id = $pdo->lastInsertId();

    // Criar notificação
    $config = getNotificacaoConfig('encarregado_criado');
    criarNotificacao(
        'encarregado_criado',
        'Nuevo encargado creado',
        "Encargado {$data['nome']} fue registrado",
        [
            'icone' => $config['icone'],
            'cor' => $config['cor'],
            'url' => '/staff',
            'entidade_tipo' => 'encarregado',
            'entidade_id' => $id,
            'usuario_id' => $user['id'],
            'usuario_nome' => $user['nome'] ?? 'Admin',
            'usuario_tipo' => $user['tipo']
        ]
    );

    echo json_encode([
        'success' => true,
        'message' => 'Encarregado criado com sucesso',
        'id' => $id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao criar encarregado: ' . $e->getMessage()
    ]);
}
