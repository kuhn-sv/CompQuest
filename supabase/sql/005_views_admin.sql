-- Derived views and admin-friendly views (RLS still applies via underlying tables)

create or replace view public.tim_question_counts as
select user_id, task_id, count(*)::int as question_count
from public.tim_messages
group by user_id, task_id;

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
