export interface SummaryResultLike {
  elapsedMs: number;
  totalCorrect: number;
  totalPossible: number;
  totalPoints: number;
  timeBonus?: number;
}
