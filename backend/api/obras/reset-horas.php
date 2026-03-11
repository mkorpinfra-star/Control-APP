<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';

// ─── JWT VALIDATION ────────────────────────────────────────────────────────
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Token no proporcionado']);
    exit;
}

$jwt = $matches[1];

try {
    // Decode JWT
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
        throw new Exception('Token inválido');
    }

    $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);

    if (!$payload || !isset($payload['user_id']) || !isset($payload['tenant_id'])) {
        throw new Exception('Token inválido');
    }

    // Verificar expiração
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        throw new Exception('Token expirado');
    }

    $auth = [
        'user_id' => $payload['user_id'],
        'tenant_id' => $payload['tenant_id'],
        'tipo' => $payload['tipo'] ?? null
    ];

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Token inválido: ' . $e->getMessage()]);
    exit;
}

$tenant_id = $auth['tenant_id'];
// ────────────────────────────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $obra_id = $input['obra_id'] ?? null;
    $funcionario_id = $input['funcionario_id'] ?? null; // null = todos

    if (!$obra_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'obra_id es requerido']);
        exit;
    }

    // Verificar se a obra pertence ao tenant
    $stmt = $pdo->prepare("SELECT id FROM obras WHERE id = ? AND tenant_id = ?");
    $stmt->execute([$obra_id, $tenant_id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Obra no encontrada']);
        exit;
    }

    $pdo->beginTransaction();

    if ($funcionario_id) {
        // Resetar apenas de um funcionário específico nesta obra
        $stmt = $pdo->prepare("
            DELETE FROM apontamentos
            WHERE obra_id = ?
              AND funcionario_id = ?
              AND tenant_id = ?
        ");
        $stmt->execute([$obra_id, $funcionario_id, $tenant_id]);
        $count = $stmt->rowCount();

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => "Se eliminaron {$count} registro(s) de horas del funcionario en esta obra",
            'count' => $count
        ]);
    } else {
        // Resetar de TODOS os funcionários nesta obra
        $stmt = $pdo->prepare("
            DELETE FROM apontamentos
            WHERE obra_id = ?
              AND tenant_id = ?
        ");
        $stmt->execute([$obra_id, $tenant_id]);
        $count = $stmt->rowCount();

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => "Se eliminaron {$count} registro(s) de horas de todos los funcionarios en esta obra",
            'count' => $count
        ]);
    }

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al resetear horas: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
