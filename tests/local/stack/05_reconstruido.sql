-- Objetos usados pelo código mas AUSENTES dos .sql do repositório
-- (reconstruídos a partir de src/services/supabase.js e das telas).
-- Servem para o ambiente local de testes; o schema real de produção não está versionado.

create table if not exists public.usuarios_documentos (
  usuario_id uuid primary key references public.usuarios(id) on delete cascade,
  cpf text,
  atualizado_em timestamptz default now()
);

create table if not exists public.audit_log (
  id bigserial primary key,
  usuario_id uuid,
  usuario_nome text,
  acao text not null,
  entidade text,
  entidade_id text,
  dados_antigos jsonb,
  dados_novos jsonb,
  motivo text,
  contexto text,
  criado_em timestamptz default now()
);

create table if not exists public.os_comentarios (
  id uuid primary key default gen_random_uuid(),
  os_id uuid references public.ordens_servico(id) on delete cascade,
  usuario_id uuid references public.usuarios(id),
  texto text,
  foto_url text,
  criado_em timestamptz default now()
);

alter table public.controle_ponto add column if not exists latitude_entrada double precision;
alter table public.controle_ponto add column if not exists longitude_entrada double precision;
alter table public.controle_ponto add column if not exists latitude_saida double precision;
alter table public.controle_ponto add column if not exists longitude_saida double precision;
-- o app grava status 'fechado' (fechamento mensal)
alter table public.controle_ponto drop constraint if exists controle_ponto_status_check;
alter table public.controle_ponto add constraint controle_ponto_status_check
  check (status in ('rascunho','enviado','aprovado','rejeitado','fechado'));

alter table public.requisicao_itens alter column item_id drop not null;
alter table public.requisicao_itens add column if not exists nome_livre text;
alter table public.requisicao_itens add column if not exists disponivel boolean;
alter table public.requisicao_itens add column if not exists resposta_almoxarife text;
alter table public.requisicao_itens add column if not exists previsao_data date;

alter table public.almoxarifado_itens add column if not exists consumo_medio_mensal numeric(12,2);
alter table public.almoxarifado_itens drop constraint if exists almoxarifado_itens_categoria_check;
alter table public.almoxarifado_itens drop constraint if exists almoxarifado_itens_unidade_check;

-- políticas "abertas" equivalentes às do SUPABASE_PRODUCAO.sql para as tabelas novas
do $$ declare t text; begin
  foreach t in array array['usuarios_documentos','audit_log','os_comentarios'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "auth_all_%1$s" on %1$I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', t);
  end loop;
end $$;
