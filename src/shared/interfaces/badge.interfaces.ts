// Badge-related types and constants for the topic badge system

export type BadgeLevel = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond';

export interface BadgeConfig {
  level: BadgeLevel;
  label: string;
  icon: string;
  minAccuracy: number;
  description: string;
}

export interface UserTopicBadge {
  category: string;
  avgAccuracy: number;
  badgeLevel: BadgeLevel;
  completedTasks: number;
  totalTasks: number;
}

/**
 * Ordered list of badge tiers (highest first) with display metadata.
 * Used for legend rendering, level derivation, and progress coloring.
 */
export const BADGE_TIERS: BadgeConfig[] = [
  { level: 'diamond', label: 'Diamant', icon: '💎', minAccuracy: 100, description: '100%' },
  { level: 'gold', label: 'Gold', icon: '🥇', minAccuracy: 90, description: '90–99%' },
  { level: 'silver', label: 'Silber', icon: '🥈', minAccuracy: 80, description: '80–89%' },
  { level: 'bronze', label: 'Bronze', icon: '🥉', minAccuracy: 50, description: '50–79%' },
  { level: 'none', label: '', icon: '', minAccuracy: 0, description: '< 50%' },
];

/** Quick lookup: BadgeLevel → BadgeConfig */
export const BADGE_CONFIG: Record<BadgeLevel, BadgeConfig> = Object.fromEntries(
  BADGE_TIERS.map(tier => [tier.level, tier]),
) as Record<BadgeLevel, BadgeConfig>;

/** Visible tiers for the legend (excludes 'none') */
export const BADGE_LEGEND_TIERS = BADGE_TIERS.filter(t => t.level !== 'none');

/**
 * Derive the badge level for a given accuracy percentage.
 */
export const getBadgeLevelForAccuracy = (accuracy: number): BadgeLevel => {
  for (const tier of BADGE_TIERS) {
    if (accuracy >= tier.minAccuracy) return tier.level;
  }
  return 'none';
};

/**
 * Ordered rank of badge levels (lowest → highest).
 * Used for comparing badge levels programmatically.
 */
const BADGE_LEVEL_ORDER: BadgeLevel[] = ['none', 'bronze', 'silver', 'gold', 'diamond'];

/**
 * Check whether `current` badge level meets or exceeds `required` badge level.
 */
export const isBadgeLevelSufficient = (
  current: BadgeLevel,
  required: BadgeLevel,
): boolean => {
  return BADGE_LEVEL_ORDER.indexOf(current) >= BADGE_LEVEL_ORDER.indexOf(required);
};
