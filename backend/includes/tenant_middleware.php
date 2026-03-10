<?php
/**
 * Middleware para validação de Tenant
 * Extrai tenant_id do JWT e valida acesso
 */

require_once __DIR__ . '/jwt.php';

/**
 * Valida o token JWT e retorna o tenant_id
 * @return array ['user_id' => int, 'tenant_id' => int, 'tipo' => string]
 * @throws Exception se token inválido ou tenant suspenso
 */
function validateTenantAccess() {
    // Pegar token do header Authorization
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized', 'message' => 'Token não fornecido']);
        exit;
    }

    $token = $matches[1];

    try {
        $payload = validateJWT($token);

        if (!isset($payload['tenant_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Token sem tenant_id']);
            exit;
        }

        // Validar se tenant ainda está ativo
        $pdo = getConnection();
        $stmt = $pdo->prepare("
            SELECT id, nome, status, license_type, trial_ends_at, license_expires_at
            FROM tenants
            WHERE id = ? AND deleted_at IS NULL
        ");
        $stmt->execute([$payload['tenant_id']]);
        $tenant = $stmt->fetch();

        if (!$tenant) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden', 'message' => 'Tenant não encontrado']);
            exit;
        }

        // Verificar status
        if ($tenant['status'] === 'suspenso') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden', 'message' => 'Conta suspensa. Entre em contato com o suporte.']);
            exit;
        }

        if ($tenant['status'] === 'cancelado') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden', 'message' => 'Conta cancelada']);
            exit;
        }

        // Verificar trial expirado
        if ($tenant['status'] === 'trial' && $tenant['trial_ends_at']) {
            $trial_end = new DateTime($tenant['trial_ends_at']);
            if (new DateTime() > $trial_end) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden', 'message' => 'Período de teste expirado. Faça upgrade do plano.']);
                exit;
            }
        }

        // Verificar licença expirada
        if ($tenant['license_expires_at']) {
            $license_end = new DateTime($tenant['license_expires_at']);
            if (new DateTime() > $license_end) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden', 'message' => 'Licença expirada. Renove sua assinatura.']);
                exit;
            }
        }

        return [
            'user_id' => $payload['id'],
            'tenant_id' => $payload['tenant_id'],
            'tipo' => $payload['tipo'],
            'nome' => $payload['nome'],
            'email' => $payload['email'],
            'tabela' => $payload['tabela'],
        ];

    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized', 'message' => 'Token inválido: ' . $e->getMessage()]);
        exit;
    }
}

/**
 * Valida se o usuário é admin ou super_admin
 * @param array $auth Resultado de validateTenantAccess()
 * @return void
 */
function requireAdmin($auth) {
    if ($auth['tipo'] !== 'admin' && $auth['tipo'] !== 'super_admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden', 'message' => 'Acesso restrito a administradores']);
        exit;
    }
}

/**
 * Valida se o usuário é super_admin (multi-tenant admin)
 * @param array $auth Resultado de validateTenantAccess()
 * @return void
 */
function requireSuperAdmin($auth) {
    if ($auth['tipo'] !== 'super_admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden', 'message' => 'Acesso restrito a super administradores']);
        exit;
    }
}
