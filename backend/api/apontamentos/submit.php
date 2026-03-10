<?php
/**
 * API: Enviar apontamento para aprovação
 * POST /api/apontamentos/submit.php
 *
 * Gera token único para aprovação via WhatsApp
 * Se funcionário reenviar (corrigir), substitui o envio anterior
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
require_once __DIR__ . '/../../includes/email.php';

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

$tenant_id = $payload['empresa_id'] ?? $payload['tenant_id'] ?? null;
if (!$tenant_id) {
    http_response_code(400);
    echo json_encode(['error' => 'tenant_id ausente no token']);
    exit;
}

$auth = [
    'tenant_id' => $tenant_id,
    'tipo' => $payload['tipo'],
    'user_id' => $payload['id'],
    'nome' => $payload['nome'] ?? ''
];

$input = json_decode(file_get_contents('php://input'), true);
$apontamentoId = isset($input['id']) ? $input['id'] : null;

if (!$apontamentoId) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad request', 'message' => 'ID do apontamento obrigatório']);
    exit;
}

try {
    $pdo = getConnection();
    $pdo->beginTransaction();

    // Verificar se o apontamento existe e pertence ao usuário
    $stmt = $pdo->prepare("
        SELECT a.*, o.numero as obra_numero, o.nome as obra_nome,
               o.encarregado_id, e.email as encarregado_email, e.nome as encarregado_nome, e.telefone as encarregado_telefone
        FROM apontamentos a
        INNER JOIN obras o ON o.id = a.obra_id AND o.tenant_id = ?
        LEFT JOIN encarregados e ON e.id = o.encarregado_id AND e.tenant_id = ?
        WHERE a.id = ? AND a.funcionario_id = ? AND a.tenant_id = ?
    ");
    $stmt->execute([$tenant_id, $tenant_id, $apontamentoId, $auth['user_id'], $tenant_id]);
    $apontamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$apontamento) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        exit;
    }

    // =============== LÓGICA DE SUBSTITUIÇÃO DE ENVIO DUPLICADO ===============
    // Se funcionário já enviou para essa obra/semana e está enviando novamente (corrigindo),
    // substituir o anterior (marcar como obsoleto ou deletar)

    if ($apontamento['status'] === 'enviado') {
        // Já está enviado - significa que está CORRIGINDO
        // Apenas atualizar enviado_em e invalidar tokens antigos
        $stmt = $pdo->prepare("
            UPDATE apontamentos
            SET enviado_em = NOW()
            WHERE id = ? AND tenant_id = ?
        ");
        $stmt->execute([$apontamentoId, $tenant_id]);

        // Invalidar todos os tokens antigos deste apontamento
        $stmt = $pdo->prepare("
            UPDATE aprovacao_tokens
            SET usado = 1, usado_em = NOW()
            WHERE apontamento_id = ? AND usado = 0
        ");
        $stmt->execute([$apontamentoId]);

    } else {
        // Está enviando pela primeira vez (rascunho ou rejeitado)
        // Verificar se já existe OUTRO envio para mesma obra/semana/funcionário
        $stmt = $pdo->prepare("
            SELECT id FROM apontamentos
            WHERE funcionario_id = ?
              AND obra_id = ?
              AND semana_inicio = ?
              AND tenant_id = ?
              AND id != ?
              AND status IN ('enviado', 'aprovado_encarregado', 'aprovado')
            LIMIT 1
        ");
        $stmt->execute([
            $auth['user_id'],
            $apontamento['obra_id'],
            $apontamento['semana_inicio'],
            $tenant_id,
            $apontamentoId
        ]);
        $duplicado = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($duplicado) {
            // Existe outro envio - DELETAR o antigo (substituição completa)
            $stmt = $pdo->prepare("
                DELETE FROM apontamentos
                WHERE id = ? AND tenant_id = ?
            ");
            $stmt->execute([$duplicado['id'], $tenant_id]);

            // Tokens também serão deletados em CASCADE
        }

        // Atualizar status para enviado
        $stmt = $pdo->prepare("
            UPDATE apontamentos
            SET status = 'enviado', enviado_em = NOW()
            WHERE id = ? AND tenant_id = ?
        ");
        $stmt->execute([$apontamentoId, $tenant_id]);
    }

    // =============== GERAR TOKEN ÚNICO PARA APROVAÇÃO VIA WHATSAPP ===============
    $approvalToken = bin2hex(random_bytes(32)); // Token único de 64 caracteres
    $expiraEm = date('Y-m-d H:i:s', strtotime('+7 days')); // Expira em 7 dias

    $stmt = $pdo->prepare("
        INSERT INTO aprovacao_tokens (token, apontamento_id, encarregado_id, tenant_id, expira_em)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $approvalToken,
        $apontamentoId,
        $apontamento['encarregado_id'],
        $tenant_id,
        $expiraEm
    ]);

    $pdo->commit();

    // =============== PREPARAR LINK DE APROVAÇÃO ===============
    $approvalUrl = "https://puntoclicks.com/approve/" . $approvalToken;

    // =============== PREPARAR MENSAGEM WHATSAPP ===============
    $whatsappNumber = $apontamento['encarregado_telefone'];

    // Mensagem sem emojis problemáticos - usar apenas texto simples e emojis seguros
    $whatsappMessage = "*NUEVO REGISTRO DE HORAS*\n\n";
    $whatsappMessage .= "*Empleado:* {$auth['nome']}\n";
    $whatsappMessage .= "*Obra:* {$apontamento['obra_numero']} - {$apontamento['obra_nome']}\n";
    $whatsappMessage .= "*Semana:* " . date('d/m/Y', strtotime($apontamento['semana_inicio'])) . "\n";
    $whatsappMessage .= "*Total:* " . number_format($apontamento['total_horas'], 1, ',', '.') . " horas\n\n";
    $whatsappMessage .= "Haz clic para aprobar:\n{$approvalUrl}";

    // URL encode para WhatsApp
    $whatsappLink = "https://wa.me/" . preg_replace('/\D/', '', $whatsappNumber) . "?text=" . urlencode($whatsappMessage);

    echo json_encode([
        'success' => true,
        'message' => 'Registro enviado para aprobación',
        'whatsapp_link' => $whatsappLink,
        'approval_url' => $approvalUrl,
        'encarregado_nome' => $apontamento['encarregado_nome'],
        'encarregado_telefone' => $whatsappNumber
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
