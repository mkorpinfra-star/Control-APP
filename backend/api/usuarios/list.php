<?php
/**
 * API: Listar Usuários
 * GET /api/usuarios/list.php?tipo=funcionario|encarregado|admin
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';

// Verificar autenticação
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Apenas admin/encarregado pode listar todos os usuários
if ($payload['tipo'] !== 'admin' && $payload['tipo'] !== 'encarregado') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

try {
    $pdo = getConnection();

    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : null;

    // Detectar colunas financeiras opcionais
    $existingCols = $pdo->query("SHOW COLUMNS FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);

    // Garantir que colunas financeiras existam (migração automática)
    $migrateCols = [
        'salario_base'        => "DECIMAL(12,2) DEFAULT NULL",
        'salario_hora'        => "DECIMAL(10,2) DEFAULT NULL",
        'salario_base_mensal' => "DECIMAL(12,2) DEFAULT NULL",
        'valor_hora_venda'    => "DECIMAL(10,2) DEFAULT NULL",
        'vale_moradia'        => "DECIMAL(10,2) DEFAULT NULL",
        'ibf'                 => "DECIMAL(10,2) DEFAULT NULL",
        'bonificacao'         => "DECIMAL(10,2) DEFAULT 0",
        'funcao_id'           => "INT DEFAULT NULL",
    ];
    foreach ($migrateCols as $fc => $def) {
        if (!in_array($fc, $existingCols)) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN `{$fc}` {$def}");
            $existingCols[] = $fc;
        }
    }

    // Montar SELECT com colunas opcionais
    $optionalCols = '';
    foreach (['funcao','funcao_id','salario_base','salario_hora','salario_base_mensal','valor_hora_venda','vale_moradia','ibf','bonificacao','biometria'] as $col) {
        if (in_array($col, $existingCols)) {
            $optionalCols .= ", {$col}";
        }
    }

    $sql = "SELECT id, passaporte, nome, email, telefone, foto_url, tipo, ativo{$optionalCols}
            FROM usuarios WHERE ativo = 1";
    $params = [];

    if ($tipo) {
        $sql .= " AND tipo = ?";
        $params[] = $tipo;
    }

    $sql .= " ORDER BY nome ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($usuarios);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
