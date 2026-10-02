-- Emula o bootstrap de um projeto Supabase (roles, schemas, grants padrão)
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;
create role authenticator login password 'authpass' noinherit;
grant anon, authenticated, service_role to authenticator;
create role supabase_auth_admin login password 'authpass' superuser createrole;
create role supabase_storage_admin nologin;

create schema if not exists auth authorization supabase_auth_admin;
create schema if not exists extensions;
create extension if not exists "uuid-ossp" with schema public;
create extension if not exists pgcrypto with schema public;

grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- Storage (stub suficiente para os scripts do projeto rodarem)
create schema if not exists storage;
create table storage.buckets (id text primary key, name text, public boolean default false);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid, created_at timestamptz default now());
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated, service_role;
grant all on storage.buckets, storage.objects to anon, authenticated, service_role;
