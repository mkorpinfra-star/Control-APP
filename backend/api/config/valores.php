<?php
/**
 * API: Configuração de valores de hora
 * GET /api/config/valores.php  -> retorna config atual
 * POST /api/config/valores.php -> salva config
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

try {
    $pdo = getConnection();

    // Garantir que colunas extras existem
    $extraCols = [
        'fatura_hora_normal'    => 'DECIMAL(10,2) DEFAULT 25.00',
        'fatura_hora_extra'     => 'DECIMAL(10,2) DEFAULT 37.50',
        'fatura_hora_noturna'   => 'DECIMAL(10,2) DEFAULT 50.00',
        'multiplicador_extra'   => 'DECIMAL(5,2) DEFAULT 1.50',
        'multiplicador_noturna' => 'DECIMAL(5,2) DEFAULT 2.00',
    ];
    foreach ($extraCols as $col => $def) {
        $check = $pdo->query("SHOW COLUMNS FROM config_valores LIKE '$col'");
        if ($check->rowCount() === 0) {
            $pdo->exec("ALTER TABLE config_valores ADD COLUMN $col $def");
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT * FROM config_valores ORDER BY id DESC LIMIT 1");
        $config = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$config) {
            $config = [
                'valor_hora_normal'    => 15.00,
                'valor_hora_extra'     => 22.50,
                'valor_hora_noturna'   => 30.00,
                'fatura_hora_normal'   => 25.00,
                'fatura_hora_extra'    => 37.50,
                'fatura_hora_noturna'  => 50.00,
                'multiplicador_extra'  => 1.50,
                'multiplicador_noturna'=> 2.00,
            ];
        }

        echo json_encode($config);

    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if ($user['tipo'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        $valor_normal   = isset($input['valor_hora_normal'])     ? floatval($input['valor_hora_normal'])    : 15.00;
        $valor_extra    = isset($input['valor_hora_extra'])      ? floatval($input['valor_hora_extra'])     : 22.50;
        $valor_noturna  = isset($input['valor_hora_noturna'])    ? floatval($input['valor_hora_noturna'])   : 30.00;
        $fatura_normal  = isset($input['fatura_hora_normal'])    ? floatval($input['fatura_hora_normal'])   : 25.00;
        $fatura_extra   = isset($input['fatura_hora_extra'])     ? floatval($input['fatura_hora_extra'])    : 37.50;
        $fatura_noturna = isset($input['fatura_hora_noturna'])   ? floatval($input['fatura_hora_noturna'])  : 50.00;
        $mult_extra     = isset($input['multiplicador_extra'])   ? floatval($input['multiplicador_extra'])  : 1.50;
        $mult_noturna   = isset($input['multiplicador_noturna']) ? floatval($input['multiplicador_noturna']): 2.00;

        $stmt = $pdo->query("SELECT id FROM config_valores ORDER BY id DESC LIMIT 1");
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $stmt = $pdo->prepare("
                UPDATE config_valores SET
                    valor_hora_normal = ?,
                    valor_hora_extra = ?,
                    valor_hora_noturna = ?,
                    fatura_hora_normal = ?,
                    fatura_hora_extra = ?,
                    fatura_hora_noturna = ?,
                    multiplicador_extra = ?,
                    multiplicador_noturna = ?,
                    atualizado_em = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $valor_normal, $valor_extra, $valor_noturna,
                $fatura_normal, $fatura_extra, $fatura_noturna,
                $mult_extra, $mult_noturna,
                $existing['id']
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO config_valores
                    (valor_hora_normal, valor_hora_extra, valor_hora_noturna,
                     fatura_hora_normal, fatura_hora_extra, fatura_hora_noturna,
                     multiplicador_extra, multiplicador_noturna)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $valor_normal, $valor_extra, $valor_noturna,
                $fatura_normal, $fatura_extra, $fatura_noturna,
                $mult_extra, $mult_noturna
            ]);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Valores actualizados',
            'valores' => compact(
                'valor_normal', 'valor_extra', 'valor_noturna',
                'fatura_normal', 'fatura_extra', 'fatura_noturna',
                'mult_extra', 'mult_noturna'
            )
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}
