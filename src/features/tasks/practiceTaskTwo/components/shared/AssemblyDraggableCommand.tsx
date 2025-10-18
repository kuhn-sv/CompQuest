import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import type {AssemblyCommand} from './assembly.types';

interface AssemblyDraggableCommandProps {
  /** The command to display */
  command: AssemblyCommand;
  /** Unique identifier for drag and drop */
  id: string;
  /** Whether this command is already placed in a slot */
  isPlaced: boolean;
  /** Whether this command is currently selected */
  isSelected: boolean;
  /** Click handler for command selection */
  onClick: () => void;
  /** Whether drag and drop is disabled */
  disabled: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * A draggable assembly command component
 * Used in assembly-related tasks for drag-and-drop interactions
 */
const AssemblyDraggableCommand: React.FC<AssemblyDraggableCommandProps> = ({
  command,
  id,
  isPlaced,
  isSelected,
  onClick,
  disabled,
  className = '',
}) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id,
    disabled: isPlaced || disabled,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const displayText = command.arg ? `${command.op} ${command.arg}` : command.op;

  if (isPlaced) {
    return null; // Don't render if already placed
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`assembly__command ${isDragging ? 'is-dragging' : ''} ${isSelected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      onClick={onClick}
      {...listeners}
      {...attributes}>
      {displayText}
    </div>
  );
};

export default AssemblyDraggableCommand;

