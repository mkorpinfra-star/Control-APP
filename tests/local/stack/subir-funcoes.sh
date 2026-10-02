#!/bin/bash
# Executa as Edge Functions localmente com Deno (esm.sh é remapeado para npm: via import_map.json).
# Uso: ANON_KEY=... SERVICE_KEY=... ./tests/local/stack/subir-funcoes.sh
# Depois suba o gateway com FN_PORTS="admin-reset-senha=9101,admin-criar-usuario=9102,ia-imagem=9103"
D=$(cd "$(dirname "$0")" && pwd); R=$(cd "$D/../../.." && pwd); i=0
for f in admin-reset-senha admin-criar-usuario ia-imagem; do
  p=$((9101+i)); i=$((i+1))
  SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_ANON_KEY=$ANON_KEY SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY \
  OPENROUTER_KEY=${OPENROUTER_KEY:-chave-falsa} FN_PORT=$p FN_FILE=file://$R/supabase/functions/$f/index.ts \
  nohup ${DENO:-deno} run -A --import-map="$D/import_map.json" "$D/runner.ts" > /tmp/fn-$f.log 2>&1 &
done
