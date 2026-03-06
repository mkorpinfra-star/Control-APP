<?php
// Teste simples - acesse: https://j2s.ad/login/backend/test.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'OK',
    'message' => 'PHP funcionando!',
    'php_version' => PHP_VERSION,
    'time' => date('Y-m-d H:i:s'),
    'path' => __DIR__
]);
