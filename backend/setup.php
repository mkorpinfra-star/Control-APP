<?php
/**
 * Script de Setup - Execute uma vez para criar senhas seguras
 * Acesse: https://j2s.ad/backend/setup.php
 * APAGUE ESTE ARQUIVO APÓS USAR!
 */

require_once __DIR__ . '/config/database.php';

// Novas senhas (altere conforme necessário)
$senhas = [
    'ENC001' => 'J2S@Encargado2026',   // Encarregado
    'FUNC001' => 'J2S@Func001',         // Funcionário 1
    'FUNC002' => 'J2S@Func002',         // Funcionário 2
];

echo "<h1>Setup do Sistema de Control Horario</h1>";
echo "<h2>Atualizando senhas...</h2>";

try {
    $pdo = getConnection();

    foreach ($senhas as $passaporte => $senha) {
        $hash = password_hash($senha, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE usuarios SET senha_hash = ? WHERE passaporte = ?");
        $stmt->execute([$hash, $passaporte]);

        if ($stmt->rowCount() > 0) {
            echo "<p>✅ <strong>$passaporte</strong>: Senha atualizada para <code>$senha</code></p>";
        } else {
            echo "<p>⚠️ <strong>$passaporte</strong>: Usuário não encontrado</p>";
        }
    }

    echo "<hr>";
    echo "<h2>Credenciais Atualizadas:</h2>";
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>Perfil</th><th>Passaporte</th><th>Senha</th></tr>";
    echo "<tr><td>Encarregado</td><td>ENC001</td><td>J2S@Encargado2026</td></tr>";
    echo "<tr><td>Funcionário</td><td>FUNC001</td><td>J2S@Func001</td></tr>";
    echo "<tr><td>Funcionário</td><td>FUNC002</td><td>J2S@Func002</td></tr>";
    echo "</table>";

    echo "<hr>";
    echo "<h2 style='color:red;'>⚠️ IMPORTANTE: APAGUE ESTE ARQUIVO AGORA!</h2>";
    echo "<p>Por segurança, delete o arquivo <code>setup.php</code> do servidor após usar.</p>";

} catch (Exception $e) {
    echo "<p style='color:red;'>❌ Erro: " . $e->getMessage() . "</p>";
}
