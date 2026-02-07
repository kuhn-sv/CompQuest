import type {BadgeLevel} from '../interfaces';

/** Category key → user-facing display name */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  zahlendarstellung: 'Zahlendarstellung',
  mikroprozessortechnik: 'Mikroprozessortechnik',
};

/** Delay (ms) before showing a badge popup so the ResultSummary can appear first. */
export const DISPLAY_DELAY_MS = 600;

/** Numeric rank per badge level for comparison purposes. */
export const BADGE_RANK: Record<BadgeLevel, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
};
