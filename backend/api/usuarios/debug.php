<?php
/**
 * Debug para subpasta - APAGAR DEPOIS
 * Acesse: https://j2s.ad/login/backend/api/usuarios/debug.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Debug - Subpasta Usuarios</h1>";

echo "<h2>1. Diretório atual</h2>";
echo "<p>__DIR__ = " . __DIR__ . "</p>";

echo "<h2>2. Verificando caminhos</h2>";

$configPath = __DIR__ . '/../../config/database.php';
echo "<p>Caminho config: " . realpath($configPath) . "</p>";
echo "<p>Existe? " . (file_exists($configPath) ? "SIM" : "NÃO") . "</p>";

$jwtPath = __DIR__ . '/../../includes/jwt.php';
echo "<p>Caminho jwt: " . realpath($jwtPath) . "</p>";
echo "<p>Existe? " . (file_exists($jwtPath) ? "SIM" : "NÃO") . "</p>";

echo "<h2>3. Listando pasta pai</h2>";
$parentDir = __DIR__ . '/../../';
if (is_dir($parentDir)) {
    $files = scandir($parentDir);
    echo "<pre>" . print_r($files, true) . "</pre>";
} else {
    echo "<p>Pasta não existe!</p>";
}

echo "<h2>4. Testando conexão</h2>";
try {
    require_once $configPath;
    $pdo = getConnection();
    echo "<p style='color:green'>✅ Conexão OK</p>";

    $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios WHERE ativo = 1");
    $row = $stmt->fetch();
    echo "<p>Total usuários: " . $row['total'] . "</p>";

} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erro: " . $e->getMessage() . "</p>";
}

echo "<hr><p><strong>APAGUE ESTE ARQUIVO DEPOIS!</strong></p>";
