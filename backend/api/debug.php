<?php
/**
 * Script de diagnóstico - APAGAR DEPOIS
 * Acesse: https://j2s.ad/login/backend/api/debug.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/html; charset=utf-8');

echo "<h1>Diagnóstico do Sistema</h1>";

// 1. Versão PHP
echo "<h2>1. PHP</h2>";
echo "<p>Versão: " . phpversion() . "</p>";

// 2. Teste de conexão com banco
echo "<h2>2. Conexão com Banco</h2>";
try {
    require_once __DIR__ . '/../config/database.php';
    $pdo = getConnection();
    echo "<p style='color:green'>✅ Conexão OK</p>";

    // 3. Testar query de usuários
    echo "<h2>3. Usuários</h2>";
    $stmt = $pdo->query("SELECT id, passaporte, nome, tipo FROM usuarios WHERE ativo = 1");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<p>Total: " . count($usuarios) . "</p>";
    echo "<pre>" . print_r($usuarios, true) . "</pre>";

    // 4. Testar query de obras
    echo "<h2>4. Obras</h2>";
    $stmt = $pdo->query("SELECT id, numero, nome FROM obras WHERE ativo = 1");
    $obras = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<p>Total: " . count($obras) . "</p>";
    echo "<pre>" . print_r($obras, true) . "</pre>";

} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erro: " . $e->getMessage() . "</p>";
}

// 5. Testar JWT
echo "<h2>5. JWT</h2>";
try {
    require_once __DIR__ . '/../includes/jwt.php';
    echo "<p style='color:green'>✅ JWT carregado</p>";
} catch (Exception $e) {
    echo "<p style='color:red'>❌ Erro: " . $e->getMessage() . "</p>";
}

// 6. Headers
echo "<h2>6. Headers recebidos</h2>";
echo "<pre>" . print_r(getallheaders(), true) . "</pre>";

echo "<hr><p><strong>APAGUE ESTE ARQUIVO DEPOIS!</strong></p>";
