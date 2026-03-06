<?php
/**
 * API: Rejeitar apontamento
 * PUT /api/apontamentos/reject.php
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

// Apenas admin e encarregado podem rejeitar
if ($user['tipo'] !== 'admin' && $user['tipo'] !== 'encarregado') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$apontamentoId = isset($input['id']) ? $input['id'] : null;
$observacao = isset($input['observacao']) ? $input['observacao'] : null;

if (!$apontamentoId || !$observacao) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad request', 'message' => 'ID y motivo son obligatorios']);
    exit;
}

try {
    $pdo = getConnection();

    // Admin pode rejeitar/excluir qualquer, encarregado só suas obras
    // Aceita status enviado OU aprovado (admin pode reverter aprovações)
    $statusAceitos = "'enviado','aprovado','aprovado_encarregado','aprovado_admin'";

    if ($user['tipo'] === 'admin') {
        $stmt = $pdo->prepare("
            SELECT a.*,
                   u.nome as funcionario_nome, u.email as funcionario_email,
                   o.numero as obra_numero, o.nome as obra_nome
            FROM apontamentos a
            INNER JOIN usuarios u ON u.id = a.funcionario_id
            INNER JOIN obras o ON o.id = a.obra_id
            WHERE a.id = ? AND a.status IN ('enviado','aprovado','aprovado_encarregado','aprovado_admin')
        ");
        $stmt->execute([$apontamentoId]);
    } else {
        $stmt = $pdo->prepare("
            SELECT a.*,
                   u.nome as funcionario_nome, u.email as funcionario_email,
                   o.numero as obra_numero, o.nome as obra_nome
            FROM apontamentos a
            INNER JOIN usuarios u ON u.id = a.funcionario_id
            INNER JOIN obras o ON o.id = a.obra_id
            WHERE a.id = ? AND o.encarregado_id = ? AND a.status IN ('enviado','aprovado','aprovado_encarregado')
        ");
        $stmt->execute([$apontamentoId, $user['id']]);
    }

    $apontamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$apontamento) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found', 'message' => 'Apontamento não encontrado ou sem permissão']);
        exit;
    }

    // Se admin e observacao = '__DELETE__' — excluir o registro permanentemente
    if ($user['tipo'] === 'admin' && $observacao === '__DELETE__') {
        $stmt = $pdo->prepare("DELETE FROM apontamentos WHERE id = ?");
        $stmt->execute([$apontamentoId]);
        echo json_encode(['success' => true, 'message' => 'Registro eliminado']);
        exit;
    }

    // Atualizar status para rejeitado
    $stmt = $pdo->prepare("
        UPDATE apontamentos
        SET status = 'rejeitado', observacao_rejeicao = ?
        WHERE id = ?
    ");
    $stmt->execute([$observacao, $apontamentoId]);

    // Enviar e-mail ao funcionário
    if (isset($apontamento['funcionario_email']) && $apontamento['funcionario_email']) {
        sendRejectionNotification(
            $apontamento['funcionario_email'],
            $apontamento['funcionario_nome'],
            $apontamento['obra_numero'],
            $apontamento['semana_inicio'],
            $observacao
        );
    }

    echo json_encode(['success' => true, 'message' => 'Registro rechazado']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
