-- ===============================
-- GabaritKDP Mini-CMS (Markdown) for Guides/Articles
-- Supabase SQL: Tables + RLS Policies
-- ===============================

-- 1) Admin users table (who can create/update articles)
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

-- Optional: keep email in sync (manual is fine)

-- 2) Articles table
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  excerpt text,
  content_md text not null,
  cover_image_url text,
  language text not null default 'fr',
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_status_published_at on public.articles(status, published_at desc);
create index if not exists idx_articles_language on public.articles(language);

-- 3) updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

-- ===============================
-- RLS
-- ===============================
alter table public.admin_users enable row level security;
alter table public.articles enable row level security;

-- admin_users: user can see their own admin row (helps front-end check)
drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self"
on public.admin_users
for select
to authenticated
using (id = auth.uid());

-- admin_users: no public insert/update/delete by default (manage via SQL editor)

-- ARTICLES: PUBLIC READ published only
-- Anyone (anon or authenticated) can SELECT where published

drop policy if exists "articles_public_read_published" on public.articles;
create policy "articles_public_read_published"
on public.articles
for select
to anon, authenticated
using (status = 'published');

-- ARTICLES: ADMIN full access (create/update/delete)
-- Authenticated users who are in admin_users can do everything.

drop policy if exists "articles_admin_insert" on public.articles;
create policy "articles_admin_insert"
on public.articles
for insert
to authenticated
with check (
  exists (select 1 from public.admin_users au where au.id = auth.uid())
  and author_id = auth.uid()
);


drop policy if exists "articles_admin_update" on public.articles;
create policy "articles_admin_update"
on public.articles
for update
to authenticated
using (exists (select 1 from public.admin_users au where au.id = auth.uid()))
with check (exists (select 1 from public.admin_users au where au.id = auth.uid()));


drop policy if exists "articles_admin_delete" on public.articles;
create policy "articles_admin_delete"
on public.articles
for delete
to authenticated
using (exists (select 1 from public.admin_users au where au.id = auth.uid()));

-- OPTIONAL: allow admins to read drafts too (SELECT)
drop policy if exists "articles_admin_read_all" on public.articles;
create policy "articles_admin_read_all"
on public.articles
for select
to authenticated
using (exists (select 1 from public.admin_users au where au.id = auth.uid()));

-- ===============================
-- Bootstrap: add your own user as admin
-- Replace with your actual auth.user id once you have it.
-- Example:
-- insert into public.admin_users (id, email) values ('YOUR-USER-UUID','amzkdptessa@gmail.com');
-- ===============================
