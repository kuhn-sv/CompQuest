import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../number-system/number-system.page.scss';
import { ConnectionOverlay } from '../../../../shared/components';
import { useDragAndDrop, useConnectionLines, useTimer, CONNECTION_LINE_PRESETS, DRAG_DROP_PRESETS } from '../../../../shared/hooks';
import { EquationRow } from './EquationRow';
import { ResultsSection } from './ResultsSection';
import { generateAdditionSet, AdditionTask } from './addition.helper';
import { Difficulty } from '../../../../shared/enums/difficulty.enum';

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

const PositiveArithmeticComponent: React.FC = () => {
  // 3-stage flow: Easy, Medium, Hard
  const stages: Difficulty[] = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard];
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [tasks, setTasks] = useState<AdditionTask[]>([]);
  const [answerPool, setAnswerPool] = useState<{ value: string; base: number }[]>([]);
  const [assignments, setAssignments] = useState<Record<string, { value: string; base: number } | null>>({});
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
    draggedItem: draggedAnswer,
    dragOverTargetId: dragOverTaskId,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    resetDragState
  } = useDragAndDrop<{ value: string; base: number }>(DRAG_DROP_PRESETS.NUMBER_SYSTEM);

  // Connection lines calculation
  const getTaskIdCb = useCallback((task: AdditionTask) => task.id, []);
  const compareAnswersCb = useCallback((assignment: { value: string; base: number }, poolAnswer: { value: string; base: number }) => (
    assignment.value === poolAnswer.value && assignment.base === poolAnswer.base
  ), []);

  const connectionLines = useConnectionLines({
    tasks,
    assignments,
    answerPool,
    containerRef,
    getTaskId: getTaskIdCb,
    compareAnswers: compareAnswersCb,
    ...CONNECTION_LINE_PRESETS.NUMBER_SYSTEM,
    debug: false
  });

  const startSetForStage = (idx: number, options?: { resetTimer?: boolean }) => {
    const { resetTimer: shouldResetTimer = true } = options ?? {};
    const difficulty = stages[idx];
    const { tasks, answerPool } = generateAdditionSet(difficulty);
    setTasks(tasks);
    setAnswerPool(answerPool);
    setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
    setEvaluated(false);
    setActiveTaskId(null);
    if (shouldResetTimer) {
      reset();
    }
    start();
  };

  // Initial start handler
  const handleInitialStart = () => {
    setHasStarted(true);
    setStageIndex(0);
    startSetForStage(0, { resetTimer: true });
  };

  const resetSet = () => {
    setAssignments(Object.fromEntries(tasks.map(t => [t.id, null])));
    setEvaluated(false);
    setActiveTaskId(null);
    resetDragState();
    reset();
    if (tasks.length > 0) {
      start();
    }
  };

  // Assignment logic
  const assignAnswer = (taskId: string, answer: { value: string; base: number }) => {
    setAssignments(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (next[k] && next[k]!.value === answer.value && next[k]!.base === answer.base) next[k] = null;
      }
      next[taskId] = answer;
      return next;
    });
    setActiveTaskId(null);
  };

  const onDropAnswer = (taskId: string, answer: { value: string; base: number }) => {
    assignAnswer(taskId, answer);
  };

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
    return a && a.value === t.expected && a.base === t.base;
  }).length, [tasks, assignments]);

  const evaluate = () => {
    setEvaluated(true);
    stop();
    const difficulty = stages[stageIndex];
    const total = tasks.length;
    const correct = tasks.filter(t => {
      const a = assignments[t.id];
      return a && a.value === t.expected && a.base === t.base;
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
  };

  const goToNextStage = () => {
    if (stageIndex < stages.length - 1) {
      const nextIndex = stageIndex + 1;
      setStageIndex(nextIndex);
      startSetForStage(nextIndex, { resetTimer: false });
    }
  };

  return (
    <div className="number-system-container">
      <div className="ns-header">
        <Link to="/dashboard" className="back-to-dashboard">← Zurück zum Dashboard</Link>
        <h1>Positive Arithmetik – Übung 1.2</h1>
      </div>


      {hasStarted && tasks.length > 0 && (
        <div className={`ns-content ${activeTaskId ? 'has-active' : ''}`} ref={containerRef}>
          <div className="equations-and-results">
            <div className="equations-section">
              {tasks.map((t) => {
                const assigned = assignments[t.id];
                const isCorrect = evaluated && !!assigned && assigned.value === t.expected && assigned.base === t.base;
                const isWrong = evaluated && !!assigned && !(assigned.value === t.expected && assigned.base === t.base);
                const isActive = activeTaskId === t.id;
                return (
                  <EquationRow
                    key={t.id}
                    task={t}
                    assignment={assigned}
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
            />
          </div>
          <ConnectionOverlay connectionLines={connectionLines} />
          <div className="ns-controls">
            <div className="actions">
              {!evaluated && (
                <button onClick={resetSet} disabled={!tasks.length}>Zurücksetzen</button>
              )}
              <button onClick={evaluate} disabled={!allAssigned}>Auswerten</button>
              {evaluated && stageIndex < stages.length - 1 && (
                <button onClick={goToNextStage}>Weiter</button>
              )}
            </div>
            {evaluated && (
              <div className="result">Ergebnis: {correctCount} / {tasks.length} richtig</div>
            )}
          </div>
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
