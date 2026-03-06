<?php
/**
 * Arquivo de autenticação - funções auxiliares
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/jwt.php';

/**
 * Valida o token JWT e retorna os dados do usuário
 * @return array|false Dados do usuário ou false se inválido
 */
function validateToken()
{
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] :
        (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

    if (empty($authHeader)) {
        return false;
    }

    $token = str_replace('Bearer ', '', $authHeader);
    return validateJWT($token);
}

/**
 * Verifica se o usuário é admin
 * @param array $user Dados do usuário
 * @return bool
 */
function isAdmin($user)
{
    return isset($user['tipo']) && $user['tipo'] === 'admin';
}

/**
 * Verifica se o usuário é encarregado
 * @param array $user Dados do usuário
 * @return bool
 */
function isSupervisor($user)
{
    return isset($user['tipo']) && $user['tipo'] === 'encarregado';
}

/**
 * Middleware de autenticação - valida token e retorna usuário ou encerra com erro 401
 * @return array Dados do usuário autenticado
 */
function authMiddleware()
{
    $user = validateToken();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized', 'message' => 'Token inválido ou ausente']);
        exit;
    }

    return $user;
}
