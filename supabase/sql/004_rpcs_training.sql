-- RPCs for recording attempts and Tim messages (with limits)

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

-- Per-task daily limit
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

-- Remaining credits helper
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
