import supabase from './client';

export interface MissionStatsRow {
  task_id: string;
  category: string;
  display_order: number;
  participant_count: number;
  avg_accuracy: number;
  avg_time_ms: number;
}

export interface MissionStatsDto {
  taskId: string;
  category: string;
  displayOrder: number;
  participantCount: number;
  avgAccuracy: number;
  avgTimeMs: number;
}

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
};
