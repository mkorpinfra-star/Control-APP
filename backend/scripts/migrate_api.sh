#!/bin/bash
# ========================================
# Script para auxiliar migração de APIs
# ========================================
# Uso: ./migrate_api.sh <caminho_do_arquivo>
# Exemplo: ./migrate_api.sh backend/api/apontamentos/list.php

if [ -z "$1" ]; then
    echo "❌ Erro: Informe o caminho do arquivo"
    echo "Uso: ./migrate_api.sh <caminho_do_arquivo>"
    echo "Exemplo: ./migrate_api.sh backend/api/apontamentos/list.php"
    exit 1
fi

FILE=$1

if [ ! -f "$FILE" ]; then
    echo "❌ Arquivo não encontrado: $FILE"
    exit 1
fi

echo "========================================="
echo "🔍 Analisando $FILE"
echo "========================================="

# Verificar se já foi migrado
if grep -q "tenant_middleware.php" "$FILE"; then
    echo "✅ Arquivo já migrado (usa tenant_middleware.php)"
    exit 0
fi

echo "⚠️  Arquivo PRECISA ser migrado"
echo ""

# Verificar se usa jwt.php
if grep -q "jwt.php" "$FILE"; then
    echo "📝 Padrão detectado: usa jwt.php"
    echo ""
    echo "🔧 Passos para migração:"
    echo ""
    echo "1. Trocar:"
    echo "   require_once __DIR__ . '/../../includes/jwt.php';"
    echo "   Por:"
    echo "   require_once __DIR__ . '/../../includes/tenant_middleware.php';"
    echo ""
    echo "2. Remover validação JWT manual e trocar por:"
    echo "   \$auth = validateTenantAccess();"
    echo "   \$tenant_id = \$auth['tenant_id'];"
    echo ""
    echo "3. Se exige admin, adicionar:"
    echo "   requireAdmin(\$auth);"
    echo ""
    echo "4. Adicionar tenant_id em TODAS as queries:"
    echo "   SELECT * FROM tabela WHERE condicao AND tenant_id = ?"
    echo "   \$stmt->execute([..., \$tenant_id]);"
    echo ""
    echo "5. Adicionar tenant_id em JOINs:"
    echo "   LEFT JOIN tabela t ON ... AND t.tenant_id = ?"
    echo ""
else
    echo "⚠️  Arquivo não usa jwt.php - revisar manualmente"
fi

echo ""
echo "========================================="
echo "📖 Ver exemplos em:"
echo "   - backend/api/obras/list.php"
echo "   - backend/api/obras/create.php"
echo "========================================="
