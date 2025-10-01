-- Profiles table and RLS policies
-- Run this in Supabase SQL Editor

-- Optional: ensure pgcrypto is available for gen_random_uuid()
-- create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  matrikelnummer text,
  role text not null default 'student' check (role in ('student','admin')),
  preferences jsonb not null default '{}'::jsonb,
  progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  updated_at timestamptz
);

create index if not exists profiles_matrikelnummer_idx on public.profiles (matrikelnummer);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Helper function: check if current user is admin
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

-- SELECT policy: user can read own row; admins read all
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

-- INSERT policy: user can insert own row; admins can insert any
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

-- UPDATE policy: users can update their own row (must keep role=student); admins can update any
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = 'student');

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
for update
to authenticated
using (public.is_admin())
with check (true);

-- DELETE policy: only admins
drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles
for delete
to authenticated
using (public.is_admin());

-- Optional helper: promote current user to admin
-- update public.profiles set role = 'admin' where id = auth.uid();
