<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');

$debug = [
    'step' => 1,
    'message' => 'Iniciando debug'
];

try {
    // Passo 1: Verificar se arquivos existem
    $debug['step'] = 2;
    $debug['auth_file_exists'] = file_exists('../../includes/auth.php');
    $debug['db_file_exists'] = file_exists('../../config/database.php');

    // Passo 2: Incluir arquivos
    $debug['step'] = 3;
    require_once '../../includes/auth.php';
    $debug['auth_loaded'] = true;

    $debug['step'] = 4;
    require_once '../../config/database.php';
    $debug['db_loaded'] = true;

    // Passo 3: Verificar funções
    $debug['step'] = 5;
    $debug['authMiddleware_exists'] = function_exists('authMiddleware');
    $debug['validateToken_exists'] = function_exists('validateToken');
    $debug['getConnection_exists'] = function_exists('getConnection');

    // Passo 4: Verificar headers
    $debug['step'] = 6;
    $debug['headers'] = getallheaders();
    $debug['auth_header'] = $_SERVER['HTTP_AUTHORIZATION'] ?? 'not found';

    // Passo 5: Tentar autenticar
    $debug['step'] = 7;
    $user = authMiddleware();
    $debug['user_authenticated'] = true;
    $debug['user_id'] = $user['id'];
    $debug['user_tipo'] = $user['tipo'];

    // Passo 6: Conectar DB
    $debug['step'] = 8;
    $pdo = getConnection();
    $debug['db_connected'] = true;

    // Passo 7: Query teste
    $debug['step'] = 9;
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM obras WHERE ativa = 1");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $debug['total_obras_ativas'] = $result['total'];

    $debug['step'] = 10;
    $debug['success'] = true;

} catch (Exception $e) {
    $debug['error'] = $e->getMessage();
    $debug['error_file'] = $e->getFile();
    $debug['error_line'] = $e->getLine();
    $debug['error_trace'] = $e->getTraceAsString();
}

echo json_encode($debug, JSON_PRETTY_PRINT);
