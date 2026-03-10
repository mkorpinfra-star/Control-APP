<?php
/**
 * API: Atualizar Obra
 * PUT /api/obras/update.php
 * MULTI-TENANT: Filtra por empresa_id
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

// Support both empresa_id and tenant_id
$empresaId = $payload['empresa_id'] ?? $payload['tenant_id'] ?? null;
if (!$empresaId) {
    http_response_code(400);
    echo json_encode(['error' => 'empresa_id/tenant_id ausente no token']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        exit;
    }

    $pdo = getConnection();

    // Verificar se a obra pertence à empresa do usuário
    $checkStmt = $pdo->prepare("SELECT id FROM obras WHERE id = ? AND tenant_id = ?");
    $checkStmt->execute([$data['id'], $empresaId]);
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Obra não encontrada']);
        exit;
    }

    $updates = [];
    $params = [];

    // Usa array_key_exists para detectar campos enviados mesmo quando null
    if (!empty($data['numero'])) {
        $updates[] = "numero = ?";
        $params[] = strtoupper($data['numero']);
    }
    if (!empty($data['nome'])) {
        $updates[] = "nome = ?";
        $params[] = $data['nome'];
    }
    if (array_key_exists('endereco', $data)) {
        $updates[] = "endereco = ?";
        $params[] = $data['endereco'] ?: null;
    }
    if (array_key_exists('email_financeiro', $data)) {
        $updates[] = "email_financeiro = ?";
        $params[] = $data['email_financeiro'] ?: null;
    }
    if (array_key_exists('email_encarregado', $data)) {
        $updates[] = "email_encarregado = ?";
        $params[] = $data['email_encarregado'] ?: null;
    }
    if (array_key_exists('cliente_id', $data)) {
        $updates[] = "cliente_id = ?";
        $params[] = $data['cliente_id'] ?: null;
    }
    if (array_key_exists('encarregado_id', $data)) {
        $updates[] = "encarregado_id = ?";
        $params[] = $data['encarregado_id'] ?: null;
    }
    if (array_key_exists('data_inicio', $data)) {
        $updates[] = "data_inicio = ?";
        $params[] = $data['data_inicio'] ?: null;
    }
    if (array_key_exists('data_fim', $data)) {
        $updates[] = "data_fim = ?";
        $params[] = $data['data_fim'] ?: null;
    }
    if (array_key_exists('dias_desativados', $data)) {
        // Garantir coluna
        $checkCol = $pdo->query("SHOW COLUMNS FROM obras LIKE 'dias_desativados'");
        if ($checkCol->rowCount() === 0) {
            $pdo->exec("ALTER TABLE obras ADD COLUMN dias_desativados TEXT NULL");
        }
        $updates[] = "dias_desativados = ?";
        $diasArr = $data['dias_desativados'];
        $params[] = (!empty($diasArr) && is_array($diasArr)) ? json_encode($diasArr) : null;
    }

    // === NOVOS CAMPOS: País, Faturamento, Impostos ===
    if (array_key_exists('pais', $data)) {
        $updates[] = "pais = ?";
        $params[] = $data['pais'] ?: 'España';
    }
    if (array_key_exists('fatura_hora_normal', $data)) {
        $updates[] = "fatura_hora_normal = ?";
        $params[] = floatval($data['fatura_hora_normal']);
    }
    if (array_key_exists('fatura_hora_extra', $data)) {
        $updates[] = "fatura_hora_extra = ?";
        $params[] = floatval($data['fatura_hora_extra']);
    }
    if (array_key_exists('fatura_hora_noturna', $data)) {
        $updates[] = "fatura_hora_noturna = ?";
        $params[] = floatval($data['fatura_hora_noturna']);
    }
    if (array_key_exists('multiplicador_extra', $data)) {
        $updates[] = "multiplicador_extra = ?";
        $params[] = floatval($data['multiplicador_extra']);
    }
    if (array_key_exists('multiplicador_noturna', $data)) {
        $updates[] = "multiplicador_noturna = ?";
        $params[] = floatval($data['multiplicador_noturna']);
    }
    if (array_key_exists('imposto_igi', $data)) {
        $updates[] = "imposto_igi = ?";
        $params[] = floatval($data['imposto_igi']);
    }
    if (array_key_exists('imposto_cas_funcionario', $data)) {
        $updates[] = "imposto_cas_funcionario = ?";
        $params[] = floatval($data['imposto_cas_funcionario']);
    }
    if (array_key_exists('imposto_cas_empresa', $data)) {
        $updates[] = "imposto_cas_empresa = ?";
        $params[] = floatval($data['imposto_cas_empresa']);
    }
    if (array_key_exists('imposto_irpc', $data)) {
        $updates[] = "imposto_irpc = ?";
        $params[] = floatval($data['imposto_irpc']);
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        exit;
    }

    $sql = "UPDATE obras SET " . implode(', ', $updates) . " WHERE id = ? AND tenant_id = ?";
    $params[] = $data['id'];
    $params[] = $empresaId;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Buscar obra para notificação
    $stmtObra = $pdo->prepare("SELECT numero, nome FROM obras WHERE id = ? AND tenant_id = ?");
    $stmtObra->execute([$data['id'], $empresaId]);
    $obra = $stmtObra->fetch(PDO::FETCH_ASSOC);

    if ($obra) {
        $config = getNotificacaoConfig('obra_editada');
        criarNotificacao(
            'obra_editada',
            'Obra editada',
            "Obra #{$obra['numero']} - {$obra['nome']} fue modificada",
            [
                'icone' => $config['icone'],
                'cor' => $config['cor'],
                'url' => '/projects',
                'entidade_tipo' => 'obra',
                'entidade_id' => $data['id'],
                'usuario_id' => $payload['id'],
                'usuario_nome' => $payload['nome'] ?? 'Admin',
                'usuario_tipo' => $payload['tipo'],
                'empresa_id' => $empresaId
            ]
        );
    }

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
