import React from 'react';
import { AssignmentMap } from '../numberSystem.types';
import type { AnswerOption } from '../interfaces/numberSystem.interface';
import NumberWithBase from '../../../../shared/components/number/NumberWithBase.component';

interface ResultsSectionProps {
  answerPool: AnswerOption[];
  usedAnswerKeys: Set<string>;
  assignments: AssignmentMap;
  draggedAnswer: AnswerOption | null;
  activeTaskId: string | null;
  tasks: Array<{ id: string }>;
  handleDragStart: (e: React.DragEvent, answer: AnswerOption) => void;
  handleDragEnd: () => void;
  assignAnswer: (taskId: string, answer: AnswerOption) => void;
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
                <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  <NumberWithBase value={answer.value} base={answer.base} />
                </div>
              </div>
            )}
            {/* Connection line segment when answer is used */}
            {used && <span className="connector-line" />}
            {/* Trailing line after each answer in result section - always visible */}
            <span className="lead-line lead-line--trailing" />
          </div>
        );
      })}
    </div>
  );
};