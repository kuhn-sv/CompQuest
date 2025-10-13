import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import type {
  NumberTaskBase,
  AnswerOptionBase,
  AssignmentMapBase,
} from './NumberTask.types';
import {AnswerDragData, DRAG_TYPES} from '../interfaces/dnd.types';

interface ResultsSectionProps {
  answerPool: AnswerOptionBase[];
  // Deprecated: a Set of value|base keys marks used, but fails for duplicates. Kept for compatibility.
  usedAnswerKeys: Set<string>;
  assignments: AssignmentMapBase;
  draggedAnswer: AnswerOptionBase | null;
  activeTaskId: string | null;
  tasks: NumberTaskBase[];
  handlePointerDown?: (
    e: React.PointerEvent | React.TouchEvent,
    answer: AnswerOptionBase,
  ) => void;
  // When using dnd-kit these handlers may be omitted and are therefore optional
  handleDragStart?: (e: React.DragEvent, answer: AnswerOptionBase) => void;
  handleDragEnd?: () => void;
  assignAnswer: (taskId: string, answer: AnswerOptionBase) => void;
  evaluated: boolean;
  // Optional renderer to display an answer value (e.g., wrap with NumberWithBase)
  renderAnswer?: (answer: AnswerOptionBase) => React.ReactNode;
  // Optional prefix used to build stable, unique keys for answer rows
  keyPrefix?: string;
  // Enable dnd-kit draggable behavior when present
  enableDndKit?: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = props => {
  const {
    answerPool,
    assignments,
    draggedAnswer,
    activeTaskId,
    tasks,
    handleDragStart,
    handlePointerDown,
    handleDragEnd,
    assignAnswer,
    evaluated,
    renderAnswer,
    keyPrefix = 'result',
    enableDndKit = false,
  } = props;

  const DraggableAnswer: React.FC<{
    answer: AnswerOptionBase;
    index: number;
    assignedToTask?: NumberTaskBase;
    resultState: string;
    keyPrefix: string;
  }> = ({answer, index, assignedToTask, resultState, keyPrefix}) => {
    const aKey = `${answer.value}|${answer.base}`;
    const id = `${keyPrefix}:answer:${index}:${aKey}`;

    const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
      id,
      data: {
        type: DRAG_TYPES.ANSWER,
        answer,
        index,
      } satisfies AnswerDragData<AnswerOptionBase>, // <- Generischer Typ
    });
    return (
      <div
        ref={setNodeRef}
        data-answer-key={aKey}
        className={`input-field result-field${assignedToTask ? ' assigned' : ''}${resultState ? ' ' + resultState : ''} ${isDragging ? 'dragging' : ''}`}
        style={{touchAction: 'none'}}
        {...attributes}
        {...listeners}
        onClick={() => {
          const targetTaskId =
            activeTaskId ?? tasks.find(t => !assignments[t.id])?.id;
          if (targetTaskId) assignAnswer(targetTaskId, answer);
        }}>
        <div style={{userSelect: 'none'}}>
          {renderAnswer ? renderAnswer(answer) : answer.value}
        </div>
      </div>
    );
  };
  // Build a count of how many answers of each value|base are assigned
  const assignedCountByKey = new Map<string, number>();
  for (const t of tasks) {
    const a = assignments[t.id];
    if (!a) continue;
    const k = `${a.value}|${a.base}`;
    assignedCountByKey.set(k, (assignedCountByKey.get(k) ?? 0) + 1);
  }

  // Track how many of each key we've encountered while rendering, so only
  // the first N instances (where N = assigned count) are marked as used/hidden
  const seenSoFar = new Map<string, number>();

  return (
    <div className="results-section">
      {answerPool.map((answer, index) => {
        const aKey = `${answer.value}|${answer.base}`;
        const maxUsed = assignedCountByKey.get(aKey) ?? 0;
        const seen = seenSoFar.get(aKey) ?? 0;
        const used = seen < maxUsed;
        if (used) seenSoFar.set(aKey, seen + 1);
        let assignedToTask: NumberTaskBase | undefined;
        let resultState = '';
        for (const t of tasks) {
          const assigned = assignments[t.id];
          if (
            assigned &&
            assigned.value === answer.value &&
            assigned.base === answer.base
          ) {
            assignedToTask = t;
            if (evaluated) {
              if (
                assigned.value === t.expectedValue &&
                assigned.base === t.toBase
              ) {
                resultState = 'success';
              } else {
                resultState = 'error';
              }
            }
            break;
          }
        }
        // Use a scoped key including prefix and index to avoid collisions when values repeat
        const rowKey = `${keyPrefix}:${index}:${aKey}`;
        return (
          <div key={rowKey} className={`result-row row-${index}`}>
            {!used &&
              (enableDndKit ? (
                <DraggableAnswer
                  answer={answer}
                  assignedToTask={assignedToTask}
                  resultState={resultState}
                  index={index}
                  keyPrefix={keyPrefix}
                />
              ) : (
                <div
                  data-answer-key={aKey}
                  className={`input-field result-field${assignedToTask ? ' assigned' : ''}${resultState ? ' ' + resultState : ''} ${draggedAnswer && draggedAnswer.value === answer.value && draggedAnswer.base === answer.base ? 'dragging' : ''}`}
                  draggable={true}
                  style={{touchAction: 'none'}}
                  onDragStart={e => handleDragStart?.(e, answer)}
                  onDragEnd={() => handleDragEnd?.()}
                  onPointerDown={(e: React.PointerEvent) => {
                    // Prefer a provided pointer-aware handler from parent hook
                    if (handlePointerDown) {
                      handlePointerDown(e, answer);
                      return;
                    }
                    // Fallback: call the mouse-drag handler with a minimal fake event
                    const fakeEvent = {
                      // copy useful properties but ensure methods exist
                      ...e,
                      dataTransfer: {
                        setData: () => {},
                        getData: () => '',
                        effectAllowed: 'move',
                        dropEffect: 'move',
                      },
                      stopPropagation: () => {},
                      preventDefault: () => {},
                    } as unknown as React.DragEvent;
                    if (handleDragStart) handleDragStart(fakeEvent, answer);
                  }}
                  onTouchStart={(e: React.TouchEvent) => {
                    if (handlePointerDown) {
                      handlePointerDown(e, answer);
                      return;
                    }
                    // fallback to click assignment
                  }}
                  onClick={() => {
                    const targetTaskId =
                      activeTaskId ?? tasks.find(t => !assignments[t.id])?.id;
                    if (targetTaskId) assignAnswer(targetTaskId, answer);
                  }}>
                  <div style={{userSelect: 'none'}}>
                    {renderAnswer ? renderAnswer(answer) : answer.value}
                  </div>
                </div>
              ))}
            {used && (
              <span
                className={`connector-line${resultState ? ' ' + resultState : ''}`}
              />
            )}
            <span
              className={`lead-line lead-line--trailing${used && resultState ? ' ' + resultState : ''}`}
            />
          </div>
        );
      })}
    </div>
  );
};
