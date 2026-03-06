<?php
/**
 * API: Gerenciar Impostos (IGI, CAS)
 * GET /api/config/impostos.php - Listar impostos
 * POST /api/config/impostos.php - Atualizar imposto (admin only)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
    echo json_encode(['success' => false, 'message' => 'Não autorizado']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token inválido']);
    exit;
}

try {
    $pdo = getConnection();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {
        // Listar todos os impostos (ativos e inativos para admin visualizar)
        $stmt = $pdo->query("SELECT * FROM config_impostos ORDER BY id");
        $impostos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'impostos' => $impostos
        ]);

    } elseif ($metodo === 'POST') {
        // Apenas admin pode alterar
        if ($user['tipo'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Permissão negada']);
            exit;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        $id = isset($data['id']) ? intval($data['id']) : null;
        $percentual = isset($data['percentual']) ? floatval($data['percentual']) : null;
        $ativo = isset($data['ativo']) ? intval($data['ativo']) : 1;

        if (!$id || $percentual === null) {
            echo json_encode(['success' => false, 'message' => 'Dados incompletos']);
            exit;
        }

        // Verificar se o registro existe
        $check = $pdo->prepare("SELECT id FROM config_impostos WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Imposto não encontrado']);
            exit;
        }

        $stmt = $pdo->prepare("UPDATE config_impostos SET percentual = ?, ativo = ? WHERE id = ?");
        $stmt->execute([$percentual, $ativo, $id]);
        // rowCount() pode ser 0 se o valor não mudou, mas o UPDATE foi bem-sucedido
        echo json_encode(['success' => true, 'message' => 'Imposto atualizado']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
}
