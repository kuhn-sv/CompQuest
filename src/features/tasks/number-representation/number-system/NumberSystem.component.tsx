import React, {useMemo, useRef, useState, useCallback, useEffect} from 'react';
import './number-system.page.scss';
import {generateSet} from './numberSystem.helper';
import {Difficulty} from '@shared/enums/difficulty.enum';
import type {
  NumberTask,
  AnswerOption,
} from './interfaces/numberSystem.interface';
import type {StageScore} from './interfaces/evaluation.interface';
import type {AssignmentMap} from './numberSystem.types';
import NumberWithBase from '@shared/components/input/number/NumberWithBase.component';
import {
  DndProvider,
  EquationRow,
} from '@shared/components';
import {DragOverlay} from '@dnd-kit/core';
import type {SubTaskComponentProps} from '../interfaces';
import {
  useConnectionLines,
  useFooterControls,
  useHudState,
  useGameStartScreen,
  CONNECTION_LINE_PRESETS,
} from '@shared/hooks';
import { ResultsSection } from '../shared/number-task/ResultsSection';
import { ConnectionOverlay } from '@features/tasks/shared/components/connection-overlay/ConnectionOverlay.component';
import { TaskContext } from '@/shared/interfaces/tasking.interfaces';
import { GameStartScreen } from '../../shared/components';
// dnd-kit event types are referenced inline where needed; no top-level type import

const NumberSystemComponent: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  taskMeta,
  onTaskContextChange,
  getElapsed,
}) => {
  // Staged progression: Easy → Medium → Hard
  const stages: Difficulty[] = useMemo(
    () => [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard],
    [],
  );
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [tasks, setTasks] = useState<NumberTask[]>([]);
  const [answerPool, setAnswerPool] = useState<AnswerOption[]>([]);
  const [assignments, setAssignments] = useState<AssignmentMap>({});
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(
    null,
  ) as React.RefObject<HTMLDivElement>;
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [stageScores, setStageScores] = useState<StageScore[]>([]);
  // Final summary is reported to parent via onSummaryChange.

  // Start-screen lifecycle (manages hasStarted state + HUD start signal)
  const {hasStarted, startTask} = useGameStartScreen({
    onHudChange,
    totalTasks: stages.length,
    subtitle: 'Datenfluss wiederherstellen',
  });

  // Per-task threshold/bonus handled centrally by TaskContainer via taskMeta

  // Provide a compact context describing the visible task set to AskTim
  useEffect(() => {
    if (!onTaskContextChange) return;
    if (!hasStarted) {
      onTaskContextChange(null);
      return;
    }
    
    const taskContext: TaskContext = {
      subtaskType: 'NumberSystem',
      taskId: activeTaskId || taskMeta?.id || 'NumberSystem', // Use current active or generic
      taskTitle: taskMeta?.title ?? 'Zahlensystem',
      description: 'Stelle den Datenfluss wieder her, indem du jede Zahl mit ihrem passenden Gegenstück verbindest.',
      contextData: {
          stage: stageIndex + 1,
          totalStages: stages.length,
          taskCount: tasks.length,
          tasks: tasks.map(t => ({
              id: t.id,
              fromValue: t.sourceValue,
              fromBase: t.fromBase,
              toBase: t.toBase,
          })),
      },
      userState: {
          assignments: Object.entries(assignments).map(([taskId, assign]) => ({
              taskId,
              assignedValue: assign?.value,
              assignedBase: assign?.base
          }))
      },
      solution: {
          correctAssignments: tasks.map(t => ({
              taskId: t.id,
              expectedValue: t.expectedValue,
              expectedBase: t.toBase
          }))
      }
    };
    onTaskContextChange(taskContext);
    return () => onTaskContextChange(null);
  }, [
    onTaskContextChange,
    hasStarted,
    stageIndex,
    tasks,
    taskMeta,
    stages.length,
    activeTaskId,
    assignments
  ]);

  // dnd-kit local drag state (replaces useDragAndDrop in this component)
  const [dndDraggedAnswer, setDndDraggedAnswer] = useState<AnswerOption | null>(
    null,
  );
  const [dndDragOverTaskId, setDndDragOverTaskId] = useState<string | null>(
    null,
  );

  // Connection lines calculation
  const getTaskIdCb = useCallback((task: NumberTask) => task.id, []);
  const compareAnswersCb = useCallback(
    (assignment: AnswerOption, poolAnswer: AnswerOption) =>
      assignment.value === poolAnswer.value &&
      assignment.base === poolAnswer.base,
    [],
  );

  const rawConnectionLines = useConnectionLines({
    tasks,
    assignments,
    answerPool,
    containerRef,
    getTaskId: getTaskIdCb,
    compareAnswers: compareAnswersCb,
    ...CONNECTION_LINE_PRESETS.NUMBER_SYSTEM,
    debug: false,
  });

  // Nach Auswertung: Status für jede Linie setzen
  const connectionLines = useMemo(() => {
    if (!evaluated) return rawConnectionLines;
    return rawConnectionLines.map(line => {
      const task = tasks.find(t => t.id === line.taskId);
      const assigned = assignments[line.taskId];
      let status: 'correct' | 'wrong' = 'wrong';
      if (
        assigned &&
        task &&
        assigned.value === task.expectedValue &&
        assigned.base === task.toBase
      ) {
        status = 'correct';
      }
      return {
        ...line,
        status,
      };
    });
  }, [rawConnectionLines, evaluated, tasks, assignments]);

  const startSetForStage = useCallback(
    (idx: number) => {
      const difficulty = stages[idx];
      const {tasks, answerPool} = generateSet(difficulty);
      setTasks(tasks);
      setAnswerPool(answerPool);
      setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
      setEvaluated(false);
      setActiveTaskId(null);
    },
    [stages],
  );

  // Initial start handler: reveal tasks and kick off stage 1
  const handleInitialStart = useCallback(() => {
    startTask();
    setStageIndex(0);
    startSetForStage(0);
  }, [startTask, startSetForStage]);

  const resetSet = useCallback(() => {
    setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
    setEvaluated(false);
    setActiveTaskId(null);
    // clear dnd-kit local state
    setDndDraggedAnswer(null);
    setDndDragOverTaskId(null);
  }, [tasks]);

  // Wrapper function for assignment logic
  const assignAnswer = useCallback(
    (taskId: string, answer: AnswerOption) => {
      setAssignments(prev => {
        const toKey = (a: {value: string; base: number} | null | undefined) =>
          a ? `${a.value}|${a.base}` : '';
        const targetKey = toKey(answer as {value: string; base: number});
        const prevAssignedKey = toKey(prev[taskId]);

        // No-op if the same answer is already assigned to this task
        if (prevAssignedKey === targetKey) return prev;

        // How many identical answers exist in the pool?
        const available = answerPool.filter(
          a => `${a.value}|${a.base}` === targetKey,
        ).length;
        // How many are currently assigned (excluding current task)?
        const currentlyAssigned = Object.entries(prev).filter(
          ([tid, a]) =>
            tid !== taskId &&
            a &&
            toKey(a as {value: string; base: number}) === targetKey,
        ).length;

        if (currentlyAssigned < available) {
          return {...prev, [taskId]: answer};
        }
        return prev; // capacity full; don't steal previous assignments
      });
      setActiveTaskId(null);
    },
    [answerPool],
  );

  const assignAnswerAdapter = useCallback(
    (taskId: string, answer: {value: string; base?: number | string}) => {
      if (typeof answer.base === 'number') {
        assignAnswer(taskId, {
          value: answer.value,
          base: answer.base as AnswerOption['base'],
        });
      }
    },
    [assignAnswer],
  );

  // dnd-kit handlers (use assignAnswer which is defined above)
  const handleDndKitDragStart = useCallback(
    (event: import('@dnd-kit/core').DragStartEvent) => {
      const {active} = event;
      if (!active || typeof active.id !== 'string') return;
      const parts = active.id.split(':');
      const last = parts[parts.length - 1]; // VALUE|BASE
      const [value, baseStr] = last.split('|');
      const base = parseInt(baseStr, 10);
      if (value && !Number.isNaN(base)) {
        setDndDraggedAnswer({value, base: base as AnswerOption['base']});
      }
    },
    [],
  );

  const handleDndKitDragOver = useCallback(
    (event: import('@dnd-kit/core').DragOverEvent) => {
      const {over} = event;
      if (!over || typeof over.id !== 'string') {
        setDndDragOverTaskId(null);
        return;
      }
      if (over.id.startsWith('task:')) {
        setDndDragOverTaskId(over.id.replace(/^task:/, ''));
      } else {
        setDndDragOverTaskId(null);
      }
    },
    [],
  );

  const handleDndKitDragEnd = useCallback(
    (event: import('@dnd-kit/core').DragEndEvent) => {
      const {active, over} = event;
      if (
        !over ||
        typeof active.id !== 'string' ||
        typeof over.id !== 'string'
      ) {
        setDndDraggedAnswer(null);
        setDndDragOverTaskId(null);
        return;
      }
      if (active.id.includes('answer') && over.id.startsWith('task:')) {
        const parts = (active.id as string).split(':');
        const last = parts[parts.length - 1]; // VALUE|BASE
        const [value, baseStr] = last.split('|');
        const base = parseInt(baseStr, 10);
        const taskId = over.id.replace(/^task:/, '');
        if (taskId && value && !Number.isNaN(base)) {
          assignAnswer(taskId, {value, base: base as AnswerOption['base']});
        }
      }
      setDndDraggedAnswer(null);
      setDndDragOverTaskId(null);
    },
    [assignAnswer],
  );

  const usedAnswerKeys = useMemo(() => {
    return new Set(
      Object.values(assignments)
        .filter((a): a is AnswerOption => !!a)
        .map(a => `${a.value}|${a.base}`),
    );
  }, [assignments]);

  const evaluate = useCallback(() => {
    setEvaluated(true);

    // Compute stage score
    const difficulty = stages[stageIndex];
    const total = tasks.length;
    const correct = tasks.filter(t => {
      const a = assignments[t.id];
      return a && a.value === t.expectedValue && a.base === t.toBase;
    }).length;
    const points = correct; // 1 point per correct pair
    setStageScores(prev => {
      const next = [...prev];
      // Overwrite or append current stage score
      next[stageIndex] = {difficulty, correct, total, points};
      return next;
    });

    // If this was the last stage, compute final result and emit to container
    if (stageIndex === stages.length - 1) {
      const elapsedMs = getElapsed?.() ?? 0;
      const perStage = (() => {
        const base = [...stageScores];
        base[stageIndex] = {difficulty, correct, total, points};
        return base;
      })();
      onSummaryChange?.({
        elapsedMs,
        perStage: perStage.map(s => ({...s})),
      });
    }
  }, [
    assignments,
    getElapsed,
    onSummaryChange,
    stageIndex,
    stageScores,
    stages,
    tasks,
  ]);

  const goToNextStage = useCallback(() => {
    if (stageIndex < stages.length - 1) {
      const nextIndex = stageIndex + 1;
      setStageIndex(nextIndex);
      // Resume timer: do not reset
      startSetForStage(nextIndex);
    }
  }, [stageIndex, stages, startSetForStage]);

  // Footer controls (stabilised via hook)
  useFooterControls(
    onControlsChange,
    {onReset: resetSet, onEvaluate: evaluate, onNext: goToNextStage},
    {
      showReset: true,
      showEvaluate: !evaluated,
      showNext: evaluated && stageIndex < stages.length - 1,
      disableReset: evaluated || !tasks.length,
      disableNext: false,
    },
    hasStarted && tasks.length > 0,
  );

  // HUD state (stabilised via hook)
  const hudState = useMemo(() => {
    if (!hasStarted || tasks.length === 0)
      return {progress: null, isStartScreen: true} as const;
    return {
      subtitle: 'Datenfluss wiederherstellen',
      progress: {current: stageIndex + 1, total: stages.length},
      isStartScreen: false,
    };
  }, [hasStarted, tasks.length, stageIndex, stages.length]);
  useHudState(onHudChange, hudState);

  return (
    <div className="number-system-container">
      <div className="ns-header">
        <h1>Zahlensysteme – Übung 1.1</h1>
      </div>

      {/* Header timer/progress moved to container */}

      {hasStarted && tasks.length > 0 && (
        <DndProvider
          onDragStart={handleDndKitDragStart}
          onDragOver={handleDndKitDragOver}
          onDragEnd={handleDndKitDragEnd}>
          <div
            className={`ns-content ${activeTaskId ? 'has-active' : ''}`}
            ref={containerRef}>
            <div className="equations-and-results">
              {/* Left side: Equation rows */}
              <div className="equations-section">
                {tasks.map(t => {
                  const assigned = assignments[t.id];
                  const isCorrect =
                    evaluated &&
                    !!assigned &&
                    assigned.value === t.expectedValue &&
                    assigned.base === t.toBase;
                  const isWrong =
                    evaluated &&
                    !!assigned &&
                    !(
                      assigned.value === t.expectedValue &&
                      assigned.base === t.toBase
                    );
                  const isActive = activeTaskId === t.id;
                  return (
                    <EquationRow
                      key={`ns-task:${t.id}`}
                      hasAssignment={!!assigned}
                      sourceContent={
                        <NumberWithBase
                          value={t.sourceValue}
                          base={t.fromBase}
                        />
                      }
                      assignedContent={
                        assigned ? (
                          <NumberWithBase
                            value={assigned.value}
                            base={assigned.base}
                          />
                        ) : null
                      }
                      isCorrect={isCorrect}
                      isWrong={isWrong}
                      isActive={isActive}
                      isDragOver={dndDragOverTaskId === t.id}
                      onClick={() => setActiveTaskId(t.id)}
                      dataTaskId={t.id}
                      enableDndKit={true}
                      droppableId={`task:${t.id}`}
                    />
                  );
                })}
              </div>

              {/* Right side: Available results */}
              <ResultsSection
                answerPool={answerPool}
                usedAnswerKeys={usedAnswerKeys}
                assignments={assignments}
                draggedAnswer={dndDraggedAnswer}
                activeTaskId={activeTaskId}
                tasks={tasks}
                assignAnswer={assignAnswerAdapter}
                enableDndKit={true}
                evaluated={evaluated}
                keyPrefix="ns"
                renderAnswer={a =>
                  typeof a.base === 'number' ? (
                    <NumberWithBase
                      value={a.value}
                      base={a.base as 2 | 8 | 10 | 16}
                    />
                  ) : (
                    a.value
                  )
                }
              />
            </div>

            {/* SVG overlay for connection lines */}
            <ConnectionOverlay connectionLines={connectionLines} />

            {/* Visual clone for the dragged item so users see it under the pointer */}
            <DragOverlay>
              {dndDraggedAnswer ? (
                typeof dndDraggedAnswer.base === 'number' ? (
                  <div className="ns-drag-overlay">
                    <NumberWithBase
                      value={dndDraggedAnswer.value}
                      base={dndDraggedAnswer.base as 2 | 8 | 10 | 16}
                    />
                  </div>
                ) : (
                  <div className="ns-drag-overlay">
                    {dndDraggedAnswer.value}
                  </div>
                )
              ) : null}
            </DragOverlay>

            {/* Controls moved to parent footer */}
          </div>
        </DndProvider>
      )}

      {/* Initial start overlay with a large round button */}
      {!hasStarted && (
        <GameStartScreen
          statusTitle="Zahlensystem-Decoder beschädigt!"
          statusDescription={
            <>
              „Oh nein! Der Zahlensystem-Decoder des Rechners ist beschädigt. Er kann binäre, oktale und hexadezimale Zahlen nicht mehr richtig interpretieren. Ohne funktionierende Umrechnung kann der Computer keine Maschinenbefehle verarbeiten!"
              <br />
              <br />
              <strong>Ziel der Reparatur:</strong> Ordne verschiedene Zahlendarstellungen (binär, oktal, hexadezimal) einander zu, damit der Decoder wieder weiß, welche Zahlen äquivalent sind. Konvertiere zwischen den Zahlensystemen, um die Übersetzungsfunktion wiederherzustellen.
            </>
          }
          taskCount={4}
          estimatedTime={taskMeta?.timeLimit ?? 0}
          fetchBestAttempt
          taskId={taskMeta?.id}
          onStart={handleInitialStart}
          startLabel="Mission starten"
        />
      )}

      {/* Summary overlay moved to container */}
    </div>
  );
};

export default NumberSystemComponent;
