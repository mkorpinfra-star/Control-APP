<?php
/**
 * API: Atualizar Usuário
 * PUT /api/usuarios/update.php
 * MULTI-TENANT: Isolado por tenant_id
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/tenant_middleware.php';

// Validar acesso multi-tenant e permissão de admin
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id'];
requireAdmin($auth);

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $pdo = getConnection();

    // Verificar se usuário pertence ao tenant
    $checkStmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ? AND tenant_id = ?");
    $checkStmt->execute([$data['id'], $tenant_id]);
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuário não encontrado ou não pertence a este tenant']);
        exit;
    }

    // Garantir que colunas financeiras existam (migração automática)
    $financialCols = [
        'salario_base'        => "DECIMAL(12,2) DEFAULT NULL",
        'salario_hora'        => "DECIMAL(10,2) DEFAULT NULL",
        'salario_base_mensal' => "DECIMAL(12,2) DEFAULT NULL",
        'valor_hora_venda'    => "DECIMAL(10,2) DEFAULT NULL",
        'vale_moradia'        => "DECIMAL(10,2) DEFAULT NULL",
        'ibf'                 => "DECIMAL(10,2) DEFAULT NULL",
        'bonificacao'         => "DECIMAL(10,2) DEFAULT 0",
    ];
    $existingCols = $pdo->query("SHOW COLUMNS FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($financialCols as $col => $def) {
        if (!in_array($col, $existingCols)) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN `{$col}` {$def}");
            $existingCols[] = $col; // update local cache
        }
    }

    $updates = [];
    $params = [];

    if (!empty($data['nome'])) {
        $updates[] = "nome = ?";
        $params[] = $data['nome'];
    }
    if (!empty($data['passaporte'])) {
        $updates[] = "passaporte = ?";
        $params[] = strtoupper($data['passaporte']);
    }
    if (isset($data['email'])) {
        $updates[] = "email = ?";
        $params[] = $data['email'];
    }
    if (isset($data['telefone'])) {
        $updates[] = "telefone = ?";
        $params[] = $data['telefone'];
    }
    if (isset($data['funcao']) && in_array('funcao', $existingCols)) {
        $updates[] = "funcao = ?";
        $params[] = $data['funcao'];
    }
    if (!empty($data['tipo'])) {
        $updates[] = "tipo = ?";
        $params[] = $data['tipo'];
    }
    if (array_key_exists('funcao_id', $data) && in_array('funcao_id', $existingCols)) {
        $updates[] = "funcao_id = ?";
        // FK: string vazia ou 0 vira NULL para não violar constraint
        $params[] = (!empty($data['funcao_id']) && intval($data['funcao_id']) > 0)
            ? intval($data['funcao_id'])
            : null;
    }
    if (!empty($data['senha'])) {
        $updates[] = "senha_hash = ?";
        $params[] = password_hash($data['senha'], PASSWORD_DEFAULT);
    }
    if (isset($data['salario_base']) && in_array('salario_base', $existingCols)) {
        $val = $data['salario_base'] !== '' ? floatval($data['salario_base']) : null;
        $updates[] = "salario_base = ?";
        $params[] = $val;
        // manter sincronizado com salario_base_mensal
        if (in_array('salario_base_mensal', $existingCols)) {
            $updates[] = "salario_base_mensal = ?";
            $params[] = $val;
        }
    } elseif (isset($data['salario_base_mensal']) && in_array('salario_base_mensal', $existingCols)) {
        $val = $data['salario_base_mensal'] !== '' ? floatval($data['salario_base_mensal']) : null;
        $updates[] = "salario_base_mensal = ?";
        $params[] = $val;
        if (in_array('salario_base', $existingCols)) {
            $updates[] = "salario_base = ?";
            $params[] = $val;
        }
    }
    if (isset($data['salario_hora']) && in_array('salario_hora', $existingCols)) {
        $updates[] = "salario_hora = ?";
        $params[] = $data['salario_hora'] !== '' ? floatval($data['salario_hora']) : null;
    }
    if (isset($data['valor_hora_venda']) && in_array('valor_hora_venda', $existingCols)) {
        $updates[] = "valor_hora_venda = ?";
        $params[] = $data['valor_hora_venda'] !== '' ? floatval($data['valor_hora_venda']) : null;
    }
    if (isset($data['vale_moradia']) && in_array('vale_moradia', $existingCols)) {
        $updates[] = "vale_moradia = ?";
        $params[] = $data['vale_moradia'] !== '' ? floatval($data['vale_moradia']) : null;
    }
    if (isset($data['ibf']) && in_array('ibf', $existingCols)) {
        $updates[] = "ibf = ?";
        $params[] = $data['ibf'] !== '' ? floatval($data['ibf']) : null;
    }
    if (isset($data['bonificacao']) && in_array('bonificacao', $existingCols)) {
        $updates[] = "bonificacao = ?";
        $params[] = $data['bonificacao'] !== '' ? floatval($data['bonificacao']) : 0;
    }
    // Verificar se coluna biometria existe antes de tentar atualizar
    if (isset($data['biometria']) && in_array('biometria', $existingCols)) {
        $updates[] = "biometria = ?";
        $params[] = $data['biometria'] ? 1 : 0;
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        exit;
    }

    $sql = "UPDATE usuarios SET " . implode(', ', $updates) . " WHERE id = ? AND tenant_id = ?";
    $params[] = $data['id'];
    $params[] = $tenant_id;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
