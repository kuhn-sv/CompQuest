import type {MissionStatsDto, StudentExerciseStatDto, StudentBadgeDto} from '../../../services/supabase/professor.service';

// Re-export for convenience
export type {StudentExerciseStatDto, StudentBadgeDto};

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

/** Per-student mission stat, enriched with display name */
export interface PlayerMissionStats extends StudentExerciseStatDto {
  displayName: string;
}

/** A group of player missions belonging to the same category */
export interface PlayerCategoryGroup {
  category: string;
  displayName: string;
  missions: PlayerMissionStats[];
}

/** Column definition for the generic MissionTable */
export interface TableColumnDef {
  key: string;
  label: string;
  className?: string;
}
