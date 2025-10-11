import React, {useMemo, useRef, useState, useCallback, useEffect} from 'react';
import './number-system.page.scss';
import {generateSet} from './numberSystem.helper';
import {Difficulty} from '../../../../shared/enums/difficulty.enum';
import type {
  NumberTask,
  AnswerOption,
} from './interfaces/numberSystem.interface';
import type {
  StageScore,
  EvaluationConfig,
} from './interfaces/evaluation.interface';
import type {AssignmentMap} from './numberSystem.types';
import {ResultsSection} from './components';
import {EquationRow as SharedEquationRow} from '../../../../shared/components/equationrow/EquationRow';
import NumberWithBase from '../../../../shared/components/number/NumberWithBase.component';
import {
  ConnectionOverlay,
  GameStartScreen,
} from '../../../../shared/components';
import type {SubTaskComponentProps} from '../interfaces';
import {
  useDragAndDrop,
  useConnectionLines,
  useTimer,
  CONNECTION_LINE_PRESETS,
  DRAG_DROP_PRESETS,
} from '../../../../shared/hooks';

const NumberSystemComponent: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  taskMeta,
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
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [stageScores, setStageScores] = useState<StageScore[]>([]);
  // Final summary is reported to parent via onSummaryChange.

  // Config: 3 minutes threshold = 180000 ms, 1 point bonus
  const evalConfig: EvaluationConfig = useMemo(
    () => ({timeBonusThresholdMs: 3 * 60 * 1000, timeBonusPoints: 1}),
    [],
  );

  // Timer functionality
  const {isRunning, start, stop, reset, getElapsed} = useTimer();

  // Inform parent HUD about start screen visibility
  useEffect(() => {
    if (!onHudChange) return;
    if (!hasStarted) {
      onHudChange({progress: null, isStartScreen: true});
    }
  }, [hasStarted, onHudChange]);

  // Drag and Drop logic
  const {
    draggedItem: draggedAnswer,
    dragOverTargetId: dragOverTaskId,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    resetDragState,
  } = useDragAndDrop<AnswerOption>(DRAG_DROP_PRESETS.NUMBER_SYSTEM);

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
    (idx: number, options?: {resetTimer?: boolean}) => {
      const {resetTimer: shouldResetTimer = true} = options ?? {};
      const difficulty = stages[idx];
      const {tasks, answerPool} = generateSet(difficulty);
      setTasks(tasks);
      setAnswerPool(answerPool);
      setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
      setEvaluated(false);
      setActiveTaskId(null);
      // Start the timer when a new set begins
      if (shouldResetTimer) {
        reset();
      }
      start();
    },
    [reset, start, stages],
  );

  // Initial start handler: reveal tasks and kick off stage 1
  const handleInitialStart = useCallback(() => {
    setHasStarted(true);
    setStageIndex(0);
    startSetForStage(0, {resetTimer: true});
  }, [startSetForStage]);

  const resetSet = useCallback(() => {
    setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
    setEvaluated(false);
    setActiveTaskId(null);
    resetDragState();
    // Reset and restart timer
    reset();
    if (tasks.length > 0) {
      start();
    }
  }, [reset, resetDragState, start, tasks]);

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

  // Drop handler for the hook
  const onDropAnswer = (taskId: string, answer: AnswerOption) => {
    assignAnswer(taskId, answer);
  };

  // Adapters to use shared ResultsSection (accepts broader AnswerOptionBase)
  const handleDragStartAdapter = useCallback(
    (e: React.DragEvent, answer: {value: string; base?: number | string}) => {
      if (typeof answer.base === 'number') {
        handleDragStart(e, {
          value: answer.value,
          base: answer.base as AnswerOption['base'],
        });
      }
    },
    [handleDragStart],
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

  const usedAnswerKeys = useMemo(() => {
    return new Set(
      Object.values(assignments)
        .filter((a): a is AnswerOption => !!a)
        .map(a => `${a.value}|${a.base}`),
    );
  }, [assignments]);

  const allAssigned = useMemo(
    () => tasks.length > 0 && tasks.every(t => assignments[t.id]),
    [tasks, assignments],
  );

  const evaluate = useCallback(() => {
    setEvaluated(true);
    stop();

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
      const elapsedMs = getElapsed();
      const withinThreshold = elapsedMs <= evalConfig.timeBonusThresholdMs;
      const timeBonus = withinThreshold ? evalConfig.timeBonusPoints : 0;
      const perStage = (() => {
        const base = [...stageScores];
        base[stageIndex] = {difficulty, correct, total, points};
        return base;
      })();
      const totalCorrect = perStage.reduce(
        (sum, s) => sum + (s?.correct ?? 0),
        0,
      );
      const totalPossible = perStage.reduce(
        (sum, s) => sum + (s?.total ?? 0),
        0,
      );
      const totalPoints = totalCorrect + timeBonus;
      onSummaryChange?.({
        elapsedMs,
        withinThreshold,
        timeBonus,
        perStage: perStage.map(s => ({...s})),
        totalCorrect,
        totalPossible,
        totalPoints,
        thresholdMs: evalConfig.timeBonusThresholdMs,
      });
    }
  }, [
    assignments,
    evalConfig.timeBonusPoints,
    evalConfig.timeBonusThresholdMs,
    getElapsed,
    onSummaryChange,
    stageIndex,
    stageScores,
    stages,
    stop,
    tasks,
  ]);

  const goToNextStage = useCallback(() => {
    if (stageIndex < stages.length - 1) {
      const nextIndex = stageIndex + 1;
      setStageIndex(nextIndex);
      // Resume timer: do not reset
      startSetForStage(nextIndex, {resetTimer: false});
    }
  }, [stageIndex, stages, startSetForStage]);

  // Provide footer controls to parent (stabilized)
  const resetSetRef = useRef(resetSet);
  const evaluateRef = useRef(evaluate);
  const goToNextStageRef = useRef(goToNextStage);

  useEffect(() => {
    resetSetRef.current = resetSet;
  }, [resetSet]);
  useEffect(() => {
    evaluateRef.current = evaluate;
  }, [evaluate]);
  useEffect(() => {
    goToNextStageRef.current = goToNextStage;
  }, [goToNextStage]);

  const onResetStable = useCallback(() => {
    resetSetRef.current();
  }, []);
  const onEvaluateStable = useCallback(() => {
    evaluateRef.current();
  }, []);
  const onNextStable = useCallback(() => {
    goToNextStageRef.current();
  }, []);

  const controls = useMemo(() => {
    if (!hasStarted || tasks.length === 0) return null;
    return {
      onReset: onResetStable,
      onEvaluate: onEvaluateStable,
      onNext: onNextStable,
      showReset: !evaluated,
      showEvaluate: true,
      showNext: evaluated && stageIndex < stages.length - 1,
      disableReset: !tasks.length,
      disableEvaluate: !allAssigned,
      disableNext: false,
    };
  }, [
    hasStarted,
    tasks.length,
    evaluated,
    stageIndex,
    stages.length,
    allAssigned,
    onResetStable,
    onEvaluateStable,
    onNextStable,
  ]);

  const prevControlsRef = useRef<typeof controls>(null);
  const onControlsChangeRef = useRef(onControlsChange);
  const onHudChangeRef = useRef(onHudChange);
  useEffect(() => {
    onControlsChangeRef.current = onControlsChange;
  }, [onControlsChange]);
  useEffect(() => {
    onHudChangeRef.current = onHudChange;
  }, [onHudChange]);
  useEffect(() => {
    if (!onControlsChangeRef.current) return;
    if (prevControlsRef.current !== controls) {
      onControlsChangeRef.current(controls);
      prevControlsRef.current = controls;
    }
  }, [controls]);

  // Unmount-only cleanup for controls and HUD
  useEffect(() => {
    return () => {
      onControlsChangeRef.current?.(null);
      onHudChangeRef.current?.(null);
    };
  }, []);

  // Update HUD in parent header
  useEffect(() => {
    if (!hasStarted || tasks.length === 0) return;
    onHudChangeRef.current?.({
      subtitle: 'Datenfluss wiederherstellen',
      progress: {current: stageIndex + 1, total: stages.length},
      requestTimer: isRunning ? 'start' : undefined,
      isStartScreen: false,
    });
  }, [hasStarted, tasks.length, stageIndex, stages.length, isRunning]);

  return (
    <div className="number-system-container">
      <div className="ns-header">
        <h1>Zahlensysteme – Übung 1.1</h1>
      </div>

      {/* Header timer/progress moved to container */}

      {hasStarted && tasks.length > 0 && (
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
                  <SharedEquationRow
                    key={`ns-task:${t.id}`}
                    hasAssignment={!!assigned}
                    sourceContent={
                      <NumberWithBase value={t.sourceValue} base={t.fromBase} />
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
                    isDragOver={dragOverTaskId === t.id}
                    onClick={() => setActiveTaskId(t.id)}
                    onDragOver={e => handleDragOver(e, t.id)}
                    onDragEnter={e => handleDragEnter(e, t.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, t.id, onDropAnswer)}
                  />
                );
              })}
            </div>

            {/* Right side: Available results */}
            <ResultsSection
              answerPool={answerPool}
              usedAnswerKeys={usedAnswerKeys}
              assignments={assignments}
              draggedAnswer={draggedAnswer}
              activeTaskId={activeTaskId}
              tasks={tasks}
              handleDragStart={handleDragStartAdapter}
              handleDragEnd={handleDragEnd}
              assignAnswer={assignAnswerAdapter}
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

          {/* Controls moved to parent footer */}
        </div>
      )}

      {/* Initial start overlay with a large round button */}
      {!hasStarted && (
        <div className="ns-start-overlay">
          <GameStartScreen
            statusTitle="Datenfluss gestört"
            statusDescription={
              <>
                "Ein Fehler in der Systemkonvertierung hat den Informationsfluss
                unterbrochen. Die Zahlenpakete liegen jetzt in unterschiedlichen
                Systemen vor – einige in Binär, andere in Dezimal."
                <br />
                <br />
                <strong>Deine Mission:</strong> Stelle den Datenfluss wieder
                her, indem du jede Zahl mit ihrem passenden Gegenstück
                verbindest. Nur wenn die Systeme korrekt gekoppelt sind, kann
                die Datenübertragung weiterlaufen.
              </>
            }
            taskCount={4}
            estimatedTime="~5 min"
            fetchBestAttempt
            taskId={taskMeta?.id}
            onStart={handleInitialStart}
            startLabel="Mission starten"
          />
        </div>
      )}

      {/* Summary overlay moved to container */}
    </div>
  );
};

export default NumberSystemComponent;
