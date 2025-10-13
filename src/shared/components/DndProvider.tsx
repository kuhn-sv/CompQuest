import React from 'react';
import {
  DndContext,
  CollisionDetection,
  DragStartEvent,
  DragMoveEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import elementFromPointCollision from '../hooks/dndCollisionAdapter';
import {useDndSensors} from '../hooks/dndSensors';

interface DndProviderProps {
  children: React.ReactNode;
  collisionDetection?: CollisionDetection;
  onDragStart?: (event: DragStartEvent) => void;
  onDragMove?: (event: DragMoveEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

export const DndProvider: React.FC<DndProviderProps> = ({
  children,
  collisionDetection = elementFromPointCollision,
  onDragStart,
  onDragMove,
  onDragOver,
  onDragEnd,
}) => {
  const sensors = useDndSensors();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}>
      {children}
    </DndContext>
  );
};

export default DndProvider;
