<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain; charset=utf-8');

echo "=== TESTE DE AUTENTICAÇÃO ===\n\n";

// Teste 1: Verificar arquivos
echo "1. Verificando arquivos...\n";
$authPath = realpath('../../includes/auth.php');
$dbPath = realpath('../../config/database.php');
echo "   auth.php: " . ($authPath ? "OK - $authPath" : "NÃO ENCONTRADO") . "\n";
echo "   database.php: " . ($dbPath ? "OK - $dbPath" : "NÃO ENCONTRADO") . "\n\n";

if (!$authPath || !$dbPath) {
    die("ERRO: Arquivos não encontrados!\n");
}

// Teste 2: Incluir auth.php
echo "2. Incluindo auth.php...\n";
try {
    require_once $authPath;
    echo "   OK\n\n";
} catch (Exception $e) {
    die("ERRO ao incluir auth.php: " . $e->getMessage() . "\n");
}

// Teste 3: Verificar funções
echo "3. Verificando funções...\n";
echo "   authMiddleware: " . (function_exists('authMiddleware') ? "OK" : "NÃO EXISTE") . "\n";
echo "   validateToken: " . (function_exists('validateToken') ? "OK" : "NÃO EXISTE") . "\n";
echo "   validateJWT: " . (function_exists('validateJWT') ? "OK" : "NÃO EXISTE") . "\n\n";

if (!function_exists('authMiddleware')) {
    die("ERRO: authMiddleware não existe!\n");
}

// Teste 4: Verificar headers
echo "4. Headers recebidos...\n";
$headers = getallheaders();
foreach ($headers as $key => $value) {
    if (stripos($key, 'auth') !== false) {
        echo "   $key: " . substr($value, 0, 50) . "...\n";
    }
}
echo "\n";

// Teste 5: Tentar autenticar
echo "5. Tentando autenticar...\n";
try {
    $user = authMiddleware();
    echo "   OK - Usuário autenticado!\n";
    echo "   ID: " . $user['id'] . "\n";
    echo "   Nome: " . $user['nome'] . "\n";
    echo "   Tipo: " . $user['tipo'] . "\n\n";
    echo "=== SUCESSO! ===\n";
} catch (Exception $e) {
    echo "   ERRO: " . $e->getMessage() . "\n";
    echo "   Arquivo: " . $e->getFile() . "\n";
    echo "   Linha: " . $e->getLine() . "\n";
}
