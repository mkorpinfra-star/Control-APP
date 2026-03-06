<?php
/**
 * APONTAMENTOS APROVADOS COM VALORES FINANCEIROS
 * Para Admin visualizar valores após aprovação do encarregado
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);

try {
    $inicio = $_GET['inicio'] ?? null;
    $fim = $_GET['fim'] ?? null;
    $obraId = isset($_GET['obra_id']) ? (int)$_GET['obra_id'] : null;

    if (!$inicio || !$fim) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parâmetros inicio e fim obrigatórios']);
        exit;
    }

    $pdo = getConnection();

    // Garantir colunas financeiras em usuarios (migração automática)
    $existingUserCols = $pdo->query("SHOW COLUMNS FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);
    foreach (['salario_base_mensal','valor_hora_venda','vale_moradia','ibf'] as $fc) {
        if (!in_array($fc, $existingUserCols)) {
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN `{$fc}` DECIMAL(10,2) DEFAULT NULL");
            $existingUserCols[] = $fc;
        }
    }

    // Detectar colunas disponíveis em usuarios para montar SELECT dinamicamente
    $colUsuarios = $existingUserCols;
    $selectFuncao      = in_array('funcao', $colUsuarios)           ? "u.funcao as funcionario_funcao,"            : "NULL as funcionario_funcao,";
    $selectValorHora   = in_array('valor_hora_venda', $colUsuarios) ? "u.valor_hora_venda,"                        : "NULL as valor_hora_venda,";

    // Detectar colunas opcionais em apontamentos
    $colApontamentos   = $pdo->query("SHOW COLUMNS FROM apontamentos")->fetchAll(PDO::FETCH_COLUMN);
    $selectSemanaFim   = in_array('semana_fim',     $colApontamentos) ? "a.semana_fim,"       : "NULL as semana_fim,";
    $selectDataAprov   = in_array('data_aprovacao', $colApontamentos) ? "a.data_aprovacao,"   : "NULL as data_aprovacao,";
    $hasAprovadoPor    = in_array('aprovado_por',   $colApontamentos);
    $selectAprovadoPor = $hasAprovadoPor ? "a.aprovado_por," : "NULL as aprovado_por,";
    $joinAprovador     = $hasAprovadoPor
        ? "LEFT JOIN usuarios aprovador ON aprovador.id = a.aprovado_por"
        : "";
    $selectAprovadorNome = $hasAprovadoPor ? "aprovador.nome as aprovador_nome" : "NULL as aprovador_nome";

    $whereObra = $obraId ? " AND a.obra_id = :obra_id" : "";
    $params = ['inicio' => $inicio, 'fim' => $fim];
    if ($obraId) $params['obra_id'] = $obraId;

    $stmt = $pdo->prepare("
        SELECT
            a.id,
            a.funcionario_id,
            a.obra_id,
            a.semana_inicio,
            {$selectSemanaFim}
            a.horas_diarias,
            a.status,
            {$selectDataAprov}
            {$selectAprovadoPor}

            u.nome as funcionario_nome,
            u.passaporte as funcionario_passaporte,
            {$selectFuncao}
            {$selectValorHora}

            o.numero as obra_numero,
            o.nome as obra_nome,

            {$selectAprovadorNome}

        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id
        INNER JOIN obras o ON o.id = a.obra_id AND (o.ativo = 1 OR o.ativa = 1)
        {$joinAprovador}

        WHERE a.status IN ('aprovado', 'aprovado_encarregado')
        AND a.semana_inicio >= :inicio
        AND a.semana_inicio <= :fim
        $whereObra

        ORDER BY a.semana_inicio DESC, o.numero, u.nome
    ");

    $stmt->execute($params);
    $rawApontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    require_once __DIR__ . '/../../includes/horas_helper.php';

    // Calcular horas via JSON para cada apontamento (empresa: festivo=8h; cliente: festivo=0h)
    $apontamentos = [];
    foreach ($rawApontamentos as $apt) {
        $hEmpresa = calcularHorasJson($apt['horas_diarias'], false); // empresa paga festivo
        $hCliente  = calcularHorasJson($apt['horas_diarias'], true);  // cliente não paga festivo

        $valorHora = floatval($apt['valor_hora_venda']) ?: 24.00;
        $totalHorasCliente = $hCliente['normais'] + $hCliente['extra'] + $hCliente['noturna'];

        $apt['horas_normais']  = $hEmpresa['normais'];
        $apt['horas_extra']    = $hEmpresa['extra'];
        $apt['horas_noturna']  = $hEmpresa['noturna'];
        $apt['total_horas']    = $hEmpresa['normais'] + $hEmpresa['extra'] + $hEmpresa['noturna'];
        $apt['festivos']       = $hEmpresa['festivos'];
        // Para faturamento ao cliente
        $apt['horas_normais_cliente']  = $hCliente['normais'];
        $apt['horas_extra_cliente']    = $hCliente['extra'];
        $apt['horas_noturna_cliente']  = $hCliente['noturna'];
        $apt['total_horas_cliente']    = $totalHorasCliente;
        $apt['valor_cliente']          = round($totalHorasCliente * $valorHora, 2);

        $apontamentos[] = $apt;
    }

    echo json_encode([
        'success' => true,
        'apontamentos' => $apontamentos
    ]);

} catch (Exception $e) {
    error_log('Erro approved-financial.php: ' . $e->getMessage());
    echo json_encode([
        'success'      => false,
        'apontamentos' => [],
        'message'      => $e->getMessage()
    ]);
}
