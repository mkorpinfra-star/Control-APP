<?php
/**
 * SCRIPT DE CONFIGURAÇÃO - Execute uma vez no servidor
 * Acesse: https://j2s.ad/login/backend/setup-admin.php
 * DEPOIS APAGUE ESTE ARQUIVO!
 */

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/config/database.php';

echo "<h1>Setup Admin J2S</h1>";

try {
    $pdo = getConnection();

    // Senha admin123 com hash correto
    $senha = 'admin123';
    $hash = password_hash($senha, PASSWORD_DEFAULT);

    echo "<p>Hash gerado: <code>$hash</code></p>";

    // Verificar se ADMIN existe
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE passaporte = 'ADMIN'");
    $stmt->execute();
    $exists = $stmt->fetch();

    if ($exists) {
        // Atualizar senha e tipo
        $stmt = $pdo->prepare("UPDATE usuarios SET senha_hash = ?, tipo = 'admin' WHERE passaporte = 'ADMIN'");
        $stmt->execute([$hash]);
        echo "<p style='color: green;'>✅ Usuário ADMIN atualizado!</p>";
    } else {
        // Criar novo
        $stmt = $pdo->prepare("INSERT INTO usuarios (passaporte, senha_hash, nome, email, tipo, ativo) VALUES ('ADMIN', ?, 'Administrador', 'admin@j2s.ad', 'admin', 1)");
        $stmt->execute([$hash]);
        echo "<p style='color: green;'>✅ Usuário ADMIN criado!</p>";
    }

    echo "<hr>";
    echo "<h2>Credenciais:</h2>";
    echo "<p><strong>Passaporte:</strong> ADMIN</p>";
    echo "<p><strong>Senha:</strong> admin123</p>";
    echo "<hr>";
    echo "<p style='color: red;'><strong>⚠️ APAGUE ESTE ARQUIVO APÓS USAR!</strong></p>";
    echo "<p>Caminho: /login/backend/setup-admin.php</p>";

} catch (Exception $e) {
    echo "<p style='color: red;'>Erro: " . $e->getMessage() . "</p>";
}
