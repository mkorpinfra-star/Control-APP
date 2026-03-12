<?php
/**
 * API: Broadcast - Enviar notificação para TODOS os usuários
 * POST /api/monitoramento/broadcast.php
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

// Apenas admin pode enviar broadcast
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
$mensagem = isset($input['mensagem']) ? trim($input['mensagem']) : '';

if (empty($mensagem)) {
    http_response_code(400);
    echo json_encode(['error' => 'Mensagem é obrigatória']);
    exit;
}

try {
    $pdo = getConnection();

    // Buscar TODOS os usuários ativos do tenant (admin, encarregado, funcionario)
    $stmt = $pdo->prepare("
        SELECT id, nome, fcm_token, tipo
        FROM usuarios
        WHERE tenant_id = ? AND ativo = 1
    ");
    $stmt->execute([$tenant_id]);
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $total_enviados = 0;
    $titulo = 'Aviso General';

    foreach ($usuarios as $usuario) {
        // 1. Criar notificação in-app
        $stmt = $pdo->prepare("
            INSERT INTO notificacoes (usuario_id, tenant_id, tipo, titulo, mensagem, lida)
            VALUES (?, ?, 'geral', ?, ?, 0)
        ");
        $stmt->execute([
            $usuario['id'],
            $tenant_id,
            $titulo,
            $mensagem
        ]);

        // 2. Enviar push notification se tiver FCM token
        if (!empty($usuario['fcm_token'])) {
            enviarPushNotification($usuario['fcm_token'], $titulo, $mensagem);
        }

        $total_enviados++;
    }

    echo json_encode([
        'success' => true,
        'total_enviados' => $total_enviados,
        'message' => "Notificação enviada para {$total_enviados} usuários"
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
