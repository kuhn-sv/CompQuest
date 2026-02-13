import React, {useMemo, useRef, useState, useCallback, useEffect} from 'react';
import {Link} from 'react-router-dom';
import '../number-system/number-system.page.scss';
import {
  ConnectionOverlay,
  DndProvider,
  GameStartScreen,
} from '../../../../shared/components';
// Footer buttons are rendered in parent; we expose controls upwards
import type {SubTaskComponentProps} from '../interfaces';
import {
  useConnectionLines,
  useFooterControls,
  useHudState,
  useGameStartScreen,
  CONNECTION_LINE_PRESETS,
} from '../../../../shared/hooks';
import {EquationRow as SharedEquationRow} from '../../../../shared/components/input/equation-row/EquationRow';
import NumberWithBase from '../../../../shared/components/input/number/NumberWithBase.component';
import {generateAdditionSet, AdditionTask} from './addition.helper';
import {Difficulty} from '../../../../shared/enums/difficulty.enum';
import type {ArithmeticMode} from '../interfaces';
import {TaskId} from '../../../../shared/enums/taskId.enum';
import {DragOverlay} from '@dnd-kit/core';
import type {PAStageScore} from './arithmetic.interfaces';
import { AnswerOptionBase } from '../shared/number-task/NumberTask.types';
import { ResultsSection } from '../shared/number-task/ResultsSection';

const PositiveArithmeticComponent: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onSummaryChange,
  onHudChange,
  arithmeticMode = 'positive',
  onTaskContextChange,
  taskMeta,
  getElapsed,
}) => {
  // 3-stage flow: Easy, Medium, Hard
  const stages: Difficulty[] = useMemo(
    () => [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard],
    [],
  );
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [tasks, setTasks] = useState<AdditionTask[]>([]);
  const [answerPool, setAnswerPool] = useState<AnswerOptionBase[]>([]);
  const [assignments, setAssignments] = useState<
    Record<string, AnswerOptionBase | null>
  >({});
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(
    null,
  ) as React.RefObject<HTMLDivElement>;
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [stageScores, setStageScores] = useState<PAStageScore[]>([]);
  // final summary is lifted to container

  // Start-screen lifecycle
  const {hasStarted, startTask} = useGameStartScreen({
    onHudChange,
    totalTasks: stages.length,
    subtitle:
      arithmeticMode === 'twos-complement'
        ? 'Additionen im Zweierkomplement (3 Stufen)'
        : 'Positive Additionen und Subtraktionen (3 Stufen)',
  });

  // dnd-kit PoC state/handlers are used; ResultsSection and DndProvider handle draggables

  // Connection lines calculation
  const getTaskIdCb = useCallback((task: AdditionTask) => task.id, []);
  const compareAnswersCb = useCallback(
    (assignment: AnswerOptionBase, poolAnswer: AnswerOptionBase) =>
      assignment.value === poolAnswer.value &&
      assignment.base === poolAnswer.base,
    [],
  );
  const evaluateStatusCb = useCallback(
    (task: AdditionTask, assignment: AnswerOptionBase) => {
      const aBase =
        typeof assignment.base === 'string'
          ? parseInt(assignment.base, 10)
          : assignment.base;
      if (assignment.value === task.expected && aBase === task.base)
        return 'correct';
      return 'wrong';
    },
    [],
  );

  const connectionLines = useConnectionLines({
    tasks,
    assignments,
    answerPool,
    containerRef,
    getTaskId: getTaskIdCb,
    compareAnswers: compareAnswersCb,
    ...CONNECTION_LINE_PRESETS.NUMBER_SYSTEM,
    debug: false,
    evaluated,
    evaluateStatus: evaluateStatusCb,
  });

  const startSetForStage = useCallback(
    (idx: number) => {
      const difficulty = stages[idx];
      const {tasks, answerPool} = generateAdditionSet(
        difficulty,
        arithmeticMode as ArithmeticMode,
      );
      setTasks(tasks);
      setAnswerPool(answerPool);
      setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
      setEvaluated(false);
      setActiveTaskId(null);
    },
    [stages, arithmeticMode],
  );

  // Initial start handler
  const handleInitialStart = useCallback(() => {
    startTask();
    setStageIndex(0);
    startSetForStage(0);
  }, [startTask, startSetForStage]);

  // Provide compact context for AskTim: which stage and a sample task
  useEffect(() => {
    if (!onTaskContextChange) return;
    if (!hasStarted) {
      onTaskContextChange(null);
      return;
    }
    const sample = tasks[0];
    const ctx = {
      title:
        taskMeta?.title ??
        (arithmeticMode === 'twos-complement'
          ? 'Zweierkomplement-Arithmetik'
          : 'Positive Arithmetik'),
      stage: stageIndex + 1,
      totalStages: stages.length,
      sampleTask: sample
        ? {
            id: sample.id,
            left: sample.left,
            expected: sample.expected,
            base: sample.base,
          }
        : null,
    } as const;
    onTaskContextChange(ctx);
    return () => onTaskContextChange(null);
  }, [
    onTaskContextChange,
    hasStarted,
    stageIndex,
    tasks,
    taskMeta,
    arithmeticMode,
    stages.length,
  ]);

  const resetSet = useCallback(() => {
    setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
    setEvaluated(false);
    setActiveTaskId(null);
    // Clear any dnd-kit transient state
    setDndDraggedAnswer(null);
    setDndDragOverTaskId(null);
    // Do not reset the shared timer here; only reset task-local state.
    // Update HUD progress without sending timer control commands.
    onHudChangeRef.current?.({
      progress: {current: stageIndex + 1, total: stages.length},
    });
  }, [tasks, stageIndex, stages.length]);

  // Assignment logic
  const assignAnswer = useCallback(
    (taskId: string, answer: AnswerOptionBase) => {
      setAssignments(prev => {
        const toKey = (
          a: {value: string; base?: number | string} | null | undefined,
        ) => (a ? `${a.value}|${a.base}` : '');
        const targetKey = toKey(answer);
        const prevAssignedKey = toKey(prev[taskId]);

        // No-op if the same answer is already assigned to this task
        if (prevAssignedKey === targetKey) return prev;

        // How many identical answers exist in the pool?
        const available = answerPool.filter(
          a => `${a.value}|${a.base}` === targetKey,
        ).length;
        // How many are currently assigned (excluding current task to avoid double counting)?
        const currentlyAssigned = Object.entries(prev).filter(
          ([tid, a]) => tid !== taskId && a && toKey(a) === targetKey,
        ).length;

        // If capacity available, assign without removing previous uses
        if (currentlyAssigned < available) {
          return {...prev, [taskId]: answer};
        }
        // Otherwise, capacity is full; ignore to avoid stealing from other tasks
        return prev;
      });
      setActiveTaskId(null);
    },
    [answerPool],
  );

  // dnd-kit local drag state (PoC) — keeps HTML5 fallback via useDragAndDrop
  const [dndDraggedAnswer, setDndDraggedAnswer] =
    useState<AnswerOptionBase | null>(null);
  const [dndDragOverTaskId, setDndDragOverTaskId] = useState<string | null>(
    null,
  );

  const handleDndKitDragStart = useCallback(
    (event: import('@dnd-kit/core').DragStartEvent) => {
      const {active} = event;
      if (!active || typeof active.id !== 'string') return;
      const parts = active.id.split(':');
      const last = parts[parts.length - 1]; // VALUE|BASE
      const [value, baseStr] = last.split('|');
      const base = parseInt(baseStr, 10);
      if (value && !Number.isNaN(base)) {
        setDndDraggedAnswer({value, base});
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
          assignAnswer(taskId, {value, base});
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
        .filter((a): a is {value: string; base: number} => !!a)
        .map(a => `${a.value}|${a.base}`),
    );
  }, [assignments]);

  const evaluate = useCallback(() => {
    setEvaluated(true);
    const difficulty = stages[stageIndex];
    const total = tasks.length;
    const correct = tasks.filter(t => {
      const a = assignments[t.id];
      const aBase =
        typeof a?.base === 'string' ? parseInt(a.base, 10) : a?.base;
      return !!a && a.value === t.expected && aBase === t.base;
    }).length;
    const points = correct;
    setStageScores(prev => {
      const next = [...prev];
      next[stageIndex] = {difficulty, correct, total, points};
      return next;
    });
    if (stageIndex === stages.length - 1) {
      const elapsedMs = getElapsed?.() ?? 0;
      const perStage = (() => {
        const base = [...stageScores];
        base[stageIndex] = {difficulty, correct, total, points};
        return base;
      })();

      // Send minimal summary; TaskContainer computes bonuses/thresholds centrally
      onSummaryChange?.({
        elapsedMs,
        perStage: perStage.map(s => ({...s, difficulty: s.difficulty})),
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
      startSetForStage(nextIndex);
      // Update HUD progress on stage advance (timer continues)
      onHudChangeRef.current?.({
        progress: {current: nextIndex + 1, total: stages.length},
      });
    }
  }, [stageIndex, stages.length, startSetForStage]);

  // Provide footer controls to parent (stabilised via hook)
  const onHudChangeRef = useRef(onHudChange);
  useEffect(() => {
    onHudChangeRef.current = onHudChange;
  }, [onHudChange]);

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
    if (!hasStarted) return {progress: null, isStartScreen: true} as const;
    return {
      progress: {current: stageIndex + 1, total: stages.length},
      subtitle:
        arithmeticMode === 'twos-complement'
          ? 'Additionen im Zweierkomplement (3 Stufen)'
          : 'Positive Additionen und Subtraktionen (3 Stufen)',
    };
  }, [hasStarted, stageIndex, stages.length, arithmeticMode]);
  useHudState(onHudChange, hudState);

  return (
    <div className="number-system-container">
      <div className="ns-header">
        <Link to="/dashboard" className="back-to-dashboard">
          ← Zurück zum Dashboard
        </Link>
        <h1>
          {arithmeticMode === 'twos-complement'
            ? 'Zweierkomplement-Arithmetik – Übung 1.2'
            : 'Positive Arithmetik – Übung 1.2'}
        </h1>
      </div>

      {hasStarted && tasks.length > 0 && (
        <DndProvider
          onDragStart={handleDndKitDragStart}
          onDragOver={handleDndKitDragOver}
          onDragEnd={handleDndKitDragEnd}>
          <div
            className={`ns-content ${activeTaskId ? 'has-active' : ''}`}
            ref={containerRef}>
            <div className="equations-and-results">
              <div className="equations-section">
                {tasks.map(t => {
                  const assigned = assignments[t.id];
                  const assignedBase =
                    typeof assigned?.base === 'string'
                      ? parseInt(assigned.base, 10)
                      : assigned?.base;
                  const isCorrect =
                    evaluated &&
                    !!assigned &&
                    assigned.value === t.expected &&
                    assignedBase === t.base;
                  const isWrong =
                    evaluated &&
                    !!assigned &&
                    !(assigned.value === t.expected && assignedBase === t.base);
                  const isActive = activeTaskId === t.id;
                  const [zahl1, zahl2] = t.left.split(' + ');
                  const baseSub =
                    t.base === 2
                      ? '₂'
                      : t.base === 8
                        ? '₈'
                        : t.base === 16
                          ? '₁₆'
                          : '';
                  return (
                    <SharedEquationRow
                      key={`pa-task:${t.id}`}
                      hasAssignment={!!assigned}
                      sourceContent={
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            lineHeight: 1.2,
                          }}>
                          <span>
                            {zahl1}
                            <sub style={{marginLeft: 2}}>{baseSub}</sub>
                          </span>
                          <span>
                            + {zahl2}
                            <sub style={{marginLeft: 2}}>{baseSub}</sub>
                          </span>
                        </div>
                      }
                      assignedContent={
                        assigned && assignedBase ? (
                          <NumberWithBase
                            value={assigned.value}
                            base={assignedBase as 2 | 8 | 10 | 16}
                          />
                        ) : null
                      }
                      isCorrect={isCorrect}
                      isWrong={isWrong}
                      isActive={isActive}
                      isDragOver={dndDragOverTaskId === t.id}
                      onClick={() => setActiveTaskId(t.id)}
                      enableDndKit={true}
                      droppableId={`task:${t.id}`}
                    />
                  );
                })}
              </div>
              <ResultsSection
                answerPool={answerPool}
                usedAnswerKeys={usedAnswerKeys}
                assignments={assignments}
                draggedAnswer={dndDraggedAnswer}
                activeTaskId={activeTaskId}
                tasks={tasks}
                assignAnswer={assignAnswer}
                evaluated={evaluated}
                keyPrefix={
                  arithmeticMode === 'twos-complement' ? 'tc-pa' : 'pa'
                }
                renderAnswer={(a: AnswerOptionBase) =>
                  typeof a.base === 'number' ? (
                    <NumberWithBase
                      value={a.value}
                      base={a.base as 2 | 8 | 10 | 16}
                    />
                  ) : (
                    a.value
                  )
                }
                enableDndKit={true}
              />
            </div>
            <ConnectionOverlay connectionLines={connectionLines} />
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

      {!hasStarted && (
        <GameStartScreen
          statusTitle={
            arithmeticMode === 'twos-complement'
              ? 'Rechenfehler erkannt!'
              : 'Rechenmodul offline!'
          }
          statusDescription={
            arithmeticMode === 'twos-complement' ? (
              <>
                Beim Addieren negativer Zahlen im Zweierkomplement wurde der
                Datenfluss gesprengt. Der Prozessor kann nicht mehr korrekt mit
                negativen Zahlen umgehen.
                <strong>Deine Mission: </strong> Verbinde zusammengehörige
                Operationen im Zweierkomplement präzise und erkenne, wann ein
                Überlauf entsteht. So stellst du sicher, dass der Datenfluss
                wiederhergestellt wird und der Prozessor fehlerfrei rechnen
                kann.
              </>
            ) : (
              <>
                Der zentrale Rechenkern ist abgestürzt, weil Zahlen
                unterschiedlicher Systeme nicht mehr korrekt miteinander
                interagieren.
                <strong>Deine Mission: </strong>Führe die Grundrechenoperationen
                in Binär-, Oktal- und Hexadezimaldarstellung korrekt durch,
                indem du jeder Rechnung das passende Gegenstück zuordnest.
                Stelle sicher, dass alle Zahlensysteme wieder synchron rechnen –
                nur dann kann der Rechenkern neu starten.
              </>
            )
          }
          taskCount={4}
          estimatedTime="~5 min"
          fetchBestAttempt
          taskId={
            arithmeticMode === 'twos-complement'
              ? TaskId.TwosComplementArithmetic
              : TaskId.PositiveArithmetic
          }
          onStart={handleInitialStart}
          startLabel="Mission starten"
        />
      )}
    </div>
  );
};

export default PositiveArithmeticComponent;
