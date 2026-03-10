<?php
/**
 * API: Trocar Senha do Usuário
 * POST /api/usuarios/change-password.php
 * MULTI-TENANT: Isolado por tenant_id
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
require_once __DIR__ . '/../../includes/tenant_middleware.php';

// Validar acesso multi-tenant
$auth = validateTenantAccess();
$tenant_id = $auth['tenant_id'];

// Só aceita POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Pegar dados
$data = json_decode(file_get_contents('php://input'), true);

$current_password = $data['current_password'] ?? '';
$new_password = $data['new_password'] ?? '';

// Validações
if (empty($current_password) || empty($new_password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios']);
    exit;
}

if (strlen($new_password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La nueva contraseña debe tener al menos 6 caracteres']);
    exit;
}

try {
    $db = getConnection();

    // Buscar usuário atual (filtrado por tenant)
    $stmt = $db->prepare("SELECT senha_hash FROM usuarios WHERE id = ? AND tenant_id = ?");
    $stmt->execute([$auth['user_id'], $tenant_id]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit;
    }

    // Verificar senha atual
    if (!password_verify($current_password, $usuario['senha_hash'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Contraseña actual incorrecta']);
        exit;
    }

    // Hash da nova senha
    $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);

    // Atualizar senha (filtrado por tenant)
    $stmt = $db->prepare("UPDATE usuarios SET senha_hash = ? WHERE id = ? AND tenant_id = ?");
    $stmt->execute([$new_password_hash, $auth['user_id'], $tenant_id]);

    echo json_encode([
        'success' => true,
        'message' => 'Contraseña cambiada con éxito'
    ]);

} catch (Exception $e) {
    error_log("Erro ao alterar senha: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al cambiar la contraseña']);
}
