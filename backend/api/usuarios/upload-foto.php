<?php
/**
 * API: Upload de Foto do Funcionário
 * POST /api/usuarios/upload-foto.php
 * Converte para WebP e salva
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';

// Verificar autenticação
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader) || strpos($authHeader, 'Bearer ') !== 0) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$payload = validateJWT($token);

if (!$payload) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Verificar se tem arquivo
$sourceImage = null;
$input = json_decode(file_get_contents('php://input'), true);
$base64 = isset($input['foto']) ? $input['foto'] : null;

if ($base64) {
    // Processar base64
    $base64 = preg_replace('#^data:image/\\w+;base64,#i', '', $base64);
    $imageData = base64_decode($base64);

    if (!$imageData) {
        http_response_code(400);
        echo json_encode(['error' => 'Base64 inválido']);
        exit;
    }

    $sourceImage = imagecreatefromstring($imageData);
} elseif (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
    // Processar arquivo
    $file = $_FILES['foto'];
    $mime = mime_content_type($file['tmp_name']);

    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($mime, $allowed)) {
        http_response_code(400);
        echo json_encode(['error' => 'Formato de imagem não suportado']);
        exit;
    }

    $sourceImage = imagecreatefromstring(file_get_contents($file['tmp_name']));
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhuma foto enviada']);
    exit;
}

if (!$sourceImage) {
    http_response_code(400);
    echo json_encode(['error' => 'Não foi possível processar a imagem']);
    exit;
}

try {
    $pdo = getConnection();
    $userId = $payload['id'];

    // Redimensionar para 200x200 (quadrado)
    $width = imagesx($sourceImage);
    $height = imagesy($sourceImage);
    $size = min($width, $height);

    // Criar imagem quadrada
    $thumb = imagecreatetruecolor(200, 200);

    // Crop centralizado
    $srcX = ($width - $size) / 2;
    $srcY = ($height - $size) / 2;

    imagecopyresampled($thumb, $sourceImage, 0, 0, $srcX, $srcY, 200, 200, $size, $size);

    // Criar diretório se não existir
    $uploadDir = __DIR__ . '/../../uploads/fotos/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Nome do arquivo
    $filename = 'user_' . $userId . '_' . time() . '.webp';
    $filepath = $uploadDir . $filename;

    // Salvar como WebP (qualidade 80)
    imagewebp($thumb, $filepath, 80);

    // Limpar memória
    imagedestroy($sourceImage);
    imagedestroy($thumb);

    // URL para acesso
    $fotoUrl = '/login/backend/uploads/fotos/' . $filename;

    // Atualizar no banco
    $stmt = $pdo->prepare("UPDATE usuarios SET foto_url = ? WHERE id = ?");
    $stmt->execute([$fotoUrl, $userId]);

    echo json_encode([
        'success' => true,
        'foto_url' => $fotoUrl,
        'message' => 'Foto atualizada com sucesso'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
