import type {MissionStatsDto} from '../../../services/supabase/professor.service';

/** Aggregated stats for a single mission, enriched with display info */
export interface MissionStats extends MissionStatsDto {
  displayName: string;
}

/** A group of missions belonging to the same category */
export interface CategoryMissionGroup {
  category: string;
  displayName: string;
  missions: MissionStats[];
}

/** The two views of the professor dashboard */
export type ProfessorDashboardView = 'course-overview' | 'player-profiles';
