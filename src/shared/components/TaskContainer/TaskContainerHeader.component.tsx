import React, {useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {Timer} from '..';
import ConfirmModal from '../ConfirmModal/ConfirmModal.component';
import type {TaskHudState} from '../../interfaces/tasking.interfaces';
import './TaskContainerHeader.component.scss';

interface Props {
  title: string;
  description?: string;
  hudState: TaskHudState | null;
  time: number;
  isRunning: boolean;
  formatTime: (ms: number) => string;
  getElapsed: () => number;
}

const TaskContainerHeader: React.FC<Props> = ({
  title,
  description,
  hudState,
  time,
  isRunning,
  formatTime,
  getElapsed,
}) => {
  const navigate = useNavigate();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const handleBackClick = useCallback(() => setShowLeaveModal(true), []);
  const handleCancelLeave = useCallback(() => setShowLeaveModal(false), []);
  const handleConfirmLeave = useCallback(
    () => navigate('/dashboard', {state: {openExercises: true}}),
    [navigate],
  );

  const progressPercent = hudState?.progress
    ? Math.round((hudState.progress.current / hudState.progress.total) * 100)
    : 0;

  return (
    <div className="task-container__header">
      {showLeaveModal && (
        <ConfirmModal
          title="Aufgabe verlassen?"
          message="Dein aktueller Fortschritt geht verloren. Möchtest du wirklich zurück zur Aufgabenübersicht?"
          confirmLabel="Verlassen"
          cancelLabel="Weiterüben"
          onConfirm={handleConfirmLeave}
          onCancel={handleCancelLeave}
        />
      )}
      <div className="header-row header-row--top">
        <button
          type="button"
          className="task-back-button"
          aria-label="Zurück zur Aufgabenübersicht"
          onClick={handleBackClick}>
          ‹
        </button>
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
            style={{width: hudState?.progress ? `${progressPercent}%` : '0%'}}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskContainerHeader;
