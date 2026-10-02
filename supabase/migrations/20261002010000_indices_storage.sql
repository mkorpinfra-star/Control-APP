-- ============================================================================
-- MKORP — Índices para as consultas do app e restrição de upload no Storage
-- Data: 2026-10-02 · idempotente · aplicar DEPOIS de 20261002000000_seguranca_rls_estoque_ponto.sql
-- ============================================================================

-- Índices (as listas filtram por usuário/status/data e ordenam por criação)
create index if not exists idx_ponto_data            on public.controle_ponto (data);
create index if not exists idx_ponto_status_data     on public.controle_ponto (status, data);
create index if not exists idx_os_responsavel_status on public.ordens_servico (responsavel_id, status);
create index if not exists idx_os_status_conclusao   on public.ordens_servico (status, data_conclusao);
create index if not exists idx_req_usuario_status    on public.requisicoes (usuario_id, status);
create index if not exists idx_req_status_criado     on public.requisicoes (status, criado_em desc);
create index if not exists idx_reqi_requisicao       on public.requisicao_itens (requisicao_id);
create index if not exists idx_mov_item_criado       on public.movimentacoes_estoque (item_id, criado_em desc);
create index if not exists idx_reg_os                on public.registros_campo (os_id);
create index if not exists idx_audit_criado          on public.audit_log (criado_em desc);
create index if not exists idx_ajustes_ponto         on public.ponto_ajustes (ponto_id);
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='os_comentarios') then
    create index if not exists idx_com_os on public.os_comentarios (os_id, criado_em);
  end if;
end $$;

-- Storage: antes, qualquer autenticado enviava arquivo para QUALQUER bucket.
-- Agora: só usuário ativo, só no bucket do app, e foto de perfil só no próprio nome.
-- (O bucket continua público para leitura — os links já gravados seguem funcionando.
--  Recomendação futura: bucket privado + URLs assinadas.)
drop policy if exists "upload_autenticado" on storage.objects;
drop policy if exists fotos_campo_insert on storage.objects;
create policy fotos_campo_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fotos-campo'
    and public.usuario_ativo()
    and (name not like 'avatars/%' or name like 'avatars/' || auth.uid()::text || '\_%')
  );
drop policy if exists fotos_campo_admin on storage.objects;
create policy fotos_campo_admin on storage.objects for delete to authenticated
  using (bucket_id = 'fotos-campo' and public.e_admin());
