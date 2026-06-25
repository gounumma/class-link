alter table public.courses
  add column if not exists is_featured boolean not null default false;

create index if not exists courses_featured_sort
  on public.courses(is_featured, is_published, sort_order)
  where is_featured = true and is_published = true;

comment on column public.courses.is_featured is
  'When true, the published course appears in the home featured-course section.';
