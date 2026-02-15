import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SubTaskComponentProps, TaskContext} from '@shared/interfaces/tasking.interfaces';
import './WriteAssembly.component.scss';
import {
  generateAvailableCommands,
  AssemblyCommand,
  WriteAssemblyTask,
} from './writeAssembly.helper';
import {
  AssemblyDraggableCommand,
  AssemblyDroppableSlot,
  calculateScore,
  DIFFICULTY_MAP,
} from '../shared';
import {
  useFooterControls,
  useHudState,
  useGameStartScreen,
} from '@shared/hooks';
import GameStartScreen from '@features/tasks/shared/components/game-start-screen/GameStartScreen.component';
import {Difficulty} from '@shared/enums/difficulty.enum';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {useDndSensors} from '@shared/utils/dnd/dndSensors';
import {generateRounds} from './writeAssembly.utils';

const WriteAssembly: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  onTaskContextChange,
  taskMeta,
  getElapsed,
}) => {
  const rounds: WriteAssemblyTask[] = useMemo(() => generateRounds(), []);

  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [evaluated, setEvaluated] = useState<boolean>(false);

  // Start-screen lifecycle
  const {hasStarted, startTask: baseStart} = useGameStartScreen({
    onHudChange,
    totalTasks: rounds.length,
    subtitle: 'Sortiere die Befehle in die richtige Reihenfolge',
  });

  // State for placed commands (slots in the program)
  const [placedCommands, setPlacedCommands] = useState<
    ({command: AssemblyCommand; sourceIndex: number} | null)[]
  >([]);

  // State for available commands
  const [availableCommands, setAvailableCommands] = useState<AssemblyCommand[]>(
    [],
  );

  // Track which available command is selected for click-to-assign
  const [selectedCommandIndex, setSelectedCommandIndex] = useState<
    number | null
  >(null);

  // Track actively dragged command for DragOverlay
  const [activeCommand, setActiveCommand] = useState<AssemblyCommand | null>(
    null,
  );

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
    const slots = new Array(current.commands.length).fill(null);
    setPlacedCommands(slots);

    // Generate available commands
    const available = generateAvailableCommands(current);
    setAvailableCommands(available);

    setEvaluated(false);
    setSelectedCommandIndex(null);
  }, [roundIndex, current]);

  // Update task context for Tim whenever the current task changes
  useEffect(() => {
    if (!current || !hasStarted) {
      onTaskContextChange?.(null);
      return;
    }

    const taskContext: TaskContext = {
      subtaskType: 'WriteAssembly',
      taskId: current.id,
      taskTitle: 'Assembler schreiben',
      description: 'Rekonstruiere aus der Prosa-Beschreibung ein korrektes Assembler-Programm.',
      contextData: {
          roundIndex: roundIndex,
          taskDescription: current.prosa_text,
          difficulty: current.difficulty,
          numberOfCommands: current.commands.length,
          availableCommands: availableCommands, 
      },
      userState: {
          placedCommands: placedCommands.map(p => p ? { op: p.command.op, arg: p.command.arg } : null)
      },
      solution: {
          correctSequence: current.commands
      }
    };

    onTaskContextChange?.(taskContext);
  }, [current, roundIndex, rounds.length, hasStarted, onTaskContextChange, placedCommands, availableCommands]);

  const startTask = useCallback(() => {
    baseStart();

    // Initialize first round
    const slots = new Array(current.commands.length).fill(null);
    setPlacedCommands(slots);
    const available = generateAvailableCommands(current);
    setAvailableCommands(available);
    setEvaluated(false);
    setSelectedCommandIndex(null);
  }, [baseStart, current]);

  const resetTask = useCallback(() => {
    const slots = new Array(current.commands.length).fill(null);
    setPlacedCommands(slots);
    // Don't regenerate available commands on reset - keep the original shuffled order
    setEvaluated(false);
    setSelectedCommandIndex(null);
  }, [current]);

  const evaluate = useCallback(() => {
    setEvaluated(true);

    // Count correct placements
    let correct = 0;
    for (let i = 0; i < current.commands.length; i++) {
      const placed = placedCommands[i];
      const expected = current.commands[i];
      if (
        placed &&
        placed.command.op === expected.op &&
        placed.command.arg === expected.arg
      ) {
        correct++;
      }
    }

    const total = current.commands.length;
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
      const elapsedMs = getElapsed?.() ?? 0;
      const base = [...stageScores];
      base[roundIndex] = {difficulty, correct, total, points};

      // Calculate total points from all stages (sum of points, not correct answers)
      const basePoints = base.reduce(
        (sum, stage) => sum + (stage?.points ?? 0),
        0,
      );
      const totalCorrect = base.reduce(
        (sum, stage) => sum + (stage?.correct ?? 0),
        0,
      );
      const totalPossible = base.reduce(
        (sum, stage) => sum + (stage?.total ?? 0),
        0,
      );

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
    current.commands,
    current.difficulty,
    placedCommands,
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
      setEvaluated(false);
      setSelectedCommandIndex(null);
    }
  }, [roundIndex, rounds.length]);

  // Check if a command from available list is placed
  const isCommandPlaced = useCallback(
    (availableIndex: number) => {
      return placedCommands.some(
        placed => placed && placed.sourceIndex === availableIndex,
      );
    },
    [placedCommands],
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
        newPlaced[firstEmptySlotIndex] = {
          command: cmd,
          sourceIndex: availableIndex,
        };
        setPlacedCommands(newPlaced);
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
          setActiveCommand(placedCommands[slotIndex].command);
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
        newPlaced[slotIndex] = {command: cmd, sourceIndex: availableIndex};
        setPlacedCommands(newPlaced);
        setSelectedCommandIndex(null);
      }

      // Dragging from slot to slot (reordering)
      else if (activeId.startsWith('placed-') && overId.startsWith('slot-')) {
        const fromSlotIndex = active.data.current?.fromSlot;
        const toSlotIndex = parseInt(overId.replace('slot-', ''), 10);

        if (fromSlotIndex === undefined || fromSlotIndex === toSlotIndex)
          return;

        const newPlaced = [...placedCommands];
        const temp = newPlaced[fromSlotIndex];
        newPlaced[fromSlotIndex] = newPlaced[toSlotIndex];
        newPlaced[toSlotIndex] = temp;
        setPlacedCommands(newPlaced);
      }
    },
    [availableCommands, placedCommands, isCommandPlaced],
  );

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setActiveCommand(null);
  }, []);

  useFooterControls(
    onControlsChange,
    {onReset: resetTask, onEvaluate: evaluate, onNext: next},
    {
      showReset: true,
      showEvaluate: !evaluated,
      showNext: evaluated && roundIndex < rounds.length - 1,
      disableReset: evaluated,
      disableNext: !evaluated,
    },
    hasStarted,
  );

  // HUD state (reactive via hook)
  const hudState = useMemo(() => {
    if (!hasStarted) return {progress: null, isStartScreen: true} as const;
    return {
      subtitle: 'Sortiere die Befehle in die richtige Reihenfolge',
      progress: {current: roundIndex + 1, total: rounds.length},
    };
  }, [hasStarted, roundIndex, rounds.length]);
  useHudState(onHudChange, hudState);

  // Cleanup task context on unmount
  useEffect(() => {
    return () => {
      onTaskContextChange?.(null);
    };
  }, [onTaskContextChange]);

  return (
    <div className="write-assembly">
      {!hasStarted ? (
        <GameStartScreen
          statusTitle="Assembler-Programm schreiben"
          statusDescription={
            <>
              Instruktionspfad korrupt! Die Steuerlogik versteht nur noch Prosa
              – der Decoder kann keine gültigen Befehlsfolgen mehr erzeugen.
              Falsche Instruktionen stören den Takt, der Programmzähler driftet.
              <br />
              <br />
              <strong>Deine Mission:</strong> Rekonstruiere aus der
              Prosa-Beschreibung ein korrektes Assembler-Programm: <br /> <br />
              • Wähle nur passende Befehle aus dem Pool. <br />
              • Ordne sie in die richtige Reihenfolge. <br />• Filtere
              falsche/irrelevante Instruktionen konsequent heraus. <br /> <br />
              Erst wenn die Sequenz logisch kohärent ist, gibt der Decoder den
              Datenpfad frei.
            </>
          }
          taskCount={rounds.length}
          estimatedTime="~8 min"
          fetchBestAttempt
          taskId={taskMeta?.id}
          onStart={startTask}
          startLabel="Quiz starten"
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}>
          <div className="write-assembly__task-header">
            <h3 className="write-assembly__program-title">
              Assembler-Operation
            </h3>
            <div className="write-assembly__description">
              {current.prosa_text}
            </div>
          </div>

          <div className="write-assembly__content">
            <div className="write-assembly__left">
              <div className="write-assembly__available">
                <h3 className="write-assembly__available-title">
                  Verfügbare Befehle
                </h3>
                <p className="write-assembly__available-subtitle">
                  Wähle Befehle aus dieser Liste
                </p>
                <div className="write-assembly__commands">
                  {availableCommands.map((command, index) => (
                    <AssemblyDraggableCommand
                      key={index}
                      id={`available-${index}`}
                      command={command}
                      isPlaced={isCommandPlaced(index)}
                      isSelected={selectedCommandIndex === index}
                      onClick={() => handleCommandClick(index)}
                      disabled={evaluated}
                      className="write-assembly__command"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="write-assembly__right">
              <div className="write-assembly__program">
                <h3 className="write-assembly__slots-title">Dein Programm</h3>
                <div className="write-assembly__slots">
                  {placedCommands.map((placedItem, index) => {
                    const expected = current.commands[index];
                    const isCorrect =
                      evaluated &&
                      placedItem !== null &&
                      placedItem.command.op === expected.op &&
                      placedItem.command.arg === expected.arg;
                    const isWrong = evaluated && !isCorrect;

                    return (
                      <AssemblyDroppableSlot
                        key={index}
                        index={index}
                        label={index.toString(2).padStart(4, '0')}
                        command={placedItem?.command ?? null}
                        isCorrect={isCorrect}
                        isWrong={isWrong}
                        evaluated={evaluated}
                        onRemove={() => handleRemoveCommand(index)}
                        className="write-assembly__slot-row"
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
      )}
    </div>
  );
};

export default WriteAssembly;
