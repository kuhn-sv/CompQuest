import React, {useState} from 'react';
import './TaskActionButtons.component.scss';
import { AskTimModal, TimIcon } from '../../../../ask-tim';
import { TaskFooterControls } from '@/shared/interfaces/tasking.interfaces';

interface TaskActionButtonsProps extends TaskFooterControls {
  taskMeta?: {
    id: string;
    title: string;
    level?: string;
  };
  // Optional task context object (structure defined by each task). It will be
  // forwarded to the AskTimModal so the assistant can be given the current
  // visible task statement and any relevant values.
  taskContext?: unknown;
}

const TaskActionButtons: React.FC<TaskActionButtonsProps> = ({
  onReset,
  onEvaluate,
  onNext,
  showReset = true,
  showEvaluate = true,
  showNext = false,
  disableReset = false,
  disableNext = false,
  taskMeta,
  taskContext,
}) => {
  const [showAskTim, setShowAskTim] = useState(false);

  return (
    <>
      <div className="task-action-buttons">
        {/* Tim fragen button moved to the left and includes inline hint SVG */}
        <button
          className="task-action-btn secondary task-action-btn--left"
          onClick={() => setShowAskTim(true)}
          aria-haspopup="dialog">
          <TimIcon />
          Tim fragen
        </button>
        {showReset && (
          <button
            className="task-action-btn secondary"
            onClick={onReset}
            disabled={disableReset}>
            Zurücksetzen
          </button>
        )}
        {showEvaluate && (
          <button className="task-action-btn primary" onClick={onEvaluate}>
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
      </div>

      <AskTimModal
        open={showAskTim}
        onClose={() => setShowAskTim(false)}
        taskMeta={taskMeta}
        taskContext={taskContext}
      />
    </>
  );
};

export default TaskActionButtons;
