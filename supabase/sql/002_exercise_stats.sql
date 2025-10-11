-- Exercise stats table, RLS, and triggers
-- Run this in Supabase SQL Editor

-- Optional: ensure pgcrypto is available for gen_random_uuid()
-- create extension if not exists pgcrypto;

create table if not exists public.exercise_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Stable ID of the exercise/task coming from the frontend (slug, key, etc.)
  task_id text not null,
  task_title text not null,

  -- Total attempts a user has made for this task
  attempts_count int not null default 0,

  -- Best attempt metrics (denormalized for fast reads)
  best_time_ms int,
  best_accuracy numeric(5,2), -- e.g., 0..100 (%), adjust to your scale
  best_points int,

  -- Total number of questions asked to Tim for this task (denormalized)
  questions_count int not null default 0,

  -- Timestamps
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (user_id, task_id)
);

create index if not exists exercise_stats_user_task_idx
  on public.exercise_stats (user_id, task_id);

alter table public.exercise_stats enable row level security;

-- RLS: users can see and manage their own rows; admins can see/manage all
drop policy if exists "exercise_stats_select" on public.exercise_stats;
create policy "exercise_stats_select" on public.exercise_stats
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "exercise_stats_insert_self" on public.exercise_stats;
create policy "exercise_stats_insert_self" on public.exercise_stats
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "exercise_stats_update_self" on public.exercise_stats;
create policy "exercise_stats_update_self" on public.exercise_stats
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "exercise_stats_delete_admin" on public.exercise_stats;
create policy "exercise_stats_delete_admin" on public.exercise_stats
for delete to authenticated
using (public.is_admin());

-- Utility trigger to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists exercise_stats_set_updated_at on public.exercise_stats;
create trigger exercise_stats_set_updated_at
before update on public.exercise_stats
for each row execute function public.set_updated_at();
