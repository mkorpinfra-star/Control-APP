<?php
// Teste de erro - acesse direto no navegador
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

echo "1. Testando require config...\n";
require_once __DIR__ . '/../../config/database.php';
echo "   OK\n";

echo "2. Testando require jwt...\n";
require_once __DIR__ . '/../../includes/jwt.php';
echo "   OK\n";

echo "3. Testando conexão...\n";
$pdo = getConnection();
echo "   OK\n";

echo "4. Testando query...\n";
$stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios");
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo "   Total: " . $row['total'] . "\n";

echo "5. Headers recebidos:\n";
print_r(getallheaders());

echo "\n6. SERVER:\n";
echo "HTTP_AUTHORIZATION: " . (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : 'NÃO EXISTE') . "\n";

echo "\nTudo OK!";
