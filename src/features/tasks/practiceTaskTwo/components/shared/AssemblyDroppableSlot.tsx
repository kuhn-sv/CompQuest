import React from 'react';
import {useDraggable, useDroppable} from '@dnd-kit/core';
import type {AssemblyCommand} from './assembly.types';

interface AssemblyDroppableSlotProps {
  /** Slot index */
  index: number;
  /** Label to display (e.g., slot number or address) */
  label: string;
  /** The command currently placed in this slot */
  command: AssemblyCommand | null;
  /** Whether this slot's command is correct (after evaluation) */
  isCorrect: boolean;
  /** Whether this slot's command is wrong (after evaluation) */
  isWrong: boolean;
  /** Whether the task has been evaluated */
  evaluated: boolean;
  /** Callback when command is removed from slot */
  onRemove: () => void;
  /** Additional CSS class name */
  className?: string;
  /** Custom placeholder text */
  placeholder?: string;
}

/**
 * A droppable slot component for assembly commands
 * Supports both dropping new commands and reordering existing ones
 */
const AssemblyDroppableSlot: React.FC<AssemblyDroppableSlotProps> = ({
  index,
  label,
  command,
  isCorrect,
  isWrong,
  evaluated,
  onRemove,
  className = '',
  placeholder = '???',
}) => {
  const {setNodeRef, isOver} = useDroppable({
    id: `slot-${index}`,
  });

  // Make placed command draggable for reordering
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDragRef,
    transform: dragTransform,
    isDragging: isDraggingPlaced,
  } = useDraggable({
    id: `placed-${index}`,
    disabled: !command || evaluated,
    data: {
      fromSlot: index,
    },
  });

  const dragStyle = dragTransform
    ? {
        transform: `translate3d(${dragTransform.x}px, ${dragTransform.y}px, 0)`,
      }
    : undefined;

  const displayText = command
    ? command.arg
      ? `${command.op} ${command.arg}`
      : command.op
    : '';

  return (
    <div
      className={`assembly__slot-row ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''} ${className}`}>
      <div className="assembly__slot-label">{label}:</div>
      <div
        ref={setNodeRef}
        className={`assembly__slot ${isOver ? 'is-over' : ''} ${command ? 'has-command' : ''}`}>
        {command ? (
          <div
            ref={setDragRef}
            style={dragStyle}
            className={`assembly__placed-command ${isDraggingPlaced ? 'is-dragging' : ''}`}
            {...dragListeners}
            {...dragAttributes}>
            {displayText}
            {!evaluated && (
              <button
                className="assembly__remove-btn"
                onClick={e => {
                  e.stopPropagation();
                  onRemove();
                }}
                aria-label="Remove command">
                ×
              </button>
            )}
          </div>
        ) : (
          <span className="assembly__slot-placeholder">{placeholder}</span>
        )}
      </div>
    </div>
  );
};

export default AssemblyDroppableSlot;

