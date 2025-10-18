import React, {useCallback, useEffect, useState} from 'react';
import './VonNeumannReconstruct.scss';
import {DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable} from '@dnd-kit/core';
import {useDndSensors} from '../../../../shared/hooks/dndSensors';
import type {TaskStageScore} from '../../../../shared/interfaces/tasking.interfaces';

interface Props {
  components: string[];
  onChange?: (score: TaskStageScore | null) => void;
  evaluated?: boolean;
}

interface Placements {
  [dropZoneId: string]: string | null;
}

// Drop zone IDs for the architecture
const DROP_ZONES = {
  CPU_LEFT: 'cpu-left',
  CPU_RIGHT: 'cpu-right',
  TRANSPORT: 'transport',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right',
};

// Validation: which components go where
const CPU_COMPONENTS = ['Steuerwerk', 'Rechenwerk'];
const TRANSPORT_COMPONENT = 'Transportmedium';
const BOTTOM_COMPONENTS = ['RAM', 'ROM', 'Peripherie'];

const DraggableComponent: React.FC<{id: string; label: string; isPlaced: boolean}> = ({
  id,
  label,
  isPlaced,
}) => {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id,
    disabled: isPlaced,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-component ${isPlaced ? 'is-placed' : ''} ${isDragging ? 'is-dragging' : ''}`}
      {...listeners}
      {...attributes}>
      {label}
    </div>
  );
};

const DroppableZone: React.FC<{
  id: string;
  label?: string;
  placedComponent: string | null;
  isCorrect?: boolean;
  isWrong?: boolean;
  evaluated?: boolean;
}> = ({id, label, placedComponent, isCorrect, isWrong, evaluated}) => {
  const {setNodeRef, isOver} = useDroppable({
    id,
  });

  // Make placed component draggable
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDragRef,
    transform: dragTransform,
    isDragging: isDraggingPlaced,
  } = useDraggable({
    id: `placed-${placedComponent}`,
    disabled: !placedComponent || evaluated,
    data: {
      component: placedComponent,
      fromZone: id,
    },
  });

  const dragStyle = dragTransform
    ? {
        transform: `translate3d(${dragTransform.x}px, ${dragTransform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone ${isOver ? 'is-over' : ''} ${placedComponent ? 'has-component' : ''} ${evaluated && isCorrect ? 'is-correct' : ''} ${evaluated && isWrong ? 'is-wrong' : ''}`}
      data-label={label}>
      {placedComponent ? (
        <div
          ref={setDragRef}
          style={dragStyle}
          className={`placed-component ${isDraggingPlaced ? 'is-dragging' : ''}`}
          {...dragListeners}
          {...dragAttributes}>
          {placedComponent}
        </div>
      ) : (
        label
      )}
    </div>
  );
};

const VonNeumannReconstruct: React.FC<Props> = ({components, onChange, evaluated}) => {
  const [placements, setPlacements] = useState<Placements>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useDndSensors();

  // Track which components are placed
  const placedComponents = new Set(Object.values(placements).filter(Boolean));

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const {active, over} = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const activeIdStr = active.id as string;
    const dropZoneId = over.id as string;

    // Check if dragging from a placement or from the list
    let componentId: string;

    if (activeIdStr.startsWith('placed-')) {
      // Dragging from a drop zone
      componentId = activeIdStr.replace('placed-', '');
    } else {
      // Dragging from the component list
      componentId = activeIdStr;
    }

    setPlacements(prev => {
      // Remove component from its previous placement (if any)
      const cleaned: Placements = {};
      Object.entries(prev).forEach(([zoneId, compId]) => {
        if (compId !== componentId) {
          cleaned[zoneId] = compId;
        }
      });

      // Place in new zone
      cleaned[dropZoneId] = componentId;
      return cleaned;
    });
  }, []);

  // Validation logic
  const validatePlacement = useCallback(
    (zoneId: string, component: string | null): boolean => {
      if (!component) return false;

      // CPU zones
      if (zoneId === DROP_ZONES.CPU_LEFT || zoneId === DROP_ZONES.CPU_RIGHT) {
        return CPU_COMPONENTS.includes(component);
      }

      // Transport zone
      if (zoneId === DROP_ZONES.TRANSPORT) {
        return component === TRANSPORT_COMPONENT;
      }

      // Bottom row zones
      if (
        zoneId === DROP_ZONES.BOTTOM_LEFT ||
        zoneId === DROP_ZONES.BOTTOM_CENTER ||
        zoneId === DROP_ZONES.BOTTOM_RIGHT
      ) {
        return BOTTOM_COMPONENTS.includes(component);
      }

      return false;
    },
    [],
  );

  // Calculate score and validation state
  useEffect(() => {
    const totalZones = Object.keys(DROP_ZONES).length;
    let correctCount = 0;

    Object.entries(placements).forEach(([zoneId, component]) => {
      if (validatePlacement(zoneId, component)) {
        correctCount++;
      }
    });

    // Check if all required components are placed

    const score: TaskStageScore = {
      difficulty: 'Rekonstruktion',
      correct: correctCount,
      total: totalZones,
      points: correctCount,
    };

    onChange?.(score);
  }, [placements, components, validatePlacement, onChange]);

  // Get active component label for drag overlay
  const getActiveComponent = () => {
    if (!activeId) return null;
    
    if (activeId.startsWith('placed-')) {
      return activeId.replace('placed-', '');
    }
    return components.find(c => c === activeId) || null;
  };

  const activeComponent = getActiveComponent();

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <div className="vn-reconstruct">
        <div className="vn-reconstruct__content">
          {/* Left side: Von-Neumann Architecture Diagram */}
          <div className="vn-reconstruct__diagram">
            <h3 className="vn-reconstruct__title">
              Aufgabe 1/4: Rekonstruiere die Von-Neumann-Architektur
            </h3>
            <p className="vn-reconstruct__subtitle">
              Ziehe die Komponenten an ihren Platz
            </p>

            {/* CPU Container */}
            <div className="architecture-container">
              <div className="cpu-container">
                <div className="cpu-label">CPU</div>
                <div className="cpu-zones">
                  <DroppableZone
                    id={DROP_ZONES.CPU_LEFT}
                    placedComponent={placements[DROP_ZONES.CPU_LEFT] || null}
                    isCorrect={validatePlacement(
                      DROP_ZONES.CPU_LEFT,
                      placements[DROP_ZONES.CPU_LEFT] || null,
                    )}
                    isWrong={
                      !validatePlacement(
                        DROP_ZONES.CPU_LEFT,
                        placements[DROP_ZONES.CPU_LEFT] || null,
                      ) && !!placements[DROP_ZONES.CPU_LEFT]
                    }
                    evaluated={evaluated}
                  />
                  <DroppableZone
                    id={DROP_ZONES.CPU_RIGHT}
                    placedComponent={placements[DROP_ZONES.CPU_RIGHT] || null}
                    isCorrect={validatePlacement(
                      DROP_ZONES.CPU_RIGHT,
                      placements[DROP_ZONES.CPU_RIGHT] || null,
                    )}
                    isWrong={
                      !validatePlacement(
                        DROP_ZONES.CPU_RIGHT,
                        placements[DROP_ZONES.CPU_RIGHT] || null,
                      ) && !!placements[DROP_ZONES.CPU_RIGHT]
                    }
                    evaluated={evaluated}
                  />
                </div>
              </div>

              {/* Transport Medium */}
              <DroppableZone
                id={DROP_ZONES.TRANSPORT}
                placedComponent={placements[DROP_ZONES.TRANSPORT] || null}
                isCorrect={validatePlacement(
                  DROP_ZONES.TRANSPORT,
                  placements[DROP_ZONES.TRANSPORT] || null,
                )}
                isWrong={
                  !validatePlacement(
                    DROP_ZONES.TRANSPORT,
                    placements[DROP_ZONES.TRANSPORT] || null,
                  ) && !!placements[DROP_ZONES.TRANSPORT]
                }
                evaluated={evaluated}
              />

              {/* Bottom Row */}
              <div className="bottom-row">
                <DroppableZone
                  id={DROP_ZONES.BOTTOM_LEFT}
                  placedComponent={placements[DROP_ZONES.BOTTOM_LEFT] || null}
                  isCorrect={validatePlacement(
                    DROP_ZONES.BOTTOM_LEFT,
                    placements[DROP_ZONES.BOTTOM_LEFT] || null,
                  )}
                  isWrong={
                    !validatePlacement(
                      DROP_ZONES.BOTTOM_LEFT,
                      placements[DROP_ZONES.BOTTOM_LEFT] || null,
                    ) && !!placements[DROP_ZONES.BOTTOM_LEFT]
                  }
                  evaluated={evaluated}
                />
                <DroppableZone
                  id={DROP_ZONES.BOTTOM_CENTER}
                  placedComponent={placements[DROP_ZONES.BOTTOM_CENTER] || null}
                  isCorrect={validatePlacement(
                    DROP_ZONES.BOTTOM_CENTER,
                    placements[DROP_ZONES.BOTTOM_CENTER] || null,
                  )}
                  isWrong={
                    !validatePlacement(
                      DROP_ZONES.BOTTOM_CENTER,
                      placements[DROP_ZONES.BOTTOM_CENTER] || null,
                    ) && !!placements[DROP_ZONES.BOTTOM_CENTER]
                  }
                  evaluated={evaluated}
                />
                <DroppableZone
                  id={DROP_ZONES.BOTTOM_RIGHT}
                  placedComponent={placements[DROP_ZONES.BOTTOM_RIGHT] || null}
                  isCorrect={validatePlacement(
                    DROP_ZONES.BOTTOM_RIGHT,
                    placements[DROP_ZONES.BOTTOM_RIGHT] || null,
                  )}
                  isWrong={
                    !validatePlacement(
                      DROP_ZONES.BOTTOM_RIGHT,
                      placements[DROP_ZONES.BOTTOM_RIGHT] || null,
                    ) && !!placements[DROP_ZONES.BOTTOM_RIGHT]
                  }
                  evaluated={evaluated}
                />
              </div>
            </div>
          </div>

          {/* Right side: Draggable Components */}
          <div className="vn-reconstruct__components">
            {components
              .filter(component => !placedComponents.has(component))
              .map(component => (
                <DraggableComponent
                  key={component}
                  id={component}
                  label={component}
                  isPlaced={false}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeComponent ? (
          <div className="draggable-component is-overlay">{activeComponent}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default VonNeumannReconstruct;