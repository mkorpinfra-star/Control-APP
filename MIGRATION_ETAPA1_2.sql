-- ============================================================
-- MKORP CONTROL — Migration Etapa 1+2 (aditiva, idempotente)
-- Rode no SQL Editor do Supabase. Não remove nada.
-- ============================================================

-- OS: cancelamento com motivo + prazo (SLA)
alter table ordens_servico add column if not exists motivo_cancelamento text;
alter table ordens_servico add column if not exists prazo date;

-- Número de OS atômico (sequence + função)
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

-- Contratos: valor + SLA padrão (horas)
alter table contratos add column if not exists valor numeric(12,2);
alter table contratos add column if not exists sla_horas int;

-- Usuários: campos de RH
alter table usuarios add column if not exists cpf text;
alter table usuarios add column if not exists data_admissao date;

-- Requisições: controle de entrega física
alter table requisicoes add column if not exists entregue_em timestamptz;
