import React from 'react';
import type { NumberTaskBase, AnswerOptionBase, AssignmentMapBase } from './NumberTask.types';

interface ResultsSectionProps {
  answerPool: AnswerOptionBase[];
  usedAnswerKeys: Set<string>;
  assignments: AssignmentMapBase;
  draggedAnswer: AnswerOptionBase | null;
  activeTaskId: string | null;
  tasks: NumberTaskBase[];
  handleDragStart: (e: React.DragEvent, answer: AnswerOptionBase) => void;
  handleDragEnd: () => void;
  assignAnswer: (taskId: string, answer: AnswerOptionBase) => void;
  evaluated: boolean;
  // Optional renderer to display an answer value (e.g., wrap with NumberWithBase)
  renderAnswer?: (answer: AnswerOptionBase) => React.ReactNode;
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
  assignAnswer,
  evaluated,
  renderAnswer,
}) => {
  return (
    <div className="results-section">
      {answerPool.map((answer, index) => {
        const aKey = `${answer.value}|${answer.base}`;
        const used = usedAnswerKeys.has(aKey);
        let assignedToTask: NumberTaskBase | undefined;
        let resultState = '';
        for (const t of tasks) {
          const assigned = assignments[t.id];
          if (assigned && assigned.value === answer.value && assigned.base === answer.base) {
            assignedToTask = t;
            if (evaluated) {
              if (assigned.value === t.expectedValue && assigned.base === t.toBase) {
                resultState = 'success';
              } else {
                resultState = 'error';
              }
            }
            break;
          }
        }
        return (
          <div key={aKey} className={`result-row row-${index}`}>
            {!used && (
              <div
                className={`input-field result-field${assignedToTask ? ' assigned' : ''}${resultState ? ' ' + resultState : ''} ${draggedAnswer && draggedAnswer.value === answer.value && draggedAnswer.base === answer.base ? 'dragging' : ''}`}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, answer)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  const targetTaskId = activeTaskId ?? tasks.find(t => !assignments[t.id])?.id;
                  if (targetTaskId) assignAnswer(targetTaskId, answer);
                }}
              >
                <div style={{ userSelect: 'none' }}>
                  {renderAnswer ? renderAnswer(answer) : answer.value}
                </div>
              </div>
            )}
            {used && <span className={`connector-line${resultState ? ' ' + resultState : ''}`} />}
            <span className={`lead-line lead-line--trailing${used && resultState ? ' ' + resultState : ''}`} />
          </div>
        );
      })}
    </div>
  );
};
