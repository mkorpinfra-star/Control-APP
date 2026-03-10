<?php
/**
 * SALVAR DESPESAS INDIRETAS
 * POST /api/payroll/despesas-salvar.php
 * Body: { obra_id, mes_referencia, locacao_escritorio, locacao_deposito,
 *          fornecedores, ferramentas, uniformes, taxa_imigracao,
 *          cartao_transporte, outros }
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);
$tenantId = $user['tenant_id'];

try {
    $body = json_decode(file_get_contents('php://input'), true);

    $obraId        = isset($body['obra_id'])        ? (int)$body['obra_id']              : 0;
    $mesReferencia = isset($body['mes_referencia'])  ? trim($body['mes_referencia'])       : '';

    if (!$obraId || !$mesReferencia) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'obra_id e mes_referencia obrigatórios']);
        exit;
    }

    $campos = [
        'locacao_escritorio', 'locacao_deposito', 'fornecedores',
        'ferramentas', 'uniformes', 'taxa_imigracao', 'cartao_transporte', 'outros'
    ];

    $pdo = getConnection();

    // Garantir tabela existe
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS despesas_indiretas (
            id                  INT AUTO_INCREMENT PRIMARY KEY,
            tenant_id           INT NOT NULL,
            obra_id             INT NOT NULL,
            mes_referencia      CHAR(7) NOT NULL,
            locacao_escritorio  DECIMAL(12,2) DEFAULT 0,
            locacao_deposito    DECIMAL(12,2) DEFAULT 0,
            fornecedores        DECIMAL(12,2) DEFAULT 0,
            ferramentas         DECIMAL(12,2) DEFAULT 0,
            uniformes           DECIMAL(12,2) DEFAULT 0,
            taxa_imigracao      DECIMAL(12,2) DEFAULT 0,
            cartao_transporte   DECIMAL(12,2) DEFAULT 0,
            outros              DECIMAL(12,2) DEFAULT 0,
            total               DECIMAL(12,2) GENERATED ALWAYS AS (
                locacao_escritorio + locacao_deposito + fornecedores +
                ferramentas + uniformes + taxa_imigracao +
                cartao_transporte + outros
            ) STORED,
            created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uq_tenant_obra_mes (tenant_id, obra_id, mes_referencia),
            INDEX idx_tenant (tenant_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Verificar se já existe
    $check = $pdo->prepare("SELECT id FROM despesas_indiretas WHERE obra_id = ? AND mes_referencia = ? AND tenant_id = ?");
    $check->execute([$obraId, $mesReferencia, $tenantId]);
    $existing = $check->fetch();

    $values = [];
    foreach ($campos as $campo) {
        $values[$campo] = isset($body[$campo]) ? floatval($body[$campo]) : 0;
    }

    if ($existing) {
        $sets = implode(', ', array_map(fn($c) => "$c = :$c", $campos));
        $stmt = $pdo->prepare("UPDATE despesas_indiretas SET $sets WHERE id = :id AND tenant_id = :tenant_id");
        $values['id'] = $existing['id'];
        $values['tenant_id'] = $tenantId;
        $stmt->execute($values);
    } else {
        $cols = implode(', ', array_merge(['tenant_id', 'obra_id', 'mes_referencia'], $campos));
        $placeholders = implode(', ', array_merge([':tenant_id', ':obra_id', ':mes_referencia'], array_map(fn($c) => ":$c", $campos)));
        $stmt = $pdo->prepare("INSERT INTO despesas_indiretas ($cols) VALUES ($placeholders)");
        $values['tenant_id']      = $tenantId;
        $values['obra_id']        = $obraId;
        $values['mes_referencia'] = $mesReferencia;
        $stmt->execute($values);
    }

    // Retornar registro atualizado
    $sel = $pdo->prepare("SELECT * FROM despesas_indiretas WHERE obra_id = ? AND mes_referencia = ? AND tenant_id = ?");
    $sel->execute([$obraId, $mesReferencia, $tenantId]);
    $row = $sel->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'despesas' => $row]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro: ' . $e->getMessage()]);
}
