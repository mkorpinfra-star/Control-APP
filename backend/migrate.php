<?php
/**
 * Script de Migração: Adicionar colunas faltantes na tabela clientes
 * Executa: backend/sql/FIX_CLIENTES_ENDERECO.sql
 */

require_once __DIR__ . '/config/database.php';

try {
    $pdo = getConnection();

    echo "Iniciando migração...\n\n";

    // Ler o arquivo SQL
    $sqlFile = __DIR__ . '/sql/FIX_CLIENTES_ENDERECO.sql';

    if (!file_exists($sqlFile)) {
        throw new Exception("Arquivo SQL não encontrado: $sqlFile");
    }

    $sql = file_get_contents($sqlFile);

    // Executar a migração
    echo "Executando ALTER TABLE na tabela clientes...\n";
    $pdo->exec($sql);

    echo "✅ Migração concluída com sucesso!\n";
    echo "\nColunas adicionadas:\n";
    echo "  - nif (VARCHAR 50)\n";
    echo "  - email_financeiro (VARCHAR 200)\n";
    echo "  - endereco (TEXT)\n";
    echo "  - pessoa_contato (VARCHAR 200)\n";

} catch (Exception $e) {
    echo "❌ Erro na migração: " . $e->getMessage() . "\n";
    exit(1);
}
