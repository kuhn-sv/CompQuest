import type { TaskFeedback } from '@shared/interfaces/tasking.interfaces';

export interface FeedbackInput {
  feedback?: TaskFeedback;
  accuracyPercent: number; // 0-100
  elapsedMs: number;
  timeLimit?: number; // ms
}

/**
 * Default feedback used when no task-specific feedback is provided.
 */
const DEFAULT_FEEDBACK: TaskFeedback = {
  accurateAndFast:
    '💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht\'s aus, wenn man\'s wirklich verstanden hat!"',
  accurateButSlow:
    '⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht\'s schneller."',
  inaccurateButFast:
    '⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Antworten waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen."',
  inaccurateAndSlow:
    '🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast\'s durchgezogen! 💪 Übung macht den Meister – versuch es einfach nochmal!"',
};

/**
 * Generate a feedback string based on accuracy and speed.
 *
 * Uses the task-specific feedback from `TaskMetadata` if available,
 * otherwise falls back to generic default strings.
 */
export function generateFeedback({
  feedback,
  accuracyPercent,
  elapsedMs,
  timeLimit,
}: FeedbackInput): string {
  const isAccurate = accuracyPercent >= 75;
  const isFast = typeof timeLimit === 'number' ? elapsedMs < timeLimit : false;

  const fb = feedback ?? DEFAULT_FEEDBACK;

  if (isAccurate && isFast) return fb.accurateAndFast;
  if (isAccurate && !isFast) return fb.accurateButSlow;
  if (!isAccurate && isFast) return fb.inaccurateButFast;
  return fb.inaccurateAndSlow;
}

export default generateFeedback;
