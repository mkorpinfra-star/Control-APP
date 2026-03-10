<?php
/**
 * GERAR FATURAMENTO MENSAL
 * Calcula automaticamente com base nos apontamentos aprovados
 * Valores de faturamento são DIFERENTES dos valores de folha (markup)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../includes/tenant_middleware.php';
require_once '../../config/database.php';

$auth = validateTenantAccess(['admin']);
$tenant_id = $auth['tenant_id'];

try {
    $mesReferencia = $_GET['mes'] ?? date('Y-m');
    $obraId = isset($_GET['obra_id']) && $_GET['obra_id'] !== 'all' ? (int)$_GET['obra_id'] : null;

    $pdo = getConnection();

    // Buscar config fiscal
    $configStmt = $pdo->query("SELECT * FROM config_fiscal ORDER BY id DESC LIMIT 1");
    $config = $configStmt->fetch(PDO::FETCH_ASSOC);

    $igiPercentual = $config['igi_percentual'] ?? 4.50;

    // Buscar todos apontamentos aprovados do mês com valor individual por funcionário
    $mesInicio = $mesReferencia . '-01';
    $mesFim = date('Y-m-t', strtotime($mesInicio));

    $whereObra = $obraId ? " AND a.obra_id = :obra_id" : "";
    $params = ['mes_inicio' => $mesInicio, 'mes_fim' => $mesFim];
    if ($obraId) $params['obra_id'] = $obraId;

    require_once __DIR__ . '/../../includes/horas_helper.php';

    // Detectar coluna ativo/ativa em obras
    $colsObras = $pdo->query("SHOW COLUMNS FROM obras")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('ativo', $colsObras)) {
        $obraAtivoFilter = "AND o.ativo = 1";
    } elseif (in_array('ativa', $colsObras)) {
        $obraAtivoFilter = "AND o.ativa = 1";
    } else {
        $obraAtivoFilter = "";
    }

    // Detectar coluna ativo em usuarios
    $colsUsers = $pdo->query("SHOW COLUMNS FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);
    $userAtivoFilter = in_array('ativo', $colsUsers) ? "AND u.ativo = 1" : "";

    // Buscar apontamentos individuais com JSON horas_diarias (dados reais estão no JSON)
    // Filtra apenas obras e funcionários ATIVOS para não resgatar itens deletados
    $stmt = $pdo->prepare("
        SELECT
            a.obra_id,
            a.horas_diarias,
            o.numero as obra_numero,
            o.nome as obra_nome,
            u.valor_hora_venda
        FROM apontamentos a
        INNER JOIN obras o ON o.id = a.obra_id AND o.tenant_id = :tenant_id $obraAtivoFilter
        INNER JOIN usuarios u ON u.id = a.funcionario_id AND u.tenant_id = :tenant_id $userAtivoFilter
        WHERE a.tenant_id = :tenant_id
        AND a.status IN ('aprovado', 'aprovado_encarregado')
        AND a.semana_inicio >= :mes_inicio
        AND a.semana_inicio <= :mes_fim
        $whereObra
    ");
    $params['tenant_id'] = $tenant_id;
    $stmt->execute($params);
    $rawApontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agrupar por obra, usando JSON (paraCliente=true: festivo=0h)
    $obrasSummary = [];
    foreach ($rawApontamentos as $apt) {
        $oId = $apt['obra_id'];
        if (!isset($obrasSummary[$oId])) {
            $obrasSummary[$oId] = [
                'obra_id'            => $oId,
                'obra_numero'        => $apt['obra_numero'],
                'obra_nome'          => $apt['obra_nome'],
                'total_horas_normais' => 0,
                'total_horas_extra'  => 0,
                'total_horas_noturna' => 0,
                'valor_total'        => 0
            ];
        }

        // true = paraCliente: festivos contam 0h
        $h = calcularHorasJson($apt['horas_diarias'], true);
        $totalHorasFuncionario = $h['normais'] + $h['extra'] + $h['noturna'];

        $valorHoraVenda = floatval($apt['valor_hora_venda']) ?: 24.00;
        $valorTotalFuncionario = $totalHorasFuncionario * $valorHoraVenda;

        $obrasSummary[$oId]['total_horas_normais'] += $h['normais'];
        $obrasSummary[$oId]['total_horas_extra']   += $h['extra'];
        $obrasSummary[$oId]['total_horas_noturna'] += $h['noturna'];
        $obrasSummary[$oId]['valor_total']         += $valorTotalFuncionario;
    }

    $apontamentos = array_values($obrasSummary);

    $gerados = 0;
    $atualizados = 0;

    foreach ($apontamentos as $apt) {
        // Verificar se já existe
        $checkStmt = $pdo->prepare("
            SELECT id FROM faturamento
            WHERE tenant_id = ? AND obra_id = ? AND mes_referencia = ?
        ");
        $checkStmt->execute([$tenant_id, $apt['obra_id'], $mesReferencia]);
        $existing = $checkStmt->fetch();

        // NOVO: Usar valor calculado com base nos valores individuais de cada funcionário
        $valorTotalServicos = $apt['valor_total'];
        $totalHoras = $apt['total_horas_normais'] + $apt['total_horas_extra'] + $apt['total_horas_noturna'];

        // Calcular valores médios por hora (fallback se não houver horas)
        $valorHoraNormal = 30.00;   // valor padrão
        $valorHoraExtra = 42.00;    // valor padrão
        $valorHoraNoturna = 48.00;  // valor padrão

        // FASE 4: Cálculo automático de IGI
        $totalBruto = $valorTotalServicos;
        $igiValor = $totalBruto * ($igiPercentual / 100);
        $totalLiquido = $totalBruto - $igiValor;

        // Verificar se coluna total_horas existe
        $checkColumn = $pdo->query("SHOW COLUMNS FROM faturamento LIKE 'total_horas'");
        $hasTotalHorasColumn = $checkColumn->rowCount() > 0;

        if ($existing) {
            // Atualizar - REMOVER colunas GENERATED (igi_valor)
            if ($hasTotalHorasColumn) {
                $updateStmt = $pdo->prepare("
                    UPDATE faturamento SET
                        horas_normais = :horas_normais,
                        horas_extra = :horas_extra,
                        horas_noturna = :horas_noturna,
                        valor_hora_normal = :valor_hora_normal,
                        valor_hora_extra = :valor_hora_extra,
                        valor_hora_noturna = :valor_hora_noturna,
                        total_horas = :total_horas,
                        valor_total_servicos = :valor_total_servicos,
                        total_bruto = :total_bruto,
                        igi_percentual = :igi_percentual,
                        total_liquido = :total_liquido
                    WHERE id = :id
                ");
                $updateStmt->execute([
                    'horas_normais' => $apt['total_horas_normais'],
                    'horas_extra' => $apt['total_horas_extra'],
                    'horas_noturna' => $apt['total_horas_noturna'],
                    'valor_hora_normal' => $valorHoraNormal,
                    'valor_hora_extra' => $valorHoraExtra,
                    'valor_hora_noturna' => $valorHoraNoturna,
                    'total_horas' => $totalHoras,
                    'valor_total_servicos' => $valorTotalServicos,
                    'total_bruto' => $totalBruto,
                    'igi_percentual' => $igiPercentual,
                    'total_liquido' => $totalLiquido,
                    'id' => $existing['id']
                ]);
            } else {
                // Sem coluna total_horas
                $updateStmt = $pdo->prepare("
                    UPDATE faturamento SET
                        horas_normais = :horas_normais,
                        horas_extra = :horas_extra,
                        horas_noturna = :horas_noturna,
                        valor_hora_normal = :valor_hora_normal,
                        valor_hora_extra = :valor_hora_extra,
                        valor_hora_noturna = :valor_hora_noturna,
                        valor_total_servicos = :valor_total_servicos,
                        total_bruto = :total_bruto,
                        igi_percentual = :igi_percentual,
                        total_liquido = :total_liquido
                    WHERE id = :id
                ");
                $updateStmt->execute([
                    'horas_normais' => $apt['total_horas_normais'],
                    'horas_extra' => $apt['total_horas_extra'],
                    'horas_noturna' => $apt['total_horas_noturna'],
                    'valor_hora_normal' => $valorHoraNormal,
                    'valor_hora_extra' => $valorHoraExtra,
                    'valor_hora_noturna' => $valorHoraNoturna,
                    'valor_total_servicos' => $valorTotalServicos,
                    'total_bruto' => $totalBruto,
                    'igi_percentual' => $igiPercentual,
                    'total_liquido' => $totalLiquido,
                    'id' => $existing['id']
                ]);
            }
            $atualizados++;
        } else {
            // Criar novo - REMOVER colunas GENERATED (igi_valor)
            if ($hasTotalHorasColumn) {
                $insertStmt = $pdo->prepare("
                    INSERT INTO faturamento (
                        tenant_id, obra_id, mes_referencia,
                        horas_normais, horas_extra, horas_noturna,
                        valor_hora_normal, valor_hora_extra, valor_hora_noturna,
                        total_horas, valor_total_servicos, total_bruto,
                        igi_percentual, total_liquido
                    ) VALUES (
                        :tenant_id, :obra_id, :mes_referencia,
                        :horas_normais, :horas_extra, :horas_noturna,
                        :valor_hora_normal, :valor_hora_extra, :valor_hora_noturna,
                        :total_horas, :valor_total_servicos, :total_bruto,
                        :igi_percentual, :total_liquido
                    )
                ");
                $insertStmt->execute([
                    'tenant_id' => $tenant_id,
                    'obra_id' => $apt['obra_id'],
                    'mes_referencia' => $mesReferencia,
                    'horas_normais' => $apt['total_horas_normais'],
                    'horas_extra' => $apt['total_horas_extra'],
                    'horas_noturna' => $apt['total_horas_noturna'],
                    'valor_hora_normal' => $valorHoraNormal,
                    'valor_hora_extra' => $valorHoraExtra,
                    'valor_hora_noturna' => $valorHoraNoturna,
                    'total_horas' => $totalHoras,
                    'valor_total_servicos' => $valorTotalServicos,
                    'total_bruto' => $totalBruto,
                    'igi_percentual' => $igiPercentual,
                    'total_liquido' => $totalLiquido
                ]);
            } else {
                // Sem coluna total_horas
                $insertStmt = $pdo->prepare("
                    INSERT INTO faturamento (
                        tenant_id, obra_id, mes_referencia,
                        horas_normais, horas_extra, horas_noturna,
                        valor_hora_normal, valor_hora_extra, valor_hora_noturna,
                        valor_total_servicos, total_bruto,
                        igi_percentual, total_liquido
                    ) VALUES (
                        :tenant_id, :obra_id, :mes_referencia,
                        :horas_normais, :horas_extra, :horas_noturna,
                        :valor_hora_normal, :valor_hora_extra, :valor_hora_noturna,
                        :valor_total_servicos, :total_bruto,
                        :igi_percentual, :total_liquido
                    )
                ");
                $insertStmt->execute([
                    'tenant_id' => $tenant_id,
                    'obra_id' => $apt['obra_id'],
                    'mes_referencia' => $mesReferencia,
                    'horas_normais' => $apt['total_horas_normais'],
                    'horas_extra' => $apt['total_horas_extra'],
                    'horas_noturna' => $apt['total_horas_noturna'],
                    'valor_hora_normal' => $valorHoraNormal,
                    'valor_hora_extra' => $valorHoraExtra,
                    'valor_hora_noturna' => $valorHoraNoturna,
                    'valor_total_servicos' => $valorTotalServicos,
                    'total_bruto' => $totalBruto,
                    'igi_percentual' => $igiPercentual,
                    'total_liquido' => $totalLiquido
                ]);
            }
            $gerados++;
        }
    }

    echo json_encode([
        'success' => true,
        'mes_referencia' => $mesReferencia,
        'gerados' => $gerados,
        'atualizados' => $atualizados,
        'total' => $gerados + $atualizados
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao gerar faturamento: ' . $e->getMessage()
    ]);
}
