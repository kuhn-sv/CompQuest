-- ============================================================
-- 003 – Tim messages table, RLS, sync trigger
-- ============================================================
-- Run order: 3 of 5  (depends on: 001 for is_admin(), 002 for exercise_stats)
-- ============================================================

-- 1. Table
create table if not exists public.tim_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  task_id     text not null,
  task_title  text not null,
  level       text,
  tim_version text,
  request     text not null,
  response    text not null,
  created_at  timestamptz not null default now()
);

-- 2. Indexes
create index if not exists tim_messages_user_task_created_idx
  on public.tim_messages (user_id, task_id, created_at desc);

create index if not exists tim_messages_user_created_idx
  on public.tim_messages (user_id, created_at desc);

-- 3. Enable RLS
alter table public.tim_messages enable row level security;

-- 4. RLS policies
drop policy if exists "tim_messages_select" on public.tim_messages;
create policy "tim_messages_select" on public.tim_messages
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "tim_messages_insert_self" on public.tim_messages;
create policy "tim_messages_insert_self" on public.tim_messages
for insert to authenticated
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "tim_messages_update_admin" on public.tim_messages;
create policy "tim_messages_update_admin" on public.tim_messages
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tim_messages_delete_admin" on public.tim_messages;
create policy "tim_messages_delete_admin" on public.tim_messages
for delete to authenticated
using (public.is_admin());

-- 5. Trigger: sync questions_count into exercise_stats
create or replace function public.increment_questions_count_on_tim_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.exercise_stats (user_id, task_id, task_title, questions_count)
  values (new.user_id, new.task_id, new.task_title, 1)
  on conflict (user_id, task_id)
  do update set questions_count = public.exercise_stats.questions_count + 1,
                task_title = excluded.task_title,
                updated_at = now();
  return new;
end;
$$;

drop trigger if exists tim_messages_after_insert on public.tim_messages;
create trigger tim_messages_after_insert
after insert on public.tim_messages
for each row execute function public.increment_questions_count_on_tim_message();
