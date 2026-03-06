<?php
/**
 * API: Relatório mensal por obra
 * GET /api/relatorios/mensal.php?obra_id=X&mes=2024-02
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

// Apenas admin e encarregado podem ver relatórios
if ($user['tipo'] !== 'admin' && $user['tipo'] !== 'encarregado') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

$obra_id = isset($_GET['obra_id']) ? intval($_GET['obra_id']) : 0;
$mes = isset($_GET['mes']) ? $_GET['mes'] : date('Y-m'); // formato: 2024-02

if (!$obra_id) {
    http_response_code(400);
    echo json_encode(['error' => 'obra_id es obligatorio']);
    exit;
}

try {
    $pdo = getConnection();

    // Buscar valores de hora configurados
    $stmt = $pdo->query("SELECT * FROM config_valores ORDER BY id DESC LIMIT 1");
    $config = $stmt->fetch(PDO::FETCH_ASSOC);

    $valor_normal = isset($config['valor_hora_normal']) ? floatval($config['valor_hora_normal']) : 21.00;
    $valor_extra = isset($config['valor_hora_extra']) ? floatval($config['valor_hora_extra']) : 28.00;
    $valor_noturna = isset($config['valor_hora_noturna']) ? floatval($config['valor_hora_noturna']) : 30.00;

    // Buscar dados da obra
    $stmt = $pdo->prepare("
        SELECT o.*, c.nome as cliente_nome, c.email_financeiro as cliente_email_financeiro
        FROM obras o
        LEFT JOIN clientes c ON o.cliente_id = c.id
        WHERE o.id = ?
    ");
    $stmt->execute([$obra_id]);
    $obra = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$obra) {
        http_response_code(404);
        echo json_encode(['error' => 'Obra no encontrada']);
        exit;
    }

    // Adicionar email do cliente para facilitar envio direto
    $obra['cliente_email'] = $obra['cliente_email_financeiro'] ?? null;

    // Calcular inicio e fim do mês
    $mesInicio = $mes . '-01';
    $mesFim = date('Y-m-t', strtotime($mesInicio));

    // Buscar apontamentos aprovados do mês para esta obra
    $stmt = $pdo->prepare("
        SELECT a.*, u.nome as funcionario_nome, u.passaporte as funcionario_passaporte, u.foto_url
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        WHERE a.obra_id = ? 
        AND a.status IN ('aprovado', 'aprovado_encarregado')
        AND a.semana_inicio >= ?
        AND a.semana_inicio <= ?
        ORDER BY u.nome, a.semana_inicio
    ");
    $stmt->execute([$obra_id, $mesInicio, $mesFim]);
    $apontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agrupar por funcionário
    $funcionarios = [];
    $totaisGeral = ['normal' => 0, 'extra' => 0, 'noturna' => 0, 'total' => 0];

    foreach ($apontamentos as $apt) {
        $funcId = $apt['funcionario_id'];

        if (!isset($funcionarios[$funcId])) {
            $funcionarios[$funcId] = [
                'id' => $funcId,
                'nome' => $apt['funcionario_nome'],
                'passaporte' => $apt['funcionario_passaporte'],
                'foto_url' => $apt['foto_url'],
                'horas_normal' => 0,
                'horas_extra' => 0,
                'horas_noturna' => 0,
                'horas_total' => 0,
                'semanas' => []
            ];
        }

        // Processar horas
        $horasDiarias = json_decode($apt['horas_diarias'], true);
        $semanaHoras = ['normal' => 0, 'extra' => 0, 'noturna' => 0];

        if ($horasDiarias) {
            foreach ($horasDiarias as $key => $dia) {
                if (is_array($dia)) {
                    // Formato novo
                    $semanaHoras['normal'] += isset($dia['normal']) ? floatval($dia['normal']) : 0;
                    $semanaHoras['extra'] += isset($dia['extra']) ? floatval($dia['extra']) : 0;
                    $semanaHoras['noturna'] += isset($dia['noturna']) ? floatval($dia['noturna']) : 0;
                } else {
                    // Formato antigo - tudo como normal
                    $semanaHoras['normal'] += floatval($dia);
                }
            }
        }

        $funcionarios[$funcId]['horas_normal'] += $semanaHoras['normal'];
        $funcionarios[$funcId]['horas_extra'] += $semanaHoras['extra'];
        $funcionarios[$funcId]['horas_noturna'] += $semanaHoras['noturna'];
        $funcionarios[$funcId]['horas_total'] += $semanaHoras['normal'] + $semanaHoras['extra'] + $semanaHoras['noturna'];

        $funcionarios[$funcId]['semanas'][] = [
            'semana_inicio' => $apt['semana_inicio'],
            'normal' => $semanaHoras['normal'],
            'extra' => $semanaHoras['extra'],
            'noturna' => $semanaHoras['noturna'],
            'total' => $semanaHoras['normal'] + $semanaHoras['extra'] + $semanaHoras['noturna']
        ];

        $totaisGeral['normal'] += $semanaHoras['normal'];
        $totaisGeral['extra'] += $semanaHoras['extra'];
        $totaisGeral['noturna'] += $semanaHoras['noturna'];
        $totaisGeral['total'] += $semanaHoras['normal'] + $semanaHoras['extra'] + $semanaHoras['noturna'];
    }

    // Calcular valores em €
    $valoresGeral = [
        'valor_normal' => $totaisGeral['normal'] * $valor_normal,
        'valor_extra' => $totaisGeral['extra'] * $valor_extra,
        'valor_noturna' => $totaisGeral['noturna'] * $valor_noturna,
        'valor_total' => ($totaisGeral['normal'] * $valor_normal) + ($totaisGeral['extra'] * $valor_extra) + ($totaisGeral['noturna'] * $valor_noturna)
    ];

    // Adicionar valores a cada funcionário
    foreach ($funcionarios as &$func) {
        $func['valor_normal'] = $func['horas_normal'] * $valor_normal;
        $func['valor_extra'] = $func['horas_extra'] * $valor_extra;
        $func['valor_noturna'] = $func['horas_noturna'] * $valor_noturna;
        $func['valor_total'] = $func['valor_normal'] + $func['valor_extra'] + $func['valor_noturna'];
    }

    echo json_encode([
        'success' => true,
        'obra' => $obra,
        'mes' => $mes,
        'config_valores' => [
            'hora_normal' => $valor_normal,
            'hora_extra' => $valor_extra,
            'hora_noturna' => $valor_noturna
        ],
        'funcionarios' => array_values($funcionarios),
        'totais' => $totaisGeral,
        'valores' => $valoresGeral,
        'total_funcionarios' => count($funcionarios)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
