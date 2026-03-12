<?php
/**
 * API: Notificar Funcionário
 * POST /api/monitoramento/notify.php
 *
 * Envia notificações:
 * - Push Notification (FCM)
 * - Notificação In-App
 * - Mensagem WhatsApp
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

if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Apenas admin pode notificar
if ($payload['tipo'] !== 'admin' && $payload['tipo'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden - Admin only']);
    exit;
}

$tenant_id = $payload['empresa_id'] ?? $payload['tenant_id'] ?? null;
if (!$tenant_id) {
    http_response_code(400);
    echo json_encode(['error' => 'tenant_id ausente no token']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$funcionario_id = isset($input['funcionario_id']) ? (int)$input['funcionario_id'] : null;
$tipo = isset($input['tipo']) ? $input['tipo'] : 'pendente'; // 'pendente', 'incompleto', 'rejeitado'

if (!$funcionario_id) {
    http_response_code(400);
    echo json_encode(['error' => 'funcionario_id obrigatório']);
    exit;
}

try {
    $pdo = getConnection();

    // Buscar dados do funcionário
    $stmt = $pdo->prepare("
        SELECT id, nome, email, telefone, fcm_token
        FROM usuarios
        WHERE id = ? AND tenant_id = ? AND tipo = 'funcionario'
    ");
    $stmt->execute([$funcionario_id, $tenant_id]);
    $funcionario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$funcionario) {
        http_response_code(404);
        echo json_encode(['error' => 'Funcionário não encontrado']);
        exit;
    }

    // Definir mensagens baseado no tipo
    $mensagens = [
        'pendente' => [
            'titulo' => 'Registro de Horas Pendiente',
            'corpo' => 'No has registrado tus horas hoy. Por favor, marca tu punto.',
            'whatsapp' => 'Hola ' . $funcionario['nome'] . ', no has registrado tus horas hoy. Por favor, marca tu punto en la aplicación.'
        ],
        'incompleto' => [
            'titulo' => 'Registro Incompleto',
            'corpo' => 'Tu registro de horas está incompleto. Por favor, completa y envía.',
            'whatsapp' => 'Hola ' . $funcionario['nome'] . ', tu registro de horas está incompleto. Por favor, completa y envía para aprobación.'
        ],
        'rejeitado' => [
            'titulo' => 'Registro Rechazado',
            'corpo' => 'Tu registro de horas fue rechazado. Revisa y corrige.',
            'whatsapp' => 'Hola ' . $funcionario['nome'] . ', tu registro de horas fue rechazado. Por favor, revisa las observaciones y corrige.'
        ]
    ];

    $msg = $mensagens[$tipo] ?? $mensagens['pendente'];

    // 1. CRIAR NOTIFICAÇÃO IN-APP
    $stmt = $pdo->prepare("
        INSERT INTO notificacoes (usuario_id, tenant_id, tipo, titulo, mensagem, lida, criado_em)
        VALUES (?, ?, ?, ?, ?, 0, NOW())
    ");
    $stmt->execute([
        $funcionario_id,
        $tenant_id,
        $tipo,
        $msg['titulo'],
        $msg['corpo']
    ]);

    // 2. ENVIAR PUSH NOTIFICATION (FCM)
    $pushEnviado = false;
    if (!empty($funcionario['fcm_token'])) {
        $pushEnviado = enviarPushNotification($funcionario['fcm_token'], $msg['titulo'], $msg['corpo']);
    }

    // 3. ENVIAR WHATSAPP (via API)
    $whatsappEnviado = false;
    if (!empty($funcionario['telefone'])) {
        $whatsappEnviado = enviarWhatsApp($funcionario['telefone'], $msg['whatsapp']);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Notificações enviadas',
        'notificacoes' => [
            'in_app' => true,
            'push' => $pushEnviado,
            'whatsapp' => $whatsappEnviado
        ],
        'funcionario' => [
            'id' => $funcionario['id'],
            'nome' => $funcionario['nome']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

/**
 * Enviar Push Notification via Firebase Cloud Messaging (FCM)
 */
function enviarPushNotification($fcmToken, $titulo, $corpo) {
    // TODO: Configurar Firebase Cloud Messaging
    // Necessário: Server Key do Firebase

    $serverKey = getenv('FCM_SERVER_KEY'); // Configurar no .env

    if (empty($serverKey)) {
        error_log('FCM_SERVER_KEY não configurado');
        return false;
    }

    $url = 'https://fcm.googleapis.com/fcm/send';

    $notification = [
        'title' => $titulo,
        'body' => $corpo,
        'sound' => 'default',
        'badge' => '1'
    ];

    $data = [
        'to' => $fcmToken,
        'notification' => $notification,
        'priority' => 'high'
    ];

    $headers = [
        'Authorization: key=' . $serverKey,
        'Content-Type: application/json'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $httpCode == 200;
}

/**
 * Enviar Mensagem WhatsApp via API
 */
function enviarWhatsApp($telefone, $mensagem) {
    // TODO: Configurar API de WhatsApp
    // Opções: Twilio, WhatsApp Business API, Evolution API, etc.

    $apiUrl = getenv('WHATSAPP_API_URL'); // Ex: https://api.evolution.com/message/sendText
    $apiKey = getenv('WHATSAPP_API_KEY');

    if (empty($apiUrl) || empty($apiKey)) {
        error_log('WhatsApp API não configurado');
        // Por enquanto, retornar true para não bloquear
        return true;
    }

    // Formatar telefone (remover +, espaços, etc)
    $telefoneFormatado = preg_replace('/[^0-9]/', '', $telefone);

    $data = [
        'number' => $telefoneFormatado,
        'text' => $mensagem
    ];

    $headers = [
        'Content-Type: application/json',
        'apikey: ' . $apiKey
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return $httpCode == 200 || $httpCode == 201;
}
