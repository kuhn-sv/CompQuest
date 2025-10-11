-- Update logic for choosing best attempt: prioritize accuracy > points > lower time
-- Also ensure all best_* fields are updated together from the same attempt

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

  -- Upsert row and increment attempts, capture current best metrics
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

  -- Decide if the new attempt is better based on accuracy > points > lower time
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

  -- If better, promote all best_* from this single attempt (no partial updates)
  update public.exercise_stats
  set best_points = case when v_is_better then p_points else best_points end,
      best_accuracy = case when v_is_better then p_accuracy else best_accuracy end,
      best_time_ms = case when v_is_better then p_time_ms else best_time_ms end
  where user_id = v_user and task_id = p_task_id;
end;
$$;

grant execute on function public.record_exercise_attempt(text, text, int, numeric, int) to authenticated;
