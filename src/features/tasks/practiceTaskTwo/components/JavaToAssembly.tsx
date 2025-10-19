import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { SubTaskComponentProps } from '../../../../shared/interfaces/tasking.interfaces';
import './JavaToAssembly.component.scss';
import {
  generateAvailableCommands,
  AssemblyCommand,
  getTaskCommands,
} from './JavaToAssembly.helper';
import javaToAssemblyTasksData from '../../../../data/tasks/java-to-assembly.json';
import {
  AssemblyDraggableCommand,
  AssemblyDroppableSlot,
  calculateScore,
  shuffle,
  DIFFICULTY_MAP,
} from './shared';
import { useTimer } from '../../../../shared/hooks';
import GameStartScreen from '../../../../shared/components/startScreen/GameStartScreen.component.tsx';
import { Difficulty } from '../../../../shared/enums/difficulty.enum';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useDndSensors } from '../../../../shared/hooks/dndSensors';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Types
interface JavaToAssemblyTask {
  id: string;
  topic: string;
  java: string;
  addresses: string[];
  assembler: string[];
  difficulty: string;
  hint?: string;
}

// Generate rounds from JSON data
const generateRounds = (): JavaToAssemblyTask[] => {
  const tasks = javaToAssemblyTasksData as JavaToAssemblyTask[];

  // Select tasks by difficulty: 2x leicht, 1x mittel, 1x schwer
  const leichtTasks = tasks.filter(t => t.difficulty === 'leicht');
  const mittelTasks = tasks.filter(t => t.difficulty === 'mittel');
  const schwerTasks = tasks.filter(t => t.difficulty === 'schwer');

  const selected = [
    ...shuffle(leichtTasks).slice(0, 2),
    ...shuffle(mittelTasks).slice(0, 1),
    ...shuffle(schwerTasks).slice(0, 1),
  ];

  return shuffle(selected);
};

// Modal Component for expanded Java code
const JavaCodeModal: React.FC<{
  code: string;
  topic: string;
  onClose: () => void;
}> = ({code, topic, onClose}) => {
  return (
    <div className="java-to-assembly__modal-overlay" onClick={onClose}>
      <div
        className="java-to-assembly__modal-content"
        onClick={e => e.stopPropagation()}>
        <div className="java-to-assembly__modal-header">
          <h2>{topic}</h2>
          <button
            className="java-to-assembly__modal-close"
            onClick={onClose}
            aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="java-to-assembly__modal-code">
          <SyntaxHighlighter language="java" style={vscDarkPlus}>
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};


const JavaToAssembly: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  onTaskContextChange,
  taskMeta,
}) => {
  const rounds: JavaToAssemblyTask[] = useMemo(() => generateRounds(), []);

  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  // State for placed commands (slots in the program)
  const [placedCommands, setPlacedCommands] = useState<(AssemblyCommand | null)[]>(
    [],
  );

  // State for available commands
  const [availableCommands, setAvailableCommands] = useState<AssemblyCommand[]>([]);

  // Track which available command index is placed in which slot (slotIndex -> availableIndex)
  const [slotToAvailableMap, setSlotToAvailableMap] = useState<Map<number, number>>(
    new Map(),
  );

  // Track which available command is selected for click-to-assign
  const [selectedCommandIndex, setSelectedCommandIndex] = useState<number | null>(
    null,
  );

  // Track actively dragged command for DragOverlay
  const [activeCommand, setActiveCommand] = useState<AssemblyCommand | null>(null);

  const {isRunning, start, stop, reset, getElapsed} = useTimer();

  // Accumulate per-round scores
  const [stageScores, setStageScores] = useState<
    Array<{
      difficulty: Difficulty;
      correct: number;
      total: number;
      points: number;
    }>
  >([]);

  const current = rounds[roundIndex];
  const sensors = useDndSensors();

  // Initialize round state when round changes
  useEffect(() => {
    if (!current) return;

    // Initialize slots based on solution length
    const slots = new Array(current.assembler.length).fill(null);
    setPlacedCommands(slots);

    // Generate available commands
    const available = generateAvailableCommands(current);
    setAvailableCommands(available);

    setSlotToAvailableMap(new Map());
    setEvaluated(false);
    setSelectedCommandIndex(null);
  }, [roundIndex, current]);

  // Update task context for Tim whenever the current task changes
  useEffect(() => {
    if (!current || !hasStarted) {
      onTaskContextChange?.(null);
      return;
    }

    const taskContext = {
      subtaskType: 'JavaToAssembly',
      taskId: current.id,
      roundIndex: roundIndex,
      topic: current.topic,
      difficulty: current.difficulty,
      javaCode: current.java,
      numberOfCommands: current.assembler.length,
      addresses: current.addresses,
    };

    onTaskContextChange?.(taskContext);
  }, [current, roundIndex, rounds.length, hasStarted, onTaskContextChange]);

  const startTask = useCallback(() => {
    setHasStarted(true);
    reset();
    start();

    // Initialize first round
    const slots = new Array(current.assembler.length).fill(null);
    setPlacedCommands(slots);
    const available = generateAvailableCommands(current);
    setAvailableCommands(available);
    setSlotToAvailableMap(new Map());
    setEvaluated(false);
    setSelectedCommandIndex(null);
  }, [reset, start, current]);

  const resetTask = useCallback(() => {
    const slots = new Array(current.assembler.length).fill(null);
    setPlacedCommands(slots);
    // Don't regenerate available commands on reset - keep the original shuffled order
    setSlotToAvailableMap(new Map());
    setEvaluated(false);
    setSelectedCommandIndex(null);
    reset();
    start();
  }, [reset, start, current]);

  const evaluate = useCallback(() => {
    setEvaluated(true);
    stop();

    const correctCommands = getTaskCommands(current);

    // Count correct placements
    let correct = 0;
    for (let i = 0; i < correctCommands.length; i++) {
      const placed = placedCommands[i];
      const expected = correctCommands[i];
      if (placed && placed.op === expected.op && placed.arg === expected.arg) {
        correct++;
      }
    }

    const total = correctCommands.length;
    const wrong = total - correct;
    const points = calculateScore(correct, wrong);

    const difficulty = DIFFICULTY_MAP[current.difficulty] || Difficulty.Easy;

    setStageScores(prev => {
      const next = [...prev];
      next[roundIndex] = {difficulty, correct, total, points};
      return next;
    });

    // If last round, compute final result and emit to container
    if (roundIndex === rounds.length - 1) {
      const elapsedMs = getElapsed();
      const base = [...stageScores];
      base[roundIndex] = {difficulty, correct, total, points};

      // Calculate total points from all stages (sum of points, not correct answers)
      const basePoints = base.reduce((sum, stage) => sum + (stage?.points ?? 0), 0);
      const totalCorrect = base.reduce((sum, stage) => sum + (stage?.correct ?? 0), 0);
      const totalPossible = base.reduce((sum, stage) => sum + (stage?.total ?? 0), 0);

      // Calculate time bonus
      const thresholdMs = taskMeta?.timeLimit ?? 3 * 60 * 1000; // default 3 minutes
      const withinThreshold = elapsedMs <= thresholdMs;
      const timeBonus = withinThreshold ? 1 : 0;
      const totalPoints = basePoints + timeBonus;

      onSummaryChange?.({
        elapsedMs,
        perStage: base.map(s => ({...s, difficulty: s.difficulty})),
        totalPoints,
        totalCorrect,
        totalPossible,
        thresholdMs,
        withinThreshold,
        timeBonus,
      });
    }
  }, [
    current,
    placedCommands,
    stop,
    getElapsed,
    onSummaryChange,
    roundIndex,
    rounds.length,
    stageScores,
    taskMeta,
  ]);

  const next = useCallback(() => {
    if (roundIndex < rounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex);
      setSlotToAvailableMap(new Map());
      setEvaluated(false);
      setSelectedCommandIndex(null);
      start();
    }
  }, [roundIndex, rounds.length, start]);

  // Check if a command from available list is placed
  const isCommandPlaced = useCallback(
    (availableIndex: number) => {
      // Check if this specific index is used in any slot
      return Array.from(slotToAvailableMap.values()).includes(availableIndex);
    },
    [slotToAvailableMap],
  );

  // Handle click on available command
  const handleCommandClick = useCallback(
    (availableIndex: number) => {
      if (evaluated) return;
      if (isCommandPlaced(availableIndex)) return;

      // Toggle selection
      if (selectedCommandIndex === availableIndex) {
        setSelectedCommandIndex(null);
        return;
      }

      // Select this command and auto-assign to first empty slot
      const firstEmptySlotIndex = placedCommands.findIndex(cmd => cmd === null);

      if (firstEmptySlotIndex !== -1) {
        const cmd = availableCommands[availableIndex];
        const newPlaced = [...placedCommands];
        newPlaced[firstEmptySlotIndex] = cmd;
        setPlacedCommands(newPlaced);

        // Update the mapping
        setSlotToAvailableMap(prev => {
          const newMap = new Map(prev);
          newMap.set(firstEmptySlotIndex, availableIndex);
          return newMap;
        });

        setSelectedCommandIndex(null);
      } else {
        // No empty slots, just select
        setSelectedCommandIndex(availableIndex);
      }
    },
    [
      evaluated,
      selectedCommandIndex,
      availableCommands,
      placedCommands,
      isCommandPlaced,
    ],
  );

  // Handle remove command from slot
  const handleRemoveCommand = useCallback(
    (slotIndex: number) => {
      const newPlaced = [...placedCommands];
      newPlaced[slotIndex] = null;
      setPlacedCommands(newPlaced);

      // Remove from mapping
      setSlotToAvailableMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(slotIndex);
        return newMap;
      });
    },
    [placedCommands],
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const {active} = event;
      const activeId = active.id as string;

      // Set active command for overlay
      if (activeId.startsWith('available-')) {
        const availableIndex = parseInt(activeId.replace('available-', ''), 10);
        setActiveCommand(availableCommands[availableIndex]);
      } else if (activeId.startsWith('placed-')) {
        const slotIndex = active.data.current?.fromSlot;
        if (slotIndex !== undefined && placedCommands[slotIndex]) {
          setActiveCommand(placedCommands[slotIndex]);
        }
      }
    },
    [availableCommands, placedCommands],
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event;
      setActiveCommand(null);
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Dragging from available list to slot
      if (activeId.startsWith('available-') && overId.startsWith('slot-')) {
        const availableIndex = parseInt(activeId.replace('available-', ''), 10);
        const slotIndex = parseInt(overId.replace('slot-', ''), 10);

        if (isCommandPlaced(availableIndex)) return;

        const cmd = availableCommands[availableIndex];
        const newPlaced = [...placedCommands];

        // If target slot already has a command, we need to remove that mapping first
        setSlotToAvailableMap(prev => {
          const newMap = new Map(prev);
          newMap.set(slotIndex, availableIndex);
          return newMap;
        });

        newPlaced[slotIndex] = cmd;
        setPlacedCommands(newPlaced);
        setSelectedCommandIndex(null);
      }

      // Dragging from slot to slot (reordering)
      else if (activeId.startsWith('placed-') && overId.startsWith('slot-')) {
        const fromSlotIndex = active.data.current?.fromSlot;
        const toSlotIndex = parseInt(overId.replace('slot-', ''), 10);

        if (fromSlotIndex === undefined || fromSlotIndex === toSlotIndex) return;

        const newPlaced = [...placedCommands];
        const temp = newPlaced[fromSlotIndex];
        newPlaced[fromSlotIndex] = newPlaced[toSlotIndex];
        newPlaced[toSlotIndex] = temp;
        setPlacedCommands(newPlaced);

        // Swap the mappings as well
        setSlotToAvailableMap(prev => {
          const newMap = new Map(prev);
          const fromAvailableIndex = prev.get(fromSlotIndex);
          const toAvailableIndex = prev.get(toSlotIndex);

          if (fromAvailableIndex !== undefined) {
            newMap.set(toSlotIndex, fromAvailableIndex);
          } else {
            newMap.delete(toSlotIndex);
          }

          if (toAvailableIndex !== undefined) {
            newMap.set(fromSlotIndex, toAvailableIndex);
          } else {
            newMap.delete(fromSlotIndex);
          }

          return newMap;
        });
      }
    },
    [availableCommands, placedCommands, isCommandPlaced],
  );

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveCommand(null);
  }, []);

  // Update controls when state changes
  useEffect(() => {
    if (!hasStarted) {
      onControlsChange?.(null);
      return;
    }

    const allSlotsFilled = placedCommands.every(cmd => cmd !== null);

    onControlsChange?.({
      onReset: resetTask,
      onEvaluate: evaluate,
      onNext: next,
      showReset: !evaluated,
      showEvaluate: true,
      showNext: evaluated && roundIndex < rounds.length - 1,
      disableReset: evaluated,
      disableEvaluate: evaluated || !allSlotsFilled,
      disableNext: !evaluated,
    });
  }, [
    hasStarted,
    evaluated,
    roundIndex,
    rounds.length,
    placedCommands,
    resetTask,
    evaluate,
    next,
    onControlsChange,
  ]);

  // Update HUD based on state
  useEffect(() => {
    if (!hasStarted) {
      onHudChange?.({
        progress: null,
        isStartScreen: true,
      });
    } else {
      onHudChange?.({
        subtitle: 'Ordne die Befehle richtig an, um den Java Code in Assembler zu übersetzen',
        progress: {current: roundIndex + 1, total: rounds.length},
        requestTimer: isRunning ? 'start' : undefined,
      });
    }
  }, [hasStarted, roundIndex, rounds.length, isRunning, onHudChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      onControlsChange?.(null);
      onHudChange?.(null);
      onTaskContextChange?.(null);
    };
  }, [onControlsChange, onHudChange, onTaskContextChange]);

  return (
    <div className="java-to-assembly">
      {!hasStarted ? (
        <div className="ns-start-overlay">
          <GameStartScreen
            statusTitle="Compiler defekt!"
            statusDescription={
              <>
              Der Hochsprachen-Parser liefert nur Fragmente – der Codegenerator zur CPU ist getrennt. Ohne korrekte Übersetzung bricht die Pipeline zwischen Java und Instruktionssatz.
                <br />
                <br />
                <strong>Deine Mission:</strong> Übersetze den gegebenen Java-Code in funktional äquivalenten Assembler:<br /><br />
              • Wähle nur passende Befehle aus dem Pool. <br />
              • Ordne sie in die richtige Reihenfolge. <br />
              • Filtere falsche/irrelevante Instruktionen konsequent heraus. <br />
              </>
            }
            taskCount={rounds.length}
            estimatedTime="~8 min"
            fetchBestAttempt
            taskId={taskMeta?.id}
            onStart={startTask}
            startLabel="Quiz starten"
          />
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}>
            <div className="java-to-assembly__content">
              <div className="java-to-assembly__left">
                <div className="java-to-assembly__java-section">
                  <div className="java-to-assembly__java-header">
                    <h3 className="java-to-assembly__java-title">Java Code</h3>
                    <button
                      className="java-to-assembly__maximize-btn"
                      onClick={() => setShowModal(true)}
                      aria-label="Maximize code"
                      title="Code vergrößern">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="java-to-assembly__java-code">
                    <SyntaxHighlighter language="java" style={vscDarkPlus}>
                      {current.java}
                    </SyntaxHighlighter>
                  </div>
                  {current.hint && (
                    <div className="java-to-assembly__hint">
                      {current.hint}
                    </div>
                  )}
                </div>
              </div>

              <div className="java-to-assembly__middle">
                <div className="java-to-assembly__available">
                  <h3 className="java-to-assembly__available-title">
                    Verfügbare Befehle
                  </h3>
                  <div className="java-to-assembly__commands">
                    {availableCommands.map((command, index) => (
                      <AssemblyDraggableCommand
                        key={index}
                        id={`available-${index}`}
                        command={command}
                        isPlaced={isCommandPlaced(index)}
                        isSelected={selectedCommandIndex === index}
                        onClick={() => handleCommandClick(index)}
                        disabled={evaluated}
                        className="java-to-assembly__command"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="java-to-assembly__right">
                <div className="java-to-assembly__program">
                  <h3 className="java-to-assembly__slots-title">Dein Programm</h3>
                  <div className="java-to-assembly__slots">
                    {placedCommands.map((command, index) => {
                      const correctCommands = getTaskCommands(current);
                      const expected = correctCommands[index];
                      const isCorrect =
                        evaluated &&
                        command !== null &&
                        command.op === expected.op &&
                        command.arg === expected.arg;
                      const isWrong = evaluated && !isCorrect;

                      return (
                        <AssemblyDroppableSlot
                          key={index}
                          index={index}
                          label={current.addresses[index]}
                          command={command}
                          isCorrect={isCorrect}
                          isWrong={isWrong}
                          evaluated={evaluated}
                          onRemove={() => handleRemoveCommand(index)}
                          className="java-to-assembly__slot-row"
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <DragOverlay>
              {activeCommand ? (
                <div className="assembly__command assembly__drag-overlay">
                  {activeCommand.arg
                    ? `${activeCommand.op} ${activeCommand.arg}`
                    : activeCommand.op}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {showModal && (
            <JavaCodeModal
              code={current.java}
              topic={current.topic}
              onClose={() => setShowModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default JavaToAssembly;

