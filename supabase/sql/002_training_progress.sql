-- Exercise progress, statistics, and Tim Q&A logs
-- Run this in Supabase SQL Editor

-- Optional: ensure pgcrypto is available for gen_random_uuid()
-- create extension if not exists pgcrypto;

-- =============================================================
-- 1) Per-user per-exercise aggregated stats
-- =============================================================
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

-- =============================================================
-- 2) Tim Q&A log (one row per user question/Tim response)
-- =============================================================
create table if not exists public.tim_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,   -- exercise this question belongs to
  task_title text not null,
  level text,              -- level at which question was asked
  tim_version text,        -- version of Tim used
  request text not null,   -- user question
  response text not null,  -- Tim/AI answer
  created_at timestamptz not null default now()
);

create index if not exists tim_messages_user_task_created_idx
  on public.tim_messages (user_id, task_id, created_at desc);

alter table public.tim_messages enable row level security;

drop policy if exists "tim_messages_select" on public.tim_messages;
create policy "tim_messages_select" on public.tim_messages
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "tim_messages_insert_self" on public.tim_messages;
create policy "tim_messages_insert_self" on public.tim_messages
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

-- Users shouldn't edit logs; allow only admins to update/delete
drop policy if exists "tim_messages_update_admin" on public.tim_messages;
create policy "tim_messages_update_admin" on public.tim_messages
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tim_messages_delete_admin" on public.tim_messages;
create policy "tim_messages_delete_admin" on public.tim_messages
for delete to authenticated
using (public.is_admin());

-- =============================================================
-- 3) Trigger: keep exercise_stats.questions_count in sync with tim_messages
-- =============================================================
create or replace function public.increment_questions_count_on_tim_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.exercise_stats (user_id, task_id, task_title, questions_count)
  values (new.user_id, new.task_id, new.task_title, 1)
  on conflict (user_id, task_id)
  do update set questions_count = public.exercise_stats.questions_count + 1,
                task_title = excluded.task_title,
                updated_at = now();
  return new;
end;
$$;

drop trigger if exists tim_messages_after_insert on public.tim_messages;
create trigger tim_messages_after_insert
after insert on public.tim_messages
for each row execute function public.increment_questions_count_on_tim_message();

-- =============================================================
-- 4) RPC helpers: safe server-side endpoints to record attempts/Q&A
-- =============================================================

-- Record an exercise attempt and update aggregates safely
create or replace function public.record_exercise_attempt(
  p_task_id text,
  p_task_title text,
  p_time_ms int,
  p_accuracy numeric(5,2),
  p_points int
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := now();
  v_best_time int;
  v_best_accuracy numeric(5,2);
  v_best_points int;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  -- Upsert row and increment attempts
  insert into public.exercise_stats as es (
    user_id, task_id, task_title, attempts_count, best_time_ms, best_accuracy, best_points, last_attempt_at
  ) values (
    v_user, p_task_id, p_task_title, 1, p_time_ms, p_accuracy, p_points, v_now
  )
  on conflict (user_id, task_id)
  do update set
    attempts_count = es.attempts_count + 1,
    last_attempt_at = v_now,
    task_title = p_task_title
  returning best_time_ms, best_accuracy, best_points
  into v_best_time, v_best_accuracy, v_best_points;

  -- Update best metrics if this attempt is better.
  -- Define "better" as: higher points first, then higher accuracy, then lower time.
  update public.exercise_stats
  set best_points = case when (v_best_points is null or p_points > v_best_points) then p_points else best_points end,
      best_accuracy = case
        when (v_best_points is null or p_points > v_best_points) then p_accuracy
        when (p_points = coalesce(v_best_points, p_points) and (v_best_accuracy is null or p_accuracy > v_best_accuracy)) then p_accuracy
        else best_accuracy
      end,
      best_time_ms = case
        when (v_best_points is null or p_points > v_best_points) then p_time_ms
        when (p_points = coalesce(v_best_points, p_points) and p_accuracy = coalesce(v_best_accuracy, p_accuracy) and (v_best_time is null or p_time_ms < v_best_time)) then p_time_ms
        else best_time_ms
      end
  where user_id = v_user and task_id = p_task_id;
end;
$$;

grant execute on function public.record_exercise_attempt(text, text, int, numeric, int) to authenticated;

-- Record a Tim message; returns the created message ID
create or replace function public.record_tim_message(
  p_task_id text,
  p_task_title text,
  p_level text,
  p_tim_version text,
  p_request text,
  p_response text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into public.tim_messages (user_id, task_id, task_title, level, tim_version, request, response)
  values (v_user, p_task_id, p_task_title, p_level, p_tim_version, p_request, p_response)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.record_tim_message(text, text, text, text, text, text) to authenticated;

-- Same as above but enforces a per-user per-task daily limit atomically
create or replace function public.record_tim_message_with_limit(
  p_task_id text,
  p_task_title text,
  p_level text,
  p_tim_version text,
  p_request text,
  p_response text,
  p_daily_limit int
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_count int;
  v_lock_key bigint;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  -- Serialize per user/task/day to avoid race conditions
  v_lock_key := hashtextextended(
    (v_user::text || '|' || p_task_id || '|' || now()::date::text), 0
  );
  perform pg_advisory_xact_lock(v_lock_key);

  select count(*)::int into v_count
  from public.tim_messages
  where user_id = v_user
    and task_id = p_task_id
    and created_at::date = now()::date;

  if v_count >= p_daily_limit then
    raise exception using
      errcode = 'P0001',
      message = 'tim_limit_exceeded',
      detail = format('Daily limit %s reached for task %s', p_daily_limit, p_task_id),
      hint = 'Try again tomorrow or increase limit.';
  end if;

  insert into public.tim_messages (user_id, task_id, task_title, level, tim_version, request, response)
  values (v_user, p_task_id, p_task_title, p_level, p_tim_version, p_request, p_response)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.record_tim_message_with_limit(text, text, text, text, text, text, int) to authenticated;

-- Global per-user daily limit (across all tasks)
create or replace function public.record_tim_message_with_global_limit(
  p_task_id text,
  p_task_title text,
  p_level text,
  p_tim_version text,
  p_request text,
  p_response text,
  p_daily_limit int
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_count int;
  v_lock_key bigint;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  -- Serialize per user/day
  v_lock_key := hashtextextended((v_user::text || '|' || now()::date::text), 0);
  perform pg_advisory_xact_lock(v_lock_key);

  select count(*)::int into v_count
  from public.tim_messages
  where user_id = v_user
    and created_at::date = now()::date;

  if v_count >= p_daily_limit then
    raise exception using
      errcode = 'P0001',
      message = 'tim_global_limit_exceeded',
      detail = format('Daily global limit %s reached', p_daily_limit),
      hint = 'Try again tomorrow or increase limit.';
  end if;

  insert into public.tim_messages (user_id, task_id, task_title, level, tim_version, request, response)
  values (v_user, p_task_id, p_task_title, p_level, p_tim_version, p_request, p_response)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.record_tim_message_with_global_limit(text, text, text, text, text, text, int) to authenticated;

-- Optional: helper view to quickly fetch per-task question counts (derived from tim_messages)
create or replace view public.tim_question_counts as
select user_id, task_id, count(*)::int as question_count
from public.tim_messages
group by user_id, task_id;

-- =============================================================
-- 5) Admin-friendly views (RLS still applies via underlying tables)
-- =============================================================
create or replace view public.admin_exercise_overview as
select
  es.user_id,
  p.email,
  p.display_name,
  p.matrikelnummer,
  p.role,
  es.task_id,
  es.task_title,
  es.attempts_count,
  es.questions_count,
  es.best_points,
  es.best_accuracy,
  es.best_time_ms,
  es.last_attempt_at,
  es.created_at as stats_created_at,
  es.updated_at as stats_updated_at,
  (
    select max(tm.created_at)
    from public.tim_messages tm
    where tm.user_id = es.user_id and tm.task_id = es.task_id
  ) as last_question_at
from public.exercise_stats es
left join public.profiles p on p.id = es.user_id;

create or replace view public.admin_tim_messages_recent as
select
  tm.id,
  tm.created_at,
  tm.user_id,
  p.email,
  p.display_name,
  p.matrikelnummer,
  p.role,
  tm.task_id,
  tm.task_title,
  tm.level,
  tm.tim_version,
  tm.request,
  tm.response
from public.tim_messages tm
left join public.profiles p on p.id = tm.user_id;

-- =============================================================
-- 6) RPC: compute remaining daily credits for Tim messages
-- =============================================================
create or replace function public.get_tim_remaining_credits(
  p_task_id text,
  p_task_daily_limit int,
  p_global_daily_limit int
) returns table (
  task_used int,
  global_used int,
  task_remaining int,
  global_remaining int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  return query
  with t_used as (
    select count(*)::int as c
    from public.tim_messages
    where user_id = v_user and task_id = p_task_id and created_at::date = now()::date
  ),
  g_used as (
    select count(*)::int as c
    from public.tim_messages
    where user_id = v_user and created_at::date = now()::date
  )
  select
    (select c from t_used) as task_used,
    (select c from g_used) as global_used,
    greatest(p_task_daily_limit - (select c from t_used), 0) as task_remaining,
    greatest(p_global_daily_limit - (select c from g_used), 0) as global_remaining;
end;
$$;

grant execute on function public.get_tim_remaining_credits(text, int, int) to authenticated;
