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
        {/* Tim fragen button moved to the left and includes inline hint SVG */}
        <button
          className="task-action-btn secondary task-action-btn--left"
          onClick={() => setShowAskTim(true)}
          aria-haspopup="dialog"
        >
          {/* inline hint.svg content */}
          <svg
            className="task-action-icon"
            width="20"
            height="20"
            viewBox="0 0 423 423"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_240_294)">
              <path d="M211.5 423C179.812 423 154.032 397.219 154.032 365.533C154.032 357.384 160.639 350.778 168.788 350.778H254.211C262.361 350.778 268.967 357.385 268.967 365.533C268.967 397.219 243.188 423 211.5 423Z" fill="#48AEE2"/>
              <path d="M254.211 350.777H211.5V423C243.188 423 268.967 397.219 268.967 365.533C268.967 357.383 262.362 350.777 254.211 350.777Z" fill="#3797D3"/>
              <path d="M278.576 380.289H144.424C136.275 380.289 129.668 373.682 129.668 365.533V255.538C129.668 244.081 142.23 236.959 152.067 242.916C188.465 264.952 234.505 264.97 270.935 242.916C280.777 236.958 293.332 244.087 293.332 255.538V365.533C293.331 373.682 286.725 380.289 278.576 380.289Z" fill="#8DC3E9"/>
              <path d="M270.935 242.915C252.724 253.94 232.111 259.449 211.5 259.449V380.288H278.576C286.725 380.288 293.332 373.681 293.332 365.532V255.538C293.332 244.086 280.775 236.958 270.935 242.915Z" fill="#48AEE2"/>
              <path d="M293.326 310.029H129.664V339.541H293.326V310.029Z" fill="#48AEE2"/>
              <path d="M136.782 268.161C94.4679 242.554 67.0249 196.298 67.0249 144.474C67.0249 64.8107 131.836 0 211.5 0C291.164 0 355.975 64.8107 355.975 144.474C355.975 196.306 328.528 242.557 286.216 268.161C240.43 295.88 182.613 295.906 136.782 268.161Z" fill="#FFE49C"/>
              <path d="M211.5 0V288.96C237.411 288.96 263.318 282.024 286.216 268.162C328.527 242.557 355.975 196.306 355.975 144.475C355.975 64.8107 291.164 0 211.5 0Z" fill="#FFD155"/>
              <path d="M183.399 169.13C175.25 169.13 168.644 175.737 168.644 183.885V282.468C178.222 285.437 188.112 287.4 198.156 288.328V183.886C198.155 175.737 191.548 169.13 183.399 169.13Z" fill="#FFD155"/>
              <path d="M293.336 310.029H211.5V339.541H293.336V310.029Z" fill="#3797D3"/>
              <path d="M239.601 169.13C231.451 169.13 224.845 175.737 224.845 183.885V288.328C234.889 287.4 244.779 285.438 254.357 282.468V183.886C254.357 175.737 247.75 169.13 239.601 169.13Z" fill="#FFBE00"/>
            </g>
            <defs>
              <clipPath id="clip0_240_294">
                <rect width="423" height="423" fill="white"/>
              </clipPath>
            </defs>
          </svg>
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
        {/* (moved) Tim fragen button rendered above as first element */}
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
