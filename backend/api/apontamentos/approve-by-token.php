<?php
/**
 * API PÚBLICA: Aprovar apontamento via token único (WhatsApp)
 *
 * GET /api/apontamentos/approve-by-token.php?token=XXX
 * - Retorna dados do apontamento para visualização
 *
 * POST /api/apontamentos/approve-by-token.php
 * - Aprovar ou rejeitar com assinatura
 *
 * SEM AUTENTICAÇÃO JWT - Link público para encarregado
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/email.php';
require_once __DIR__ . '/../../includes/notificacao_helper.php';

$pdo = getConnection();

// ==================== GET: Carregar dados do apontamento ====================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $token = isset($_GET['token']) ? trim($_GET['token']) : '';

    if (empty($token)) {
        http_response_code(400);
        echo json_encode(['error' => 'Token ausente']);
        exit;
    }

    try {
        // Buscar token válido e não usado
        $stmt = $pdo->prepare("
            SELECT at.*, a.status, a.funcionario_id, a.obra_id, a.semana_inicio, a.horas_diarias, a.total_horas,
                   u.nome as funcionario_nome, u.passaporte as funcionario_passaporte, u.foto_url as funcionario_foto,
                   o.numero as obra_numero, o.nome as obra_nome,
                   e.nome as encarregado_nome, e.telefone as encarregado_telefone
            FROM aprovacao_tokens at
            INNER JOIN apontamentos a ON a.id = at.apontamento_id
            INNER JOIN usuarios u ON u.id = a.funcionario_id AND u.tenant_id = at.tenant_id
            INNER JOIN obras o ON o.id = a.obra_id AND o.tenant_id = at.tenant_id
            LEFT JOIN encarregados e ON e.id = at.encarregado_id AND e.tenant_id = at.tenant_id
            WHERE at.token = ?
              AND at.usado = 0
              AND at.expira_em > NOW()
              AND a.status = 'enviado'
        ");
        $stmt->execute([$token]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            http_response_code(404);
            echo json_encode(['error' => 'Token inválido, já usado ou expirado']);
            exit;
        }

        // Decodificar horas
        $horas = json_decode($data['horas_diarias'], true);

        echo json_encode([
            'success' => true,
            'apontamento' => [
                'id' => $data['apontamento_id'],
                'funcionario_nome' => $data['funcionario_nome'],
                'funcionario_passaporte' => $data['funcionario_passaporte'],
                'funcionario_foto' => $data['funcionario_foto'],
                'obra_numero' => $data['obra_numero'],
                'obra_nome' => $data['obra_nome'],
                'semana_inicio' => $data['semana_inicio'],
                'horas_diarias' => $horas,
                'total_horas' => $data['total_horas'],
                'status' => $data['status']
            ],
            'encarregado' => [
                'nome' => $data['encarregado_nome']
            ]
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
    }

    exit;
}

// ==================== POST: Aprovar ou Rejeitar ====================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $token = isset($input['token']) ? trim($input['token']) : '';
    $acao = isset($input['acao']) ? trim($input['acao']) : ''; // 'aprovar' ou 'rejeitar'
    $assinatura = isset($input['assinatura']) ? $input['assinatura'] : null;
    $observacao = isset($input['observacao']) ? trim($input['observacao']) : '';

    if (empty($token) || empty($acao)) {
        http_response_code(400);
        echo json_encode(['error' => 'Token e ação são obrigatórios']);
        exit;
    }

    if ($acao === 'aprovar' && empty($assinatura)) {
        http_response_code(400);
        echo json_encode(['error' => 'Assinatura é obrigatória para aprovar']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Buscar token e apontamento
        $stmt = $pdo->prepare("
            SELECT at.*, a.status, a.funcionario_id, a.obra_id, a.semana_inicio, a.tenant_id
            FROM aprovacao_tokens at
            INNER JOIN apontamentos a ON a.id = at.apontamento_id
            WHERE at.token = ?
              AND at.usado = 0
              AND at.expira_em > NOW()
              AND a.status = 'enviado'
            FOR UPDATE
        ");
        $stmt->execute([$token]);
        $tokenData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$tokenData) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['error' => 'Token inválido, já usado ou expirado']);
            exit;
        }

        $apontamentoId = $tokenData['apontamento_id'];
        $encarregadoId = $tokenData['encarregado_id'];
        $tenant_id = $tokenData['tenant_id'];

        if ($acao === 'aprovar') {
            // Aprovar apontamento
            $stmt = $pdo->prepare("
                UPDATE apontamentos
                SET status = 'aprovado_encarregado',
                    aprovado_em = NOW(),
                    aprovado_por = ?,
                    assinatura_base64 = ?
                WHERE id = ? AND tenant_id = ?
            ");
            $stmt->execute([$encarregadoId, $assinatura, $apontamentoId, $tenant_id]);

            $mensagem = 'Apontamento aprovado com sucesso via WhatsApp';

        } elseif ($acao === 'rejeitar') {
            // Rejeitar apontamento
            $stmt = $pdo->prepare("
                UPDATE apontamentos
                SET status = 'rejeitado',
                    observacao_rejeicao = ?
                WHERE id = ? AND tenant_id = ?
            ");
            $stmt->execute([$observacao, $apontamentoId, $tenant_id]);

            $mensagem = 'Apontamento rejeitado. Funcionário será notificado.';
        }

        // Marcar token como usado
        $stmt = $pdo->prepare("
            UPDATE aprovacao_tokens
            SET usado = 1, usado_em = NOW()
            WHERE token = ?
        ");
        $stmt->execute([$token]);

        $pdo->commit();

        echo json_encode([
            'success' => true,
            'message' => $mensagem
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
    }

    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
