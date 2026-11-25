-- Execute apenas em instalação AI Master anterior, antes de publicar os novos arquivos.
-- Preserva registros existentes e políticas RLS. Em instalação nova, use schema.sql.
begin;
do $$
declare c record; kinds integer:=0; sources integer:=0;
begin
 for c in select conname,pg_get_constraintdef(oid) as def
 from pg_constraint where conrelid='public.ai_materials'::regclass and contype='c'
 loop
  if c.def like '%kind%' and c.def like '%object_path%' and c.def like '%external_url%' then
   execute format('alter table public.ai_materials drop constraint %I',c.conname); sources:=sources+1;
  elsif c.def like '%kind%' and c.def like '%pdf%' and c.def like '%epub%' and c.def like '%link%' then
   execute format('alter table public.ai_materials drop constraint %I',c.conname); kinds:=kinds+1;
  end if;
 end loop;
 if kinds<>1 or sources<>1 then raise exception 'Estrutura inesperada; revise as constraints antes de migrar'; end if;
end $$;
alter table public.ai_materials
 add constraint ai_materials_kind_check check (kind in ('pdf','epub','link','video')),
 add constraint ai_materials_source_check check ((kind in ('pdf','epub') and object_path is not null and external_url is null) or (kind in ('link','video') and object_path is null and external_url is not null and external_url ~ '^https://'));
commit;
