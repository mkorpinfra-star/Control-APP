<?php
/**
 * API: Funcionários que NÃO enviaram horas para uma obra/semana
 * GET /api/apontamentos/negligentes.php?obra_id=X&semana_inicio=YYYY-MM-DD
 *
 * Retorna os funcionários alocados na obra que ainda não têm apontamento
 * (ou têm rascunho/rejeitado) para a semana solicitada.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/jwt.php';

$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization']
            : (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '');

if (empty($authHeader)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$user  = validateJWT($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

if ($user['tipo'] !== 'admin' && $user['tipo'] !== 'encarregado') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$obraId       = isset($_GET['obra_id'])       ? intval($_GET['obra_id'])           : 0;
$semanaInicio = isset($_GET['semana_inicio'])  ? trim($_GET['semana_inicio'])        : '';

// Se não passaram obra_id, retornar para TODAS as obras do encarregado
$todasObras = ($obraId === 0);

try {
    $pdo = getConnection();

    // Montar cláusula de obra
    if ($todasObras) {
        if ($user['tipo'] === 'encarregado') {
            // Só obras que o encarregado gerencia
            $obraClause  = "AND o.encarregado_id = :enc_id";
            $obraParams  = [':enc_id' => $user['id']];
        } else {
            // Admin vê todas
            $obraClause = '';
            $obraParams = [];
        }
    } else {
        $obraClause = "AND fo.obra_id = :obra_id";
        $obraParams = [':obra_id' => $obraId];
    }

    // Se não passou semana, usar a semana corrente (segunda-feira)
    if (!$semanaInicio) {
        $hoje = new DateTime();
        $diaSemana = (int)$hoje->format('N');
        if ($diaSemana !== 1) {
            $hoje->modify('last monday');
        }
        $semanaInicio = $hoje->format('Y-m-d');
    }

    // Buscar funcionários alocados e seu status nesta semana
    $sql = "
        SELECT
            u.id            AS funcionario_id,
            u.nome          AS funcionario_nome,
            u.foto_url,
            o.id            AS obra_id,
            o.numero        AS obra_numero,
            o.nome          AS obra_nome,
            COALESCE(a.status, 'sem_registro') AS status_semana,
            a.id            AS apontamento_id,
            a.semana_inicio
        FROM funcionario_obra fo
        INNER JOIN usuarios u ON u.id = fo.funcionario_id
        INNER JOIN obras    o ON o.id = fo.obra_id
        LEFT JOIN apontamentos a
               ON a.funcionario_id = fo.funcionario_id
              AND a.obra_id        = fo.obra_id
              AND a.semana_inicio  = :semana_inicio
        WHERE fo.ativo = 1
          AND u.ativo  = 1
          AND o.ativo  = 1
          AND u.tipo   NOT IN ('admin', 'encarregado')
          $obraClause
        ORDER BY o.nome, u.nome
    ";

    $params = array_merge([':semana_inicio' => $semanaInicio], $obraParams);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Separar por categoria
    $semRegistro  = [];   // nunca abriram a semana
    $rascunho     = [];   // salvaram mas não enviaram
    $enviado      = [];   // enviado, aguardando aprovação
    $aprovado     = [];   // aprovado_encarregado ou aprovado
    $rejeitado    = [];   // rejeitado — precisa corrigir

    foreach ($rows as $row) {
        $entry = [
            'funcionario_id'   => $row['funcionario_id'],
            'funcionario_nome' => $row['funcionario_nome'],
            'foto_url'         => $row['foto_url'],
            'obra_id'          => $row['obra_id'],
            'obra_numero'      => $row['obra_numero'],
            'obra_nome'        => $row['obra_nome'],
            'status'           => $row['status_semana'],
            'apontamento_id'   => $row['apontamento_id'],
        ];

        switch ($row['status_semana']) {
            case 'sem_registro': $semRegistro[] = $entry; break;
            case 'rascunho':     $rascunho[]    = $entry; break;
            case 'enviado':      $enviado[]      = $entry; break;
            case 'rejeitado':    $rejeitado[]    = $entry; break;
            default:             $aprovado[]     = $entry; break; // aprovado_encarregado / aprovado
        }
    }

    // Pendentes = sem registro + rascunho + rejeitado (não enviaram)
    $pendentes = array_merge($semRegistro, $rascunho, $rejeitado);

    echo json_encode([
        'success'       => true,
        'semana_inicio' => $semanaInicio,
        'total'         => count($rows),
        'pendentes'     => $pendentes,       // ainda não enviaram
        'enviado'       => $enviado,         // enviado, esperando aprovação
        'aprovado'      => $aprovado,        // já aprovado
        'rejeitado'     => $rejeitado,       // rejeitado, precisa corrigir
        'sem_registro'  => $semRegistro,     // nunca abriu a semana
        'rascunho'      => $rascunho,        // salvou mas não enviou
        'contagem' => [
            'sem_registro'  => count($semRegistro),
            'rascunho'      => count($rascunho),
            'enviado'       => count($enviado),
            'aprovado'      => count($aprovado),
            'rejeitado'     => count($rejeitado),
            'total_alocados'=> count($rows),
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
