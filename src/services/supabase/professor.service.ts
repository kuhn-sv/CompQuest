import supabase from './client';

// ── Raw row shapes returned by Supabase RPCs ──────────────────────────

export interface MissionStatsRow {
  task_id: string;
  category: string;
  display_order: number;
  participant_count: number;
  avg_accuracy: number;
  avg_time_ms: number;
}

interface StudentRow {
  id: string;
  display_name: string;
  gamertag: string;
  matrikelnummer: string | null;
}

interface StudentExerciseStatRow {
  task_id: string;
  category: string;
  display_order: number;
  best_accuracy: number;
  best_time_ms: number;
  attempts_count: number;
  completed: boolean;
}

interface StudentBadgeRow {
  category: string;
  avg_accuracy: number;
  badge_level: string;
  completed_tasks: number;
  total_tasks: number;
}

// ── Mapped DTO shapes ─────────────────────────────────────────────────

export interface MissionStatsDto {
  taskId: string;
  category: string;
  displayOrder: number;
  participantCount: number;
  avgAccuracy: number;
  avgTimeMs: number;
}

export interface StudentListItem {
  id: string;
  displayName: string;
  gamertag: string;
  matrikelnummer: string | null;
}

export interface StudentExerciseStatDto {
  taskId: string;
  category: string;
  displayOrder: number;
  bestAccuracy: number;
  bestTimeMs: number;
  attemptsCount: number;
  completed: boolean;
}

export interface StudentBadgeDto {
  category: string;
  avgAccuracy: number;
  badgeLevel: string;
  completedTasks: number;
  totalTasks: number;
}

// ── Service ───────────────────────────────────────────────────────────

export const professorService = {
  /**
   * Fetch aggregated mission statistics (admin only).
   * Returns one entry per task, ordered by category → display_order.
   */
  getMissionStats: async (): Promise<MissionStatsDto[]> => {
    const {data, error} = await supabase.rpc('get_mission_stats');
    if (error) throw error;

    return (data as MissionStatsRow[]).map((row) => ({
      taskId: row.task_id,
      category: row.category,
      displayOrder: row.display_order,
      participantCount: Number(row.participant_count),
      avgAccuracy: Number(row.avg_accuracy),
      avgTimeMs: Number(row.avg_time_ms),
    }));
  },

  /**
   * Fetch the total number of students (admin only).
   */
  getTotalStudentCount: async (): Promise<number> => {
    const {data, error} = await supabase.rpc('get_total_student_count');
    if (error) throw error;
    return Number(data);
  },

  /**
   * Fetch all students (admin only).
   * Sorted by display_name ascending.
   */
  getAllStudents: async (): Promise<StudentListItem[]> => {
    const {data, error} = await supabase.rpc('get_all_students');
    if (error) throw error;

    return (data as StudentRow[]).map((row) => ({
      id: row.id,
      displayName: row.display_name,
      gamertag: row.gamertag,
      matrikelnummer: row.matrikelnummer,
    }));
  },

  /**
   * Fetch exercise stats for a specific student (admin only).
   */
  getStudentExerciseStats: async (
    userId: string,
  ): Promise<StudentExerciseStatDto[]> => {
    const {data, error} = await supabase.rpc('get_student_exercise_stats', {
      p_user_id: userId,
    });
    if (error) throw error;

    return (data as StudentExerciseStatRow[]).map((row) => ({
      taskId: row.task_id,
      category: row.category,
      displayOrder: row.display_order,
      bestAccuracy: Number(row.best_accuracy),
      bestTimeMs: Number(row.best_time_ms),
      attemptsCount: Number(row.attempts_count),
      completed: row.completed,
    }));
  },

  /**
   * Fetch topic badges for a specific student (admin only).
   */
  getStudentBadges: async (userId: string): Promise<StudentBadgeDto[]> => {
    const {data, error} = await supabase.rpc('get_student_badges', {
      p_user_id: userId,
    });
    if (error) throw error;

    return (data as StudentBadgeRow[]).map((row) => ({
      category: row.category,
      avgAccuracy: Number(row.avg_accuracy),
      badgeLevel: row.badge_level,
      completedTasks: Number(row.completed_tasks),
      totalTasks: Number(row.total_tasks),
    }));
  },
};
