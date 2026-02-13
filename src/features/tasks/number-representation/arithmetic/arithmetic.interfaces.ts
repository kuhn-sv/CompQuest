import type { Difficulty } from '@shared/enums/difficulty.enum';

export interface PAStageScore {
  difficulty: Difficulty;
  correct: number;
  total: number;
  points: number;
}
