import React, { useEffect, useState } from 'react';
import { Timer } from '..';
import TaskActionButtons from '../TaskActionButtons/TaskActionButtons.component';
import SummaryOverlay from '../ResultSummary/ResultSummary';
import { useTimer } from '../../hooks';
import type { TaskFooterControls, TaskHudState, TaskSummaryState } from '../../../features/tasks/practiceTaskOne/interfaces';
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
  children: (injected: TaskContainerInjectedProps) => React.ReactNode;
}

// Reusable container for tasks/subtasks with header (title/desc/timer/progress), body, footer actions, and summary overlay
export const TaskContainer: React.FC<TaskContainerProps> = ({
  title,
  description,
  endHref = '/dashboard',
  endLabel = 'Beenden',
  children,
}) => {
  const [footerControls, setFooterControls] = useState<TaskFooterControls | null>(null);
  const [hudState, setHudState] = useState<TaskHudState | null>(null);
  const [summaryState, setSummaryState] = useState<TaskSummaryState | null>(null);

  const { time, isRunning, start, stop, reset, formatTime, getElapsed } = useTimer();

  // Reset timer when summary opens/closes as requested by hud
  useEffect(() => {
    // No-op for now; timer is controlled via hudState and button handlers below
  }, [summaryState]);

  const injected: TaskContainerInjectedProps = {
    onControlsChange: setFooterControls,
    onHudChange: (hud) => {
      setHudState(hud);
      if (!hud) return;
      if (hud.requestTimer === 'start') start();
      if (hud.requestTimer === 'stop') stop();
      if (hud.requestTimer === 'reset') reset();
    },
    onSummaryChange: setSummaryState,
  };

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
                <p className="task-description">{hudState?.subtitle ?? description}</p>
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
                aria-valuenow={hudState?.progress ? progressPercent : 0}
              >
                <div
                  className="task-progress__fill"
                  style={{ width: hudState?.progress ? `${progressPercent}%` : '0%' }}
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
              onClose={() => setSummaryState(null)}
            />
          )}
        </div>

        {/* Unified footer with task action buttons */}
        {!summaryState && (
          <div className="task-container__footer">
            {footerControls && (
              <TaskActionButtons
                onReset={footerControls.onReset}
                onEvaluate={() => {
                  stop();
                  footerControls.onEvaluate();
                }}
                onNext={() => {
                  start();
                  footerControls.onNext?.();
                }}
                showReset={footerControls.showReset}
                showEvaluate={footerControls.showEvaluate}
                showNext={footerControls.showNext}
                disableReset={footerControls.disableReset}
                disableEvaluate={footerControls.disableEvaluate}
                disableNext={footerControls.disableNext}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskContainer;
