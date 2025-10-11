import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Timer} from '..';
import TaskActionButtons from '../TaskActionButtons/TaskActionButtons.component';
import SummaryOverlay from '../ResultSummary/ResultSummary';
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
  onSummaryChange: (summary: TaskSummaryState | null) => void;
}

interface TaskContainerProps {
  title: string;
  description?: string;
  endHref?: string;
  endLabel?: string;
  // Optional meta to record progress in DB on completion
  taskMeta?: {id: string; title: string};
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
      a.onReset === b.onReset &&
      a.onEvaluate === b.onEvaluate &&
      a.onNext === b.onNext &&
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
    (summary: TaskSummaryState | null) => {
      // Avoid redundant updates (can cause render loops if child resends same object)
      if (summaryShallowEqual(prevSummaryRef.current, summary)) return;
      setSummaryState(summary);
      prevSummaryRef.current = summary;
      if (summary && taskMeta?.id && taskMeta?.title) {
        const accuracyPct =
          summary.totalPossible > 0
            ? Math.round((summary.totalCorrect / summary.totalPossible) * 100)
            : 0;
        // Fire-and-forget; UI shouldn't block on persistence
        trainingService
          .recordAttempt(taskMeta.id, taskMeta.title, {
            timeMs: Math.round(summary.elapsedMs),
            accuracy: accuracyPct,
            points: summary.totalPoints,
          })
          .catch(err => console.error('Failed to record attempt:', err));
      }
    },
    [taskMeta],
  );

  const injected: TaskContainerInjectedProps = useMemo(
    () => ({
      onControlsChange: handleControlsChange,
      onHudChange: handleHudChange,
      onSummaryChange: handleSummaryChange,
    }),
    [handleControlsChange, handleHudChange, handleSummaryChange],
  );

  const progressPercent = hudState?.progress
    ? Math.round((hudState.progress.current / hudState.progress.total) * 100)
    : 0;

  return (
    <div className="task-container">
      <div className="task-container__container">
        {/* Header */}
        {!summaryState && (
          <div className="task-container__header">
            <div className="header-row header-row--top">
              <div className="task-info">
                <h2 className="task-title">{title}</h2>
                <p className="task-description">
                  {hudState?.subtitle ?? description}
                </p>
              </div>
              <div className="task-hud">
                <Timer
                  time={time}
                  isRunning={isRunning}
                  formatTime={formatTime}
                  getElapsed={getElapsed}
                />
              </div>
            </div>
            <div className="header-row header-row--bottom">
              <div className="task-progress__meta">
                <span className="task-progress__label">
                  {hudState?.progress
                    ? `Aufgabe ${hudState.progress.current}/${hudState.progress.total}`
                    : ''}
                </span>
                <span className="task-progress__percent">
                  {hudState?.progress ? `${progressPercent}%` : ''}
                </span>
              </div>
              <div
                className="task-progress__bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={hudState?.progress ? progressPercent : 0}>
                <div
                  className="task-progress__fill"
                  style={{
                    width: hudState?.progress ? `${progressPercent}%` : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Task Content */}
        <div className="task-container__task-content">
          {!summaryState && children(injected)}
          {summaryState && (
            <SummaryOverlay
              result={{
                elapsedMs: summaryState.elapsedMs,
                totalCorrect: summaryState.totalCorrect,
                totalPossible: summaryState.totalPossible,
                totalPoints: summaryState.totalPoints,
              }}
              formatTime={formatTime}
              endHref={endHref}
              endLabel={endLabel}
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
          const canShowFooter = forceShowFooter
            ? hasControls && anyVisible
            : hasControls &&
              anyVisible &&
              !hudState?.isStartScreen &&
              !!hudState?.progress;
          return canShowFooter ? (
            <div className="task-container__footer">
              <TaskActionButtons
                onReset={footerControls!.onReset}
                onEvaluate={() => {
                  stop();
                  footerControls!.onEvaluate();
                }}
                onNext={() => {
                  start();
                  footerControls!.onNext?.();
                }}
                showReset={footerControls!.showReset}
                showEvaluate={footerControls!.showEvaluate}
                showNext={footerControls!.showNext}
                disableReset={footerControls!.disableReset}
                disableEvaluate={footerControls!.disableEvaluate}
                disableNext={footerControls!.disableNext}
              />
            </div>
          ) : null;
        })()}
      </div>
    </div>
  );
};

export default TaskContainer;
