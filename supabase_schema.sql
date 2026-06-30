-- ============================================================
-- MKORP CONTROL — Schema Supabase
-- Rodar no SQL Editor do painel Supabase (uma vez)
-- ============================================================

-- Extensão para UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- USUÁRIOS (complementa auth.users do Supabase)
-- ============================================================
create table public.usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  email       text not null unique,
  telefone    text,
  cargo       text not null check (cargo in ('admin','supervisor','eletricista','ajudante','motorista')),
  matricula   text unique,
  ativo       boolean default true,
  criado_em   timestamptz default now()
);

-- ============================================================
-- CONTRATOS (prefeituras / municípios)
-- ============================================================
create table public.contratos (
  id           uuid primary key default uuid_generate_v4(),
  nome         text not null,
  municipio    text not null,
  estado       text not null,
  cnpj         text,
  responsavel  text,
  telefone     text,
  email        text,
  data_inicio  date,
  data_fim     date,
  status       text default 'ativo' check (status in ('ativo','encerrado','suspenso')),
  observacoes  text,
  criado_em    timestamptz default now()
);

-- ============================================================
-- ORDENS DE SERVIÇO
-- ============================================================
create table public.ordens_servico (
  id              uuid primary key default uuid_generate_v4(),
  numero          serial unique,
  contrato_id     uuid references public.contratos(id),
  responsavel_id  uuid references public.usuarios(id),
  tipo_defeito    text not null check (tipo_defeito in (
    'lampada_queimada','reator_defeituoso','cabo_danificado',
    'rele_fotoeletrico','braco_quebrado','poste_danificado',
    'vandalismo','manutencao_preventiva','outro'
  )),
  descricao       text,
  zona            text,
  bairro          text,
  logradouro      text,
  numero_poste    text,
  latitude        double precision,
  longitude       double precision,
  prioridade      text default 'normal' check (prioridade in ('baixa','normal','alta','urgente')),
  status          text default 'aberta' check (status in ('aberta','em_andamento','concluida','cancelada')),
  data_abertura   date default current_date,
  data_conclusao  date,
  observacoes     text,
  criado_em       timestamptz default now(),
  atualizado_em   timestamptz default now()
);

-- ============================================================
-- REGISTROS DE CAMPO (execução na OS)
-- ============================================================
create table public.registros_campo (
  id              uuid primary key default uuid_generate_v4(),
  os_id           uuid references public.ordens_servico(id) on delete cascade,
  usuario_id      uuid references public.usuarios(id),
  descricao       text not null,
  numero_poste    text,
  latitude        double precision,
  longitude       double precision,
  fotos           text[],          -- array de URLs do Storage
  status_apos     text check (status_apos in ('resolvido','parcial','aguardando_material','reaberto')),
  criado_em       timestamptz default now()
);

-- ============================================================
-- CONTROLE DE PONTO
-- ============================================================
create table public.controle_ponto (
  id               uuid primary key default uuid_generate_v4(),
  usuario_id       uuid references public.usuarios(id),
  data             date not null,
  os_id            uuid references public.ordens_servico(id),
  hora_entrada     time,
  hora_saida       time,
  hora_almoco_saida time,
  hora_almoco_volta time,
  horas_normais    numeric(4,2) default 0,
  horas_extras     numeric(4,2) default 0,
  horas_noturnas   numeric(4,2) default 0,
  status           text default 'rascunho' check (status in ('rascunho','enviado','aprovado','rejeitado')),
  motivo_rejeicao  text,
  aprovado_por     uuid references public.usuarios(id),
  aprovado_em      timestamptz,
  observacoes      text,
  criado_em        timestamptz default now(),
  unique(usuario_id, data)
);

-- ============================================================
-- ALMOXARIFADO — ITENS (catálogo)
-- ============================================================
create table public.almoxarifado_itens (
  id              uuid primary key default uuid_generate_v4(),
  nome            text not null,
  descricao       text,
  categoria       text not null check (categoria in (
    'lampada','reator','cabo','rele_fotoeletrico',
    'braco','luminaria','fusivel','conector','outros'
  )),
  unidade         text not null default 'un' check (unidade in ('un','m','kg','cx','rolo','par')),
  estoque_minimo  numeric(10,2) default 0,
  ativo           boolean default true,
  criado_em       timestamptz default now()
);

-- ============================================================
-- ALMOXARIFADO — ESTOQUE (saldo atual)
-- ============================================================
create table public.almoxarifado_estoque (
  id          uuid primary key default uuid_generate_v4(),
  item_id     uuid references public.almoxarifado_itens(id) unique,
  quantidade  numeric(10,2) default 0,
  atualizado_em timestamptz default now()
);

-- ============================================================
-- MOVIMENTAÇÕES DE ESTOQUE
-- ============================================================
create table public.movimentacoes_estoque (
  id              uuid primary key default uuid_generate_v4(),
  item_id         uuid references public.almoxarifado_itens(id),
  tipo            text not null check (tipo in ('entrada','saida_requisicao','saida_manual','ajuste')),
  quantidade      numeric(10,2) not null,
  saldo_apos      numeric(10,2) not null,
  os_id           uuid references public.ordens_servico(id),
  requisicao_id   uuid,
  entregue_por_id uuid references public.usuarios(id),   -- quem entregou (almoxarife / fornecedor)
  entregue_por_nome text,                                 -- nome livre p/ fornecedor externo
  retirado_por_id uuid references public.usuarios(id),   -- quem retirou (funcionário / almoxarife)
  observacao      text,
  criado_em       timestamptz default now()
);

-- ============================================================
-- REQUISIÇÕES DE MATERIAIS
-- ============================================================
create table public.requisicoes (
  id              uuid primary key default uuid_generate_v4(),
  usuario_id      uuid references public.usuarios(id),
  os_id           uuid references public.ordens_servico(id),
  status          text default 'pendente' check (status in ('pendente','aprovada','rejeitada','entregue')),
  motivo_rejeicao text,
  aprovado_por    uuid references public.usuarios(id),
  aprovado_em     timestamptz,
  observacoes     text,
  criado_em       timestamptz default now()
);

create table public.requisicao_itens (
  id             uuid primary key default uuid_generate_v4(),
  requisicao_id  uuid references public.requisicoes(id) on delete cascade,
  item_id        uuid references public.almoxarifado_itens(id),
  quantidade     numeric(10,2) not null
);

-- ============================================================
-- MATERIAIS USADOS (vinculados ao registro de campo)
-- ============================================================
create table public.materiais_usados (
  id              uuid primary key default uuid_generate_v4(),
  registro_id     uuid references public.registros_campo(id) on delete cascade,
  item_id         uuid references public.almoxarifado_itens(id),
  quantidade      numeric(10,2) not null
);

-- ============================================================
-- FUNÇÕES / TRIGGERS
-- ============================================================

-- Trigger: atualiza atualizado_em na OS
create or replace function update_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger os_atualizado_em
  before update on public.ordens_servico
  for each row execute function update_atualizado_em();

-- Função: entrada de estoque
create or replace function entrada_estoque(
  p_item_id uuid,
  p_quantidade numeric,
  p_observacao text default ''
) returns void as $$
declare
  v_saldo_atual numeric;
  v_saldo_novo  numeric;
begin
  -- Busca saldo atual ou cria registro
  insert into public.almoxarifado_estoque(item_id, quantidade)
  values (p_item_id, 0)
  on conflict (item_id) do nothing;

  select quantidade into v_saldo_atual
  from public.almoxarifado_estoque
  where item_id = p_item_id;

  v_saldo_novo := v_saldo_atual + p_quantidade;

  update public.almoxarifado_estoque
  set quantidade = v_saldo_novo, atualizado_em = now()
  where item_id = p_item_id;

  insert into public.movimentacoes_estoque(item_id, tipo, quantidade, saldo_apos, observacao)
  values (p_item_id, 'entrada', p_quantidade, v_saldo_novo, p_observacao);
end;
$$ language plpgsql;

-- Função: aprovar requisição (baixa no estoque)
create or replace function aprovar_requisicao(p_requisicao_id uuid) returns void as $$
declare
  v_item record;
  v_saldo_atual numeric;
  v_saldo_novo  numeric;
begin
  for v_item in
    select ri.item_id, ri.quantidade
    from public.requisicao_itens ri
    where ri.requisicao_id = p_requisicao_id
  loop
    select quantidade into v_saldo_atual
    from public.almoxarifado_estoque
    where item_id = v_item.item_id;

    if v_saldo_atual < v_item.quantidade then
      raise exception 'Estoque insuficiente para o item %', v_item.item_id;
    end if;

    v_saldo_novo := v_saldo_atual - v_item.quantidade;

    update public.almoxarifado_estoque
    set quantidade = v_saldo_novo, atualizado_em = now()
    where item_id = v_item.item_id;

    insert into public.movimentacoes_estoque(item_id, tipo, quantidade, saldo_apos, requisicao_id)
    values (v_item.item_id, 'saida_requisicao', v_item.quantidade, v_saldo_novo, p_requisicao_id);
  end loop;

  update public.requisicoes
  set status = 'aprovada', aprovado_em = now()
  where id = p_requisicao_id;
end;
$$ language plpgsql;

-- ============================================================
-- RLS (Row Level Security) — básico
-- ============================================================
alter table public.usuarios enable row level security;
alter table public.contratos enable row level security;
alter table public.ordens_servico enable row level security;
alter table public.registros_campo enable row level security;
alter table public.controle_ponto enable row level security;
alter table public.almoxarifado_itens enable row level security;
alter table public.almoxarifado_estoque enable row level security;
alter table public.movimentacoes_estoque enable row level security;
alter table public.requisicoes enable row level security;
alter table public.requisicao_itens enable row level security;
alter table public.materiais_usados enable row level security;

-- Política: usuários autenticados lêem tudo
create policy "leitura_autenticado" on public.usuarios for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.contratos for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.ordens_servico for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.registros_campo for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.controle_ponto for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.almoxarifado_itens for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.almoxarifado_estoque for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.movimentacoes_estoque for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.requisicoes for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.requisicao_itens for select using (auth.role() = 'authenticated');
create policy "leitura_autenticado" on public.materiais_usados for select using (auth.role() = 'authenticated');

-- Política: usuários autenticados escrevem
create policy "escrita_autenticado" on public.usuarios for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.contratos for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.ordens_servico for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.registros_campo for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.controle_ponto for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.almoxarifado_itens for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.almoxarifado_estoque for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.movimentacoes_estoque for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.requisicoes for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.requisicao_itens for all using (auth.role() = 'authenticated');
create policy "escrita_autenticado" on public.materiais_usados for all using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE — Bucket para fotos de campo
-- ============================================================
insert into storage.buckets (id, name, public) values ('fotos-campo', 'fotos-campo', true);
create policy "upload_autenticado" on storage.objects for insert with check (auth.role() = 'authenticated');
create policy "leitura_publica" on storage.objects for select using (bucket_id = 'fotos-campo');
