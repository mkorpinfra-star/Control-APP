-- ============================================================
-- MKORP CONTROL — Migration COMPLETA (todas as colunas do app)
-- Idempotente. Rode no SQL Editor do Supabase.
-- ============================================================

-- Usuários: RH + foto + acessos
alter table usuarios add column if not exists cpf text;
alter table usuarios add column if not exists data_admissao date;
alter table usuarios add column if not exists avatar_url text;
alter table usuarios add column if not exists acessos jsonb;

-- Materiais: campos extras (ESTE era o que faltava)
alter table almoxarifado_itens add column if not exists codigo text;
alter table almoxarifado_itens add column if not exists fornecedor text;
alter table almoxarifado_itens add column if not exists localizacao text;
alter table almoxarifado_itens add column if not exists valor_unitario numeric(12,2);
alter table almoxarifado_itens add column if not exists descricao text;

-- OS: cancelamento + prazo
alter table ordens_servico add column if not exists motivo_cancelamento text;
alter table ordens_servico add column if not exists prazo date;

-- Contratos: valor + SLA
alter table contratos add column if not exists valor numeric(12,2);
alter table contratos add column if not exists sla_horas int;

-- Requisições: entrega
alter table requisicoes add column if not exists entregue_em timestamptz;

-- Ponto: fechamento mensal
alter table controle_ponto add column if not exists fechado_em timestamptz;

-- Config empresa: acessos
alter table config_empresa add column if not exists acessos jsonb;

-- Número de OS atômico
do $$
declare mx bigint;
begin
  select coalesce(max(numero), 1000) into mx from ordens_servico;
  if not exists (select 1 from pg_class where relkind='S' and relname='os_numero_seq') then
    execute format('create sequence os_numero_seq start with %s', mx + 1);
  end if;
end $$;
create or replace function proximo_numero_os() returns bigint
language sql as $$ select nextval('os_numero_seq') $$;
