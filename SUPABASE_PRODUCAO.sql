-- ============================================================
-- MKORP CONTROL — Script de produção
-- Rode ISTO no SQL Editor do Supabase (uma vez).
-- Cria a tabela de config da empresa e libera escrita para
-- usuários autenticados em todas as tabelas do app.
-- ============================================================

-- 1) Tabela de configuração da empresa (linha única id=1)
create table if not exists config_empresa (
  id int primary key default 1,
  nome text,
  cnpj text,
  telefone text,
  email text,
  endereco text,
  atualizado_em timestamptz default now(),
  constraint config_empresa_single check (id = 1)
);

alter table config_empresa enable row level security;

-- 1b) Tabela de notificações (in-app)
create table if not exists notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id) on delete cascade not null,
  titulo text not null,
  mensagem text,
  tipo text default 'info',
  link text,
  lida boolean default false,
  criado_em timestamptz default now()
);
create index if not exists idx_notif_usuario on notificacoes(usuario_id, lida);
alter table notificacoes enable row level security;

-- ============================================================
-- 2) Função utilitária: cria policies de leitura/escrita para
--    authenticated em uma tabela (idempotente).
-- ============================================================
do $$
declare
  t text;
  tabelas text[] := array[
    'usuarios','contratos','ordens_servico','registros_campo',
    'ponto','almoxarifado_itens','estoque','movimentacoes_estoque',
    'requisicoes','requisicao_itens','os_comentarios','config_empresa','notificacoes'
  ];
begin
  foreach t in array tabelas loop
    -- garante RLS ligado
    execute format('alter table %I enable row level security;', t);

    -- SELECT
    execute format('drop policy if exists "auth_select_%1$s" on %1$I;', t);
    execute format(
      'create policy "auth_select_%1$s" on %1$I for select using (auth.role() = ''authenticated'');', t);

    -- INSERT
    execute format('drop policy if exists "auth_insert_%1$s" on %1$I;', t);
    execute format(
      'create policy "auth_insert_%1$s" on %1$I for insert with check (auth.role() = ''authenticated'');', t);

    -- UPDATE
    execute format('drop policy if exists "auth_update_%1$s" on %1$I;', t);
    execute format(
      'create policy "auth_update_%1$s" on %1$I for update using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');', t);

    -- DELETE
    execute format('drop policy if exists "auth_delete_%1$s" on %1$I;', t);
    execute format(
      'create policy "auth_delete_%1$s" on %1$I for delete using (auth.role() = ''authenticated'');', t);
  end loop;
end $$;

-- ============================================================
-- 3) Linha inicial da empresa (edite depois pelo app em Config)
-- ============================================================
insert into config_empresa (id, nome)
values (1, 'Mkorp Serviços de Iluminação')
on conflict (id) do nothing;
