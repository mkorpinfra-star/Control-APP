<?php
/**
 * Script para verificar e criar colunas faltantes
 * Execute este arquivo uma vez para garantir que todas as colunas existam
 */

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getConnection();

    echo "=== VERIFICANDO ESTRUTURA DO BANCO ===\n\n";

    // 1. Verificar valor_hora_venda
    echo "1. Verificando coluna valor_hora_venda...\n";
    $stmt = $pdo->query("SHOW COLUMNS FROM usuarios LIKE 'valor_hora_venda'");
    if ($stmt->rowCount() == 0) {
        echo "   ❌ Coluna não existe. Criando...\n";
        $pdo->exec("ALTER TABLE usuarios ADD COLUMN valor_hora_venda DECIMAL(10,2) DEFAULT 24.00 COMMENT 'Valor cobrado do cliente por hora'");
        echo "   ✅ Coluna criada com sucesso!\n";
    } else {
        echo "   ✅ Coluna já existe.\n";
    }

    // 2. Atualizar valores NULL
    echo "\n2. Atualizando valores NULL...\n";
    $pdo->exec("UPDATE usuarios SET valor_hora_venda = 24.00 WHERE tipo = 'funcionario' AND valor_hora_venda IS NULL");
    echo "   ✅ Valores atualizados.\n";

    // 3. Verificar outras colunas importantes
    echo "\n3. Verificando outras colunas...\n";

    $colunas = [
        'salario_base_mensal' => "DECIMAL(10,2) DEFAULT NULL COMMENT 'Salário base mensal do funcionário'",
        'vale_moradia' => "DECIMAL(10,2) DEFAULT NULL COMMENT 'Vale moradia'",
        'ibf' => "DECIMAL(10,2) DEFAULT NULL COMMENT 'IBF (Imposto sobre Benefícios Fiscais)'",
        'biometria' => "TINYINT(1) DEFAULT 0 COMMENT 'Se tem biometria cadastrada'",
        'funcao_id' => "INT(11) DEFAULT NULL COMMENT 'ID da função/cargo'",
        'total_horas' => "DECIMAL(10,2) DEFAULT 0 COMMENT 'Total de horas (para apontamentos)'"
    ];

    foreach ($colunas as $coluna => $tipo) {
        $stmt = $pdo->query("SHOW COLUMNS FROM usuarios LIKE '$coluna'");
        if ($stmt->rowCount() == 0) {
            echo "   ❌ Coluna $coluna não existe. Criando...\n";
            $pdo->exec("ALTER TABLE usuarios ADD COLUMN $coluna $tipo");
            echo "   ✅ Coluna $coluna criada!\n";
        } else {
            echo "   ✅ Coluna $coluna existe.\n";
        }
    }

    // 4. Mostrar estrutura final
    echo "\n=== ESTRUTURA FINAL DA TABELA USUARIOS ===\n";
    $stmt = $pdo->query("DESCRIBE usuarios");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo sprintf("%-30s %-20s\n", $row['Field'], $row['Type']);
    }

    echo "\n✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO!\n";

} catch (PDOException $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
    exit(1);
}
