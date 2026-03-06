<?php
/**
 * Download Export File
 * Força download do arquivo exportado
 */

require_once '../../includes/auth.php';

// Verificar autenticação
$user = authMiddleware(['admin', 'encarregado']);

$filename = $_GET['file'] ?? '';

if (empty($filename)) {
    http_response_code(400);
    die('Arquivo não especificado');
}

// Validar nome do arquivo (segurança)
if (!preg_match('/^analytics_\d{4}-\d{2}-\d{2}_\d{6}\.csv$/', $filename)) {
    http_response_code(400);
    die('Nome de arquivo inválido');
}

$filepath = __DIR__ . '/../../temp/' . $filename;

if (!file_exists($filepath)) {
    http_response_code(404);
    die('Arquivo não encontrado');
}

// Headers para download
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . filesize($filepath));
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: public');

// Enviar arquivo
readfile($filepath);

// Agendar remoção do arquivo temporário (após 1 hora)
// Em produção, usar cron job para limpar temp/
// Por enquanto, deletar arquivos antigos (> 1 hora)
$tempDir = __DIR__ . '/../../temp/';
if ($handle = opendir($tempDir)) {
    while (false !== ($file = readdir($handle))) {
        if ($file !== '.' && $file !== '..' && is_file($tempDir . $file)) {
            if (time() - filemtime($tempDir . $file) > 3600) { // 1 hora
                @unlink($tempDir . $file);
            }
        }
    }
    closedir($handle);
}

exit;
