<?php
/**
 * API: Criar Obra
 * POST /api/obras/create.php
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
require_once __DIR__ . '/../../includes/notificacao_helper.php';

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
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['numero']) || empty($data['nome'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Número e nome são obrigatórios']);
        exit;
    }

    $pdo = getConnection();

    // Verificar duplicidade
    $stmt = $pdo->prepare("SELECT id FROM obras WHERE numero = ?");
    $stmt->execute([$data['numero']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Número de obra já existe']);
        exit;
    }

    // Garantir coluna dias_desativados
    $checkCol = $pdo->query("SHOW COLUMNS FROM obras LIKE 'dias_desativados'");
    if ($checkCol->rowCount() === 0) {
        $pdo->exec("ALTER TABLE obras ADD COLUMN dias_desativados TEXT NULL");
    }

    $diasDesativados = null;
    if (!empty($data['dias_desativados']) && is_array($data['dias_desativados'])) {
        $diasDesativados = json_encode($data['dias_desativados']);
    }

    // Detectar colunas disponíveis em obras para INSERT dinâmico
    $colObras = $pdo->query("SHOW COLUMNS FROM obras")->fetchAll(PDO::FETCH_COLUMN);

    $insertCols = [
        'numero','nome','endereco','email_financeiro','email_encarregado','data_inicio','data_fim','cliente_id','encarregado_id','dias_desativados',
        // Novos campos: País, Faturamento, Impostos
        'pais','fatura_hora_normal','fatura_hora_extra','fatura_hora_noturna','multiplicador_extra','multiplicador_noturna',
        'imposto_igi','imposto_cas_funcionario','imposto_cas_empresa','imposto_irpc'
    ];
    $insertVals = [
        strtoupper($data['numero']),
        $data['nome'],
        !empty($data['endereco'])          ? $data['endereco']          : null,
        !empty($data['email_financeiro'])   ? $data['email_financeiro']  : null,
        !empty($data['email_encarregado'])  ? $data['email_encarregado'] : null,
        !empty($data['data_inicio'])        ? $data['data_inicio']       : null,
        !empty($data['data_fim'])           ? $data['data_fim']          : null,
        !empty($data['cliente_id'])         ? $data['cliente_id']        : null,
        !empty($data['encarregado_id'])     ? $data['encarregado_id']    : null,
        $diasDesativados,
        // Novos campos com valores padrão
        !empty($data['pais']) ? $data['pais'] : 'España',
        isset($data['fatura_hora_normal']) ? floatval($data['fatura_hora_normal']) : 25.00,
        isset($data['fatura_hora_extra']) ? floatval($data['fatura_hora_extra']) : 37.50,
        isset($data['fatura_hora_noturna']) ? floatval($data['fatura_hora_noturna']) : 50.00,
        isset($data['multiplicador_extra']) ? floatval($data['multiplicador_extra']) : 1.50,
        isset($data['multiplicador_noturna']) ? floatval($data['multiplicador_noturna']) : 2.00,
        isset($data['imposto_igi']) ? floatval($data['imposto_igi']) : 0.00,
        isset($data['imposto_cas_funcionario']) ? floatval($data['imposto_cas_funcionario']) : 4.70,
        isset($data['imposto_cas_empresa']) ? floatval($data['imposto_cas_empresa']) : 23.60,
        isset($data['imposto_irpc']) ? floatval($data['imposto_irpc']) : 0.00
    ];

    // Adicionar colunas de status ativo/ativa apenas se existirem
    if (in_array('ativo', $colObras)) { $insertCols[] = 'ativo'; $insertVals[] = 1; }
    if (in_array('ativa', $colObras)) { $insertCols[] = 'ativa'; $insertVals[] = 1; }

    // Remover colunas que não existem na tabela
    $filteredCols = []; $filteredVals = [];
    foreach ($insertCols as $i => $col) {
        // Colunas obrigatórias (numero, nome) sempre incluir; opcionais só se existirem
        if (in_array($col, ['numero','nome']) || in_array($col, $colObras)) {
            $filteredCols[] = $col;
            $filteredVals[] = $insertVals[$i];
        }
    }

    $colList      = implode(', ', $filteredCols);
    $placeholders = implode(', ', array_fill(0, count($filteredCols), '?'));
    $sql          = "INSERT INTO obras ({$colList}) VALUES ({$placeholders})";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($filteredVals);

    $id = $pdo->lastInsertId();

    // Criar notificação
    $config = getNotificacaoConfig('obra_criada');
    criarNotificacao(
        'obra_criada',
        'Nueva obra creada',
        "Obra #{$data['numero']} - {$data['nome']} fue creada",
        [
            'icone' => $config['icone'],
            'cor' => $config['cor'],
            'url' => '/projects',
            'entidade_tipo' => 'obra',
            'entidade_id' => $id,
            'usuario_id' => $payload['id'],
            'usuario_nome' => $payload['nome'] ?? 'Admin',
            'usuario_tipo' => $payload['tipo']
        ]
    );

    echo json_encode(['success' => true, 'id' => $id]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
