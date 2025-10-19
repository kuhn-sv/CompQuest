import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { SubTaskComponentProps } from '../../../../shared/interfaces/tasking.interfaces';
import './WriteAssembly.component.scss';
import {
  generateRounds,
  generateAvailableCommands,
  WriteAssemblyTask,
  AssemblyCommand,
} from './writeAssembly.helper';
import { calculateScore } from './shared/assembly.utils';
import {
  AssemblyDraggableCommand,
  AssemblyDroppableSlot,
} from './shared';
import { useTimer } from '../../../../shared/hooks';
import GameStartScreen from '../../../../shared/components/startScreen/GameStartScreen.component.tsx';
import { Difficulty } from '../../../../shared/enums/difficulty.enum';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useDndSensors } from '../../../../shared/hooks/dndSensors';

// Constants
const DIFFICULTY_MAP: Record<string, Difficulty> = {
  leicht: Difficulty.Easy,
  mittel: Difficulty.Medium,
  schwer: Difficulty.Hard,
};


const WriteAssembly: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  taskMeta,
}) => {
  const rounds: WriteAssemblyTask[] = useMemo(() => generateRounds(), []);

  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [evaluated, setEvaluated] = useState<boolean>(false);
  
  // State for placed commands (slots in the program)
  const [placedCommands, setPlacedCommands] = useState<(AssemblyCommand | null)[]>([]);
  
  // State for available commands
  const [availableCommands, setAvailableCommands] = useState<AssemblyCommand[]>([]);
  
  // Track which available command is selected for click-to-assign
  const [selectedCommandIndex, setSelectedCommandIndex] = useState<number | null>(null);

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
    const slots = new Array(current.commands.length).fill(null);
    setPlacedCommands(slots);
    
    // Generate available commands
    const available = generateAvailableCommands(current);
    setAvailableCommands(available);
    
    setEvaluated(false);
    setSelectedCommandIndex(null);
  }, [roundIndex, current]);

  const startTask = useCallback(() => {
    setHasStarted(true);
    reset();
    start();
    
    // Initialize first round
    const slots = new Array(current.commands.length).fill(null);
    setPlacedCommands(slots);
    const available = generateAvailableCommands(current);
    setAvailableCommands(available);
    setEvaluated(false);
    setSelectedCommandIndex(null);
  }, [reset, start, current]);

  const resetTask = useCallback(() => {
    const slots = new Array(current.commands.length).fill(null);
    setPlacedCommands(slots);
    const available = generateAvailableCommands(current);
    setAvailableCommands(available);
    setEvaluated(false);
    setSelectedCommandIndex(null);
    reset();
    start();
  }, [reset, start, current]);

  const evaluate = useCallback(() => {
    setEvaluated(true);
    stop();

    // Count correct placements
    let correct = 0;
    for (let i = 0; i < current.commands.length; i++) {
      const placed = placedCommands[i];
      const expected = current.commands[i];
      if (placed && placed.op === expected.op && placed.arg === expected.arg) {
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
    current.commands,
    current.difficulty,
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
      setEvaluated(false);
      setSelectedCommandIndex(null);
      start();
    }
  }, [roundIndex, rounds.length, start]);

  // Check if a command from available list is placed
  const isCommandPlaced = useCallback(
    (availableIndex: number) => {
      const cmd = availableCommands[availableIndex];
      return placedCommands.some(
        placed => placed && placed.op === cmd.op && placed.arg === cmd.arg,
      );
    },
    [availableCommands, placedCommands],
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

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event;
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
      }
    },
    [availableCommands, placedCommands, isCommandPlaced],
  );

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
        subtitle: 'Sortiere die Befehle in die richtige Reihenfolge',
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
    };
  }, [onControlsChange, onHudChange]);

  return (
    <div className="write-assembly">
      {!hasStarted ? (
        <div className="ns-start-overlay">
          <GameStartScreen
            statusTitle="Assembler-Programm schreiben"
            statusDescription={
              <>
               Instruktionspfad korrupt!
              Die Steuerlogik versteht nur noch Prosa – der Decoder kann keine gültigen Befehlsfolgen mehr erzeugen. Falsche Instruktionen stören den Takt, der Programmzähler driftet.
                
                <br />
                <br />
                <strong>Deine Mission:</strong> Rekonstruiere aus der Prosa-Beschreibung ein korrektes Assembler-Programm: <br /> <br />
              • Wähle nur passende Befehle aus dem Pool. <br />
              • Ordne sie in die richtige Reihenfolge. <br />
              • Filtere falsche/irrelevante Instruktionen konsequent heraus. <br /> <br />
              Erst wenn die Sequenz logisch kohärent ist, gibt der Decoder den Datenpfad frei.
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
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
                  {placedCommands.map((command, index) => {
                    const expected = current.commands[index];
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
                        label={String(index)}
                        command={command}
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
        </DndContext>
      )}
    </div>
  );
};

export default WriteAssembly;
