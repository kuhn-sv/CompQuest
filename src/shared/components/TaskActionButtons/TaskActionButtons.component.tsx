import React from 'react';
import './TaskActionButtons.component.scss';

interface TaskActionButtonsProps {
  onReset?: () => void;
  onEvaluate: () => void;
  onNext?: () => void;
  showReset?: boolean;
  showNext?: boolean;
  showEvaluate?: boolean;
  disableReset?: boolean;
  disableEvaluate?: boolean;
  disableNext?: boolean;
}

const TaskActionButtons: React.FC<TaskActionButtonsProps> = ({
  onReset,
  onEvaluate,
  onNext,
  showReset = true,
  showEvaluate = true,
  showNext = false,
  disableReset = false,
  disableEvaluate = false,
  disableNext = false,
}) => (
  <div className="task-action-buttons">
    {showReset && (
      <button className="task-action-btn secondary" onClick={onReset} disabled={disableReset}>Zurücksetzen</button>
    )}
    {showEvaluate && (
      <button className="task-action-btn primary" onClick={onEvaluate} disabled={disableEvaluate}>Auswerten</button>
    )}
    {showNext && (
      <button className="task-action-btn primary" onClick={onNext} disabled={disableNext}>Weiter</button>
    )}
  </div>
);

export default TaskActionButtons;
