-- ============================================================
-- 004 – RPCs (exercise attempts, Tim messages, leaderboard)
-- ============================================================
-- Run order: 4 of 5  (depends on: 002, 003 tables)
-- ============================================================

-- =============================================================
-- 1) Record an exercise attempt
--    Priority: accuracy > points > lower time
--    All best_* fields are updated together from the same attempt
-- =============================================================
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
  v_is_better boolean;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  -- Upsert row and increment attempts, capture current best metrics
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

  -- Decide if the new attempt is better: accuracy > points > lower time
  v_is_better := (
    v_best_accuracy is null or p_accuracy > v_best_accuracy
    or (
      p_accuracy = coalesce(v_best_accuracy, p_accuracy)
      and (
        p_points > coalesce(v_best_points, p_points)
        or (
          p_points = coalesce(v_best_points, p_points)
          and p_time_ms < coalesce(v_best_time, p_time_ms)
        )
      )
    )
  );

  -- If better, promote all best_* from this single attempt (no partial updates)
  update public.exercise_stats
  set best_points   = case when v_is_better then p_points   else best_points   end,
      best_accuracy = case when v_is_better then p_accuracy else best_accuracy end,
      best_time_ms  = case when v_is_better then p_time_ms  else best_time_ms  end
  where user_id = v_user and task_id = p_task_id;
end;
$$;

grant execute on function public.record_exercise_attempt(text, text, int, numeric, int) to authenticated;

-- =============================================================
-- 2) Record a Tim message (Anonymous, no user_id, no level)
-- =============================================================
create or replace function public.record_tim_message(
  p_task_id text,
  p_task_title text,
  p_tim_version text,
  p_request text,
  p_response text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.tim_messages (task_id, task_title, tim_version, request, response)
  values (p_task_id, p_task_title, p_tim_version, p_request, p_response)
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.record_tim_message(text, text, text, text, text) to authenticated;

-- =============================================================
-- 6) Leaderboard RPC
--    Paginated, ranked by accuracy then time
--    Always includes the current user's row
-- =============================================================
create or replace function public.get_leaderboard(
  p_task_id text,
  p_limit int default 5,
  p_offset int default 0
)
returns table (
  gamertag text,
  best_accuracy numeric(5,2),
  best_time_ms int,
  rank bigint,
  is_current_user boolean,
  total_count bigint
)
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select
      p.gamertag,
      es.best_accuracy,
      es.best_time_ms,
      es.user_id,
      row_number() over (
        order by es.best_accuracy desc nulls last, es.best_time_ms asc nulls last
      ) as rank
    from public.exercise_stats es
    inner join public.profiles p on p.id = es.user_id
    where es.task_id = p_task_id
      and es.best_accuracy is not null
      and p.leaderboard_opt_in = true
  ),
  total as (
    select count(*) as cnt from ranked
  )
  select
    r.gamertag,
    r.best_accuracy,
    r.best_time_ms,
    r.rank,
    (r.user_id = auth.uid()) as is_current_user,
    t.cnt as total_count
  from ranked r
  cross join total t
  where r.rank > p_offset and r.rank <= (p_offset + p_limit)
     or r.user_id = auth.uid()
  order by r.rank;
$$;

grant execute on function public.get_leaderboard(text, int, int) to authenticated;

-- =============================================================
-- 7) Get topic badges for the current user (Dynamic Calculation)
--    Returns one row per category with avg accuracy & badge level
--    Calculated on-the-fly from task_categories and exercise_stats
-- =============================================================
create or replace function public.get_user_badges()
returns table (
  category        text,
  avg_accuracy    numeric(5,2),
  badge_level     text,
  completed_tasks int,
  total_tasks     int
)
language sql
security definer
set search_path = public
as $$
  with category_totals as (
    select category, count(*)::int as total
    from public.task_categories
    group by category
  ),
  user_stats as (
    select
      tc.category,
      count(*)::int as completed,
      sum(es.best_accuracy) as sum_accuracy
    from public.exercise_stats es
    join public.task_categories tc on tc.task_id = es.task_id
    where es.user_id = auth.uid()
    group by tc.category
  )
  select
    ct.category,
    coalesce(round(us.sum_accuracy / ct.total, 2), 0) as avg_accuracy,
    case
        when coalesce(round(us.sum_accuracy / ct.total, 2), 0) >= 100 then 'diamond'
        when coalesce(round(us.sum_accuracy / ct.total, 2), 0) >= 90 then 'gold'
        when coalesce(round(us.sum_accuracy / ct.total, 2), 0) >= 80 then 'silver'
        when coalesce(round(us.sum_accuracy / ct.total, 2), 0) >= 50 then 'bronze'
        else 'none'
    end as badge_level,
    coalesce(us.completed, 0) as completed_tasks,
    ct.total as total_tasks
  from category_totals ct
  left join user_stats us on us.category = ct.category
  order by ct.category;
$$;


-- =============================================================
-- 8) Get exercise stats for the current user (Single Task)
--    Bypasses RLS to ensure consistent data retrieval
-- =============================================================
create or replace function public.get_my_exercise_stats(p_task_id text)
returns setof public.exercise_stats
language sql
security definer
set search_path = public
as $$
  select *
  from public.exercise_stats
  where user_id = auth.uid()
    and task_id = p_task_id
  limit 1;
$$;

grant execute on function public.get_my_exercise_stats(text) to authenticated;
