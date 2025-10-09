import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../number-system/number-system.page.scss';
import { ConnectionOverlay } from '../../../../shared/components';
// Footer buttons are rendered in parent; we expose controls upwards
import type { SubTaskComponentProps } from '../interfaces';
import { useDragAndDrop, useConnectionLines, useTimer, CONNECTION_LINE_PRESETS, DRAG_DROP_PRESETS } from '../../../../shared/hooks';
import type { DragDropItem } from '../../../../shared/hooks/useDragAndDrop';
import { EquationRow as SharedEquationRow } from '../../../../shared/components/equationrow/EquationRow';
import NumberWithBase from '../../../../shared/components/number/NumberWithBase.component';
import { ResultsSection } from '../../../../shared/numberTask/ResultsSection';
import type { AnswerOptionBase } from '../../../../shared/numberTask/NumberTask.types';
import { generateAdditionSet, AdditionTask } from './addition.helper';
import { Difficulty } from '../../../../shared/enums/difficulty.enum';
import type { ArithmeticMode } from '../interfaces';

interface PAStageScore {
  difficulty: Difficulty;
  correct: number;
  total: number;
  points: number;
}

interface PAResultSummary {
  elapsedMs: number;
  withinThreshold: boolean;
  timeBonus: number;
  perStage: PAStageScore[];
  totalCorrect: number;
  totalPossible: number;
  totalPoints: number;
}

const PositiveArithmeticComponent: React.FC<SubTaskComponentProps> = ({ onControlsChange, arithmeticMode = 'positive' }) => {
  // 3-stage flow: Easy, Medium, Hard
  const stages: Difficulty[] = useMemo(() => [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard], []);
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [tasks, setTasks] = useState<AdditionTask[]>([]);
  const [answerPool, setAnswerPool] = useState<AnswerOptionBase[]>([]);
  const [assignments, setAssignments] = useState<Record<string, AnswerOptionBase | null>>({});
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [stageScores, setStageScores] = useState<PAStageScore[]>([]);
  const [finalResult, setFinalResult] = useState<PAResultSummary | null>(null);

  // Config: 3 minutes threshold = 180000 ms, 1 point bonus
  const evalConfig = useMemo(() => ({ timeBonusThresholdMs: 3 * 60 * 1000, timeBonusPoints: 1 }), []);
  const { start, stop, reset, formatTime, getElapsed } = useTimer();

  // Drag and Drop logic
  const {
    draggedItem: draggedAnswerInternal,
    dragOverTargetId: dragOverTaskId,
    handleDragStart: handleDragStartInternal,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    resetDragState
  } = useDragAndDrop<DragDropItem>(DRAG_DROP_PRESETS.NUMBER_SYSTEM);

  // Map internal DnD item (requires base: number) to external AnswerOptionBase shape
  const draggedAnswer: AnswerOptionBase | null = draggedAnswerInternal ? { value: draggedAnswerInternal.value, base: draggedAnswerInternal.base } : null;
  const handleDragStart = useCallback((e: React.DragEvent, answer: AnswerOptionBase) => {
    const baseNum = typeof answer.base === 'string' ? parseInt(answer.base, 10) : (answer.base as number | undefined);
    if (baseNum == null || Number.isNaN(baseNum)) return; // ignore invalid drag
    handleDragStartInternal(e, { value: answer.value, base: baseNum });
  }, [handleDragStartInternal]);

  // Connection lines calculation
  const getTaskIdCb = useCallback((task: AdditionTask) => task.id, []);
  const compareAnswersCb = useCallback((assignment: AnswerOptionBase, poolAnswer: AnswerOptionBase) => (
    assignment.value === poolAnswer.value && assignment.base === poolAnswer.base
  ), []);
  const evaluateStatusCb = useCallback((task: AdditionTask, assignment: AnswerOptionBase) => {
    const aBase = typeof assignment.base === 'string' ? parseInt(assignment.base, 10) : assignment.base;
    if (assignment.value === task.expected && aBase === task.base) return 'correct';
    return 'wrong';
  }, []);

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
    evaluateStatus: evaluateStatusCb
  });

  const startSetForStage = useCallback((idx: number, options?: { resetTimer?: boolean }) => {
    const { resetTimer: shouldResetTimer = true } = options ?? {};
    const difficulty = stages[idx];
  const { tasks, answerPool } = generateAdditionSet(difficulty, arithmeticMode as ArithmeticMode);
    setTasks(tasks);
    setAnswerPool(answerPool);
    setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
    setEvaluated(false);
    setActiveTaskId(null);
    if (shouldResetTimer) {
      reset();
    }
    start();
  }, [reset, start, stages, arithmeticMode]);

  // Initial start handler
  const handleInitialStart = useCallback(() => {
    setHasStarted(true);
    setStageIndex(0);
    startSetForStage(0, { resetTimer: true });
  }, [startSetForStage]);

  const resetSet = useCallback(() => {
    setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
    setEvaluated(false);
    setActiveTaskId(null);
    resetDragState();
    reset();
    if (tasks.length > 0) {
      start();
    }
  }, [reset, resetDragState, start, tasks]);

  // Assignment logic
  const assignAnswer = useCallback((taskId: string, answer: AnswerOptionBase) => {
    setAssignments(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (next[k] && next[k]!.value === answer.value && next[k]!.base === answer.base) next[k] = null;
      }
      next[taskId] = answer;
      return next;
    });
    setActiveTaskId(null);
  }, []);

  const onDropAnswer = useCallback((taskId: string, answer: AnswerOptionBase) => {
    assignAnswer(taskId, answer);
  }, [assignAnswer]);

  const usedAnswerKeys = useMemo(() => {
    return new Set(
      Object.values(assignments)
        .filter((a): a is { value: string; base: number } => !!a)
        .map(a => `${a.value}|${a.base}`)
    );
  }, [assignments]);

  const allAssigned = useMemo(() => tasks.length > 0 && tasks.every(t => assignments[t.id]), [tasks, assignments]);
  const correctCount = useMemo(() => tasks.filter(t => {
    const a = assignments[t.id];
    const aBase = typeof a?.base === 'string' ? parseInt(a.base, 10) : a?.base;
    return !!a && a.value === t.expected && aBase === t.base;
  }).length, [tasks, assignments]);

  const evaluate = useCallback(() => {
    setEvaluated(true);
    stop();
    const difficulty = stages[stageIndex];
    const total = tasks.length;
    const correct = tasks.filter(t => {
      const a = assignments[t.id];
      const aBase = typeof a?.base === 'string' ? parseInt(a.base, 10) : a?.base;
      return !!a && a.value === t.expected && aBase === t.base;
    }).length;
    const points = correct;
    setStageScores(prev => {
      const next = [...prev];
      next[stageIndex] = { difficulty, correct, total, points };
      return next;
    });
    if (stageIndex === stages.length - 1) {
      const elapsedMs = getElapsed();
      const withinThreshold = elapsedMs <= evalConfig.timeBonusThresholdMs;
      const timeBonus = withinThreshold ? evalConfig.timeBonusPoints : 0;
      const totalCorrect = stageScores.reduce((sum, s) => sum + (s?.correct ?? 0), 0) + correct;
      const totalPossible = stageScores.reduce((sum, s) => sum + (s?.total ?? 0), 0) + total;
      const totalPoints = totalCorrect + timeBonus;
      const perStage: PAStageScore[] = (() => {
        const base = [...stageScores];
        base[stageIndex] = { difficulty, correct, total, points };
        return base;
      })();
      setFinalResult({ elapsedMs, withinThreshold, timeBonus, perStage, totalCorrect, totalPossible, totalPoints });
    }
  }, [assignments, evalConfig.timeBonusPoints, evalConfig.timeBonusThresholdMs, getElapsed, stageIndex, stageScores, stages, stop, tasks]);

  const goToNextStage = useCallback(() => {
    if (stageIndex < stages.length - 1) {
      const nextIndex = stageIndex + 1;
      setStageIndex(nextIndex);
      startSetForStage(nextIndex, { resetTimer: false });
    }
  }, [stageIndex, stages, startSetForStage]);

  // Provide footer controls to parent
  useEffect(() => {
    if (!hasStarted || tasks.length === 0) {
      onControlsChange?.(null);
      return;
    }
    onControlsChange?.({
      onReset: resetSet,
      onEvaluate: evaluate,
      onNext: goToNextStage,
      showReset: !evaluated,
      showEvaluate: true,
      showNext: evaluated && stageIndex < stages.length - 1,
      disableReset: !tasks.length,
      disableEvaluate: !allAssigned,
      disableNext: false,
    });
    return () => {
      onControlsChange?.(null);
    };
  }, [hasStarted, tasks.length, evaluated, stageIndex, stages, allAssigned, correctCount, onControlsChange, resetSet, evaluate, goToNextStage]);

  return (
    <div className="number-system-container">
      <div className="ns-header">
        <Link to="/dashboard" className="back-to-dashboard">← Zurück zum Dashboard</Link>
  <h1>{arithmeticMode === 'twos-complement' ? 'Zweierkomplement-Arithmetik – Übung 1.2' : 'Positive Arithmetik – Übung 1.2'}</h1>
      </div>


      {hasStarted && tasks.length > 0 && (
        <div className={`ns-content ${activeTaskId ? 'has-active' : ''}`} ref={containerRef}>
          <div className="equations-and-results">
            <div className="equations-section">
              {tasks.map((t) => {
                const assigned = assignments[t.id];
                const assignedBase = typeof assigned?.base === 'string' ? parseInt(assigned.base, 10) : assigned?.base;
                const isCorrect = evaluated && !!assigned && assigned.value === t.expected && assignedBase === t.base;
                const isWrong = evaluated && !!assigned && !(assigned.value === t.expected && assignedBase === t.base);
                const isActive = activeTaskId === t.id;
                const [zahl1, zahl2] = t.left.split(' + ');
                const baseSub = t.base === 2 ? '₂' : t.base === 8 ? '₈' : t.base === 16 ? '₁₆' : '';
                return (
                  <SharedEquationRow
                    key={t.id}
                    hasAssignment={!!assigned}
                    sourceContent={
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                        <span>{zahl1}<sub style={{ marginLeft: 2 }}>{baseSub}</sub></span>
                        <span>+ {zahl2}<sub style={{ marginLeft: 2 }}>{baseSub}</sub></span>
                      </div>
                    }
                    assignedContent={assigned && assignedBase ? <NumberWithBase value={assigned.value} base={assignedBase as 2|8|10|16} /> : null}
                    isCorrect={isCorrect}
                    isWrong={isWrong}
                    isActive={isActive}
                    isDragOver={dragOverTaskId === t.id}
                    onClick={() => setActiveTaskId(t.id)}
                    onDragOver={(e) => handleDragOver(e, t.id)}
                    onDragEnter={(e) => handleDragEnter(e, t.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, t.id, onDropAnswer)}
                  />
                );
              })}
            </div>
            <ResultsSection
              answerPool={answerPool}
              usedAnswerKeys={usedAnswerKeys}
              assignments={assignments}
              draggedAnswer={draggedAnswer}
              activeTaskId={activeTaskId}
              tasks={tasks}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              assignAnswer={assignAnswer}
              evaluated={evaluated}
              renderAnswer={(a) => (
                typeof a.base === 'number' ? (
                  <NumberWithBase value={a.value} base={a.base as 2|8|10|16} />
                ) : (
                  a.value
                )
              )}
            />
          </div>
          <ConnectionOverlay connectionLines={connectionLines} />
          {/* Controls moved to parent footer */}
        </div>
      )}


      {!hasStarted && (
        <div className="ns-start-overlay">
          <button className="ns-start-button" onClick={handleInitialStart} aria-label="Aufgabe starten">Start</button>
        </div>
      )}

      {finalResult && (
        <div className="ns-summary-overlay" role="dialog" aria-modal="true">
          <div className="ns-summary-card">
            <h2>Auswertung</h2>
            <div className="ns-summary-row">
              <span>Zeit:</span>
              <strong>{formatTime(finalResult.elapsedMs)}</strong>
            </div>
            <div className="ns-summary-row">
              <span>Grenze für Bonus:</span>
              <strong>{formatTime(evalConfig.timeBonusThresholdMs)} ({finalResult.withinThreshold ? 'unter' : 'über'})</strong>
            </div>
            <hr />
            <div className="ns-summary-stages">
              {finalResult.perStage.map((s, idx) => (
                <div key={idx} className="ns-summary-row">
                  <span>Stufe {idx + 1} ({s.difficulty.charAt(0).toUpperCase() + s.difficulty.slice(1)}):</span>
                  <strong>{s.correct} / {s.total} Punkte</strong>
                </div>
              ))}
            </div>
            <hr />
            <div className="ns-summary-row">
              <span>Gesamt (Antworten):</span>
              <strong>{finalResult.totalCorrect} / {finalResult.totalPossible}</strong>
            </div>
            <div className="ns-summary-row">
              <span>Zeitbonus:</span>
              <strong>{finalResult.timeBonus}</strong>
            </div>
            <div className="ns-summary-total">
              <span>Gesamtpunkte:</span>
              <strong>{finalResult.totalPoints}</strong>
            </div>
            <div className="ns-summary-actions">
              <Link to="/dashboard" className="button">Beenden</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositiveArithmeticComponent;
