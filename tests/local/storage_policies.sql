-- Testa as policies de upload do Storage simulando o JWT de cada usuário.
-- psql -v ele=<uuid> -v ina=<uuid> -f tests/local/storage_policies.sql   (espera: 5 linhas OK)
\set ON_ERROR_STOP 0
create or replace function pg_temp.tenta(uid uuid, bucket text, nome text) returns text language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', uid::text, true);
  set local role authenticated;
  insert into storage.objects(bucket_id, name) values (bucket, nome);
  return 'permitido';
exception when others then return 'negado';
end $$;
begin;
select case when pg_temp.tenta(:'ele', 'fotos-campo', '1_foto.jpg') = 'permitido' then 'OK  foto de campo permitida' else 'FALHA foto de campo' end;
rollback; begin;
select case when pg_temp.tenta(:'ele', 'outro-bucket', 'x.jpg') = 'negado' then 'OK  outro bucket negado' else 'FALHA outro bucket aceito' end;
rollback; begin;
select case when pg_temp.tenta(:'ele', 'fotos-campo', 'avatars/00000000-0000-0000-0000-000000000000_1.jpg') = 'negado' then 'OK  avatar de outra pessoa negado' else 'FALHA avatar alheio aceito' end;
rollback; begin;
select case when pg_temp.tenta(:'ele', 'fotos-campo', 'avatars/' || :'ele' || '_1.jpg') = 'permitido' then 'OK  próprio avatar permitido' else 'FALHA próprio avatar' end;
rollback; begin;
select case when pg_temp.tenta(:'ina', 'fotos-campo', '2_foto.jpg') = 'negado' then 'OK  usuário inativo negado' else 'FALHA inativo aceito' end;
rollback;
