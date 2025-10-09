import React from 'react';
import { AssignmentMap } from '../numberSystem.types';
import type { AnswerOption } from '../interfaces/numberSystem.interface';
import NumberWithBase from '../../../../../shared/components/number/NumberWithBase.component';

import type { NumberTask } from '../interfaces/numberSystem.interface';

interface ResultsSectionProps {
  answerPool: AnswerOption[];
  usedAnswerKeys: Set<string>;
  assignments: AssignmentMap;
  draggedAnswer: AnswerOption | null;
  activeTaskId: string | null;
  tasks: NumberTask[];
  handleDragStart: (e: React.DragEvent, answer: AnswerOption) => void;
  handleDragEnd: () => void;
  assignAnswer: (taskId: string, answer: AnswerOption) => void;
  evaluated: boolean;
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
  evaluated
}) => {
  return (
    <div className="results-section">
      {answerPool.map((answer, index) => {
        const aKey = `${answer.value}|${answer.base}`;
        const used = usedAnswerKeys.has(aKey);
        // Finde zugewiesene Task für diesen Pool-Input
        let assignedToTask: NumberTask | undefined;
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
                  <NumberWithBase value={answer.value} base={answer.base} />
                </div>
              </div>
            )}
            {/* Connection line segment when answer is used */}
            {used && <span className={`connector-line${resultState ? ' ' + resultState : ''}`} />}
            {/* Trailing line after each answer in result section - always visible */}
            <span className={`lead-line lead-line--trailing${resultState ? ' ' + resultState : ''}`} />
          </div>
        );
      })}
    </div>
  );
};