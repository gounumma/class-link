create extension if not exists pgcrypto;

create table public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  phone text,
  role text not null check (role in ('STUDENT','TUTOR','ADMIN')) default 'STUDENT',
  tutor_status text check (tutor_status in ('PENDING','APPROVED','REJECTED')),
  created_at timestamptz not null default now()
);

create table public.tutor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  school_name text not null,
  major text,
  education_status text not null check (education_status in ('ENROLLED','GRADUATED')),
  career text,
  bio text,
  certificate_file_path text,
  status text not null check (status in ('PENDING','APPROVED','REJECTED')) default 'PENDING',
  rejection_reason text,
  reviewed_by uuid references public.users_profile(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text,
  grade_level text,
  short_description text,
  full_description text,
  schedule_text text,
  price_text text,
  image_url text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  status text not null check (status in ('OPEN','CLOSED')) default 'OPEN',
  created_at timestamptz not null default now()
);

create unique index chat_threads_one_open_course
  on public.chat_threads(user_id, course_id) where status = 'OPEN';

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_id uuid not null references public.users_profile(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index chat_messages_thread_created on public.chat_messages(thread_id, created_at);
create index chat_messages_sender_created on public.chat_messages(sender_id, created_at desc);

create or replace function public.enforce_chat_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.sender_id::text, 0));
  if exists (
    select 1 from public.chat_messages
    where sender_id = new.sender_id
      and created_at > now() - interval '2 seconds'
  ) then
    raise exception 'Messages may only be sent once every 2 seconds' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger chat_messages_rate_limit
  before insert on public.chat_messages
  for each row execute function public.enforce_chat_rate_limit();

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  marketing_agreed boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.users_profile where id = auth.uid() and role = 'ADMIN');
$$;

create or replace function public.can_use_chat()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users_profile
    where id = auth.uid()
      and (role in ('STUDENT','ADMIN') or (role = 'TUTOR' and tutor_status = 'APPROVED'))
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.can_use_chat() from public;
grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.can_use_chat() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := case when new.raw_user_meta_data ->> 'role' = 'TUTOR' then 'TUTOR' else 'STUDENT' end;
  insert into public.users_profile (id, email, name, phone, role, tutor_status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), '회원'),
    new.raw_user_meta_data ->> 'phone',
    requested_role,
    case when requested_role = 'TUTOR' then 'PENDING' else null end
  );
  insert into public.consents (user_id, terms_version, privacy_version, marketing_agreed)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'terms_version', ''), '2026-06-24'),
    coalesce(nullif(new.raw_user_meta_data ->> 'privacy_version', ''), '2026-06-24'),
    coalesce((new.raw_user_meta_data ->> 'marketing_agreed')::boolean, false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger courses_set_updated_at before update on public.courses
for each row execute function public.set_updated_at();

alter table public.users_profile enable row level security;
alter table public.tutor_applications enable row level security;
alter table public.courses enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;
alter table public.consents enable row level security;

create policy "profiles_select_self_or_admin" on public.users_profile
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_update" on public.users_profile
  for update using (public.is_admin()) with check (public.is_admin());

create policy "applications_select_self_or_admin" on public.tutor_applications
  for select using (user_id = auth.uid() or public.is_admin());
create policy "applications_insert_self" on public.tutor_applications
  for insert with check (
    user_id = auth.uid() and exists (
      select 1 from public.users_profile where id = auth.uid() and role = 'TUTOR' and tutor_status = 'PENDING'
    )
  );
create policy "applications_admin_update" on public.tutor_applications
  for update using (public.is_admin()) with check (public.is_admin());

create policy "courses_public_read_published" on public.courses
  for select using (is_published or public.is_admin());
create policy "courses_admin_insert" on public.courses
  for insert with check (public.is_admin());
create policy "courses_admin_update" on public.courses
  for update using (public.is_admin()) with check (public.is_admin());
create policy "courses_admin_delete" on public.courses
  for delete using (public.is_admin());

create policy "threads_select_owner_or_admin" on public.chat_threads
  for select using (user_id = auth.uid() or public.is_admin());
create policy "threads_insert_owner" on public.chat_threads
  for insert with check (user_id = auth.uid() and public.can_use_chat());
create policy "threads_admin_update" on public.chat_threads
  for update using (public.is_admin()) with check (public.is_admin());

create policy "messages_select_thread_participant" on public.chat_messages
  for select using (exists (
    select 1 from public.chat_threads t
    where t.id = thread_id and (t.user_id = auth.uid() or public.is_admin())
  ));
create policy "messages_insert_thread_participant" on public.chat_messages
  for insert with check (
    sender_id = auth.uid()
    and public.can_use_chat()
    and exists (
      select 1 from public.chat_threads t
      where t.id = thread_id and t.status = 'OPEN'
        and (t.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "messages_mark_read_participant" on public.chat_messages
  for update using (exists (
    select 1 from public.chat_threads t
    where t.id = thread_id and (t.user_id = auth.uid() or public.is_admin())
  ));

create policy "consents_select_self_or_admin" on public.consents
  for select using (user_id = auth.uid() or public.is_admin());
create policy "consents_insert_self" on public.consents
  for insert with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tutor-certificates',
  'tutor-certificates',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "certificate_owner_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'tutor-certificates'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.users_profile where id = auth.uid() and role = 'TUTOR')
  );

create policy "certificate_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'tutor-certificates' and public.is_admin());

create policy "certificate_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'tutor-certificates' and public.is_admin());
