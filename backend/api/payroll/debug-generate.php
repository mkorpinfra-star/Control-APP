<?php
/**
 * DEBUG - Testar geração de folha com detalhes
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

try {
    $user = authMiddleware(['admin']);
    $tenantId = $user['tenant_id'];

    $mesReferencia = $_GET['mes'] ?? '2026-03';
    $obraId = isset($_GET['obra_id']) && $_GET['obra_id'] !== 'all' ? (int)$_GET['obra_id'] : null;

    $pdo = getConnection();

    // 1. Buscar config fiscal
    $configStmt = $pdo->prepare("SELECT * FROM config_fiscal WHERE tenant_id = :tenant_id ORDER BY id DESC LIMIT 1");
    $configStmt->execute(['tenant_id' => $tenantId]);
    $config = $configStmt->fetch(PDO::FETCH_ASSOC);

    $casDescFuncionario = $config['cas_desconto_funcionario'] ?? 6.50;
    $casCustoEmpresa = $config['cas_custo_empresa'] ?? 15.50;

    // 2. Buscar apontamentos aprovados
    $mesInicio = $mesReferencia . '-01';
    $mesFim = date('Y-m-t', strtotime($mesInicio));

    $whereObra = $obraId ? " AND a.obra_id = :obra_id" : "";
    $params = ['mes_inicio' => $mesInicio, 'mes_fim' => $mesFim];
    if ($obraId) $params['obra_id'] = $obraId;

    require_once __DIR__ . '/../../includes/horas_helper.php';

    $params['tenant_id'] = $tenantId;

    $stmt = $pdo->prepare("
        SELECT
            a.id as apontamento_id,
            a.funcionario_id,
            a.obra_id,
            a.horas_diarias,
            u.funcao,
            u.salario_base,
            u.salario_hora,
            u.vale_moradia,
            u.ibf,
            COALESCE(u.bonificacao, 0) as bonificacao_manual,
            o.nome as obra_nome,
            u.nome as funcionario_nome
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        INNER JOIN obras o ON o.id = a.obra_id
        WHERE a.status IN ('aprovado', 'aprovado_encarregado')
        AND a.semana_inicio >= :mes_inicio
        AND a.semana_inicio <= :mes_fim
        AND a.tenant_id = :tenant_id
        AND u.tenant_id = :tenant_id
        AND o.tenant_id = :tenant_id
        $whereObra
        LIMIT 5
    ");
    $stmt->execute($params);
    $rawApontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'debug' => 'Teste de geração',
        'mes' => $mesReferencia,
        'obra_id' => $obraId,
        'config' => $config,
        'total_apontamentos' => count($rawApontamentos),
        'apontamentos_sample' => $rawApontamentos
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => explode("\n", $e->getTraceAsString())
    ], JSON_PRETTY_PRINT);
}
