<?php
/**
 * ATUALIZAR ENCARREGADO
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

    if (empty($data['nome'])) {
        throw new Exception('Nome é obrigatório');
    }

    $pdo = getConnection();

    // Verificar email duplicado (exceto próprio registro)
    if (!empty($data['email'])) {
        $checkEmail = $pdo->prepare("SELECT id FROM encarregados WHERE email = ? AND id != ?");
        $checkEmail->execute([$data['email'], $data['id']]);
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
            WHERE id = :id
        ");
        $stmt->execute([
            'nome' => $data['nome'],
            'email' => $data['email'] ?? null,
            'telefone' => $data['telefone'] ?? null,
            'passaporte' => $data['passaporte'] ?? null,
            'senha' => $senhaHash,
            'ativo' => $data['ativo'] ?? 1,
            'id' => $data['id']
        ]);
    } else {
        $stmt = $pdo->prepare("
            UPDATE encarregados SET
                nome = :nome,
                email = :email,
                telefone = :telefone,
                passaporte = :passaporte,
                ativo = :ativo
            WHERE id = :id
        ");
        $stmt->execute([
            'nome' => $data['nome'],
            'email' => $data['email'] ?? null,
            'telefone' => $data['telefone'] ?? null,
            'passaporte' => $data['passaporte'] ?? null,
            'ativo' => $data['ativo'] ?? 1,
            'id' => $data['id']
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
