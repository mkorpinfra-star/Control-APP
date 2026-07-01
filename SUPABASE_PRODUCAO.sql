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
alter table config_empresa add column if not exists acessos jsonb;

-- 1b) Notificações
create table if not exists notificacoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  titulo text not null, mensagem text, tipo text default 'info',
  link text, lida boolean default false, criado_em timestamptz default now()
);
create index if not exists idx_notif_usuario on notificacoes(usuario_id, lida);

-- 1c) Módulo de Medição
create table if not exists tipos_servico (
  id uuid primary key default gen_random_uuid(),
  nome text not null, unidade text default 'un',
  valor_padrao numeric(12,2) default 0, ativo boolean default true,
  criado_em timestamptz default now()
);
create table if not exists precos_servico (
  id uuid primary key default gen_random_uuid(),
  tipo_servico_id uuid references tipos_servico(id) on delete cascade,
  contrato_id uuid references contratos(id) on delete cascade,
  valor numeric(12,2) not null,
  unique(tipo_servico_id, contrato_id)
);
create table if not exists os_servicos (
  id uuid primary key default gen_random_uuid(),
  os_id uuid references ordens_servico(id) on delete cascade not null,
  tipo_servico_id uuid references tipos_servico(id),
  quantidade numeric(12,2) default 1,
  valor_unitario numeric(12,2) default 0,
  valor_total numeric(12,2) default 0,
  criado_em timestamptz default now()
);
create table if not exists medicoes (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid references contratos(id),
  mes int, ano int,
  valor_total numeric(12,2) default 0,
  status text default 'aberta',
  gerado_em timestamptz default now(), fechado_em timestamptz,
  unique(contrato_id, ano, mes)
);

-- 2) Policies para autenticados — só nas tabelas que EXISTEM
do $$
declare
  t text;
  tabelas text[] := array[
    'usuarios','contratos','ordens_servico','registros_campo',
    'controle_ponto','almoxarifado_itens','almoxarifado_estoque','movimentacoes_estoque',
    'requisicoes','requisicao_itens','os_comentarios','config_empresa','notificacoes',
    'materiais_usados','tipos_servico','precos_servico','os_servicos','medicoes'
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

  -- override de acesso por usuário + foto de perfil
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='usuarios') then
    alter table usuarios add column if not exists acessos jsonb;
    alter table usuarios add column if not exists avatar_url text;
  end if;

  -- campos extras de material
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='almoxarifado_itens') then
    alter table almoxarifado_itens add column if not exists codigo text;
    alter table almoxarifado_itens add column if not exists fornecedor text;
    alter table almoxarifado_itens add column if not exists localizacao text;
    alter table almoxarifado_itens add column if not exists valor_unitario numeric(12,2);
    alter table almoxarifado_itens add column if not exists descricao text;
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
