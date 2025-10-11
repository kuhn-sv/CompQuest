import supabase from './client';

export interface AttemptMetrics {
  timeMs: number;
  accuracy: number; // 0..100 or your chosen scale
  points: number;
}

export interface ExerciseStatsRow {
  user_id: string;
  task_id: string;
  task_title: string;
  attempts_count: number;
  best_time_ms: number | null;
  best_accuracy: number | null;
  best_points: number | null;
  questions_count: number;
  created_at: string;
  updated_at: string;
  last_attempt_at: string | null;
}

export interface TimMessageRow {
  id: string;
  user_id: string;
  task_id: string;
  task_title: string;
  level: string | null;
  tim_version: string | null;
  request: string;
  response: string;
  created_at: string;
}

export const trainingService = {
  // Record a new attempt and update aggregate stats on the server
  recordAttempt: async (taskId: string, taskTitle: string, metrics: AttemptMetrics): Promise<void> => {
    const { error } = await supabase.rpc('record_exercise_attempt', {
      p_task_id: taskId,
      p_task_title: taskTitle,
      p_time_ms: metrics.timeMs,
      p_accuracy: metrics.accuracy,
      p_points: metrics.points,
    });
    if (error) throw error;
  },

  // Record a Tim question/answer pair; returns created message id
  recordTimMessage: async (
    taskId: string,
    taskTitle: string,
    level: string,
    timVersion: string,
    request: string,
    response: string
  ): Promise<string> => {
    const { data, error } = await supabase.rpc('record_tim_message', {
      p_task_id: taskId,
      p_task_title: taskTitle,
      p_level: level,
      p_tim_version: timVersion,
      p_request: request,
      p_response: response,
    });
    if (error) throw error;
    return data as string;
  },

  // Record a Tim message but enforce a per-day limit atomically on the server
  recordTimMessageWithLimit: async (
    taskId: string,
    taskTitle: string,
    level: string,
    timVersion: string,
    request: string,
    response: string,
    dailyLimit: number
  ): Promise<string> => {
    const { data, error } = await supabase.rpc('record_tim_message_with_limit', {
      p_task_id: taskId,
      p_task_title: taskTitle,
      p_level: level,
      p_tim_version: timVersion,
      p_request: request,
      p_response: response,
      p_daily_limit: dailyLimit,
    });
    if (error) throw error;
    return data as string;
  },

  // Record a Tim message but enforce a per-day global limit across all tasks
  recordTimMessageWithGlobalLimit: async (
    taskId: string,
    taskTitle: string,
    level: string,
    timVersion: string,
    request: string,
    response: string,
    dailyLimit: number
  ): Promise<string> => {
    const { data, error } = await supabase.rpc('record_tim_message_with_global_limit', {
      p_task_id: taskId,
      p_task_title: taskTitle,
      p_level: level,
      p_tim_version: timVersion,
      p_request: request,
      p_response: response,
      p_daily_limit: dailyLimit,
    });
    if (error) throw error;
    return data as string;
  },

  // Fetch aggregated stats for current user for one task
  getStatsForTask: async (taskId: string): Promise<ExerciseStatsRow | null> => {
    const { data, error } = await supabase
      .from('exercise_stats')
      .select('*')
      .eq('task_id', taskId)
      .maybeSingle();
    if (error) throw error;
    return data as ExerciseStatsRow | null;
  },

  // Fetch Tim messages for a task (latest first)
  getTimMessagesForTask: async (taskId: string, limit = 20): Promise<TimMessageRow[]> => {
    const { data, error } = await supabase
      .from('tim_messages')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as TimMessageRow[];
  },

  // Get total number of Tim questions for a task (derived view)
  getQuestionCountForTask: async (taskId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('tim_question_counts')
      .select('question_count')
      .eq('task_id', taskId)
      .maybeSingle();
    if (error) throw error;
    return (data?.question_count as number | undefined) ?? 0;
  },

  // Get remaining daily credits (per task and global) for the current user
  getRemainingCredits: async (
    taskId: string,
    taskDailyLimit: number,
    globalDailyLimit: number
  ): Promise<{ task_used: number; global_used: number; task_remaining: number; global_remaining: number }> => {
    const { data, error } = await supabase.rpc('get_tim_remaining_credits', {
      p_task_id: taskId,
      p_task_daily_limit: taskDailyLimit,
      p_global_daily_limit: globalDailyLimit,
    });
    if (error) throw error;
    // Supabase returns an array for setof/table; ensure we handle both array and single-row
    const row = Array.isArray(data) ? data[0] : data;
    return row as { task_used: number; global_used: number; task_remaining: number; global_remaining: number };
  },
};
