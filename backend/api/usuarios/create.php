<?php
/**
 * API: Criar Usuário
 * POST /api/usuarios/create.php
 * MULTI-TENANT: Isolado por tenant_id
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

    // Validação básica
    if (empty($data['nome']) || empty($data['senha'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome e senha são obrigatórios']);
        exit;
    }

    // Passaporte obrigatório apenas para funcionários e encarregados
    $tipo = $data['tipo'] ?? 'funcionario';
    if ($tipo !== 'admin' && empty($data['passaporte'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Passaporte é obrigatório para funcionários e encarregados']);
        exit;
    }

    $pdo = getConnection();

    // Verificar se passaporte já existe no tenant (se fornecido)
    if (!empty($data['passaporte'])) {
        $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE passaporte = ? AND tenant_id = ?");
        $stmt->execute([strtoupper($data['passaporte']), $tenant_id]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Passaporte já cadastrado neste tenant']);
            exit;
        }
    }

    $senhaHash = password_hash($data['senha'], PASSWORD_DEFAULT);

    // Garantir que colunas financeiras existam
    $existingCols = $pdo->query("SHOW COLUMNS FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);
    $neededCols = [
        'salario_base'        => "DECIMAL(12,2) DEFAULT NULL",
        'salario_hora'        => "DECIMAL(10,2) DEFAULT NULL",
        'salario_base_mensal' => "DECIMAL(12,2) DEFAULT NULL",
        'valor_hora_venda'    => "DECIMAL(10,2) DEFAULT NULL",
        'vale_moradia'        => "DECIMAL(10,2) DEFAULT NULL",
        'ibf'                 => "DECIMAL(10,2) DEFAULT NULL",
        'bonificacao'         => "DECIMAL(10,2) DEFAULT 0",
        'biometria'           => "TINYINT(1) DEFAULT 0",
    ];
    foreach ($neededCols as $col => $def) {
        if (!in_array($col, $existingCols)) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN `{$col}` {$def}");
            $existingCols[] = $col;
        }
    }

    // salario_base: prioridade ao novo campo, fallback para salario_base_mensal
    $salarioBase = (isset($data['salario_base']) && $data['salario_base'] !== '')
        ? floatval($data['salario_base'])
        : (isset($data['salario_base_mensal']) && $data['salario_base_mensal'] !== '' ? floatval($data['salario_base_mensal']) : null);

    $salarioHora      = (isset($data['salario_hora'])     && $data['salario_hora']     !== '') ? floatval($data['salario_hora'])     : null;
    $valorHoraVenda   = (isset($data['valor_hora_venda']) && $data['valor_hora_venda'] !== '') ? floatval($data['valor_hora_venda']) : 24.00;
    $valeMoradia      = (isset($data['vale_moradia'])     && $data['vale_moradia']     !== '') ? floatval($data['vale_moradia'])     : null;
    $ibf              = (isset($data['ibf'])              && $data['ibf']              !== '') ? floatval($data['ibf'])              : null;
    $bonificacao      = (isset($data['bonificacao'])      && $data['bonificacao']      !== '') ? floatval($data['bonificacao'])      : 0;
    $hasBiometriaColumn = in_array('biometria', $existingCols);
    $hasBonificacaoColumn = in_array('bonificacao', $existingCols);

    // Construir SQL dinamicamente (incluindo tenant_id)
    $passaporteValue = !empty($data['passaporte']) ? strtoupper($data['passaporte']) : null;

    $colsList = "tenant_id, passaporte, senha_hash, nome, email, telefone, funcao, funcao_id, tipo, ativo, salario_base, salario_hora, salario_base_mensal, valor_hora_venda, vale_moradia, ibf";
    $placeholders = "?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?";
    $params = [
        $tenant_id,
        $passaporteValue, $senhaHash, $data['nome'],
        $data['email'] ?? null, $data['telefone'] ?? null,
        $data['funcao'] ?? null, $data['funcao_id'] ?? null,
        $data['tipo'] ?? 'funcionario',
        $salarioBase, $salarioHora, $salarioBase,
        $valorHoraVenda, $valeMoradia, $ibf,
    ];

    if ($hasBonificacaoColumn) {
        $colsList .= ", bonificacao";
        $placeholders .= ", ?";
        $params[] = $bonificacao;
    }
    if ($hasBiometriaColumn) {
        $colsList .= ", biometria";
        $placeholders .= ", ?";
        $params[] = isset($data['biometria']) ? ($data['biometria'] ? 1 : 0) : 0;
    }

    $sql = "INSERT INTO usuarios ({$colsList}) VALUES ({$placeholders})";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $id = $pdo->lastInsertId();

    echo json_encode(['success' => true, 'id' => $id]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
