import type {
  TaskFooterControls,
  TaskHudState,
  TaskSummaryState,
} from '@shared/interfaces/tasking.interfaces';

export const hudShallowEqual = (
  a: TaskHudState | null,
  b: TaskHudState | null,
) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const aProg = a.progress;
  const bProg = b.progress;
  const progEqual =
    aProg === bProg ||
    (!!aProg &&
      !!bProg &&
      aProg.current === bProg.current &&
      aProg.total === bProg.total);
  return (
    progEqual &&
    a.requestTimer === b.requestTimer &&
    a.subtitle === b.subtitle &&
    a.isStartScreen === b.isStartScreen
  );
};

export const summaryShallowEqual = (
  a: TaskSummaryState | null,
  b: TaskSummaryState | null,
) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.elapsedMs === b.elapsedMs &&
    a.withinThreshold === b.withinThreshold &&
    a.timeBonus === b.timeBonus &&
    a.totalCorrect === b.totalCorrect &&
    a.totalPossible === b.totalPossible &&
    a.totalPoints === b.totalPoints &&
    a.thresholdMs === b.thresholdMs
  );
};

export const controlsShallowEqual = (
  a: TaskFooterControls | null,
  b: TaskFooterControls | null,
) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    // Compare handler presence (not function identity) to avoid spurious
    // updates when child re-creates stable callbacks with new references.
    !!a.onReset === !!b.onReset &&
    !!a.onEvaluate === !!b.onEvaluate &&
    !!a.onNext === !!b.onNext &&
    a.showReset === b.showReset &&
    a.showEvaluate === b.showEvaluate &&
    a.showNext === b.showNext &&
    a.disableReset === b.disableReset &&
    a.disableNext === b.disableNext
  );
};
