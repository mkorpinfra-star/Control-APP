<?php
/**
 * GERAR FOLHA DE PAGAMENTO MENSAL
 * Calcula automaticamente com base nos apontamentos aprovados
 */

header('Content-Type: application/json; charset=utf-8');
require_once '../../includes/auth.php';
require_once '../../config/database.php';

$user = authMiddleware(['admin']);

try {
    $mesReferencia = $_GET['mes'] ?? date('Y-m');
    $obraId = isset($_GET['obra_id']) && $_GET['obra_id'] !== 'all' ? (int)$_GET['obra_id'] : null;

    $pdo = getConnection();

    // Buscar config fiscal
    $configStmt = $pdo->query("SELECT * FROM config_fiscal ORDER BY id DESC LIMIT 1");
    $config = $configStmt->fetch(PDO::FETCH_ASSOC);

    $casDescFuncionario = $config['cas_desconto_funcionario'] ?? 6.50;
    $casCustoEmpresa = $config['cas_custo_empresa'] ?? 15.50;

    // Buscar todos apontamentos aprovados do mês
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

    // Migração automática — bonificacao em usuarios e folha_pagamento
    if (!in_array('bonificacao', $colsUsers)) {
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN bonificacao DECIMAL(10,2) DEFAULT 0");
        $colsUsers[] = 'bonificacao';
    }
    $colsFolha = $pdo->query("SHOW COLUMNS FROM folha_pagamento")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('bonificacao', $colsFolha)) {
        $pdo->exec("ALTER TABLE folha_pagamento ADD COLUMN bonificacao DECIMAL(10,2) DEFAULT 0");
    }

    // Buscar apontamentos com o JSON horas_diarias (dados reais estão no JSON)
    // Filtra apenas obras e funcionários ATIVOS para não resgatar itens deletados
    $stmt = $pdo->prepare("
        SELECT
            a.id as apontamento_id,
            a.funcionario_id,
            a.obra_id,
            a.horas_diarias,
            u.funcao,
            u.salario_base,
            u.salario_base_mensal,
            u.salario_hora,
            u.vale_moradia,
            u.ibf,
            COALESCE(u.bonificacao, 0) as bonificacao_manual
        FROM apontamentos a
        INNER JOIN usuarios u ON u.id = a.funcionario_id $userAtivoFilter
        INNER JOIN obras o ON o.id = a.obra_id $obraAtivoFilter
        WHERE a.status IN ('aprovado', 'aprovado_encarregado')
        AND a.semana_inicio >= :mes_inicio
        AND a.semana_inicio <= :mes_fim
        $whereObra
    ");
    $stmt->execute($params);
    $rawApontamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Agrupar por funcionario+obra somando horas via JSON (empresa: festivo=8h)
    $grouped = [];
    foreach ($rawApontamentos as $row) {
        $key = $row['funcionario_id'] . '_' . $row['obra_id'];
        $h = calcularHorasJson($row['horas_diarias'], false); // false = para empresa
        if (!isset($grouped[$key])) {
            $grouped[$key] = [
                'funcionario_id'      => $row['funcionario_id'],
                'obra_id'             => $row['obra_id'],
                'funcao'              => $row['funcao'],
                'salario_base'        => $row['salario_base'],
                'salario_base_mensal' => $row['salario_base_mensal'],
                'salario_hora'        => $row['salario_hora'],
                'vale_moradia'        => $row['vale_moradia'],
                'ibf'                 => $row['ibf'],
                'bonificacao_manual'  => $row['bonificacao_manual'],
                'total_horas_normais' => 0,
                'total_horas_extra'   => 0,
                'total_horas_noturna' => 0,
                'total_festivos'      => 0,
            ];
        }
        $grouped[$key]['total_horas_normais'] += $h['normais'];
        $grouped[$key]['total_horas_extra']   += $h['extra'];
        $grouped[$key]['total_horas_noturna'] += $h['noturna'];
        $grouped[$key]['total_festivos']      += $h['festivos'];
    }
    $apontamentos = array_values($grouped);

    $gerados = 0;
    $atualizados = 0;

    foreach ($apontamentos as $apt) {
        // Verificar se já existe
        $checkStmt = $pdo->prepare("
            SELECT id FROM folha_pagamento
            WHERE funcionario_id = ? AND obra_id = ? AND mes_referencia = ?
        ");
        $checkStmt->execute([$apt['funcionario_id'], $apt['obra_id'], $mesReferencia]);
        $existing = $checkStmt->fetch();

        // ── Valores do funcionário ──────────────────────────────────────────
        // salario_base    = valor fixo declarado (ex: 2.000€) — base de cálculo do CASS
        // salario_hora    = valor da hora trabalhada (ex: 14€/h)
        // vale_moradia    = valor fixo mensal de moradia
        // ibf / bonificacao = outros benefícios fixos
        $salarioBase   = floatval($apt['salario_base']   ?? $apt['salario_base_mensal'] ?? 0);
        $salarioHora   = floatval($apt['salario_hora']   ?? 0);
        $valeMoradia   = floatval($apt['vale_moradia']   ?? 0);
        $ibf           = floatval($apt['ibf']            ?? 0);

        // ── Multiplicadores ─────────────────────────────────────────────────
        $multiplicadorExtra   = 1.40;
        $multiplicadorNoturna = 1.60;

        $valorHoraNormal   = $salarioHora;
        $valorHoraExtra    = $salarioHora * $multiplicadorExtra;
        $valorHoraNoturna  = $salarioHora * $multiplicadorNoturna;

        // ── Subtotal de horas (o que o funcionário ganha pelas horas) ───────
        $subtotalHoras = ($apt['total_horas_normais'] * $valorHoraNormal)
                       + ($apt['total_horas_extra']   * $valorHoraExtra)
                       + ($apt['total_horas_noturna'] * $valorHoraNoturna);

        // ── CASS — calculado APENAS sobre salário base, não sobre horas ─────
        // Regra do Cassio: o salário base é fixo (ex: 2.000€), independente das horas
        $casFuncionarioValor = $salarioBase * ($casDescFuncionario / 100); // 6,5% do func.
        $casEmpresaValor     = $salarioBase * ($casCustoEmpresa    / 100); // 15,5% da empresa

        // ── Bonificação: valor fixo manual cadastrado no funcionário ────────────
        $bonificacao = floatval($apt['bonificacao_manual'] ?? 0);

        // ── Total Bruto (provimentos): horas + moradia + prima + bonificação ──
        $totalBruto = $subtotalHoras + $valeMoradia + $ibf + $bonificacao;

        // ── Líquido a pagar ao funcionário ───────────────────────────────────
        // Total das horas + moradia + prima + bonificação − desconto CASS do funcionário
        $totalLiquido = $subtotalHoras + $valeMoradia + $ibf + $bonificacao - $casFuncionarioValor;

        // ── Custo total para a empresa ────────────────────────────────────────
        // O que a empresa paga + CASS da empresa (encargo patronal)
        $custoTotalEmpresa = $totalLiquido + $casEmpresaValor;

        if ($existing) {
            // Atualizar apenas colunas não-GENERATED
            $updateStmt = $pdo->prepare("
                UPDATE folha_pagamento SET
                    horas_normais = :horas_normais,
                    horas_extra = :horas_extra,
                    horas_noturna = :horas_noturna,
                    salario_base = :salario_base,
                    salario_hora = :salario_hora,
                    salario_base_hora = :salario_base_hora,
                    multiplicador_extra = :multiplicador_extra,
                    multiplicador_noturna = :multiplicador_noturna,
                    bonificacao = :bonificacao,
                    total_bruto = :total_bruto,
                    cas_funcionario_percentual = :cas_func_perc,
                    cas_funcionario_valor = :cas_func_valor,
                    vale_moradia = :vale_moradia,
                    ibf = :ibf,
                    total_liquido = :total_liquido,
                    cas_empresa_percentual = :cas_emp_perc,
                    cas_empresa_valor = :cas_emp_valor,
                    cas_desconto_funcionario_percentual = :cas_desc_func_perc,
                    cas_custo_empresa_percentual = :cas_custo_emp_perc
                WHERE id = :id
            ");
            $updateStmt->execute([
                'horas_normais'       => $apt['total_horas_normais'],
                'horas_extra'         => $apt['total_horas_extra'],
                'horas_noturna'       => $apt['total_horas_noturna'],
                'salario_base'        => $salarioBase,
                'salario_hora'        => $salarioHora,
                'salario_base_hora'   => $salarioHora,
                'multiplicador_extra' => $multiplicadorExtra,
                'multiplicador_noturna' => $multiplicadorNoturna,
                'bonificacao'         => $bonificacao,
                'total_bruto'         => $totalBruto,
                'cas_func_perc'       => $casDescFuncionario,
                'cas_func_valor'      => $casFuncionarioValor,
                'vale_moradia'        => $valeMoradia,
                'ibf'                 => $ibf,
                'total_liquido'       => $totalLiquido,
                'cas_emp_perc'        => $casCustoEmpresa,
                'cas_emp_valor'       => $casEmpresaValor,
                'cas_desc_func_perc'  => $casDescFuncionario,
                'cas_custo_emp_perc'  => $casCustoEmpresa,
                'id'                  => $existing['id']
            ]);
            $atualizados++;
        } else {
            // Criar novo - apenas colunas não-GENERATED
            $insertStmt = $pdo->prepare("
                INSERT INTO folha_pagamento (
                    funcionario_id, obra_id, mes_referencia,
                    horas_normais, horas_extra, horas_noturna,
                    salario_base, salario_hora, salario_base_hora,
                    multiplicador_extra, multiplicador_noturna,
                    bonificacao, total_bruto,
                    cas_funcionario_percentual, cas_funcionario_valor,
                    vale_moradia, ibf, total_liquido,
                    cas_empresa_percentual, cas_empresa_valor,
                    cas_desconto_funcionario_percentual, cas_custo_empresa_percentual
                ) VALUES (
                    :funcionario_id, :obra_id, :mes_referencia,
                    :horas_normais, :horas_extra, :horas_noturna,
                    :salario_base, :salario_hora, :salario_base_hora,
                    :multiplicador_extra, :multiplicador_noturna,
                    :bonificacao, :total_bruto,
                    :cas_func_perc, :cas_func_valor,
                    :vale_moradia, :ibf, :total_liquido,
                    :cas_emp_perc, :cas_emp_valor,
                    :cas_desc_func_perc, :cas_custo_emp_perc
                )
            ");
            $insertStmt->execute([
                'funcionario_id'      => $apt['funcionario_id'],
                'obra_id'             => $apt['obra_id'],
                'mes_referencia'      => $mesReferencia,
                'horas_normais'       => $apt['total_horas_normais'],
                'horas_extra'         => $apt['total_horas_extra'],
                'horas_noturna'       => $apt['total_horas_noturna'],
                'salario_base'        => $salarioBase,
                'salario_hora'        => $salarioHora,
                'salario_base_hora'   => $salarioHora,
                'multiplicador_extra' => $multiplicadorExtra,
                'multiplicador_noturna' => $multiplicadorNoturna,
                'bonificacao'         => $bonificacao,
                'total_bruto'         => $totalBruto,
                'cas_func_perc'       => $casDescFuncionario,
                'cas_func_valor'      => $casFuncionarioValor,
                'vale_moradia'        => $valeMoradia,
                'ibf'                 => $ibf,
                'total_liquido'       => $totalLiquido,
                'cas_emp_perc'        => $casCustoEmpresa,
                'cas_emp_valor'       => $casEmpresaValor,
                'cas_desc_func_perc'  => $casDescFuncionario,
                'cas_custo_emp_perc'  => $casCustoEmpresa
            ]);
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
        'message' => 'Erro ao gerar folha: ' . $e->getMessage()
    ]);
}
