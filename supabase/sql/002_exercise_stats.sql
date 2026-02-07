-- ============================================================
-- 002 – Exercise stats table, RLS, trigger
-- ============================================================
-- Run order: 2 of 5  (depends on: 001 for is_admin())
-- ============================================================

-- 1. Table
create table if not exists public.exercise_stats (
  user_id        uuid not null references auth.users(id) on delete cascade,
  task_id        text not null,
  task_title     text not null,
  attempts_count int not null default 0,
  best_time_ms   int,
  best_accuracy  numeric(5,2),
  best_points    int,
  questions_count int not null default 0,
  last_attempt_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  primary key (user_id, task_id)
);

create index if not exists exercise_stats_user_task_idx
  on public.exercise_stats (user_id, task_id);

-- 2. Enable RLS
alter table public.exercise_stats enable row level security;

-- 3. RLS policies
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

-- 4. Trigger: keep updated_at fresh
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
