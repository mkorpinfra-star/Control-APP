#!/bin/bash
# Sobe um "Supabase local" mínimo (Postgres 16 + PostgREST 12 + GoTrue 2.180 + gateway Node)
# com o schema do repositório, a migração de segurança e dados FICTÍCIOS.
# Pré-requisitos: postgresql-16, binários `postgrest` e `auth` (GoTrue) nesta pasta, Node 20+.
#   ./tests/local/stack/subir.sh   (rodar da raiz do projeto)
set -e
D=$(cd "$(dirname "$0")" && pwd); R=$(cd "$D/../../.." && pwd)
PGBIN=${PGBIN:-/usr/lib/postgresql/16/bin}; PGDATA=${PGDATA:-/tmp/mkorp-pg}
P="psql -h /tmp -p 54322 -U postgres -v ON_ERROR_STOP=1 -q"
[ -d "$PGDATA" ] || $PGBIN/initdb -D "$PGDATA" -U postgres --auth=trust >/dev/null
$PGBIN/pg_ctl -D "$PGDATA" -o "-p 54322 -k /tmp" -l "$PGDATA/log" start >/dev/null || true; sleep 2
$P -c "drop database if exists mkorp" -c "create database mkorp"
for r in anon authenticated service_role authenticator supabase_auth_admin supabase_storage_admin; do $P -c "drop role if exists $r" 2>/dev/null || true; done
$P -d mkorp -f "$D/00_bootstrap.sql"
set -a; . "$D/gotrue.env"; set +a
(cd "$D" && nohup ./auth > /tmp/gotrue.log 2>&1 &); sleep 5
$P -d mkorp -c "grant usage on schema auth to anon, authenticated, service_role; grant execute on all functions in schema auth to anon, authenticated, service_role;"
for f in supabase_schema.sql SUPABASE_PRODUCAO.sql MIGRATION_ETAPA1_2.sql MIGRATION_COMPLETA.sql; do $P -d mkorp -f "$R/$f" 2>&1 | grep -v NOTICE || true; done
$P -d mkorp -f "$D/05_reconstruido.sql"
[ "$SEM_MIGRACAO" = 1 ] || for m in "$R"/supabase/migrations/*.sql; do $P -d mkorp -f "$m" 2>&1 | grep -v NOTICE || true; done
(cd "$D" && nohup ./postgrest postgrest.conf > /tmp/postgrest.log 2>&1 &)
(cd "$D" && nohup node proxy.mjs > /tmp/gateway.log 2>&1 &); sleep 2
export ANON_KEY=$(node "$D/mkjwt.mjs" anon) SERVICE_KEY=$(node "$D/mkjwt.mjs" service_role)
(cd "$R" && node tests/local/seed.mjs)
echo "ANON_KEY=$ANON_KEY"; echo "SERVICE_KEY=$SERVICE_KEY"
echo "Gateway: http://127.0.0.1:54321  — use VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=\$ANON_KEY"
