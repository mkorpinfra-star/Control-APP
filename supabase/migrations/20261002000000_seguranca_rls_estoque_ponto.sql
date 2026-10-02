-- ============================================================================
-- MKORP — Endurecimento de segurança e regras de negócio (auditoria Play Store)
-- Data: 2026-10-02
--
-- Substitui as políticas "auth_all_*" (qualquer usuário logado lia/escrevia TUDO)
-- por autorização por papel no servidor, e move operações de estoque/requisição
-- para funções transacionais (com trava de linha e idempotência).
--
-- Idempotente. Testado localmente (Postgres 16 + PostgREST 12 + GoTrue 2.180)
-- com tests/local/seguranca.test.mjs. ANTES de aplicar em produção:
--   1) faça backup;  2) aplique primeiro num projeto Supabase de homologação;
--   3) confirme que as tabelas/colunas abaixo existem com esses nomes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Pré-requisitos de schema usados pelo app (aditivos)
-- ---------------------------------------------------------------------------
create table if not exists public.usuarios_documentos (
  usuario_id uuid primary key references public.usuarios(id) on delete cascade,
  cpf text,
  atualizado_em timestamptz default now()
);
create table if not exists public.audit_log (
  id bigserial primary key, usuario_id uuid, usuario_nome text, acao text not null,
  entidade text, entidade_id text, dados_antigos jsonb, dados_novos jsonb,
  motivo text, contexto text, criado_em timestamptz default now()
);
alter table public.controle_ponto add column if not exists fechado_em timestamptz;
alter table public.controle_ponto drop constraint if exists controle_ponto_status_check;
alter table public.controle_ponto add constraint controle_ponto_status_check
  check (status in ('rascunho','enviado','aprovado','rejeitado','fechado'));
alter table public.requisicoes add column if not exists entregue_em timestamptz;
alter table public.requisicoes add column if not exists cancelado_em timestamptz;
alter table public.requisicoes drop constraint if exists requisicoes_status_check;
alter table public.requisicoes add constraint requisicoes_status_check
  check (status in ('pendente','aprovada','rejeitada','entregue','cancelada'));
alter table public.movimentacoes_estoque add column if not exists usuario_id uuid references public.usuarios(id);

-- Integridade de quantidades
alter table public.almoxarifado_estoque drop constraint if exists almox_estoque_nao_negativo;
alter table public.almoxarifado_estoque add constraint almox_estoque_nao_negativo check (quantidade >= 0) not valid;
alter table public.requisicao_itens drop constraint if exists requisicao_itens_qtd_positiva;
alter table public.requisicao_itens add constraint requisicao_itens_qtd_positiva check (quantidade > 0) not valid;
alter table public.movimentacoes_estoque drop constraint if exists movimentacoes_qtd_positiva;
alter table public.movimentacoes_estoque add constraint movimentacoes_qtd_positiva check (quantidade > 0) not valid;
-- impede baixa duplicada da mesma requisição/item
create unique index if not exists uq_mov_saida_requisicao_item
  on public.movimentacoes_estoque (requisicao_id, item_id) where tipo = 'saida_requisicao';

-- ---------------------------------------------------------------------------
-- 1. Funções auxiliares de papel (SECURITY DEFINER evita recursão de RLS)
-- ---------------------------------------------------------------------------
create or replace function public.meu_cargo() returns text
language sql stable security definer set search_path = public as $$
  select cargo from public.usuarios where id = auth.uid() and coalesce(ativo, true)
$$;
create or replace function public.usuario_ativo() returns boolean
language sql stable security definer set search_path = public as $$
  select public.meu_cargo() is not null
$$;
create or replace function public.e_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select public.meu_cargo() = 'admin'
$$;
create or replace function public.e_gestor() returns boolean   -- admin ou supervisor
language sql stable security definer set search_path = public as $$
  select public.meu_cargo() in ('admin','supervisor')
$$;
create or replace function public.e_estoquista() returns boolean -- admin ou almoxarife
language sql stable security definer set search_path = public as $$
  select public.meu_cargo() in ('admin','almoxarife')
$$;
create or replace function public.pode_aprovar_requisicao() returns boolean
language sql stable security definer set search_path = public as $$
  select public.meu_cargo() in ('admin','supervisor','almoxarife')
$$;
revoke all on function public.meu_cargo(), public.usuario_ativo(), public.e_admin(), public.e_gestor(),
  public.e_estoquista(), public.pode_aprovar_requisicao() from anon;

-- ---------------------------------------------------------------------------
-- 2. Remove TODAS as políticas existentes das tabelas do app e liga RLS
-- ---------------------------------------------------------------------------
do $$
declare t text; p record;
  tabelas text[] := array['usuarios','usuarios_documentos','contratos','ordens_servico','registros_campo',
    'controle_ponto','almoxarifado_itens','almoxarifado_estoque','movimentacoes_estoque','requisicoes',
    'requisicao_itens','os_comentarios','config_empresa','notificacoes','materiais_usados','tipos_servico',
    'precos_servico','os_servicos','medicoes','audit_log'];
begin
  foreach t in array tabelas loop
    if not exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      raise notice 'Tabela % não existe, pulando.', t; continue;
    end if;
    for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Políticas por tabela
-- ---------------------------------------------------------------------------
-- USUÁRIOS: todos os ativos leem (nomes em listas); só admin cria/edita outros.
create policy usuarios_sel on public.usuarios for select to authenticated using (public.usuario_ativo());
-- o próprio usuário sempre lê a sua linha (o app precisa saber se está desativado)
create policy usuarios_sel_self on public.usuarios for select to authenticated using (id = auth.uid());
create policy usuarios_ins on public.usuarios for insert to authenticated with check (public.e_admin());
create policy usuarios_upd_admin on public.usuarios for update to authenticated using (public.e_admin()) with check (public.e_admin());
create policy usuarios_upd_self on public.usuarios for update to authenticated using (id = auth.uid() and public.usuario_ativo()) with check (id = auth.uid());
-- (sem DELETE: desativação é por ativo=false)

-- Campos que só o admin pode mudar (o próprio usuário só altera telefone/avatar)
create or replace function public.trg_usuarios_protege_campos() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.e_admin() then return new; end if; -- service_role / admin
  if new.cargo is distinct from old.cargo or new.ativo is distinct from old.ativo
     or new.acessos is distinct from old.acessos or new.email is distinct from old.email
     or new.matricula is distinct from old.matricula or new.id is distinct from old.id then
    raise exception 'Sem permissão para alterar cargo, acesso, status, e-mail ou matrícula' using errcode = '42501';
  end if;
  return new;
end $$;
drop trigger if exists usuarios_protege_campos on public.usuarios;
create trigger usuarios_protege_campos before update on public.usuarios
  for each row execute function public.trg_usuarios_protege_campos();

-- CPF: só admin (e o próprio titular pode ler)
create policy docs_admin on public.usuarios_documentos for all to authenticated using (public.e_admin()) with check (public.e_admin());
create policy docs_self_sel on public.usuarios_documentos for select to authenticated using (usuario_id = auth.uid() and public.usuario_ativo());

-- CONFIG DA EMPRESA
create policy config_sel on public.config_empresa for select to authenticated using (public.usuario_ativo());
create policy config_admin on public.config_empresa for all to authenticated using (public.e_admin()) with check (public.e_admin());

-- CONTRATOS: leitura p/ ativos; gestores criam/editam; só admin apaga
create policy contratos_sel on public.contratos for select to authenticated using (public.usuario_ativo());
create policy contratos_ins on public.contratos for insert to authenticated with check (public.e_gestor());
create policy contratos_upd on public.contratos for update to authenticated using (public.e_gestor()) with check (public.e_gestor());
create policy contratos_del on public.contratos for delete to authenticated using (public.e_admin());

-- ORDENS DE SERVIÇO: gestores e almoxarife veem todas; campo vê as suas
create policy os_sel on public.ordens_servico for select to authenticated
  using (public.e_gestor() or public.meu_cargo() = 'almoxarife' or (responsavel_id = auth.uid() and public.usuario_ativo()));
create policy os_ins on public.ordens_servico for insert to authenticated with check (public.e_gestor());
create policy os_upd_gestor on public.ordens_servico for update to authenticated using (public.e_gestor()) with check (public.e_gestor());
create policy os_upd_resp on public.ordens_servico for update to authenticated
  using (responsavel_id = auth.uid() and public.usuario_ativo()) with check (responsavel_id = auth.uid());
create policy os_del on public.ordens_servico for delete to authenticated using (public.e_admin());

create or replace function public.trg_os_campo_restrito() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.e_gestor() then return new; end if;
  -- responsável em campo só altera localização, andamento e conclusão
  if new.contrato_id is distinct from old.contrato_id or new.responsavel_id is distinct from old.responsavel_id
     or new.tipo_defeito is distinct from old.tipo_defeito or new.prioridade is distinct from old.prioridade
     or new.numero is distinct from old.numero or new.descricao is distinct from old.descricao
     or (new.status is distinct from old.status and new.status not in ('em_andamento','concluida')) then
    raise exception 'Responsável só pode atualizar localização e andamento da OS' using errcode = '42501';
  end if;
  return new;
end $$;
drop trigger if exists os_campo_restrito on public.ordens_servico;
create trigger os_campo_restrito before update on public.ordens_servico
  for each row execute function public.trg_os_campo_restrito();

-- REGISTROS DE CAMPO / MATERIAIS USADOS / COMENTÁRIOS (herdam visibilidade da OS)
create policy reg_sel on public.registros_campo for select to authenticated
  using (public.e_gestor() or usuario_id = auth.uid()
         or exists (select 1 from public.ordens_servico o where o.id = os_id and o.responsavel_id = auth.uid()));
create policy reg_ins on public.registros_campo for insert to authenticated
  with check (usuario_id = auth.uid() and public.usuario_ativo());
create policy reg_upd on public.registros_campo for update to authenticated
  using (usuario_id = auth.uid() and criado_em > now() - interval '1 hour') with check (usuario_id = auth.uid());
create policy reg_admin on public.registros_campo for delete to authenticated using (public.e_admin());

do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='materiais_usados') then
    execute $p$create policy mat_sel on public.materiais_usados for select to authenticated using (public.usuario_ativo())$p$;
    execute $p$create policy mat_ins on public.materiais_usados for insert to authenticated with check (
      exists (select 1 from public.registros_campo r where r.id = registro_id and r.usuario_id = auth.uid()))$p$;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='os_comentarios') then
    execute $p$create policy com_sel on public.os_comentarios for select to authenticated
      using (public.e_gestor() or public.meu_cargo() = 'almoxarife' or usuario_id = auth.uid()
             or exists (select 1 from public.ordens_servico o where o.id = os_id and o.responsavel_id = auth.uid()))$p$;
    execute $p$create policy com_ins on public.os_comentarios for insert to authenticated
      with check (usuario_id = auth.uid() and public.usuario_ativo())$p$;
  end if;
end $$;

-- CONTROLE DE PONTO
create policy ponto_sel on public.controle_ponto for select to authenticated
  using ((usuario_id = auth.uid() and public.usuario_ativo()) or public.e_gestor());
create policy ponto_ins on public.controle_ponto for insert to authenticated
  with check (usuario_id = auth.uid() and public.usuario_ativo() and status in ('rascunho','enviado'));
create policy ponto_upd_self on public.controle_ponto for update to authenticated
  using (usuario_id = auth.uid() and public.usuario_ativo() and status in ('rascunho','rejeitado'))
  with check (usuario_id = auth.uid() and status in ('rascunho','enviado'));
create policy ponto_upd_gestor on public.controle_ponto for update to authenticated
  using (public.e_gestor()) with check (public.e_gestor());
-- (sem DELETE)

create or replace function public.trg_ponto_regras() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;               -- service_role
  if tg_op = 'UPDATE' then
    if old.status = 'fechado' and not public.e_admin() then
      raise exception 'Ponto fechado não pode ser alterado' using errcode = '42501';
    end if;
    if new.usuario_id is distinct from old.usuario_id or new.data is distinct from old.data then
      raise exception 'Não é permitido mover o registro de ponto' using errcode = '42501';
    end if;
    if new.status in ('aprovado','rejeitado','fechado') and new.status is distinct from old.status then
      if new.usuario_id = auth.uid() and not public.e_admin() then
        raise exception 'Ninguém aprova o próprio ponto' using errcode = '42501';
      end if;
      if new.status = 'fechado' and not public.e_admin() then
        raise exception 'Somente admin fecha o mês' using errcode = '42501';
      end if;
      if new.status = 'fechado' and old.status <> 'aprovado' then
        raise exception 'Só pontos aprovados podem ser fechados' using errcode = '23514';
      end if;
      if new.status = 'aprovado' then new.aprovado_por := auth.uid(); new.aprovado_em := now(); end if;
      if new.status = 'fechado' then new.fechado_em := now(); end if;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists ponto_regras on public.controle_ponto;
create trigger ponto_regras before insert or update on public.controle_ponto
  for each row execute function public.trg_ponto_regras();

-- Trilha imutável de marcações/ajustes do ponto (hora do SERVIDOR)
create table if not exists public.ponto_ajustes (
  id bigserial primary key,
  ponto_id uuid not null,
  usuario_id uuid not null,
  data date not null,
  operacao text not null,
  status_antes text, status_depois text,
  horarios_antes jsonb, horarios_depois jsonb,
  gps jsonb,
  alterado_por uuid,
  registrado_em timestamptz not null default now()
);
alter table public.ponto_ajustes enable row level security;
revoke all on public.ponto_ajustes from anon;
drop policy if exists ajustes_sel on public.ponto_ajustes;
create policy ajustes_sel on public.ponto_ajustes for select to authenticated
  using ((usuario_id = auth.uid() and public.usuario_ativo()) or public.e_gestor());
-- sem insert/update/delete para clientes: só o trigger grava

create or replace function public.trg_ponto_trilha() returns trigger
language plpgsql security definer set search_path = public as $$
declare h_old jsonb; h_new jsonb;
begin
  h_new := jsonb_build_object('entrada', new.hora_entrada, 'saida', new.hora_saida,
            'almoco_saida', new.hora_almoco_saida, 'almoco_volta', new.hora_almoco_volta);
  if tg_op = 'UPDATE' then
    h_old := jsonb_build_object('entrada', old.hora_entrada, 'saida', old.hora_saida,
              'almoco_saida', old.hora_almoco_saida, 'almoco_volta', old.hora_almoco_volta);
    if h_old = h_new and old.status is not distinct from new.status then return new; end if;
  end if;
  insert into public.ponto_ajustes(ponto_id, usuario_id, data, operacao, status_antes, status_depois,
         horarios_antes, horarios_depois, gps, alterado_por)
  values (new.id, new.usuario_id, new.data, tg_op,
          case when tg_op = 'UPDATE' then old.status end, new.status, h_old, h_new,
          jsonb_strip_nulls(jsonb_build_object(
            'latitude_entrada', to_jsonb(new)->'latitude_entrada', 'longitude_entrada', to_jsonb(new)->'longitude_entrada',
            'latitude_saida', to_jsonb(new)->'latitude_saida', 'longitude_saida', to_jsonb(new)->'longitude_saida')),
          auth.uid());
  return new;
end $$;
drop trigger if exists ponto_trilha on public.controle_ponto;
create trigger ponto_trilha after insert or update on public.controle_ponto
  for each row execute function public.trg_ponto_trilha();

-- ALMOXARIFADO: catálogo lido por todos os ativos; escrita só estoquista.
create policy itens_sel on public.almoxarifado_itens for select to authenticated using (public.usuario_ativo());
create policy itens_ins on public.almoxarifado_itens for insert to authenticated with check (public.e_estoquista());
create policy itens_upd on public.almoxarifado_itens for update to authenticated using (public.e_estoquista()) with check (public.e_estoquista());
-- saldo e movimentações: leitura; escrita SOMENTE pelas funções abaixo
create policy estoque_sel on public.almoxarifado_estoque for select to authenticated using (public.usuario_ativo());
create policy mov_sel on public.movimentacoes_estoque for select to authenticated using (public.e_gestor() or public.e_estoquista());

-- cria a linha de saldo automaticamente ao cadastrar item
create or replace function public.trg_item_cria_saldo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.almoxarifado_estoque(item_id, quantidade) values (new.id, 0) on conflict (item_id) do nothing;
  return new;
end $$;
drop trigger if exists item_cria_saldo on public.almoxarifado_itens;
create trigger item_cria_saldo after insert on public.almoxarifado_itens
  for each row execute function public.trg_item_cria_saldo();

-- REQUISIÇÕES
create policy req_sel on public.requisicoes for select to authenticated
  using ((usuario_id = auth.uid() and public.usuario_ativo()) or public.pode_aprovar_requisicao());
-- criação/aprovação/rejeição/cancelamento via funções (sem insert/update direto)
create policy reqi_sel on public.requisicao_itens for select to authenticated
  using (exists (select 1 from public.requisicoes r where r.id = requisicao_id
                 and ((r.usuario_id = auth.uid() and public.usuario_ativo()) or public.pode_aprovar_requisicao())));
create policy reqi_upd on public.requisicao_itens for update to authenticated
  using (public.pode_aprovar_requisicao()) with check (public.pode_aprovar_requisicao());

create or replace function public.trg_reqi_resposta_somente() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if new.item_id is distinct from old.item_id or new.quantidade is distinct from old.quantidade
     or new.requisicao_id is distinct from old.requisicao_id then
    raise exception 'Somente a resposta do almoxarife pode ser alterada' using errcode = '42501';
  end if;
  return new;
end $$;
drop trigger if exists reqi_resposta_somente on public.requisicao_itens;
create trigger reqi_resposta_somente before update on public.requisicao_itens
  for each row execute function public.trg_reqi_resposta_somente();

-- NOTIFICAÇÕES: cada um lê/marca as suas; usuários ativos podem notificar outros
create policy notif_sel on public.notificacoes for select to authenticated using (usuario_id = auth.uid());
create policy notif_upd on public.notificacoes for update to authenticated using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy notif_ins on public.notificacoes for insert to authenticated with check (public.usuario_ativo());

-- MEDIÇÃO / VALORES (R$ só admin; gestores lançam serviços na OS)
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='tipos_servico') then
    execute $p$create policy ts_sel on public.tipos_servico for select to authenticated using (public.e_gestor())$p$;
    execute $p$create policy ts_admin on public.tipos_servico for all to authenticated using (public.e_admin()) with check (public.e_admin())$p$;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='precos_servico') then
    execute $p$create policy ps_admin on public.precos_servico for all to authenticated using (public.e_admin()) with check (public.e_admin())$p$;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='os_servicos') then
    execute $p$create policy oss_gestor on public.os_servicos for all to authenticated using (public.e_gestor()) with check (public.e_gestor())$p$;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='medicoes') then
    execute $p$create policy med_admin on public.medicoes for all to authenticated using (public.e_admin()) with check (public.e_admin())$p$;
  end if;
end $$;

-- AUDITORIA: append-only. Qualquer ativo registra (com o próprio id); só admin lê.
create policy audit_ins on public.audit_log for insert to authenticated
  with check (public.usuario_ativo() and usuario_id = auth.uid());
create policy audit_sel on public.audit_log for select to authenticated using (public.e_admin());
revoke update, delete, truncate on public.audit_log from authenticated;
revoke update, delete, truncate on public.ponto_ajustes from authenticated;

-- ---------------------------------------------------------------------------
-- 4. Funções transacionais de estoque / requisição
-- ---------------------------------------------------------------------------
create or replace function public.estoque_entrada(p_item_id uuid, p_quantidade numeric, p_observacao text default '')
returns numeric language plpgsql security definer set search_path = public as $$
declare v_saldo numeric;
begin
  if not public.e_estoquista() then raise exception 'Sem permissão para movimentar estoque' using errcode='42501'; end if;
  if p_quantidade is null or p_quantidade <= 0 then raise exception 'Quantidade deve ser maior que zero' using errcode='22023'; end if;
  insert into public.almoxarifado_estoque(item_id, quantidade) values (p_item_id, 0) on conflict (item_id) do nothing;
  update public.almoxarifado_estoque set quantidade = quantidade + p_quantidade, atualizado_em = now()
   where item_id = p_item_id returning quantidade into v_saldo;
  insert into public.movimentacoes_estoque(item_id, tipo, quantidade, saldo_apos, observacao, usuario_id, entregue_por_id)
  values (p_item_id, 'entrada', p_quantidade, v_saldo, p_observacao, auth.uid(), null);
  insert into public.audit_log(usuario_id, acao, entidade, entidade_id, dados_novos)
  values (auth.uid(), 'estoque_entrada', 'almoxarifado_itens', p_item_id::text, jsonb_build_object('quantidade', p_quantidade, 'saldo_apos', v_saldo, 'observacao', p_observacao));
  return v_saldo;
end $$;

create or replace function public.estoque_saida(p_item_id uuid, p_quantidade numeric, p_observacao text default '')
returns numeric language plpgsql security definer set search_path = public as $$
declare v_saldo numeric;
begin
  if not public.e_estoquista() then raise exception 'Sem permissão para movimentar estoque' using errcode='42501'; end if;
  if p_quantidade is null or p_quantidade <= 0 then raise exception 'Quantidade deve ser maior que zero' using errcode='22023'; end if;
  select quantidade into v_saldo from public.almoxarifado_estoque where item_id = p_item_id for update;
  if v_saldo is null or v_saldo < p_quantidade then
    raise exception 'Estoque insuficiente (saldo: %)', coalesce(v_saldo, 0) using errcode='23514';
  end if;
  update public.almoxarifado_estoque set quantidade = quantidade - p_quantidade, atualizado_em = now()
   where item_id = p_item_id returning quantidade into v_saldo;
  insert into public.movimentacoes_estoque(item_id, tipo, quantidade, saldo_apos, observacao, usuario_id)
  values (p_item_id, 'saida_manual', p_quantidade, v_saldo, p_observacao, auth.uid());
  insert into public.audit_log(usuario_id, acao, entidade, entidade_id, dados_novos)
  values (auth.uid(), 'estoque_saida', 'almoxarifado_itens', p_item_id::text, jsonb_build_object('quantidade', p_quantidade, 'saldo_apos', v_saldo, 'observacao', p_observacao));
  return v_saldo;
end $$;

-- p_itens: [{"item_id": uuid|null, "nome_livre": text|null, "quantidade": number}]
create or replace function public.criar_requisicao(p_os_id uuid, p_itens jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_item jsonb; v_qtd numeric;
begin
  if not public.usuario_ativo() then raise exception 'Usuário inativo' using errcode='42501'; end if;
  if p_itens is null or jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'Informe ao menos um item' using errcode='22023';
  end if;
  insert into public.requisicoes(usuario_id, os_id, status) values (auth.uid(), p_os_id, 'pendente') returning id into v_id;
  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := (v_item->>'quantidade')::numeric;
    if v_qtd is null or v_qtd <= 0 then raise exception 'Quantidade deve ser maior que zero' using errcode='22023'; end if;
    if nullif(v_item->>'item_id','') is null and coalesce(trim(v_item->>'nome_livre'),'') = '' then
      raise exception 'Item sem identificação' using errcode='22023';
    end if;
    insert into public.requisicao_itens(requisicao_id, item_id, nome_livre, quantidade)
    values (v_id, nullif(v_item->>'item_id','')::uuid, nullif(trim(v_item->>'nome_livre'),''), v_qtd);
  end loop;
  return v_id;
end $$;

create or replace function public.aprovar_requisicao(p_requisicao_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_req record; v_item record; v_saldo numeric;
begin
  if not public.pode_aprovar_requisicao() then raise exception 'Sem permissão para aprovar requisição' using errcode='42501'; end if;
  select * into v_req from public.requisicoes where id = p_requisicao_id for update;
  if not found then raise exception 'Requisição não encontrada' using errcode='P0002'; end if;
  if v_req.status <> 'pendente' then
    raise exception 'Requisição já está "%": não pode ser aprovada novamente', v_req.status using errcode='23514';
  end if;
  -- trava os saldos em ordem determinística (evita deadlock entre aprovações concorrentes)
  for v_item in select ri.item_id, sum(ri.quantidade) as quantidade
                  from public.requisicao_itens ri
                 where ri.requisicao_id = p_requisicao_id and ri.item_id is not null
                 group by ri.item_id order by ri.item_id loop
    select quantidade into v_saldo from public.almoxarifado_estoque where item_id = v_item.item_id for update;
    if v_saldo is null or v_saldo < v_item.quantidade then
      raise exception 'Estoque insuficiente para o item % (saldo: %, pedido: %)',
        (select nome from public.almoxarifado_itens where id = v_item.item_id), coalesce(v_saldo,0), v_item.quantidade
        using errcode='23514';
    end if;
    update public.almoxarifado_estoque set quantidade = quantidade - v_item.quantidade, atualizado_em = now()
     where item_id = v_item.item_id returning quantidade into v_saldo;
    insert into public.movimentacoes_estoque(item_id, tipo, quantidade, saldo_apos, os_id, requisicao_id,
           retirado_por_id, usuario_id, observacao)
    values (v_item.item_id, 'saida_requisicao', v_item.quantidade, v_saldo, v_req.os_id, p_requisicao_id,
            v_req.usuario_id, auth.uid(), 'Requisição ' || p_requisicao_id);
  end loop;
  update public.requisicoes set status = 'aprovada', aprovado_em = now(), aprovado_por = auth.uid()
   where id = p_requisicao_id;
  insert into public.audit_log(usuario_id, acao, entidade, entidade_id)
  values (auth.uid(), 'requisicao_aprovada', 'requisicoes', p_requisicao_id::text);
end $$;

create or replace function public.rejeitar_requisicao(p_requisicao_id uuid, p_motivo text)
returns void language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  if not public.pode_aprovar_requisicao() then raise exception 'Sem permissão' using errcode='42501'; end if;
  if coalesce(trim(p_motivo),'') = '' then raise exception 'Informe o motivo' using errcode='22023'; end if;
  select status into v_status from public.requisicoes where id = p_requisicao_id for update;
  if v_status is distinct from 'pendente' then raise exception 'Só requisições pendentes podem ser rejeitadas' using errcode='23514'; end if;
  update public.requisicoes set status = 'rejeitada', motivo_rejeicao = p_motivo where id = p_requisicao_id;
  insert into public.audit_log(usuario_id, acao, entidade, entidade_id, motivo)
  values (auth.uid(), 'requisicao_rejeitada', 'requisicoes', p_requisicao_id::text, p_motivo);
end $$;

create or replace function public.cancelar_requisicao(p_requisicao_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_req record;
begin
  select * into v_req from public.requisicoes where id = p_requisicao_id for update;
  if not found or (v_req.usuario_id <> auth.uid() and not public.pode_aprovar_requisicao()) then
    raise exception 'Sem permissão' using errcode='42501';
  end if;
  if v_req.status <> 'pendente' then raise exception 'Só requisições pendentes podem ser canceladas' using errcode='23514'; end if;
  update public.requisicoes set status = 'cancelada', cancelado_em = now() where id = p_requisicao_id;
  insert into public.audit_log(usuario_id, acao, entidade, entidade_id)
  values (auth.uid(), 'requisicao_cancelada', 'requisicoes', p_requisicao_id::text);
end $$;

revoke all on function public.estoque_entrada(uuid, numeric, text), public.estoque_saida(uuid, numeric, text),
  public.criar_requisicao(uuid, jsonb), public.aprovar_requisicao(uuid), public.rejeitar_requisicao(uuid, text),
  public.cancelar_requisicao(uuid) from public, anon;
grant execute on function public.estoque_entrada(uuid, numeric, text), public.estoque_saida(uuid, numeric, text),
  public.criar_requisicao(uuid, jsonb), public.aprovar_requisicao(uuid), public.rejeitar_requisicao(uuid, text),
  public.cancelar_requisicao(uuid) to authenticated;

-- versões antigas inseguras (sem checagem de papel/estado)
drop function if exists public.entrada_estoque(uuid, numeric, text);
