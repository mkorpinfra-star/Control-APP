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

    // Buscar obra do funcionário
    $stmt = $pdo->prepare("
        SELECT o.nome as obra_nome, o.numero as obra_numero
        FROM funcionario_obra fo
        INNER JOIN obras o ON o.id = fo.obra_id AND o.tenant_id = ?
        WHERE fo.funcionario_id = ?
        LIMIT 1
    ");
    $stmt->execute([$tenant_id, $funcionario_id]);
    $obra = $stmt->fetch(PDO::FETCH_ASSOC);

    $obraInfo = '';
    if ($obra) {
        $obraInfo = ' de la obra *' . $obra['obra_numero'] . ' - ' . $obra['obra_nome'] . '*';
    }

    // Definir mensagens baseado no tipo
    $mensagens = [
        'pendente' => [
            'titulo' => 'Registro de Horas Pendiente',
            'corpo' => 'No has registrado tus horas hoy' . str_replace('*', '', $obraInfo) . '.',
            'whatsapp' => "🕒 *Control de Horas - Registro Pendiente*\n\nHola *" . $funcionario['nome'] . "*,\n\nNo has registrado tus horas de trabajo hoy" . $obraInfo . ".\n\nPor favor, accede a la aplicación y marca tu punto lo antes posible.\n\n_Mensaje automático del sistema de control de horas._"
        ],
        'incompleto' => [
            'titulo' => 'Registro Incompleto',
            'corpo' => 'Tu registro de horas' . str_replace('*', '', $obraInfo) . ' está incompleto.',
            'whatsapp' => "⚠️ *Control de Horas - Registro Incompleto*\n\nHola *" . $funcionario['nome'] . "*,\n\nTu registro de horas" . $obraInfo . " está incompleto.\n\nPor favor, completa todos los campos y envía para aprobación.\n\n_Mensaje automático del sistema de control de horas._"
        ],
        'rejeitado' => [
            'titulo' => 'Registro Rechazado',
            'corpo' => 'Tu registro de horas' . str_replace('*', '', $obraInfo) . ' fue rechazado.',
            'whatsapp' => "❌ *Control de Horas - Registro Rechazado*\n\nHola *" . $funcionario['nome'] . "*,\n\nTu registro de horas" . $obraInfo . " fue rechazado.\n\nPor favor, revisa las observaciones del encargado y corrige la información.\n\n_Mensaje automático del sistema de control de horas._"
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

    // 3. WHATSAPP - Link direto wa.me (frontend)
    $whatsappEnviado = true; // Sempre true pois usa link direto

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
 * Enviar Push Notification via Firebase Cloud Messaging (FCM) - API V1
 */
function enviarPushNotification($fcmToken, $titulo, $corpo) {
    $keyPath = __DIR__ . '/../../puntotouch-e66fc-firebase-adminsdk-fbsvc-54112e91f0.json';

    if (!file_exists($keyPath)) {
        error_log('Firebase key file não encontrado: ' . $keyPath);
        return false;
    }

    try {
        // Carregar service account
        $serviceAccount = json_decode(file_get_contents($keyPath), true);
        if (!$serviceAccount) {
            error_log('Erro ao decodificar Firebase key');
            return false;
        }

        // Gerar JWT para OAuth2
        $now = time();
        $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $claim = json_encode([
            'iss' => $serviceAccount['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlClaim = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($claim));
        $signature = '';
        $signatureInput = $base64UrlHeader . '.' . $base64UrlClaim;

        openssl_sign($signatureInput, $signature, $serviceAccount['private_key'], 'sha256WithRSAEncryption');
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        $jwt = $signatureInput . '.' . $base64UrlSignature;

        // Obter Access Token
        $ch = curl_init('https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]));
        $response = curl_exec($ch);
        curl_close($ch);

        $tokenData = json_decode($response, true);
        if (!isset($tokenData['access_token'])) {
            error_log('Erro ao obter access token: ' . $response);
            return false;
        }

        $accessToken = $tokenData['access_token'];

        // Enviar notificação via FCM V1 API
        $projectId = $serviceAccount['project_id'];
        $url = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";

        $message = [
            'message' => [
                'token' => $fcmToken,
                'notification' => [
                    'title' => $titulo,
                    'body' => $corpo
                ],
                'webpush' => [
                    'notification' => [
                        'icon' => '/icon-192x192.png',
                        'badge' => '/badge-72x72.png'
                    ]
                ]
            ]
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode != 200) {
            error_log('Erro FCM HTTP ' . $httpCode . ': ' . $result);
        }

        return $httpCode == 200;
    } catch (Exception $e) {
        error_log('Erro enviarPushNotification: ' . $e->getMessage());
        return false;
    }
}
