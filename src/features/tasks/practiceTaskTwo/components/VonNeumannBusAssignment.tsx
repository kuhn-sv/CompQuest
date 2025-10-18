import React, {useCallback, useEffect, useState} from 'react';
import './VonNeumannBusAssignment.scss';
import {DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable} from '@dnd-kit/core';
import {useDndSensors} from '../../../../shared/hooks/dndSensors';
import type {TaskStageScore} from '../../../../shared/interfaces/tasking.interfaces';
import type {Placements} from './vonneumann.helper';

interface Props {
  buses: string[];
  onChange?: (score: TaskStageScore | null) => void;
  evaluated?: boolean;
}

// Drop zone IDs for the bus connections
const DROP_ZONES = {
  LEFT: 'bus-left',
  RIGHT_TOP: 'bus-right-top',
  RIGHT_BOTTOM: 'bus-right-bottom',
};

// Validation: which buses go where
const LEFT_BUS = 'Datenbus';
const RIGHT_BUSES = ['Adressbus', 'Steuerbus'];

const DraggableBus: React.FC<{id: string; label: string; isPlaced: boolean}> = ({
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
      className={`bus-button ${isPlaced ? 'is-placed' : ''} ${isDragging ? 'is-dragging' : ''}`}
      {...listeners}
      {...attributes}>
      {label}
    </div>
  );
};

const DroppableBusZone: React.FC<{
  id: string;
  placedBus: string | null;
  isCorrect?: boolean;
  isWrong?: boolean;
  evaluated?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}> = ({id, placedBus, isCorrect, isWrong, evaluated, isSelected, onClick}) => {
  const {setNodeRef, isOver} = useDroppable({
    id,
  });

  // Make placed bus draggable
  const {
    attributes: dragAttributes,
    listeners: dragListeners,
    setNodeRef: setDragRef,
    transform: dragTransform,
    isDragging: isDraggingPlaced,
  } = useDraggable({
    id: `placed-${placedBus}`,
    disabled: !placedBus || evaluated,
    data: {
      bus: placedBus,
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
      className={`bus-drop-zone ${isOver ? 'is-over' : ''} ${placedBus ? 'has-bus' : ''} ${evaluated && isCorrect ? 'is-correct' : ''} ${evaluated && isWrong ? 'is-wrong' : ''} ${isSelected ? 'is-selected' : ''}`}
      onClick={!placedBus && !evaluated ? onClick : undefined}>
      {placedBus ? (
        <div
          ref={setDragRef}
          style={dragStyle}
          className={`placed-bus ${isDraggingPlaced ? 'is-dragging' : ''}`}
          {...dragListeners}
          {...dragAttributes}>
          <span className="bus-text">{placedBus}</span>
        </div>
      ) : (
        <span className="bus-placeholder">???</span>
      )}
    </div>
  );
};

const VonNeumannBusAssignment: React.FC<Props> = ({buses, onChange, evaluated}) => {
  const [placements, setPlacements] = useState<Placements>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const sensors = useDndSensors();

  // Track which buses are placed
  const placedBuses = new Set(Object.values(placements).filter(Boolean));

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
    let busId: string;

    if (activeIdStr.startsWith('placed-')) {
      // Dragging from a drop zone
      busId = activeIdStr.replace('placed-', '');
    } else {
      // Dragging from the bus list
      busId = activeIdStr;
    }

    setPlacements(prev => {
      // Remove bus from its previous placement (if any)
      const cleaned: Placements = {};
      Object.entries(prev).forEach(([zoneId, bus]) => {
        if (bus !== busId) {
          cleaned[zoneId] = bus;
        }
      });

      // Place in new zone
      cleaned[dropZoneId] = busId;
      return cleaned;
    });
  }, []);

  // Handle click-to-assign mode
  const handleZoneClick = (zoneId: string) => {
    if (evaluated) return;
    setSelectedZone(zoneId);
  };

  const handleBusClick = (busId: string) => {
    if (!selectedZone || evaluated) return;

    setPlacements(prev => {
      // Remove bus from its previous placement (if any)
      const cleaned: Placements = {};
      Object.entries(prev).forEach(([zoneId, bus]) => {
        if (bus !== busId) {
          cleaned[zoneId] = bus;
        }
      });

      // Place in selected zone
      cleaned[selectedZone] = busId;
      return cleaned;
    });

    setSelectedZone(null);
  };

  // Validation logic
  const validatePlacement = useCallback(
    (zoneId: string, bus: string | null): boolean => {
      if (!bus) return false;

      // Left zone: only Datenbus
      if (zoneId === DROP_ZONES.LEFT) {
        return bus === LEFT_BUS;
      }

      // Right zones: Adressbus or Steuerbus
      if (zoneId === DROP_ZONES.RIGHT_TOP || zoneId === DROP_ZONES.RIGHT_BOTTOM) {
        return RIGHT_BUSES.includes(bus);
      }

      return false;
    },
    [],
  );

  // Calculate score and validation state
  useEffect(() => {
    const totalZones = Object.keys(DROP_ZONES).length;
    let correctCount = 0;

    Object.entries(placements).forEach(([zoneId, bus]) => {
      if (validatePlacement(zoneId, bus)) {
        correctCount++;
      }
    });

    const score: TaskStageScore = {
      difficulty: 'Bus-Zuweisung',
      correct: correctCount,
      total: totalZones,
      points: correctCount,
    };

    onChange?.(score);
  }, [placements, validatePlacement, onChange]);

  // Get active bus label for drag overlay
  const getActiveBus = () => {
    if (!activeId) return null;
    
    if (activeId.startsWith('placed-')) {
      return activeId.replace('placed-', '');
    }
    return buses.find(b => b === activeId) || null;
  };

  const activeBus = getActiveBus();

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <div className="vn-bus-assignment">
        <div className="vn-bus-assignment__content">
          {/* Architecture Diagram with Bus Connections */}
          <div className="vn-bus-assignment__diagram">
            <div className="bus-architecture">
              {/* Left Bus Drop Zone - spans all 4 rows */}
              <DroppableBusZone
                id={DROP_ZONES.LEFT}
                placedBus={placements[DROP_ZONES.LEFT] || null}
                isCorrect={validatePlacement(
                  DROP_ZONES.LEFT,
                  placements[DROP_ZONES.LEFT] || null,
                )}
                isWrong={
                  !validatePlacement(
                    DROP_ZONES.LEFT,
                    placements[DROP_ZONES.LEFT] || null,
                  ) && !!placements[DROP_ZONES.LEFT]
                }
                evaluated={evaluated}
                isSelected={selectedZone === DROP_ZONES.LEFT}
                onClick={() => handleZoneClick(DROP_ZONES.LEFT)}
              />

              {/* Left Arrows - one per row */}
              <span className="arrow arrow--left arrow--row-1">&#8596;</span>
              <span className="arrow arrow--left arrow--row-2">&#8596;</span>
              <span className="arrow arrow--left arrow--row-3">&#8596;</span>
              <span className="arrow arrow--left arrow--row-4">&#8596;</span>

              {/* Component Boxes - one per row */}
              <div className="component-box component-box--row-1">
                <span className="component-label">CPU</span>
              </div>
              <div className="component-box component-box--row-2">
                <span className="component-label">RAM</span>
              </div>
              <div className="component-box component-box--row-3">
                <span className="component-label">ROM</span>
              </div>
              <div className="component-box component-box--row-4">
                <span className="component-label">Peripherie</span>
              </div>

              {/* Right Arrows - one group per row */}
              <div className="arrow-group arrow-group--right arrow-group--row-1">
                <span className="arrow">&#8594;</span>
                <span className="arrow">&#8213;</span>
              </div>
              <div className="arrow-group arrow-group--right arrow-group--row-2">
                <span className="arrow">&#8592;</span>
                <span className="arrow">&#8592;</span>
              </div>
              <div className="arrow-group arrow-group--right arrow-group--row-3">
                <span className="arrow">&#8592;</span>
                <span className="arrow">&#8592;</span>
              </div>
              <div className="arrow-group arrow-group--right arrow-group--row-4">
                <span className="arrow">&#8592;</span>
                <span className="arrow">&#8592;</span>
              </div>

              {/* Right Top Bus Drop Zone - spans rows 1-2 */}
              <DroppableBusZone
                id={DROP_ZONES.RIGHT_TOP}
                placedBus={placements[DROP_ZONES.RIGHT_TOP] || null}
                isCorrect={validatePlacement(
                  DROP_ZONES.RIGHT_TOP,
                  placements[DROP_ZONES.RIGHT_TOP] || null,
                )}
                isWrong={
                  !validatePlacement(
                    DROP_ZONES.RIGHT_TOP,
                    placements[DROP_ZONES.RIGHT_TOP] || null,
                  ) && !!placements[DROP_ZONES.RIGHT_TOP]
                }
                evaluated={evaluated}
                isSelected={selectedZone === DROP_ZONES.RIGHT_TOP}
                onClick={() => handleZoneClick(DROP_ZONES.RIGHT_TOP)}
              />

              {/* Between Arrows - one group per row */}
              <div className="arrow-group arrow-group--between arrow-group--row-1">
                <span className="arrow__empty">&#8213;</span>
                <span className="arrow">&#8594;</span>
              </div>
              <div className="arrow-group arrow-group--between arrow-group--row-2">
                <span className="arrow__empty">&#8213;</span>
                <span className="arrow__line">&#8213;</span>
              </div>
              <div className="arrow-group arrow-group--between arrow-group--row-3">
                <span className="arrow__empty">&#8213;</span>
                <span className="arrow__line">&#8213;</span>
              </div>
              <div className="arrow-group arrow-group--between arrow-group--row-4">
                <span className="arrow__empty">&#8213;</span>
                <span className="arrow__line">&#8213;</span>
              </div>

              {/* Right Bottom Bus Drop Zone - spans rows 3-4 */}
              <DroppableBusZone
                id={DROP_ZONES.RIGHT_BOTTOM}
                placedBus={placements[DROP_ZONES.RIGHT_BOTTOM] || null}
                isCorrect={validatePlacement(
                  DROP_ZONES.RIGHT_BOTTOM,
                  placements[DROP_ZONES.RIGHT_BOTTOM] || null,
                )}
                isWrong={
                  !validatePlacement(
                    DROP_ZONES.RIGHT_BOTTOM,
                    placements[DROP_ZONES.RIGHT_BOTTOM] || null,
                  ) && !!placements[DROP_ZONES.RIGHT_BOTTOM]
                }
                evaluated={evaluated}
                isSelected={selectedZone === DROP_ZONES.RIGHT_BOTTOM}
                onClick={() => handleZoneClick(DROP_ZONES.RIGHT_BOTTOM)}
              />
            </div>

            {/* Bottom: Available Buses */}
            <div className="vn-bus-assignment__buses">
              {buses
                .filter(bus => !placedBuses.has(bus))
                .map(bus => (
                  <div
                    key={bus}
                    onClick={() => handleBusClick(bus)}
                    style={{cursor: selectedZone ? 'pointer' : 'grab'}}>
                    <DraggableBus
                      id={bus}
                      label={bus}
                      isPlaced={false}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeBus ? (
          <div className="bus-button is-overlay">{activeBus}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default VonNeumannBusAssignment;