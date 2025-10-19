import { IChapter } from "../../../features/tasks/practiceTaskOne";

export interface FeedbackInput {
  taskId?: string;
  chapters?: IChapter[];
  accuracyPercent: number; // 0-100
  elapsedMs: number;
  timeLimit?: number; // ms
}

// Returns the chapter titles joined, or a fallback string
function chaptersToString(chapters?: IChapter[]) {
  if (!chapters || chapters.length === 0) return 'Kapitel';
  return chapters.map((c) => c.title).join(', ');
}

// Determine if task is a PracticeTaskTwo assembler-related task
function isAssemblerTask(taskId?: string): boolean {
  return ['read-assembly', 'write-assembly', 'java-to-assembly'].includes(taskId || '');
}

// Determine if task is Von Neumann task
function isVonNeumannTask(taskId?: string): boolean {
  return taskId === 'von-neumann';
}

// Generate a feedback string based on accuracy and speed
export function generateFeedback({
  taskId,
  chapters,
  accuracyPercent,
  elapsedMs,
  timeLimit,
}: FeedbackInput): string {
  const isAccurate = accuracyPercent >= 75;
  const isFast = typeof timeLimit === 'number' ? elapsedMs < timeLimit : false;

  const chaptersStr = chaptersToString(chapters);

  // Fast & Accurate - same for all tasks
  if (isAccurate && isFast) {
    return `💨 Genau & Schnell\n„Wow, stark! Du warst richtig fix unterwegs und hast sauber gearbeitet. So sieht's aus, wenn man's wirklich verstanden hat!"`;
  }

  // Von Neumann task feedback
  if (isVonNeumannTask(taskId)) {
    if (isAccurate && !isFast) {
      return `⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht's schneller. Wenn du magst, übe nochmal mit dem Helfermodul oder schau ins Buch ${chaptersStr}, um dein Wissen aufzufrischen."`;
    }

    if (!isAccurate && isFast) {
      return `⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Antworten waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Wirf nochmal einen Blick in Kapitel ${chaptersStr} im Buch."`;
    }

    // !isAccurate && !isFast
    return `🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast's durchgezogen! 💪 Ich würd dir empfehlen, ggf. das Buchkapitel ${chaptersStr} durchzulesen. Danach läuft das deutlich flüssiger."`;
  }

  // Assembler tasks feedback (read-assembly, write-assembly, java-to-assembly)
  if (isAssemblerTask(taskId)) {
    if (isAccurate && !isFast) {
      return `⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht's schneller. Wenn du magst, übe nochmal mit dem Helfermodul oder schau ins Buch ${chaptersStr}, um dein Wissen aufzufrischen."`;
    }

    if (!isAccurate && isFast) {
      return `⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Befehle waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Das Helfermodul im Übungsmenü hilft dir super dabei – oder wirf nochmal einen Blick in Kapitel ${chaptersStr} im Buch."`;
    }

    // !isAccurate && !isFast
    return `🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast's durchgezogen! 💪 Ich würd dir empfehlen, dir das Helfermodul im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel ${chaptersStr} durchzulesen. Danach läuft das deutlich flüssiger."`;
  }

  // Default feedback for PracticeTaskOne tasks
  if (isAccurate && !isFast) {
    return `⏱️ Genau, aber Langsam\n„Gute Arbeit – alles richtig, nur etwas gemütlich. Keine Sorge, das ist normal! Mit mehr Routine geht's schneller. Wenn du magst, übe nochmal mit den Helfermodulen oder schau ins Buch ${chaptersStr} für ein paar Tricks, wie man sicherer wird."`;
  }

  if (!isAccurate && isFast) {
    return `⚡ Ungenau, aber Schnell\n„Du bist echt flott, aber ein paar Rechenschritte waren daneben 😅. Versuch, dir beim nächsten Mal kurz Zeit fürs Prüfen zu nehmen. Die Helfermodule im Übungsmenü helfen dir super dabei – oder wirf nochmal einen Blick in Kapitel ${chaptersStr} im Buch."`;
  }

  // !isAccurate && !isFast
  return `🐢 Ungenau & Langsam\n„Okay, das war ein harter Ritt – aber du hast's durchgezogen! 💪 Ich würd dir empfehlen, dir die Helfermodule im Übungsmenü nochmal anzusehen und ggf. das Buchkapitel ${chaptersStr} durchzulesen. Danach läuft das deutlich flüssiger."`;
}

export default generateFeedback;
