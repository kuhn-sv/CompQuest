-- ============================================================
-- 003 – Tim messages table, RLS, sync trigger
-- ============================================================
-- Run order: 3 of 5  (depends on: 001 for is_admin(), 002 for exercise_stats)
-- ============================================================

-- 1. Table
create table if not exists public.tim_messages (
  id          uuid primary key default gen_random_uuid(),
  task_id     text not null,
  task_title  text not null,
  tim_version text,
  request     text not null,
  response    text not null,
  created_at  timestamptz not null default now()
);

-- 2. Indexes
create index if not exists tim_messages_task_created_idx
  on public.tim_messages (task_id, created_at desc);

-- 3. Enable RLS
alter table public.tim_messages enable row level security;

-- 4. RLS policies
drop policy if exists "tim_messages_select" on public.tim_messages;
drop policy if exists "tim_messages_insert_self" on public.tim_messages;
drop policy if exists "tim_messages_update_admin" on public.tim_messages;
drop policy if exists "tim_messages_delete_admin" on public.tim_messages;

-- Allow insert by authenticated users (any logged in user can ask Tim)
create policy "tim_messages_insert_any" on public.tim_messages
for insert to authenticated
with check (true);

-- Allow select only by service_role (admins/system)
create policy "tim_messages_select_admin" on public.tim_messages
for select to service_role
using (true);
