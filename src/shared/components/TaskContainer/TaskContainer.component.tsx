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
import {
  TaskContainerProps,
  TaskContainerInjectedProps,
} from '../../interfaces/taskContainerProps.interface';
import {useBadgeNotification} from '../../hooks/useBadgeNotification';
import {useUserBadges} from '../../hooks/useUserBadges';
import {
  hudShallowEqual,
  summaryShallowEqual,
  controlsShallowEqual,
} from './taskContainer.utils';

// Reusable container for tasks/subtasks with header (title/desc/timer/progress), body, footer actions, and summary overlay
export const TaskContainer: React.FC<TaskContainerProps> = ({
  title,
  description,
  endHref = '/dashboard',
  endLabel = 'Beenden',
  endState = {openExercises: true},
  taskMeta,
  forceShowFooter = false,
  autoStartTimer = false,
  children,
}) => {
  const {enqueueBadgeCheck} = useBadgeNotification();
  const {refreshBadges} = useUserBadges();

  const [footerControls, setFooterControls] =
    useState<TaskFooterControls | null>(null);
  const [hudState, setHudState] = useState<TaskHudState | null>(null);
  const [summaryState, setSummaryState] = useState<TaskSummaryState | null>(
    null,
  );
  // Current task context that child can update (will be passed to AskTim)
  const [taskContext, setTaskContext] = useState<unknown | null>(null);

  const {time, isRunning, start, stop, reset, formatTime, getElapsed} =
    useTimer();

  // Keep previous HUD/Summary to avoid redundant state updates causing render loops
  const prevHudRef = useRef<TaskHudState | null>(null);
  const prevSummaryRef = useRef<TaskSummaryState | null>(null);
  const prevControlsRef = useRef<TaskFooterControls | null>(null);
  const pendingSummaryRef = useRef<TaskSummaryState | null>(null);

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

  // Ref-mirror for hudState so handleSummaryChange can read it without
  // depending on the state value (keeps the callback identity stable).
  const hudStateRef = useRef<TaskHudState | null>(null);
  useEffect(() => {
    hudStateRef.current = hudState;
  }, [hudState]);

  const handleSummaryChange = useCallback(
    async (summary: Partial<TaskSummaryState> | null) => {
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
      const currentHud = hudStateRef.current;
      const isLastSubtask = !!(
        currentHud?.progress &&
        currentHud.progress.current === currentHud.progress.total
      );

      if (normalized && isLastSubtask) {
        // Store pending summary and avoid setting summaryState now
        pendingSummaryRef.current = normalized;
        prevSummaryRef.current = normalized;

        // Do not setSummaryState yet; wait for user to click Next
        return;
      }

      prevSummaryRef.current = normalized;
      if (normalized && taskMeta?.id && taskMeta?.title) {
        const accuracyPct =
          normalized.totalPossible > 0
            ? Math.round(
                (normalized.totalCorrect / normalized.totalPossible) * 100,
              )
            : 0;
        // Await persistence so leaderboard reflects the new score
        try {
          await trainingService.recordAttempt(taskMeta.id, taskMeta.title, {
            timeMs: Math.round(normalized.elapsedMs),
            accuracy: accuracyPct,
            points: normalized.totalPoints,
          });
          enqueueBadgeCheck();
          refreshBadges();
        } catch (err) {
          console.error('Failed to record attempt:', err);
        }
      }
      setSummaryState(normalized);
    },
    // hudState removed from deps – read from hudStateRef instead
    [taskMeta, enqueueBadgeCheck, refreshBadges],
  );

  const handleTaskContextChange = useCallback((ctx: unknown | null) => {
    setTaskContext(ctx);
  }, []);

  const injected: TaskContainerInjectedProps = useMemo(
    () => ({
      onControlsChange: handleControlsChange,
      onHudChange: handleHudChange,
      onTaskContextChange: handleTaskContextChange,
      onSummaryChange: handleSummaryChange,
      getElapsed,
    }),
    [
      handleControlsChange,
      handleHudChange,
      handleTaskContextChange,
      handleSummaryChange,
      getElapsed,
    ],
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
                timeBonus: summaryState.timeBonus,
              }}
              formatTime={formatTime}
              endHref={endHref}
              endLabel={endLabel}
              endState={endState}
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
          // Helper: record the attempt + trigger badge check for a pending summary
          const recordPendingAttempt = async (pending: TaskSummaryState): Promise<void> => {
            if (taskMeta?.id && taskMeta?.title) {
              const accuracyPct =
                pending.totalPossible > 0
                  ? Math.round(
                      (pending.totalCorrect / pending.totalPossible) * 100,
                    )
                  : 0;
              try {
                await trainingService.recordAttempt(taskMeta.id, taskMeta.title, {
                  timeMs: Math.round(pending.elapsedMs),
                  accuracy: accuracyPct,
                  points: pending.totalPoints,
                });
                enqueueBadgeCheck();
                refreshBadges();
              } catch (err) {
                console.error('Failed to record attempt:', err);
              }
            }
          };

          const fallbackOnNext = async () => {
            // If there's a pending summary, reveal it; otherwise call provided handler
            if (pendingSummaryRef.current) {
              // stop timer and reveal summary overlay
              stop();
              const pending = pendingSummaryRef.current;
              pendingSummaryRef.current = null;
              await recordPendingAttempt(pending);
              setSummaryState(pending);
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
                    ? async () => {
                        // If child provided onNext, prefer it, but also reveal pending summary if present
                        if (pendingSummaryRef.current) {
                          stop();
                          const pending = pendingSummaryRef.current;
                          pendingSummaryRef.current = null;
                          await recordPendingAttempt(pending);
                          setSummaryState(pending);
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
                disableNext={footerControls?.disableNext ?? false}
                taskMeta={taskMeta}
                taskContext={taskContext}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default TaskContainer;
