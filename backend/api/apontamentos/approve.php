<?php
/**
 * API: Aprovar apontamento
 * PUT /api/apontamentos/approve.php
 * 
 * Fluxo de Dupla Aprovação:
 * - Encarregado aprova: status 'enviado' → 'aprovado_encarregado' (envia email para cliente)
 * - Admin/RH aprova: status 'aprovado_encarregado' → 'aprovado' (envia email final para J2S)
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';
require_once __DIR__ . '/../../includes/email.php';
require_once __DIR__ . '/../../includes/notificacao_helper.php';

// Autenticação
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user = validateJWT($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Apenas admin e encarregado podem aprovar
if ($user['tipo'] !== 'admin' && $user['tipo'] !== 'encarregado') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$apontamentoId = isset($input['id']) ? $input['id'] : null;
$assinatura = isset($input['assinatura']) ? $input['assinatura'] : null;
$emailCopia = isset($input['email_copia']) ? $input['email_copia'] : null;

if (!$apontamentoId || !$assinatura) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad request', 'message' => 'ID y firma son obligatorios']);
    exit;
}

try {
    $pdo = getConnection();

    // Determinar qual status buscar baseado no tipo de usuário
    if ($user['tipo'] === 'admin') {
        // Admin aprova registros que já foram aprovados pelo encarregado
        $statusBuscar = 'aprovado_encarregado';
        $novoStatus = 'aprovado';

        $stmt = $pdo->prepare("
            SELECT a.*, 
                   u.nome as funcionario_nome, u.email as funcionario_email, u.foto_url as funcionario_foto,
                   o.numero as obra_numero, o.nome as obra_nome,
                   c.nome as cliente_nome, 
                   COALESCE(c.email_financeiro, c.email) as email_financeiro,
                   enc.nome as encarregado_nome
            FROM apontamentos a
            INNER JOIN usuarios u ON u.id = a.funcionario_id
            INNER JOIN obras o ON o.id = a.obra_id
            LEFT JOIN clientes c ON c.id = o.cliente_id
            LEFT JOIN usuarios enc ON enc.id = a.aprovado_por
            WHERE a.id = ? AND a.status = ?
        ");
        $stmt->execute([$apontamentoId, $statusBuscar]);
    } else {
        // Encarregado aprova registros enviados pelos funcionários
        $statusBuscar = 'enviado';
        $novoStatus = 'aprovado_encarregado';

        $stmt = $pdo->prepare("
            SELECT a.*, 
                   u.nome as funcionario_nome, u.email as funcionario_email, u.foto_url as funcionario_foto,
                   o.numero as obra_numero, o.nome as obra_nome,
                   c.nome as cliente_nome, 
                   COALESCE(c.email_financeiro, c.email) as email_financeiro
            FROM apontamentos a
            INNER JOIN usuarios u ON u.id = a.funcionario_id
            INNER JOIN obras o ON o.id = a.obra_id
            LEFT JOIN clientes c ON c.id = o.cliente_id
            WHERE a.id = ? AND o.encarregado_id = ? AND a.status = ?
        ");
        $stmt->execute([$apontamentoId, $user['id'], $statusBuscar]);
    }

    $apontamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$apontamento) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found', 'message' => 'Registro no encontrado o sin permiso']);
        exit;
    }

    // Atualizar status
    if ($user['tipo'] === 'admin') {
        // Admin aprova - atualiza aprovação final
        $stmt = $pdo->prepare("
            UPDATE apontamentos 
            SET status = ?, aprovado_admin_em = NOW(), aprovado_admin_por = ?, assinatura_admin_base64 = ?
            WHERE id = ?
        ");
        $stmt->execute([$novoStatus, $user['id'], $assinatura, $apontamentoId]);

        // Preparar dados para e-mail final (para J2S)
        $apontamento['aprovado_admin_por_nome'] = $user['nome'];
        $apontamento['aprovado_admin_em'] = date('d/m/Y H:i');

        // Enviar email final para J2S
        $emailJ2S = getConfig('email_j2s') ?: 'contactes@j2s.ad';
        sendFinalApproval($apontamento, $assinatura, $emailJ2S);

        $mensagem = 'Registro aprobado definitivamente y enviado a ' . $emailJ2S;

    } else {
        // Encarregado aprova - primeira aprovação
        $stmt = $pdo->prepare("
            UPDATE apontamentos
            SET status = ?, aprovado_em = NOW(), aprovado_por = ?, assinatura_base64 = ?
            WHERE id = ?
        ");
        $stmt->execute([$novoStatus, $user['id'], $assinatura, $apontamentoId]);

        // Preparar dados para e-mail
        $apontamento['aprovado_por_nome'] = $user['nome'];
        $apontamento['aprovado_em'] = date('d/m/Y H:i');

        // Notificar admin/RH que há registro pendente
        $emailAdmin = getConfig('email_admin') ?: getConfig('email_j2s') ?: 'contactes@j2s.ad';
        sendAdminNotification($apontamento, $emailAdmin);

        // ── Verificar se TODOS os funcionários da obra naquela semana já foram aprovados ──
        // Só envia email ao financeiro quando o último funcionário for aprovado
        $obraId      = $apontamento['obra_id'];
        $semanaInicio = $apontamento['semana_inicio'];

        // Total de funcionários que lançaram horas nessa semana/obra (independente de status)
        $stmtTotal = $pdo->prepare("
            SELECT COUNT(DISTINCT funcionario_id)
            FROM apontamentos
            WHERE obra_id = ?
              AND semana_inicio = ?
              AND status IN ('enviado', 'aprovado_encarregado', 'aprovado')
        ");
        $stmtTotal->execute([$obraId, $semanaInicio]);
        $totalAlocados = (int)$stmtTotal->fetchColumn();

        // Total já aprovados nessa semana (incluindo o que acabou de ser aprovado)
        $stmtAprovados = $pdo->prepare("
            SELECT COUNT(DISTINCT funcionario_id)
            FROM apontamentos
            WHERE obra_id = ?
              AND semana_inicio = ?
              AND status IN ('aprovado_encarregado', 'aprovado')
        ");
        $stmtAprovados->execute([$obraId, $semanaInicio]);
        $totalAprovados = (int)$stmtAprovados->fetchColumn();

        $todosAprovados = ($totalAlocados > 0 && $totalAprovados >= $totalAlocados);

        $emailsEnviados = [];

        if ($todosAprovados) {
            // Todos aprovaram — envia O email consolidado ao financeiro
            $emailFinanceiro = $apontamento['email_financeiro']
                            ?: getConfig('email_financeiro')
                            ?: getConfig('email_j2s')
                            ?: 'contactes@j2s.ad';

            $enviado = sendToFinance($apontamento, $assinatura, $emailFinanceiro);
            if ($enviado) {
                $emailsEnviados[] = $emailFinanceiro;
            } else {
                error_log("[approve.php] sendToFinance FALHOU para: $emailFinanceiro - obra:{$apontamento['obra_id']} semana:{$semanaInicio}");
            }

            // Cópia adicional se solicitado
            if ($emailCopia && filter_var($emailCopia, FILTER_VALIDATE_EMAIL)) {
                sendToFinance($apontamento, $assinatura, $emailCopia);
                $emailsEnviados[] = $emailCopia;
            }
        }

        $mensagem = 'Registro aprobado por encargado';
        $mensagem .= " ({$totalAprovados}/{$totalAlocados} empleados aprobados esta semana)";
        if (count($emailsEnviados) > 0) {
            $mensagem .= ' — Informe enviado al financiero: ' . implode(', ', $emailsEnviados);
        } else if ($todosAprovados) {
            $mensagem .= ' — Todos aprobados pero el email no se pudo enviar (verificar SMTP).';
        } else {
            $mensagem .= ' — Esperando aprobación de los demás empleados para enviar informe.';
        }
        $mensagem .= ' Pendiente de aprobación final por Admin/RH.';
    }

    // Criar notificação
    $config = getNotificacaoConfig('apontamento_aprovado');
    criarNotificacao(
        'apontamento_aprovado',
        'Horas aprobadas',
        "Horas de {$apontamento['funcionario_nome']} en obra #{$apontamento['obra_numero']} aprobadas",
        [
            'icone' => $config['icone'],
            'cor' => $config['cor'],
            'url' => '/approvals',
            'entidade_tipo' => 'apontamento',
            'entidade_id' => $apontamentoId,
            'usuario_id' => $user['id'],
            'usuario_nome' => $user['nome'] ?? 'Admin',
            'usuario_tipo' => $user['tipo']
        ]
    );

    $responseData = [
        'success'     => true,
        'message'     => $mensagem,
        'novo_status' => $novoStatus
    ];

    // Para o encarregado, retornar progresso de aprovação da semana
    if ($user['tipo'] !== 'admin' && isset($totalAprovados)) {
        $responseData['aprovados']       = $totalAprovados;
        $responseData['total_alocados']  = $totalAlocados;
        $responseData['todos_aprovados'] = $todosAprovados;
    }

    echo json_encode($responseData);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
