# Ambiente local de testes (sem tocar em produção)

Emula o Supabase com Postgres 16 + PostgREST + GoTrue e dados **fictícios** (`seed.mjs`).

1. Baixe os binários para `tests/local/stack/` (não versionados):
   - PostgREST v12.2.3 (`postgrest-v12.2.3-linux-static-x64.tar.xz`)
   - Supabase Auth/GoTrue v2.180.0 (`auth-v2.180.0-x86.tar.gz`, inclui a pasta `migrations/`)
   - Deno 2.x (para as Edge Functions)
2. `./tests/local/stack/subir.sh` — imprime `ANON_KEY` e `SERVICE_KEY`.
   Edge Functions: `ANON_KEY=… SERVICE_KEY=… ./tests/local/stack/subir-funcoes.sh` e reinicie o gateway com
   `FN_PORTS="admin-reset-senha=9101,admin-criar-usuario=9102,ia-imagem=9103" node tests/local/stack/proxy.mjs`.
   (`SEM_MIGRACAO=1` sobe o schema ORIGINAL, para reproduzir as falhas.)
3. Testes:
   ```bash
   npm run test:unit
   ANON_KEY=... SERVICE_KEY=... npm run test:api          # autorização, regras de estoque/ponto e Edge Functions
   psql -h /tmp -p 54322 -U postgres -d mkorp -v ele=<uuid> -v ina=<uuid> -f tests/local/storage_policies.sql
   echo "VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=$ANON_KEY" > .env.local && npx vite build && npx vite preview --port 5173 &
   SERVICE_KEY=... npx playwright test -c playwright.local.config.js   # fluxos pela interface
   ```
Os testes de API alteram dados: recrie o banco (`subir.sh`) antes de cada rodada.
