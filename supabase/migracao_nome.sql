-- Adiciona o nome completo dos alunos (cadastro por e-mail ou Google). Já aplicada no projeto ai-master.
begin;
alter table public.ai_members add column full_name text not null default '' check (length(full_name)<=120);
create or replace function ai_master_private.new_member() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.ai_members(user_id,email,full_name)
 values(new.id,coalesce(new.email,''),left(trim(coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name','')),120))
 on conflict(user_id) do nothing;
 return new;
end; $$;
revoke all on function ai_master_private.new_member() from public,anon,authenticated;
update public.ai_members m set full_name=left(trim(coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name','')),120)
 from auth.users u where u.id=m.user_id and m.full_name='';
commit;
