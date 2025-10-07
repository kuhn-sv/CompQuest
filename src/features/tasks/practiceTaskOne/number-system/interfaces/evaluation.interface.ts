import { Difficulty } from '../../../../../shared/enums/difficulty.enum';

export interface StageScore {
  difficulty: Difficulty;
  correct: number; // number of correct pairs
  total: number;   // number of pairs in this stage
  points: number;  // by default equal to correct
}

export interface EvaluationConfig {
  timeBonusThresholdMs: number; // e.g., 3 minutes
  timeBonusPoints: number;      // e.g., 1 point for staying under threshold
}

export interface EvaluationResult {
  elapsedMs: number;
  withinThreshold: boolean;
  timeBonus: number;
  perStage: StageScore[];
  totalCorrect: number;
  totalPossible: number;
  totalPoints: number; // totalCorrect + timeBonus
}
