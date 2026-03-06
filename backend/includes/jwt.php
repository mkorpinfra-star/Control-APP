<?php
/**
 * Funções JWT para autenticação
 * Sistema de Marcação de Ponto
 */

define('JWT_SECRET', 'sua_chave_secreta_aqui_altere_em_producao_' . md5(__DIR__));
define('JWT_EXPIRY', 86400 * 7); // 7 dias

/**
 * Gera um token JWT simples
 */
function generateJWT($payload)
{
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));

    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $payloadEncoded = base64_encode(json_encode($payload));

    $signature = hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET, true);
    $signatureEncoded = base64_encode($signature);

    return "$header.$payloadEncoded.$signatureEncoded";
}

/**
 * Valida e decodifica um token JWT
 */
function validateJWT($token)
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }

    list($header, $payloadEncoded, $signatureEncoded) = $parts;

    // Verificar assinatura
    $signature = hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET, true);
    $expectedSignature = base64_encode($signature);

    if (!hash_equals($expectedSignature, $signatureEncoded)) {
        return null;
    }

    // Decodificar payload
    $payload = json_decode(base64_decode($payloadEncoded), true);

    // Verificar expiração
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}

/**
 * Obtém o usuário do token no header Authorization
 */
function getAuthUser()
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        return validateJWT($token);
    }

    return null;
}

/**
 * Middleware: Requer autenticação
 */
function requireAuth()
{
    $user = getAuthUser();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized', 'message' => 'Token inválido ou expirado']);
        exit;
    }

    return $user;
}

/**
 * Middleware: Requer tipo de usuário específico
 */
function requireRole($roles)
{
    $user = requireAuth();

    if (!is_array($roles)) {
        $roles = [$roles];
    }

    if (!in_array($user['tipo'], $roles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden', 'message' => 'Sem permissão para esta ação']);
        exit;
    }

    return $user;
}
