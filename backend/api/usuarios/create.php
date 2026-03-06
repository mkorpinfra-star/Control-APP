<?php
/**
 * API: Criar Usuário
 * POST /api/usuarios/create.php
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
require_once __DIR__ . '/../../includes/jwt.php';

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);

if (!$payload || $payload['tipo'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden - Only admin']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['passaporte']) || empty($data['nome']) || empty($data['senha'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Passaporte, nome e senha são obrigatórios']);
        exit;
    }

    $pdo = getConnection();

    // Verificar se passaporte já existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE passaporte = ?");
    $stmt->execute([strtoupper($data['passaporte'])]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Passaporte já cadastrado']);
        exit;
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

    // Construir SQL dinamicamente
    $colsList = "passaporte, senha_hash, nome, email, telefone, funcao, funcao_id, tipo, ativo, salario_base, salario_hora, salario_base_mensal, valor_hora_venda, vale_moradia, ibf";
    $placeholders = "?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?";
    $params = [
        strtoupper($data['passaporte']), $senhaHash, $data['nome'],
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
