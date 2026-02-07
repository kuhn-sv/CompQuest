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
