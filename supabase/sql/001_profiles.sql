-- ============================================================
-- 001 – Profiles table, helper function, RLS policies
-- ============================================================
-- Run order: 1 of 5  (no dependencies)
-- ============================================================

-- 1. Table
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  display_name  text,
  matrikelnummer text,
  gamertag      text not null
                  check (gamertag ~ '^[a-zA-Z0-9_]{3,20}$'),
  role          text not null default 'student'
                  check (role in ('student','admin')),
  leaderboard_opt_in boolean not null default true,
  preferences   jsonb not null default '{}'::jsonb,
  progress      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz,
  updated_at    timestamptz
);

-- 2. Indexes
create index if not exists profiles_matrikelnummer_idx
  on public.profiles (matrikelnummer);

-- Case-insensitive unique index for gamertag
create unique index if not exists idx_profiles_gamertag
  on public.profiles (lower(gamertag));

-- 3. Enable RLS
alter table public.profiles enable row level security;

-- 4. Helper function: check if current user is admin
create or replace function public.is_admin() returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- 5. RLS policies

-- SELECT: allow anon + authenticated to read any row
--   (needed for gamertag availability checks and leaderboard)
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_gamertag_check" on public.profiles;
create policy "profiles_gamertag_check" on public.profiles
for select
to anon, authenticated
using (true);

-- INSERT: user can insert own row; admins can insert any
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

-- UPDATE (self): users can update their own row but must keep role = student
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = 'student');

-- UPDATE (admin): admins can update any row
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
for update
to authenticated
using (public.is_admin())
with check (true);

-- DELETE: only admins
drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
for delete
to authenticated
using (public.is_admin());

-- 6. Trigger: auto-create profile on registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, email, display_name, matrikelnummer, gamertag,
    leaderboard_opt_in, preferences, progress,
    created_at, last_login_at, updated_at
  ) values (
    NEW.id,
    coalesce(NEW.email, ''),
    coalesce(NEW.raw_user_meta_data->>'displayName', ''),
    coalesce(NEW.raw_user_meta_data->>'matrikelnummer', ''),
    coalesce(NEW.raw_user_meta_data->>'gamertag', 'user_' || substr(NEW.id::text, 1, 8)),
    coalesce((NEW.raw_user_meta_data->>'leaderboardOptIn')::boolean, true),
    '{"theme":"auto","language":"de","notifications":{"email":true,"achievements":true,"reminders":false}}'::jsonb,
    '{"completedTasks":[],"totalPoints":0,"level":1,"achievements":[],"statistics":{"tasksCompleted":0,"timeSpent":0,"avgTaskTime":0,"lastActivity":""}}'::jsonb,
    now(), now(), now()
  )
  on conflict (id) do nothing;
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
