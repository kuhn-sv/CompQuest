import React from 'react';

interface EquationRowProps {
  hasAssignment: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  isActive: boolean;
  isDragOver: boolean;
  onClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  // Optional data attribute used for pointer-based hit testing
  dataTaskId?: string;
  sourceContent: React.ReactNode;
  assignedContent?: React.ReactNode;
}

export const EquationRow: React.FC<EquationRowProps> = ({
  hasAssignment,
  isCorrect,
  isWrong,
  isActive,
  isDragOver,
  onClick,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  dataTaskId,
  sourceContent,
  assignedContent,
}) => {
  const resultState = isCorrect ? 'success' : isWrong ? 'error' : '';
  return (
    <div
      data-task-id={dataTaskId}
      className={`equation-row ${isCorrect ? 'correct' : ''} ${isWrong ? 'incorrect' : ''} ${isActive ? 'active' : ''} ${hasAssignment ? 'has-result' : ''} ${isDragOver ? 'drag-over' : ''}`}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}>
      <span className="lead-line lead-line--leading" />
      <div className="input-field source-field">{sourceContent}</div>
      <span
        className={`connector-line${resultState ? ' ' + resultState : ''}`}
      />
      <div className={`equals-sign${resultState ? ' ' + resultState : ''}`}>
        ＝
      </div>
      <div className="result-placeholder">
        {hasAssignment && (
          <>
            <span
              className={`connector-line${resultState ? ' ' + resultState : ''}`}
            />
            <div
              className={`input-field result-field assigned${resultState ? ' ' + resultState : ''}`}>
              {assignedContent}
            </div>
            <span
              className={`lead-line lead-line--trailing${resultState ? ' ' + resultState : ''}`}
            />
          </>
        )}
      </div>
    </div>
  );
};
