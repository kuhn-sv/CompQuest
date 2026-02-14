-- ============================================================
-- 004 – RPCs (exercise attempts, Tim conversations, leaderboard)
-- ============================================================
-- Run order: 4 of 5  (depends on: 002, 003 tables)
-- ============================================================

-- =============================================================
-- 1) Record an exercise attempt
-- =============================================================
create or replace function public.record_exercise_attempt(
  p_task_id text,
  p_task_title text,
  p_time_ms int,
  p_accuracy numeric(5,2),
  p_points int
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_now timestamptz := now();
  v_best_time int;
  v_best_accuracy numeric(5,2);
  v_best_points int;
  v_is_better boolean;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  insert into public.exercise_stats as es (
    user_id, task_id, task_title, attempts_count, best_time_ms, best_accuracy, best_points, last_attempt_at
  ) values (
    v_user, p_task_id, p_task_title, 1, p_time_ms, p_accuracy, p_points, v_now
  )
  on conflict (user_id, task_id)
  do update set
    attempts_count = es.attempts_count + 1,
    last_attempt_at = v_now,
    task_title = p_task_title
  returning best_time_ms, best_accuracy, best_points
  into v_best_time, v_best_accuracy, v_best_points;

  v_is_better := (
    v_best_accuracy is null or p_accuracy > v_best_accuracy
    or (
      p_accuracy = coalesce(v_best_accuracy, p_accuracy)
      and (
        p_points > coalesce(v_best_points, p_points)
        or (
          p_points = coalesce(v_best_points, p_points)
          and p_time_ms < coalesce(v_best_time, p_time_ms)
        )
      )
    )
  );

  update public.exercise_stats
  set best_points   = case when v_is_better then p_points   else best_points   end,
      best_accuracy = case when v_is_better then p_accuracy else best_accuracy end,
      best_time_ms  = case when v_is_better then p_time_ms  else best_time_ms  end
  where user_id = v_user and task_id = p_task_id;
end;
$$;

grant execute on function public.record_exercise_attempt(text, text, int, numeric, int) to authenticated;

-- =============================================================
-- 2) Save Tim Conversation (Upsert: Create or Update)
-- =============================================================
create or replace function public.save_tim_conversation(
  p_id uuid,
  p_task_id text,
  p_task_title text,
  p_messages jsonb,
  p_rating int default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.tim_conversations (id, task_id, task_title, messages, rating, updated_at)
  values (p_id, p_task_id, p_task_title, p_messages, p_rating, now())
  on conflict (id)
  do update set
    messages = excluded.messages,
    rating = coalesce(excluded.rating, public.tim_conversations.rating),
    updated_at = now();
end;
$$;

grant execute on function public.save_tim_conversation(uuid, text, text, jsonb, int) to authenticated;

-- =============================================================
-- 3) Rate Tim Message (Feedback)
-- =============================================================
create or replace function public.rate_tim_message(
  p_conversation_id uuid,
  p_message_index int,
  p_message_content jsonb,
  p_is_helpful boolean
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.tim_message_feedback (conversation_id, message_index, message_content, is_helpful)
  values (p_conversation_id, p_message_index, p_message_content, p_is_helpful);
end;
$$;

grant execute on function public.rate_tim_message(uuid, int, jsonb, boolean) to authenticated;

-- =============================================================
-- 6) Leaderboard RPC
-- =============================================================
create or replace function public.get_leaderboard(
  p_task_id text,
  p_limit int default 5,
  p_offset int default 0
)
returns table (
  gamertag text,
  best_accuracy numeric(5,2),
  best_time_ms int,
  rank bigint,
  is_current_user boolean,
  total_count bigint
)
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select
      p.gamertag,
      es.best_accuracy,
      es.best_time_ms,
      es.user_id,
      row_number() over (
        order by es.best_accuracy desc nulls last, es.best_time_ms asc nulls last
      ) as rank
    from public.exercise_stats es
    inner join public.profiles p on p.id = es.user_id
    where es.task_id = p_task_id
      and es.best_accuracy is not null
      and p.leaderboard_opt_in = true
  ),
  total as (
    select count(*) as cnt from ranked
  )
  select
    r.gamertag,
    r.best_accuracy,
    r.best_time_ms,
    r.rank,
    (r.user_id = auth.uid()) as is_current_user,
    t.cnt as total_count
  from ranked r
  cross join total t
  where r.rank > p_offset and r.rank <= (p_offset + p_limit)
     or r.user_id = auth.uid()
  order by r.rank;
$$;

grant execute on function public.get_leaderboard(text, int, int) to authenticated;

-- =============================================================
-- 7) Get topic badges for the current user
-- =============================================================
create or replace function public.get_user_badges()
returns table (
  category        text,
  avg_accuracy    numeric(5,2),
  badge_level     text,
  completed_tasks int,
  total_tasks     int
)
language sql
security definer
set search_path = public
as $$
  with category_totals as (
    select category, count(*)::int as total
    from public.task_categories
    group by category
  ),
  user_stats as (
    select
      tc.category,
      count(*)::int as completed,
      sum(es.best_accuracy) as sum_accuracy
    from public.exercise_stats es
    join public.task_categories tc on tc.task_id = es.task_id
    where es.user_id = auth.uid()
    group by tc.category
  )
  select
    ct.category,
    coalesce(round(us.sum_accuracy / ct.total, 2), 0) as avg_accuracy,
    case
        when coalesce(round(us.sum_accuracy / ct.total, 2), 0) >= 100 then 'diamond'
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
$$;


-- =============================================================
-- 8) Get exercise stats for the current user (Single Task)
-- =============================================================
create or replace function public.get_my_exercise_stats(p_task_id text)
returns setof public.exercise_stats
language sql
security definer
set search_path = public
as $$
  select *
  from public.exercise_stats
  where user_id = auth.uid()
    and task_id = p_task_id
  limit 1;
$$;

grant execute on function public.get_my_exercise_stats(text) to authenticated;
