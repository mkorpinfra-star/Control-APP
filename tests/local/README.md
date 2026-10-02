# Ambiente local de testes (sem tocar em produção)

Emula o Supabase com Postgres 16 + PostgREST + GoTrue e dados **fictícios** (`seed.mjs`).

1. Baixe os binários para `tests/local/stack/` (não versionados):
   - PostgREST v12.2.3 (`postgrest-v12.2.3-linux-static-x64.tar.xz`)
   - Supabase Auth/GoTrue v2.180.0 (`auth-v2.180.0-x86.tar.gz`, inclui a pasta `migrations/`)
2. `./tests/local/stack/subir.sh` — imprime `ANON_KEY` e `SERVICE_KEY`.
   (`SEM_MIGRACAO=1` sobe o schema ORIGINAL, para reproduzir as falhas.)
3. Testes:
   ```bash
   npm run test:unit
   ANON_KEY=... SERVICE_KEY=... npm run test:api          # autorização + regras de estoque/ponto
   echo "VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=$ANON_KEY" > .env.local && npx vite build && npx vite preview --port 5173 &
   SERVICE_KEY=... npx playwright test -c playwright.local.config.js   # fluxos pela interface
   ```
Os testes de API alteram dados: recrie o banco (`subir.sh`) antes de cada rodada.
