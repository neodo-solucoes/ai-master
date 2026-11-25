-- AI Master: executar em um projeto Supabase NOVO pelo SQL Editor.
-- Não executar sobre um projeto existente sem revisar nomes e políticas.
begin;
create schema if not exists ai_master_private;
revoke all on schema ai_master_private from public;
grant usage on schema ai_master_private to authenticated;

create table public.ai_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '' check (length(full_name)<=120),
  approved boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.ai_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data)='object' and octet_length(data::text)<=2097152),
  revision integer not null default 1 check(revision>0),
  updated_at timestamptz not null default now()
);
create table public.ai_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 200),
  description text not null default '' check(length(description)<=2000),
  level_id integer not null check(level_id between 0 and 6),
  module_id text check(module_id is null or module_id ~ '^n[0-5]-m[1-6]$'),
  kind text not null constraint ai_materials_kind_check check(kind in ('pdf','epub','link','video')),
  object_path text unique,
  external_url text,
  access_mode text not null default 'approved' check(access_mode in ('approved','restricted')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint ai_materials_source_check check ((kind in ('pdf','epub') and object_path is not null and external_url is null) or
         (kind in ('link','video') and object_path is null and external_url is not null and external_url ~ '^https://')),
  check(module_id is null or module_id like ('n'||level_id||'-%'))
);
create table public.ai_material_grants (
  material_id uuid not null references public.ai_materials(id) on delete cascade,
  user_id uuid not null references public.ai_members(user_id) on delete cascade,
  primary key(material_id,user_id)
);
create index ai_material_grants_user on public.ai_material_grants(user_id);

-- Funções auxiliares não expostas na API pública. Consultam papéis no banco,
-- nunca metadados editáveis do usuário ou permissões informadas pelo navegador.
create function ai_master_private.is_approved() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.ai_members where user_id=(select auth.uid()) and approved);
$$;
create function ai_master_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.ai_members where user_id=(select auth.uid()) and approved and is_admin);
$$;
create function ai_master_private.can_read_material(mid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select ai_master_private.is_admin() or (ai_master_private.is_approved() and exists(
  select 1 from public.ai_materials m where m.id=mid and m.published and
  (m.access_mode='approved' or exists(select 1 from public.ai_material_grants g where g.material_id=m.id and g.user_id=(select auth.uid())))));
$$;
create function ai_master_private.can_read_object(p text) returns boolean language sql stable security definer set search_path='' as $$
 select ai_master_private.is_admin() or exists(select 1 from public.ai_materials m where m.object_path=p and ai_master_private.can_read_material(m.id));
$$;
create function ai_master_private.new_member() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.ai_members(user_id,email,full_name)
 values(new.id,coalesce(new.email,''),left(trim(coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name','')),120))
 on conflict(user_id) do nothing;
 return new;
end; $$;
create trigger ai_master_new_member after insert on auth.users for each row execute function ai_master_private.new_member();
insert into public.ai_members(user_id,email) select id,coalesce(email,'') from auth.users on conflict(user_id) do nothing;
revoke all on all functions in schema ai_master_private from public,anon,authenticated;
grant execute on function ai_master_private.is_approved(),ai_master_private.is_admin(),ai_master_private.can_read_material(uuid),ai_master_private.can_read_object(text) to authenticated;

alter table public.ai_members enable row level security;
alter table public.ai_progress enable row level security;
alter table public.ai_materials enable row level security;
alter table public.ai_material_grants enable row level security;
revoke all on public.ai_members,public.ai_progress,public.ai_materials,public.ai_material_grants from public,anon,authenticated;
grant select on public.ai_members to authenticated;
grant update(approved) on public.ai_members to authenticated;
grant select,insert,update on public.ai_progress to authenticated;
grant select,insert,update,delete on public.ai_materials,public.ai_material_grants to authenticated;
create policy ai_members_read on public.ai_members for select to authenticated using (user_id=(select auth.uid()) or (select ai_master_private.is_admin()));
create policy ai_members_approve on public.ai_members for update to authenticated using ((select ai_master_private.is_admin()) and not is_admin) with check ((select ai_master_private.is_admin()) and not is_admin);
create policy ai_progress_read on public.ai_progress for select to authenticated using (user_id=(select auth.uid()) and (select ai_master_private.is_approved()));
create policy ai_progress_insert on public.ai_progress for insert to authenticated with check (user_id=(select auth.uid()) and (select ai_master_private.is_approved()));
create policy ai_progress_update on public.ai_progress for update to authenticated using (user_id=(select auth.uid()) and (select ai_master_private.is_approved())) with check (user_id=(select auth.uid()) and (select ai_master_private.is_approved()));
create policy ai_materials_read on public.ai_materials for select to authenticated using (ai_master_private.can_read_material(id));
create policy ai_materials_manage on public.ai_materials for all to authenticated using ((select ai_master_private.is_admin())) with check ((select ai_master_private.is_admin()));
create policy ai_grants_manage on public.ai_material_grants for all to authenticated using ((select ai_master_private.is_admin())) with check ((select ai_master_private.is_admin()));

-- Compare-and-swap: evita que uma sessão antiga sobrescreva dados de outro dispositivo.
create function public.ai_save_progress(payload jsonb, expected_revision integer) returns integer language plpgsql security invoker set search_path='' as $$
declare next_revision integer;
begin
 if not ai_master_private.is_approved() then raise exception 'ACCESS_DENIED'; end if;
 if expected_revision=0 then
   insert into public.ai_progress(user_id,data,revision) values((select auth.uid()),payload,1)
   on conflict(user_id) do nothing returning revision into next_revision;
 else
   update public.ai_progress set data=payload,revision=revision+1,updated_at=now()
    where user_id=(select auth.uid()) and revision=expected_revision returning revision into next_revision;
 end if;
 if next_revision is null then raise exception 'SYNC_CONFLICT'; end if;
 return next_revision;
end; $$;
revoke all on function public.ai_save_progress(jsonb,integer) from public,anon,authenticated;
grant execute on function public.ai_save_progress(jsonb,integer) to authenticated;

-- Bucket privado: arquivos nunca são servidos por uma URL pública do GitHub.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ai-master-library','ai-master-library',false,52428800,array['application/pdf','application/epub+zip']);
create policy ai_library_read on storage.objects for select to authenticated using (bucket_id='ai-master-library' and ai_master_private.can_read_object(name));
create policy ai_library_insert on storage.objects for insert to authenticated with check (bucket_id='ai-master-library' and (select ai_master_private.is_admin()));
create policy ai_library_update on storage.objects for update to authenticated using (bucket_id='ai-master-library' and (select ai_master_private.is_admin())) with check (bucket_id='ai-master-library' and (select ai_master_private.is_admin()));
create policy ai_library_delete on storage.objects for delete to authenticated using (bucket_id='ai-master-library' and (select ai_master_private.is_admin()));
commit;

-- Depois de criar e confirmar a sua conta na plataforma, execute SEPARADAMENTE:
-- update public.ai_members set approved=true,is_admin=true where email='SEU_EMAIL';
-- confira: select user_id,email,approved,is_admin from public.ai_members;
