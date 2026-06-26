grant usage on schema public to anon, authenticated, service_role;

grant select on table public.courses to anon;
grant select, insert, update, delete on table public.courses to authenticated;
grant all privileges on table public.courses to service_role;

grant select on table public.users_profile to authenticated;
grant select, insert, update on table public.users_profile to service_role;

grant select, insert, update on table public.chat_threads to authenticated;
grant all privileges on table public.chat_threads to service_role;

grant select, insert, update on table public.chat_messages to authenticated;
grant all privileges on table public.chat_messages to service_role;

grant select, insert on table public.consents to authenticated;
grant all privileges on table public.consents to service_role;

grant select, insert, update on table public.tutor_applications to authenticated;
grant all privileges on table public.tutor_applications to service_role;

insert into public.users_profile (id, email, name, phone, role, tutor_status)
select
  auth_user.id,
  coalesce(auth_user.email, ''),
  coalesce(nullif(trim(auth_user.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(auth_user.email, '회원'), '@', 1), '회원'),
  auth_user.raw_user_meta_data ->> 'phone',
  case
    when lower(coalesce(auth_user.email, '')) = 'admin@classmoa.net' then 'ADMIN'
    when auth_user.raw_user_meta_data ->> 'role' in ('STUDENT', 'ADMIN', 'TUTOR') then auth_user.raw_user_meta_data ->> 'role'
    else 'STUDENT'
  end,
  case when auth_user.raw_user_meta_data ->> 'role' = 'TUTOR' then 'PENDING' else null end
from auth.users auth_user
left join public.users_profile profile on profile.id = auth_user.id
where profile.id is null;

insert into public.consents (user_id, terms_version, privacy_version, marketing_agreed)
select
  auth_user.id,
  coalesce(nullif(auth_user.raw_user_meta_data ->> 'terms_version', ''), '2026-06-24'),
  coalesce(nullif(auth_user.raw_user_meta_data ->> 'privacy_version', ''), '2026-06-24'),
  coalesce((auth_user.raw_user_meta_data ->> 'marketing_agreed')::boolean, false)
from auth.users auth_user
left join public.consents consent on consent.user_id = auth_user.id
where consent.user_id is null;
