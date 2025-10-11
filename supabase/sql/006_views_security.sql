-- Harden view security for admin-related and aggregate views
-- Context: Supabase advisor flagged these views as SECURITY DEFINER (default) which can be risky.
-- Postgres 15+ supports SECURITY INVOKER for views; with this setting, permissions and RLS
-- are checked against the querying user instead of the view owner.
-- Note: Views do not have RLS themselves; underlying table RLS still applies.

-- Ensure queries run with invoker's privileges and act as a security barrier to prevent
-- predicate pushdown leaks across functions
alter view if exists public.tim_question_counts set (
  security_invoker = on,
  security_barrier = on
);

alter view if exists public.admin_exercise_overview set (
  security_invoker = on,
  security_barrier = on
);

alter view if exists public.admin_tim_messages_recent set (
  security_invoker = on,
  security_barrier = on
);

-- Optional (not applied here): tighten GRANTs to restrict who can SELECT from admin_* views.
-- Example:
-- revoke all on public.admin_exercise_overview from public, anon, authenticated;
-- grant select on public.admin_exercise_overview to service_role, supabase_admin;
-- Do similarly for public.admin_tim_messages_recent.
