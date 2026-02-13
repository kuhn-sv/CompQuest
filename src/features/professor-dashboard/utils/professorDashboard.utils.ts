import { CATEGORY_DISPLAY_NAMES } from '@shared/context/badgeNotification.constants';
import { TASK_DISPLAY_NAMES } from '@shared/constants/taskDisplayNames';
import type { MissionStatsDto, StudentExerciseStatDto } from '../../../services/supabase/professor.service';
import type {
  CategoryMissionGroup,
  MissionStats,
  PlayerCategoryGroup,
  PlayerMissionStats,
} from '../interfaces/professorDashboard.interfaces';

/**
 * Format milliseconds to "M:SS Min." display string.
 * Returns "–:–– Min." when the value is 0 or falsy.
 */
export function formatTimeFromMs(ms: number): string {
  if (!ms || ms <= 0) return '–:–– Min.';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')} Min.`;
}

/**
 * Returns a CSS class name for the accuracy ring colour.
 *   ≥ 80 → 'high'   (green)
 *   ≥ 60 → 'medium' (yellow)
 *   < 60 → 'low'    (orange / red)
 */
export function getAccuracyColorClass(accuracy: number): string {
  if (accuracy >= 80) return 'high';
  if (accuracy >= 60) return 'medium';
  return 'low';
}

/**
 * Enrich raw DTOs with display names and group by category,
 * preserving the DB display_order within each group.
 */
export function groupMissionsByCategory(
  missions: MissionStatsDto[],
): CategoryMissionGroup[] {
  const grouped = new Map<string, MissionStats[]>();

  for (const m of missions) {
    const enriched: MissionStats = {
      ...m,
      displayName: TASK_DISPLAY_NAMES[m.taskId] ?? m.taskId,
    };

    if (!grouped.has(m.category)) {
      grouped.set(m.category, []);
    }
    grouped.get(m.category)!.push(enriched);
  }

  // Sort missions inside each group by displayOrder (should already be sorted by DB)
  const result: CategoryMissionGroup[] = [];
  for (const [category, missionsList] of grouped) {
    missionsList.sort((a, b) => a.displayOrder - b.displayOrder);
    result.push({
      category,
      displayName: CATEGORY_DISPLAY_NAMES[category] ?? category,
      missions: missionsList,
    });
  }

  return result;
}

/**
 * Enrich raw student exercise stats with display names and group by category.
 */
export function groupPlayerMissionsByCategory(
  stats: StudentExerciseStatDto[],
): PlayerCategoryGroup[] {
  const grouped = new Map<string, PlayerMissionStats[]>();

  for (const s of stats) {
    const enriched: PlayerMissionStats = {
      ...s,
      displayName: TASK_DISPLAY_NAMES[s.taskId] ?? s.taskId,
    };

    if (!grouped.has(s.category)) {
      grouped.set(s.category, []);
    }
    grouped.get(s.category)!.push(enriched);
  }

  const result: PlayerCategoryGroup[] = [];
  for (const [category, missionsList] of grouped) {
    missionsList.sort((a, b) => a.displayOrder - b.displayOrder);
    result.push({
      category,
      displayName: CATEGORY_DISPLAY_NAMES[category] ?? category,
      missions: missionsList,
    });
  }

  return result;
}
