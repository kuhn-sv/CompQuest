import React from 'react';
import NumberWithBase from '../../../../shared/components/number/NumberWithBase.component';
import type { AdditionTask } from './addition.helper';

interface ResultsSectionProps {
  answerPool: { value: string; base: number }[];
  usedAnswerKeys: Set<string>;
  assignments: Record<string, { value: string; base: number } | null>;
  draggedAnswer: { value: string; base: number } | null;
  activeTaskId: string | null;
  tasks: AdditionTask[];
  handleDragStart: (e: React.DragEvent, answer: { value: string; base: number }) => void;
  handleDragEnd: () => void;
  assignAnswer: (taskId: string, answer: { value: string; base: number }) => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  answerPool,
  usedAnswerKeys,
  assignments,
  draggedAnswer,
  activeTaskId,
  tasks,
  handleDragStart,
  handleDragEnd,
  assignAnswer
}) => {
  return (
    <div className="results-section">
      {answerPool.map((answer, index) => {
        const aKey = `${answer.value}|${answer.base}`;
        const used = usedAnswerKeys.has(aKey);
        const assignedToTask = Object.values(assignments).find(assigned =>
          assigned && assigned.value === answer.value && assigned.base === answer.base
        );
        return (
          <div key={aKey} className={`result-row row-${index}`}>
            {!used && (
              <div
                className={`input-field result-field ${assignedToTask ? 'assigned' : ''} ${draggedAnswer && draggedAnswer.value === answer.value && draggedAnswer.base === answer.base ? 'dragging' : ''}`}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, answer)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  const targetTaskId = activeTaskId ?? tasks.find(t => !assignments[t.id])?.id;
                  if (targetTaskId) assignAnswer(targetTaskId, answer);
                }}
              >
                <div style={{ userSelect: 'none' }}>
                  <NumberWithBase value={answer.value} base={answer.base as 2|8|10|16} />
                </div>
              </div>
            )}
            {used && <span className="connector-line" />}
            <span className="lead-line lead-line--trailing" />
          </div>
        );
      })}
    </div>
  );
};
