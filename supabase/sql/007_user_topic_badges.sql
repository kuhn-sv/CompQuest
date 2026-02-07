-- ============================================================
-- 007 – User topic badges (pre-computed per category)
-- ============================================================
-- Run order: 7 of 7  (depends on: 001 for is_admin(), 006 for task_categories)
-- ============================================================
-- Stores the average accuracy and badge level per user per
-- topic category.  Updated automatically via trigger on
-- exercise_stats inserts/updates.

-- 1. Table
create table if not exists public.user_topic_badges (
  user_id         uuid not null references auth.users(id) on delete cascade,
  category        text not null,
  avg_accuracy    numeric(5,2) not null default 0,
  badge_level     text not null default 'none'
                    check (badge_level in ('none','bronze','silver','gold','platinum')),
  completed_tasks int not null default 0,
  total_tasks     int not null default 0,
  updated_at      timestamptz not null default now(),

  primary key (user_id, category)
);

create index if not exists user_topic_badges_user_idx
  on public.user_topic_badges (user_id);

-- 2. Enable RLS
alter table public.user_topic_badges enable row level security;

drop policy if exists "topic_badges_select_own" on public.user_topic_badges;
create policy "topic_badges_select_own" on public.user_topic_badges
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

-- Users should never manually insert/update; the trigger handles it.
-- Allow the trigger (which runs as SECURITY DEFINER or table owner) to write.
-- No insert/update/delete policies for regular users.
drop policy if exists "topic_badges_admin_all" on public.user_topic_badges;
create policy "topic_badges_admin_all" on public.user_topic_badges
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 3. Trigger function: recalculate badge after exercise_stats changes
create or replace function public.fn_update_topic_badge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category     text;
  v_total        int;
  v_completed    int;
  v_sum_accuracy numeric;
  v_avg          numeric(5,2);
  v_badge        text;
begin
  -- Find the category for this task_id (if any)
  select tc.category into v_category
  from public.task_categories tc
  where tc.task_id = new.task_id;

  -- If task is not categorized (e.g. helper module), nothing to do
  if v_category is null then
    return new;
  end if;

  -- Total tasks in this category
  select count(*) into v_total
  from public.task_categories
  where category = v_category;

  -- How many of those has the user completed (has a row in exercise_stats)?
  select count(*), coalesce(sum(es.best_accuracy), 0)
  into v_completed, v_sum_accuracy
  from public.exercise_stats es
  inner join public.task_categories tc on tc.task_id = es.task_id
  where es.user_id = new.user_id
    and tc.category = v_category
    and es.best_accuracy is not null;

  -- Average = sum of completed accuracies / total tasks in category
  -- (unfinished tasks effectively count as 0%)
  if v_total > 0 then
    v_avg := round(v_sum_accuracy / v_total, 2);
  else
    v_avg := 0;
  end if;

  -- Derive badge level from average accuracy
  v_badge := case
    when v_avg >= 100  then 'platinum'
    when v_avg >= 90   then 'gold'
    when v_avg >= 80   then 'silver'
    when v_avg >= 50   then 'bronze'
    else 'none'
  end;

  -- Upsert the badge row
  insert into public.user_topic_badges (user_id, category, avg_accuracy, badge_level, completed_tasks, total_tasks, updated_at)
  values (new.user_id, v_category, v_avg, v_badge, v_completed, v_total, now())
  on conflict (user_id, category)
  do update set
    avg_accuracy    = excluded.avg_accuracy,
    badge_level     = excluded.badge_level,
    completed_tasks = excluded.completed_tasks,
    total_tasks     = excluded.total_tasks,
    updated_at      = now();

  return new;
end;
$$;

-- 4. Attach trigger to exercise_stats
drop trigger if exists exercise_stats_update_topic_badge on public.exercise_stats;
create trigger exercise_stats_update_topic_badge
after insert or update on public.exercise_stats
for each row execute function public.fn_update_topic_badge();
