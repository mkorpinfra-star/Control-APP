<?php
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
                        'badge' => '/badge-72x72.png',
                        'vibrate' => [200, 100, 200],
                        'requireInteraction' => true
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
            error_log('Erro FCM: ' . $result);
        }

        return $httpCode == 200;
    } catch (Exception $e) {
        error_log('Erro enviarPushNotification: ' . $e->getMessage());
        return false;
    }
}
