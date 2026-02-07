-- ============================================================
-- 005 – Views, security settings, privileges
-- ============================================================
-- Run order: 5 of 5  (depends on: 001–003 tables)
-- ============================================================

-- =============================================================
-- 1) Views
-- =============================================================

-- Per-task question counts (derived from tim_messages)
create or replace view public.tim_question_counts as
select user_id, task_id, count(*)::int as question_count
from public.tim_messages
group by user_id, task_id;

-- Admin exercise overview (includes gamertag, no email for privacy)
create or replace view public.admin_exercise_overview as
select
  es.user_id,
  p.display_name,
  p.gamertag,
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

-- =============================================================
-- 2) View security settings (security invoker + barrier)
-- =============================================================
alter view if exists public.tim_question_counts set (
  security_invoker = on,
  security_barrier = on
);

alter view if exists public.admin_exercise_overview set (
  security_invoker = on,
  security_barrier = on
);

-- =============================================================
-- 3) Privileges
-- =============================================================

-- admin_exercise_overview: restrict to service roles
revoke all on public.admin_exercise_overview from public;
revoke all on public.admin_exercise_overview from anon;
revoke all on public.admin_exercise_overview from authenticated;
grant select on public.admin_exercise_overview to service_role;
grant select on public.admin_exercise_overview to supabase_admin;

-- tim_question_counts: no anon access; allow authenticated read
revoke all on public.tim_question_counts from public;
revoke all on public.tim_question_counts from anon;
grant select on public.tim_question_counts to authenticated;
grant select on public.tim_question_counts to service_role;
grant select on public.tim_question_counts to supabase_admin;
