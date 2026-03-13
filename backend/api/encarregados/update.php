<?php
/**
 * ATUALIZAR ENCARREGADO - MULTI-TENANT
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../includes/tenant_middleware.php';

$auth = validateTenantAccess();
requireAdmin($auth);

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        throw new Exception('ID é obrigatório');
    }

    if (empty($data['nome'])) {
        throw new Exception('Nome é obrigatório');
    }

    $pdo = getConnection();

    // Verificar se encarregado pertence ao tenant
    $checkOwner = $pdo->prepare("SELECT id FROM encarregados WHERE id = ? AND tenant_id = ?");
    $checkOwner->execute([$data['id'], $auth['tenant_id']]);
    if (!$checkOwner->fetch()) {
        throw new Exception('Encarregado não encontrado ou sem permissão');
    }

    // Normalizar campos vazios para null
    $data['email'] = !empty($data['email']) ? $data['email'] : null;
    $data['telefone'] = !empty($data['telefone']) ? $data['telefone'] : null;
    $data['passaporte'] = !empty($data['passaporte']) ? $data['passaporte'] : null;

    // Verificar email duplicado dentro do tenant (exceto próprio registro)
    if (!empty($data['email'])) {
        $checkEmail = $pdo->prepare("SELECT id FROM encarregados WHERE email = ? AND id != ? AND tenant_id = ?");
        $checkEmail->execute([$data['email'], $data['id'], $auth['tenant_id']]);
        if ($checkEmail->fetch()) {
            throw new Exception('Email já cadastrado');
        }
    }

    // Atualizar senha apenas se fornecida
    if (!empty($data['senha'])) {
        $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            UPDATE encarregados SET
                nome = :nome,
                email = :email,
                telefone = :telefone,
                passaporte = :passaporte,
                senha = :senha,
                ativo = :ativo
            WHERE id = :id AND tenant_id = :tenant_id
        ");
        $stmt->execute([
            'nome' => $data['nome'],
            'email' => $data['email'],
            'telefone' => $data['telefone'],
            'passaporte' => $data['passaporte'],
            'senha' => $senhaHash,
            'ativo' => $data['ativo'] ?? 1,
            'id' => $data['id'],
            'tenant_id' => $auth['tenant_id']
        ]);
    } else {
        $stmt = $pdo->prepare("
            UPDATE encarregados SET
                nome = :nome,
                email = :email,
                telefone = :telefone,
                passaporte = :passaporte,
                ativo = :ativo
            WHERE id = :id AND tenant_id = :tenant_id
        ");
        $stmt->execute([
            'nome' => $data['nome'],
            'email' => $data['email'],
            'telefone' => $data['telefone'],
            'passaporte' => $data['passaporte'],
            'ativo' => $data['ativo'] ?? 1,
            'id' => $data['id'],
            'tenant_id' => $auth['tenant_id']
        ]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Encarregado atualizado com sucesso'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao atualizar encarregado: ' . $e->getMessage()
    ]);
}
