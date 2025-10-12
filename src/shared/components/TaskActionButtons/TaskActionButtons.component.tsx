import React, {useState} from 'react';
import './TaskActionButtons.component.scss';
import AskTimModal from './AskTimModal.component';

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
  taskMeta?: {
    id: string;
    title: string;
    level?: string;
  };
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
  taskMeta,
}) => {
  const [showAskTim, setShowAskTim] = useState(false);

  return (
    <>
      <div className="task-action-buttons">
        {showReset && (
          <button
            className="task-action-btn secondary"
            onClick={onReset}
            disabled={disableReset}>
            Zurücksetzen
          </button>
        )}
        {showEvaluate && (
          <button
            className="task-action-btn primary"
            onClick={onEvaluate}
            disabled={disableEvaluate}>
            Auswerten
          </button>
        )}
        {showNext && (
          <button
            className="task-action-btn primary"
            onClick={onNext}
            disabled={disableNext}>
            Weiter
          </button>
        )}
        <button
          className="task-action-btn secondary"
          onClick={() => setShowAskTim(true)}
          aria-haspopup="dialog">
          Tim fragen
        </button>
      </div>

      <AskTimModal
        open={showAskTim}
        onClose={() => setShowAskTim(false)}
        taskMeta={taskMeta}
      />
    </>
  );
};

export default TaskActionButtons;
