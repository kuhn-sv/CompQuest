-- Tighten privileges on admin views and aggregates
-- Admin views should not be selectable by anon/authenticated; restrict to service roles
-- tim_question_counts may be used by the app; keep SELECT for authenticated if needed

-- admin_exercise_overview
revoke all on public.admin_exercise_overview from public;
revoke all on public.admin_exercise_overview from anon;
revoke all on public.admin_exercise_overview from authenticated;
grant select on public.admin_exercise_overview to service_role;
grant select on public.admin_exercise_overview to supabase_admin;

-- admin_tim_messages_recent
revoke all on public.admin_tim_messages_recent from public;
revoke all on public.admin_tim_messages_recent from anon;
revoke all on public.admin_tim_messages_recent from authenticated;
grant select on public.admin_tim_messages_recent to service_role;
grant select on public.admin_tim_messages_recent to supabase_admin;

-- tim_question_counts: no anon access; allow authenticated read; admin roles also ok
revoke all on public.tim_question_counts from public;
revoke all on public.tim_question_counts from anon;
-- If your app does NOT use this view directly from the client, comment the next line
grant select on public.tim_question_counts to authenticated;
grant select on public.tim_question_counts to service_role;
grant select on public.tim_question_counts to supabase_admin;
