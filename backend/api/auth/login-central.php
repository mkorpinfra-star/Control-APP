<?php
/**
 * API: Login Centralizado PuntoClicks
 * POST /api/auth/login-central.php
 *
 * Identifica automaticamente o tenant pelo email do usuário
 * Retorna token + redirect_url para o subdomain correto
 */

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

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Obter dados do request
$input = json_decode(file_get_contents('php://input'), true);
$emailOrPassport = trim($input['email'] ?? ''); // Pode ser email OU passaporte
$password = $input['password'] ?? '';

if (empty($emailOrPassport) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email/Passaporte e senha são obrigatórios'
    ]);
    exit;
}

try {
    $pdo = getConnection();

    // Buscar usuário por EMAIL ou PASSAPORTE + dados do tenant
    // Tenta em usuarios primeiro (com tenant)
    $stmt = $pdo->prepare("
        SELECT
            u.id,
            u.passaporte,
            u.senha_hash,
            u.nome,
            u.email,
            u.tipo,
            u.foto_url,
            u.tenant_id,
            'usuario' as tabela,
            t.id as tenant_id,
            t.slug as tenant_slug,
            t.nome as tenant_nome,
            t.logo_url as tenant_logo,
            t.primary_color as tenant_color,
            t.status as tenant_status,
            t.license_type,
            t.trial_ends_at,
            t.license_expires_at
        FROM usuarios u
        INNER JOIN tenants t ON u.tenant_id = t.id
        WHERE (u.email = ? OR u.passaporte = ?)
          AND u.ativo = 1
          AND t.deleted_at IS NULL
    ");
    $stmt->execute([$emailOrPassport, $emailOrPassport]);
    $user = $stmt->fetch();

    // FALLBACK: Buscar usuário sem tenant_id (sistema antigo j2s.ad)
    if (!$user) {
        $stmt = $pdo->prepare("
            SELECT
                id,
                passaporte,
                senha_hash,
                nome,
                email,
                tipo,
                foto_url,
                NULL as tenant_id,
                'usuario' as tabela
            FROM usuarios
            WHERE (email = ? OR passaporte = ?)
              AND ativo = 1
              AND (tenant_id IS NULL OR tenant_id = 0)
        ");
        $stmt->execute([$emailOrPassport, $emailOrPassport]);
        $user = $stmt->fetch();

        // Se encontrou usuário antigo, atribuir tenant padrão "j2s"
        if ($user) {
            $user['tenant_id'] = 1; // Assumindo que tenant j2s tem ID 1
            $user['tenant_slug'] = 'j2s';
            $user['tenant_nome'] = 'J2S Enginyeria';
            $user['tenant_logo'] = null;
            $user['tenant_color'] = '#CE0201';
            $user['tenant_status'] = 'ativo';
            $user['license_type'] = 'enterprise';
            $user['trial_ends_at'] = null;
            $user['license_expires_at'] = null;
        }
    }

    // Se não encontrou em usuarios, tentar em encarregados (com tenant)
    if (!$user) {
        $stmt = $pdo->prepare("
            SELECT
                e.id,
                e.passaporte,
                e.senha as senha_hash,
                e.nome,
                e.email,
                'encarregado' as tipo,
                NULL as foto_url,
                e.tenant_id,
                'encarregado' as tabela,
                t.id as tenant_id,
                t.slug as tenant_slug,
                t.nome as tenant_nome,
                t.logo_url as tenant_logo,
                t.primary_color as tenant_color,
                t.status as tenant_status,
                t.license_type,
                t.trial_ends_at,
                t.license_expires_at
            FROM encarregados e
            INNER JOIN tenants t ON e.tenant_id = t.id
            WHERE (e.email = ? OR e.passaporte = ?)
              AND e.ativo = 1
              AND t.deleted_at IS NULL
        ");
        $stmt->execute([$emailOrPassport, $emailOrPassport]);
        $user = $stmt->fetch();

        // FALLBACK: Buscar encarregado sem tenant_id (sistema antigo)
        if (!$user) {
            $stmt = $pdo->prepare("
                SELECT
                    id,
                    passaporte,
                    senha as senha_hash,
                    nome,
                    email,
                    'encarregado' as tipo,
                    NULL as foto_url,
                    NULL as tenant_id,
                    'encarregado' as tabela
                FROM encarregados
                WHERE (email = ? OR passaporte = ?)
                  AND ativo = 1
                  AND (tenant_id IS NULL OR tenant_id = 0)
            ");
            $stmt->execute([$emailOrPassport, $emailOrPassport]);
            $user = $stmt->fetch();

            // Se encontrou encarregado antigo, atribuir tenant padrão "j2s"
            if ($user) {
                $user['tenant_id'] = 1;
                $user['tenant_slug'] = 'j2s';
                $user['tenant_nome'] = 'J2S Enginyeria';
                $user['tenant_logo'] = null;
                $user['tenant_color'] = '#CE0201';
                $user['tenant_status'] = 'ativo';
                $user['license_type'] = 'enterprise';
                $user['trial_ends_at'] = null;
                $user['license_expires_at'] = null;
            }
        }
    }

    // Usuário não encontrado
    if (!$user) {
        error_log("❌ Usuário não encontrado: $emailOrPassport");
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Passaporte/Email ou senha incorretos'
        ]);
        exit;
    }

    // Verificar senha
    if (!password_verify($password, $user['senha_hash'])) {
        error_log("❌ Senha incorreta para: $emailOrPassport");
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Passaporte/Email ou senha incorretos'
        ]);
        exit;
    }

    // Verificar status do tenant
    if ($user['tenant_status'] === 'suspenso') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Conta suspensa. Entre em contato com o suporte.',
            'error_code' => 'TENANT_SUSPENDED'
        ]);
        exit;
    }

    if ($user['tenant_status'] === 'cancelado') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Conta cancelada. Entre em contato com o suporte.',
            'error_code' => 'TENANT_CANCELLED'
        ]);
        exit;
    }

    // Verificar trial expirado
    if ($user['tenant_status'] === 'trial' && $user['trial_ends_at']) {
        $trial_end = new DateTime($user['trial_ends_at']);
        if (new DateTime() > $trial_end) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Período de teste expirado. Faça upgrade do seu plano.',
                'error_code' => 'TRIAL_EXPIRED',
                'trial_ends_at' => $user['trial_ends_at']
            ]);
            exit;
        }
    }

    // Verificar licença expirada
    if ($user['license_expires_at']) {
        $license_end = new DateTime($user['license_expires_at']);
        if (new DateTime() > $license_end) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Licença expirada. Renove sua assinatura.',
                'error_code' => 'LICENSE_EXPIRED',
                'license_expires_at' => $user['license_expires_at']
            ]);
            exit;
        }
    }

    // Gerar token JWT
    $payload = [
        'id' => $user['id'],
        'passaporte' => $user['passaporte'],
        'nome' => $user['nome'],
        'email' => $user['email'],
        'tipo' => $user['tipo'],
        'tabela' => $user['tabela'],
        'tenant_id' => $user['tenant_id'],
        'tenant_slug' => $user['tenant_slug'],
        'empresa_id' => $user['tenant_id'] // COMPATIBILIDADE: empresa_id = tenant_id
    ];

    $token = generateJWT($payload);

    // Remover senha do retorno
    unset($user['senha_hash']);

    // Log de auditoria
    error_log("✅ Login bem-sucedido: {$user['email']} (tenant: {$user['tenant_slug']}, tipo: {$user['tipo']})");

    // Retornar sucesso com todos os dados necessários
    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'nome' => $user['nome'],
            'email' => $user['email'],
            'tipo' => $user['tipo'],
            'foto_url' => $user['foto_url'],
            'tenant_id' => $user['tenant_id']
        ],
        'tenant' => [
            'id' => $user['tenant_id'],
            'slug' => $user['tenant_slug'],
            'nome' => $user['tenant_nome'],
            'logo_url' => $user['tenant_logo'],
            'primary_color' => $user['tenant_color'],
            'status' => $user['tenant_status'],
            'license_type' => $user['license_type']
        ]
    ]);

} catch (Exception $e) {
    error_log("❌ Erro no login centralizado: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro no servidor. Tente novamente.',
        'error' => $e->getMessage()
    ]);
}
