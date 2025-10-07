import React from 'react';
import NumberWithBase from '../../../../shared/components/number/NumberWithBase.component';
import type { AdditionTask } from './addition.helper';

interface EquationRowProps {
  task: AdditionTask;
  assignment: { value: string; base: number } | null;
  isCorrect: boolean;
  isWrong: boolean;
  isActive: boolean;
  isDragOver: boolean;
  onClick: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const EquationRow: React.FC<EquationRowProps> = ({
  task,
  assignment,
  isCorrect,
  isWrong,
  isActive,
  isDragOver,
  onClick,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}) => {
  // Addition als untereinander stehende Zahlen mit Basis
  const [zahl1, zahl2] = task.left.split(' + ');
  const baseSub = task.base === 2 ? '₂' : task.base === 8 ? '₈' : task.base === 16 ? '₁₆' : '';
  return (
    <div
      className={`equation-row ${isCorrect ? 'correct' : ''} ${isWrong ? 'incorrect' : ''} ${isActive ? 'active' : ''} ${assignment ? 'has-result' : ''} ${isDragOver ? 'drag-over' : ''}`}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <span className="lead-line lead-line--leading" />
      <div className="input-field source-field">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
          <span>{zahl1}<sub style={{ marginLeft: 2 }}>{baseSub}</sub></span>
          <span>+ {zahl2}<sub style={{ marginLeft: 2 }}>{baseSub}</sub></span>
        </div>
      </div>
      <span className="connector-line" />
      <div className="equals-sign">＝</div>
      <div className="result-placeholder">
        {assignment && (
          <>
            <span className="connector-line" />
            <div className="input-field result-field assigned">
              <NumberWithBase value={assignment.value} base={assignment.base as 2|8|10|16} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
