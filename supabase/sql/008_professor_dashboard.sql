-- ============================================================================
-- Professor Dashboard: RPCs for aggregated mission statistics
-- ============================================================================

-- 1. get_total_student_count()
--    Returns the number of users with role = 'student'.
-- ----------------------------------------------------------------------------
create or replace function get_total_student_count()
returns bigint
language sql
security definer
stable
as $$
  select count(*)
  from profiles
  where role = 'student';
$$;

-- Only admins may call this function
revoke execute on function get_total_student_count() from public;
grant  execute on function get_total_student_count() to authenticated;

-- 2. get_mission_stats()
--    Aggregates per-task statistics from exercise_stats joined with
--    task_categories.  Returns one row per task, ordered by category then
--    display_order.
--    Columns: task_id, category, display_order, participant_count,
--             avg_accuracy, avg_time_ms
-- ----------------------------------------------------------------------------
create or replace function get_mission_stats()
returns table (
  task_id        text,
  category       text,
  display_order  int,
  participant_count bigint,
  avg_accuracy   numeric,
  avg_time_ms    numeric
)
language plpgsql
security definer
stable
as $$
begin
  -- Only admins are allowed
  if not is_admin() then
    raise exception 'Permission denied: admin role required';
  end if;

  return query
    select
      tc.task_id,
      tc.category,
      tc.display_order,
      count(distinct es.user_id)                       as participant_count,
      coalesce(round(avg(es.best_accuracy), 1), 0)     as avg_accuracy,
      coalesce(round(avg(es.best_time_ms), 0), 0)      as avg_time_ms
    from task_categories tc
    left join (
      -- Only include exercise data from students (exclude admins)
      exercise_stats es_inner
      join profiles p on p.id = es_inner.user_id and p.role = 'student'
    ) es on es.task_id = tc.task_id
    group by tc.task_id, tc.category, tc.display_order
    order by tc.category, tc.display_order;
end;
$$;

revoke execute on function get_mission_stats() from public;
grant  execute on function get_mission_stats() to authenticated;

-- 3. get_all_students()
--    Returns id, display_name and gamertag for all students (sorted by display_name).
-- ----------------------------------------------------------------------------
create or replace function get_all_students()
returns table (
  id              uuid,
  display_name    text,
  gamertag        text,
  matrikelnummer  text
)
language plpgsql
security definer
stable
as $$
begin
  if not is_admin() then
    raise exception 'Permission denied: admin role required';
  end if;

  return query
    select p.id, p.display_name, p.gamertag, p.matrikelnummer
    from profiles p
    where p.role = 'student'
    order by p.display_name asc;
end;
$$;

revoke execute on function get_all_students() from public;
grant  execute on function get_all_students() to authenticated;

-- 4. get_student_exercise_stats(uuid)
--    Returns all exercise_stats rows for a given student, enriched with
--    category and display_order from task_categories.
-- ----------------------------------------------------------------------------
create or replace function get_student_exercise_stats(p_user_id uuid)
returns table (
  task_id        text,
  category       text,
  display_order  int,
  best_accuracy  numeric,
  best_time_ms   int,
  attempts_count int,
  completed      boolean
)
language plpgsql
security definer
stable
as $$
begin
  if not is_admin() then
    raise exception 'Permission denied: admin role required';
  end if;

  return query
    select
      tc.task_id,
      tc.category,
      tc.display_order,
      coalesce(es.best_accuracy, 0)   as best_accuracy,
      coalesce(es.best_time_ms, 0)    as best_time_ms,
      coalesce(es.attempts_count, 0)  as attempts_count,
      (es.user_id is not null)        as completed
    from task_categories tc
    left join exercise_stats es
      on es.task_id = tc.task_id and es.user_id = p_user_id
    order by tc.category, tc.display_order;
end;
$$;

revoke execute on function get_student_exercise_stats(uuid) from public;
grant  execute on function get_student_exercise_stats(uuid) to authenticated;

-- =============================================================
-- 5) get_student_badges(uuid)
--    Returns topic badges for a given student (Dynamic Calculation).
--    Calculated on-the-fly from task_categories and exercise_stats
-- ----------------------------------------------------------------------------
create or replace function get_student_badges(p_user_id uuid)
returns table (
  category       text,
  avg_accuracy   numeric,
  badge_level    text,
  completed_tasks int,
  total_tasks    int
)
language plpgsql
security definer
stable
as $$
begin
  if not is_admin() then
    raise exception 'Permission denied: admin role required';
  end if;

  return query
  with category_totals as (
    select tc.category, count(*)::int as total
    from public.task_categories tc
    group by tc.category
  ),
  user_stats as (
    select
      tc.category,
      count(*)::int as completed,
      sum(es.best_accuracy) as sum_accuracy
    from public.exercise_stats es
    join public.task_categories tc on tc.task_id = es.task_id
    where es.user_id = p_user_id
    group by tc.category
  )
  select
    ct.category,
    coalesce(round(us.sum_accuracy / ct.total, 2), 0) as avg_accuracy,
    case
        when coalesce(round(us.sum_accuracy / ct.total, 2), 0) >= 100 then 'platinum'
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
end;
$$;

revoke execute on function get_student_badges(uuid) from public;
grant  execute on function get_student_badges(uuid) to authenticated;
