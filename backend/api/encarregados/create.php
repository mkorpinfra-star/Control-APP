<?php
/**
 * CRIAR ENCARREGADO - MULTI-TENANT
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../includes/tenant_middleware.php';
require_once '../../includes/notificacao_helper.php';

$auth = validateTenantAccess();
requireAdmin($auth);

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['nome'])) {
        throw new Exception('Nome é obrigatório');
    }

    $pdo = getConnection();

    // Verificar email duplicado dentro do tenant
    if (!empty($data['email'])) {
        $checkEmail = $pdo->prepare("SELECT id FROM encarregados WHERE email = ? AND tenant_id = ?");
        $checkEmail->execute([$data['email'], $auth['tenant_id']]);
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
            tenant_id, nome, email, telefone, passaporte, senha, ativo
        ) VALUES (
            :tenant_id, :nome, :email, :telefone, :passaporte, :senha, :ativo
        )
    ");

    $stmt->execute([
        'tenant_id' => $auth['tenant_id'],
        'nome' => $data['nome'],
        'email' => !empty($data['email']) ? $data['email'] : null,
        'telefone' => !empty($data['telefone']) ? $data['telefone'] : null,
        'passaporte' => !empty($data['passaporte']) ? $data['passaporte'] : null,
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
            'usuario_id' => $auth['user_id'],
            'usuario_nome' => $auth['nome'] ?? 'Admin',
            'usuario_tipo' => $auth['tipo'],
            'tenant_id' => $auth['tenant_id']
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
