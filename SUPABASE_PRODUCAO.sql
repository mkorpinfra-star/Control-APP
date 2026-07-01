-- ============================================================
-- MKORP CONTROL — Script de produção (idempotente e tolerante)
-- Rode no SQL Editor do Supabase. Pula tabelas que não existem.
-- ============================================================

-- 1) Config da empresa
create table if not exists config_empresa (
  id int primary key default 1,
  nome text, cnpj text, telefone text, email text, endereco text,
  atualizado_em timestamptz default now(),
  constraint config_empresa_single check (id = 1)
);

-- 1b) Notificações
create table if not exists notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  titulo text not null, mensagem text, tipo text default 'info',
  link text, lida boolean default false, criado_em timestamptz default now()
);
create index if not exists idx_notif_usuario on notificacoes(usuario_id, lida);

-- 2) Policies para autenticados — só nas tabelas que EXISTEM
do $$
declare
  t text;
  tabelas text[] := array[
    'usuarios','contratos','ordens_servico','registros_campo',
    'controle_ponto','almoxarifado_itens','almoxarifado_estoque','movimentacoes_estoque',
    'requisicoes','requisicao_itens','os_comentarios','config_empresa','notificacoes',
    'materiais_usados'
  ];
begin
  foreach t in array tabelas loop
    -- pula se a tabela não existir no schema public
    if not exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      raise notice 'Tabela % não existe, pulando.', t;
      continue;
    end if;

    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "auth_all_%1$s" on %1$I;', t);
    execute format(
      'create policy "auth_all_%1$s" on %1$I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');', t);
  end loop;
end $$;

-- 3) Ajustes condicionais (só se a tabela/coluna existir)
do $$
begin
  -- coluna fechado_em no ponto
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='controle_ponto') then
    alter table controle_ponto add column if not exists fechado_em timestamptz;
  end if;

  -- remove CHECK de cargo (para aceitar 'almoxarife')
  if exists (select 1 from information_schema.table_constraints
    where table_name='usuarios' and constraint_name='usuarios_cargo_check') then
    execute 'alter table usuarios drop constraint usuarios_cargo_check';
  end if;

  -- remove CHECK de tipo de movimentação (para aceitar 'saida_manual')
  if exists (select 1 from information_schema.table_constraints
    where table_name='movimentacoes_estoque' and constraint_name='movimentacoes_estoque_tipo_check') then
    execute 'alter table movimentacoes_estoque drop constraint movimentacoes_estoque_tipo_check';
  end if;
end $$;

-- 4) Empresa inicial
insert into config_empresa (id, nome)
values (1, 'Mkorp Serviços de Iluminação')
on conflict (id) do nothing;

-- ============================================================
-- Depois de rodar, verifique os nomes reais das suas tabelas:
--   select table_name from information_schema.tables where table_schema='public' order by 1;
-- ============================================================
