import type { BadgeLevel } from '@shared/interfaces';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  path: string;
  progressPercent?: number;
  disabled?: boolean;
}

export interface LockConfig {
  requiredBadgeKey: string;
  requiredLevel: BadgeLevel;
  hint: string;
}

export interface ExerciseCategory {
  id: string;
  title: string;
  badgeKey: string;
  missions: Exercise[];
  helperModules: Exercise[];
  lock?: LockConfig;
}
