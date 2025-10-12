import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import TaskContainerHeader from './TaskContainerHeader.component';
import TaskActionButtons from '../TaskActionButtons/TaskActionButtons.component';
import ResultSummary from '../ResultSummary/ResultSummary';
import {useTimer} from '../../hooks';
import {trainingService} from '../../../services/supabase/training.service';
import type {
  TaskFooterControls,
  TaskHudState,
  TaskSummaryState,
} from '../../interfaces/tasking.interfaces';
import './TaskContainer.component.scss';

export interface TaskContainerInjectedProps {
  onControlsChange: (controls: TaskFooterControls | null) => void;
  onHudChange: (hud: TaskHudState | null) => void;
  // Subtasks may send partial summaries; container will normalize them
  onSummaryChange: (summary: Partial<TaskSummaryState> | null) => void;
}

interface TaskContainerProps {
  title: string;
  description?: string;
  endHref?: string;
  endLabel?: string;
  // Optional meta to record progress in DB on completion
  taskMeta?: {
    id: string;
    title: string;
    chapters?: {title: string; content?: string}[];
    timeLimit?: number;
  };
  // When true, footer visibility ignores HUD gating (start screen/progress)
  forceShowFooter?: boolean;
  // When true, timer will start automatically on mount
  autoStartTimer?: boolean;
  children: (injected: TaskContainerInjectedProps) => React.ReactNode;
}

// Reusable container for tasks/subtasks with header (title/desc/timer/progress), body, footer actions, and summary overlay
export const TaskContainer: React.FC<TaskContainerProps> = ({
  title,
  description,
  endHref = '/dashboard',
  endLabel = 'Beenden',
  taskMeta,
  forceShowFooter = false,
  autoStartTimer = false,
  children,
}) => {
  const [footerControls, setFooterControls] =
    useState<TaskFooterControls | null>(null);
  const [hudState, setHudState] = useState<TaskHudState | null>(null);
  const [summaryState, setSummaryState] = useState<TaskSummaryState | null>(
    null,
  );

  const {time, isRunning, start, stop, reset, formatTime, getElapsed} =
    useTimer();

  // Keep previous HUD/Summary to avoid redundant state updates causing render loops
  const prevHudRef = useRef<TaskHudState | null>(null);
  const prevSummaryRef = useRef<TaskSummaryState | null>(null);
  const prevControlsRef = useRef<TaskFooterControls | null>(null);
  const pendingSummaryRef = useRef<TaskSummaryState | null>(null);

  const hudShallowEqual = (a: TaskHudState | null, b: TaskHudState | null) => {
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

  const summaryShallowEqual = (
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

  const controlsShallowEqual = (
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
      a.disableEvaluate === b.disableEvaluate &&
      a.disableNext === b.disableNext
    );
  };

  // Keep timer handlers in refs so injected callbacks can be stable
  const startRef = useRef(start);
  const stopRef = useRef(stop);
  const resetRef = useRef(reset);
  useEffect(() => {
    startRef.current = start;
  }, [start]);
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);
  useEffect(() => {
    resetRef.current = reset;
  }, [reset]);

  // Reset timer when summary opens/closes as requested by hud
  useEffect(() => {
    // No-op for now; timer is controlled via hudState and button handlers below
  }, [summaryState]);

  // Optionally auto start timer on mount
  useEffect(() => {
    if (autoStartTimer) {
      startRef.current();
    }
    // We only want this to run once on mount when autoStartTimer is enabled
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable callbacks to avoid triggering child effects every render
  const handleControlsChange = useCallback(
    (controls: TaskFooterControls | null) => {
      if (controlsShallowEqual(prevControlsRef.current, controls)) return;
      setFooterControls(controls);
      prevControlsRef.current = controls;
    },
    [],
  );

  const handleHudChange = useCallback((hud: TaskHudState | null) => {
    // Avoid state updates if nothing actually changed
    if (hudShallowEqual(prevHudRef.current, hud)) return;
    setHudState(hud);
    prevHudRef.current = hud;
    if (!hud) return;
    if (hud.requestTimer === 'start') startRef.current();
    if (hud.requestTimer === 'stop') stopRef.current();
    if (hud.requestTimer === 'reset') resetRef.current();
  }, []);

  const handleSummaryChange = useCallback(
    (summary: Partial<TaskSummaryState> | null) => {
      // If null, just clear
      if (!summary) {
        setSummaryState(null);
        prevSummaryRef.current = null;
        return;
      }

      // Normalize incoming summary: allow subtasks to omit bonus-related fields
      const DEFAULT_THRESHOLD_MS = 3 * 60 * 1000; // fallback if no taskMeta.timeLimit
      const DEFAULT_TIME_BONUS_POINTS = 1;

      const thresholdMs =
        summary.thresholdMs ?? taskMeta?.timeLimit ?? DEFAULT_THRESHOLD_MS;
      const elapsedMs =
        typeof summary.elapsedMs === 'number' ? summary.elapsedMs : 0;
      const withinThreshold =
        typeof summary.withinThreshold === 'boolean'
          ? summary.withinThreshold
          : elapsedMs <= thresholdMs;
      const timeBonus =
        typeof summary.timeBonus === 'number'
          ? summary.timeBonus
          : withinThreshold
            ? DEFAULT_TIME_BONUS_POINTS
            : 0;
      const totalCorrect =
        typeof summary.totalCorrect === 'number'
          ? summary.totalCorrect
          : (summary.perStage?.reduce((s, x) => s + (x?.correct ?? 0), 0) ?? 0);
      const totalPossible =
        typeof summary.totalPossible === 'number'
          ? summary.totalPossible
          : (summary.perStage?.reduce((s, x) => s + (x?.total ?? 0), 0) ?? 0);
      const totalPoints =
        typeof summary.totalPoints === 'number'
          ? summary.totalPoints
          : totalCorrect + timeBonus;

      const normalized: TaskSummaryState = {
        // Ensure required fields are present
        elapsedMs,
        perStage: summary.perStage ?? [],
        thresholdMs,
        withinThreshold,
        timeBonus,
        totalCorrect,
        totalPossible,
        totalPoints,
      };

      // Avoid redundant updates (can cause render loops if child resends same object)
      if (summaryShallowEqual(prevSummaryRef.current, normalized)) return;

      // If this is the last subtask, don't immediately show the ResultSummary.
      // Instead, store it as pending and show a "Weiter" button so the user
      // can view results after clicking Next. If we don't have progress info,
      // fall back to the old behavior.
      const isLastSubtask = !!(
        hudState?.progress &&
        hudState.progress.current === hudState.progress.total
      );

      if (normalized && isLastSubtask) {
        // Record attempt immediately even if we delay showing the overlay.
        if (taskMeta?.id && taskMeta?.title) {
          const accuracyPct =
            normalized.totalPossible > 0
              ? Math.round(
                  (normalized.totalCorrect / normalized.totalPossible) * 100,
                )
              : 0;
          trainingService
            .recordAttempt(taskMeta.id, taskMeta.title, {
              timeMs: Math.round(normalized.elapsedMs),
              accuracy: accuracyPct,
              points: normalized.totalPoints,
            })
            .catch(err => console.error('Failed to record attempt:', err));
        }

        // Store pending summary and avoid setting summaryState now
        pendingSummaryRef.current = normalized;
        prevSummaryRef.current = normalized;

        // Do not setSummaryState yet; wait for user to click Next
        return;
      }

      setSummaryState(normalized);
      prevSummaryRef.current = normalized;
      if (normalized && taskMeta?.id && taskMeta?.title) {
        const accuracyPct =
          normalized.totalPossible > 0
            ? Math.round(
                (normalized.totalCorrect / normalized.totalPossible) * 100,
              )
            : 0;
        // Fire-and-forget; UI shouldn't block on persistence
        trainingService
          .recordAttempt(taskMeta.id, taskMeta.title, {
            timeMs: Math.round(normalized.elapsedMs),
            accuracy: accuracyPct,
            points: normalized.totalPoints,
          })
          .catch(err => console.error('Failed to record attempt:', err));
      }
    },
    [taskMeta, hudState],
  );

  const injected: TaskContainerInjectedProps = useMemo(
    () => ({
      onControlsChange: handleControlsChange,
      onHudChange: handleHudChange,
      onSummaryChange: handleSummaryChange,
    }),
    [handleControlsChange, handleHudChange, handleSummaryChange],
  );

  // progressPercent is now handled inside TaskContainerHeader

  return (
    <div className="task-container">
      <div className="task-container__container">
        {/* Header */}
        {!summaryState && (
          <TaskContainerHeader
            title={title}
            description={description}
            hudState={hudState}
            time={time}
            isRunning={isRunning}
            formatTime={formatTime}
            getElapsed={getElapsed}
          />
        )}

        {/* Task Content */}
        <div className="task-container__task-content">
          {!summaryState && children(injected)}
          {summaryState && (
            <ResultSummary
              result={{
                elapsedMs: summaryState.elapsedMs,
                totalCorrect: summaryState.totalCorrect,
                totalPossible: summaryState.totalPossible,
                totalPoints: summaryState.totalPoints,
              }}
              formatTime={formatTime}
              endHref={endHref}
              endLabel={endLabel}
              taskId={taskMeta?.id}
              title={taskMeta?.title}
              chapters={taskMeta?.chapters}
              timeLimit={taskMeta?.timeLimit}
              onClose={() => {
                // Reset the task timer when closing the summary (e.g., on "Wiederholen")
                reset();
                setSummaryState(null);
              }}
            />
          )}
        </div>

        {/* Unified footer with task action buttons */}
        {(() => {
          if (summaryState) return null;
          const hasControls = !!footerControls;
          const anyVisible = !!(
            footerControls?.showReset ||
            footerControls?.showEvaluate ||
            footerControls?.showNext
          );

          // If we have a pending summary (reported on last subtask), we want to
          // show a Next button so the user can view results after clicking it.
          const hasPendingSummary = !!pendingSummaryRef.current;

          const canShowFooter = forceShowFooter
            ? (hasControls && anyVisible) || hasPendingSummary
            : (hasControls &&
                anyVisible &&
                !hudState?.isStartScreen &&
                !!hudState?.progress) ||
              hasPendingSummary;

          if (!canShowFooter) return null;

          // Provide fallback controls when child didn't supply them but we have a
          // pending summary: show a Next button that reveals the summary.
          const fallbackOnNext = () => {
            // If there's a pending summary, reveal it; otherwise call provided handler
            if (pendingSummaryRef.current) {
              // stop timer and reveal summary overlay
              stop();
              setSummaryState(pendingSummaryRef.current);
              pendingSummaryRef.current = null;
            } else {
              start();
              footerControls!.onNext?.();
            }
          };

          return (
            <div className="task-container__footer">
              <TaskActionButtons
                onReset={footerControls?.onReset}
                onEvaluate={() => {
                  stop();
                  footerControls?.onEvaluate?.();
                }}
                onNext={
                  footerControls?.onNext
                    ? () => {
                        // If child provided onNext, prefer it, but also reveal pending summary if present
                        if (pendingSummaryRef.current) {
                          stop();
                          setSummaryState(pendingSummaryRef.current);
                          pendingSummaryRef.current = null;
                        } else {
                          start();
                          footerControls!.onNext?.();
                        }
                      }
                    : fallbackOnNext
                }
                showReset={footerControls?.showReset ?? false}
                showEvaluate={footerControls?.showEvaluate ?? false}
                showNext={footerControls?.showNext || hasPendingSummary}
                disableReset={footerControls?.disableReset ?? false}
                disableEvaluate={footerControls?.disableEvaluate ?? false}
                disableNext={footerControls?.disableNext ?? false}
                taskMeta={taskMeta}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default TaskContainer;
