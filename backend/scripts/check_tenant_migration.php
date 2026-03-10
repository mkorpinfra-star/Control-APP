<?php
/**
 * Script para verificar quais APIs ainda não foram migradas para multi-tenant
 *
 * Uso: php backend/scripts/check_tenant_migration.php
 */

$apiDir = __DIR__ . '/../api';

// Pastas a verificar
$folders = [
    'apontamentos',
    'aprovacoes',
    'auth',
    'clientes',
    'encarregados',
    'financeiro',
    'folha-pagamento',
    'notificacoes',
    'obras',
    'relatorios',
    'usuarios',
];

echo "\n========================================\n";
echo "  🔍 VERIFICAÇÃO DE MIGRAÇÃO MULTI-TENANT\n";
echo "========================================\n\n";

$totalFiles = 0;
$migratedFiles = 0;
$unmigratedFiles = 0;

$unmigrated = [];

foreach ($folders as $folder) {
    $path = $apiDir . '/' . $folder;

    if (!is_dir($path)) {
        continue;
    }

    echo "📂 $folder/\n";

    $files = glob($path . '/*.php');

    foreach ($files as $file) {
        $totalFiles++;
        $filename = basename($file);

        // Pular arquivos de teste
        if (strpos($filename, 'test') !== false || strpos($filename, 'debug') !== false) {
            continue;
        }

        $content = file_get_contents($file);

        // Verificar se usa tenant_middleware
        $usesTenantMiddleware = strpos($content, 'tenant_middleware.php') !== false;
        $usesValidateTenantAccess = strpos($content, 'validateTenantAccess()') !== false;

        if ($usesTenantMiddleware && $usesValidateTenantAccess) {
            echo "  ✅ $filename (migrado)\n";
            $migratedFiles++;
        } else {
            echo "  ❌ $filename (PRECISA MIGRAR)\n";
            $unmigratedFiles++;
            $unmigrated[] = "$folder/$filename";
        }
    }

    echo "\n";
}

echo "========================================\n";
echo "📊 RESUMO\n";
echo "========================================\n";
echo "Total de arquivos: $totalFiles\n";
echo "✅ Migrados: $migratedFiles\n";
echo "❌ Não migrados: $unmigratedFiles\n";

if ($unmigrated) {
    echo "\n⚠️  ARQUIVOS QUE PRECISAM MIGRAÇÃO:\n\n";
    foreach ($unmigrated as $file) {
        echo "  - backend/api/$file\n";
    }
}

echo "\n========================================\n";

if ($unmigratedFiles === 0) {
    echo "🎉 PARABÉNS! Todos os arquivos foram migrados!\n";
} else {
    $percentage = round(($migratedFiles / $totalFiles) * 100, 1);
    echo "📈 Progresso: $percentage%\n";
    echo "\n💡 Próximo passo:\n";
    echo "   Atualizar os arquivos listados acima seguindo o guia em:\n";
    echo "   MULTI_TENANT_MIGRATION.md (Seção 4)\n";
}

echo "========================================\n\n";
