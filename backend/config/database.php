<?php
/**
 * Configuração do Banco de Dados
 * Sistema de Marcação de Ponto
 */

// Configurações do banco
define('DB_HOST', 'localhost');
define('DB_NAME', 'u268549871_saaas'); // Banco novo puntoclicks.com
define('DB_USER', 'u268549871_saaas');
define('DB_PASS', 'Legolego0304!@');
define('DB_CHARSET', 'utf8mb4');

// Conexão PDO
function getConnection()
{
    static $pdo = null;

    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    return $pdo;
}

// Helper: Obter configuração do banco
function getConfig($chave)
{
    $pdo = getConnection();
    $stmt = $pdo->prepare("SELECT valor FROM configuracoes WHERE chave = ?");
    $stmt->execute([$chave]);
    $result = $stmt->fetch();
    return $result ? $result['valor'] : null;
}

// Helper: Salvar configuração
function setConfig($chave, $valor)
{
    $pdo = getConnection();
    $stmt = $pdo->prepare("INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?");
    return $stmt->execute([$chave, $valor, $valor]);
}
