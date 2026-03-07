<?php
/**
 * API: Enviar apontamento para aprovação
 * PUT /api/apontamentos/submit.php
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
require_once __DIR__ . '/../../includes/email.php';

// Autenticação
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$apontamentoId = isset($input['id']) ? $input['id'] : null;

if (!$apontamentoId) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad request', 'message' => 'ID do apontamento obrigatório']);
    exit;
}

try {
    $pdo = getConnection();

    // Verificar se o apontamento existe e pertence ao usuário
    $stmt = $pdo->prepare("
        SELECT a.*, o.numero as obra_numero, o.nome as obra_nome,
               o.encarregado_id, e.email as encarregado_email, e.nome as encarregado_nome
        FROM apontamentos a
        INNER JOIN obras o ON o.id = a.obra_id
        LEFT JOIN encarregados e ON e.id = o.encarregado_id
        WHERE a.id = ? AND a.funcionario_id = ?
    ");
    $stmt->execute([$apontamentoId, $user['id']]);
    $apontamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$apontamento) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        exit;
    }

    if (!in_array($apontamento['status'], ['rascunho', 'rejeitado'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden', 'message' => 'Este registro ya ha sido enviado']);
        exit;
    }

    // Atualizar status para enviado
    $stmt = $pdo->prepare("UPDATE apontamentos SET status = 'enviado', enviado_em = NOW() WHERE id = ?");
    $stmt->execute([$apontamentoId]);

    // Enviar e-mail ao encarregado
    if (isset($apontamento['encarregado_email']) && $apontamento['encarregado_email']) {
        sendApprovalNotification(
            $apontamento['encarregado_email'],
            $user['nome'],
            $apontamento['obra_numero'],
            $apontamento['semana_inicio'],
            isset($apontamento['total_horas']) ? $apontamento['total_horas'] : 0
        );
    }

    echo json_encode(['success' => true, 'message' => 'Registro enviado para aprobación']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
