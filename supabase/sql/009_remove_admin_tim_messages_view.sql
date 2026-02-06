-- Remove admin_tim_messages_recent view and update admin_exercise_overview to remove email field

-- Drop the admin_tim_messages_recent view completely
drop view if exists public.admin_tim_messages_recent;

-- Recreate admin_exercise_overview without email field (for privacy)
create or replace view public.admin_exercise_overview as
select
  es.user_id,
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

