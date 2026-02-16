import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import './quiz.page.scss';
import type {SubTaskComponentProps, TaskStageScore, TaskContext} from '../interfaces';
import {useGameStartScreen, useHudState} from '@shared/hooks';
import {QUESTIONS, TOTAL} from './quiz.data';
import GameStartScreen from '@features/tasks/shared/components/game-start-screen/GameStartScreen.component';

const Quiz: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  taskMeta,
  onTaskContextChange,
  getElapsed,
}) => {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [evaluated, setEvaluated] = useState(false);
  const [scores, setScores] = useState<TaskStageScore[]>([]);

  // Start-screen lifecycle
  const {hasStarted, startTask} = useGameStartScreen({
    onHudChange,
    totalTasks: TOTAL,
    subtitle: 'Beweise dein Wissen. ',
  });

  // refs for stable callbacks to parent
  const onControlsChangeRef = useRef(onControlsChange);
  const onSummaryChangeRef = useRef(onSummaryChange);
  useEffect(() => {
    onControlsChangeRef.current = onControlsChange;
  }, [onControlsChange]);
  useEffect(() => {
    onSummaryChangeRef.current = onSummaryChange;
  }, [onSummaryChange]);

  // HUD state (stabilised via hook)
  const hudState = useMemo(() => {
    if (!hasStarted)
      return {
        progress: null,
        isStartScreen: true,
        subtitle: 'Beweise dein Wissen. ',
      } as const;
    return {
      subtitle: 'Beweise dein Wissen. ',
      progress: {current: qIndex + 1, total: TOTAL},
    };
  }, [hasStarted, qIndex]);
  useHudState(onHudChange, hudState);

  const handleStart = useCallback(() => {
    startTask();
    setQIndex(0);
    setSelected(null);
    setEvaluated(false);
    setScores([]);
  }, [startTask]);

  const resetQuestion = useCallback(() => {
    setSelected(null);
    setEvaluated(false);
  }, []);

  const evaluate = useCallback(() => {
    setEvaluated(true);
    const correct = selected === QUESTIONS[qIndex].correctIndex ? 1 : 0;
    const entry: TaskStageScore = {
      difficulty: `Frage ${qIndex + 1}`,
      correct,
      total: 1,
      points: correct,
    };
    setScores(prev => {
      const next = [...prev];
      next[qIndex] = entry;
      return next;
    });
    if (qIndex === TOTAL - 1) {
      // finalize
      const elapsedMs = getElapsed?.() ?? 0;
      const filled = (() => {
        const base = [...scores];
        base[qIndex] = entry;
        return base;
      })();
      const totalCorrect = filled.reduce((s, x) => s + (x?.correct ?? 0), 0);
      const totalPossible = filled.reduce((s, x) => s + (x?.total ?? 0), 0);
      onSummaryChangeRef.current?.({
        elapsedMs,
        perStage: filled,
        totalCorrect,
        totalPossible,
      });
    }
  }, [selected, qIndex, scores, getElapsed]);

  const next = useCallback(() => {
    if (qIndex < TOTAL - 1) {
      const nextIdx = qIndex + 1;
      setQIndex(nextIdx);
      setSelected(null);
      setEvaluated(false);
    }
  }, [qIndex]);

  // Provide footer controls to parent
  const onResetStable = useCallback(() => resetQuestion(), [resetQuestion]);
  const onEvaluateStable = useCallback(() => evaluate(), [evaluate]);
  const onNextStable = useCallback(() => next(), [next]);

  const controls = useMemo(() => {
    if (!hasStarted) return null;
    return {
      onReset: onResetStable,
      onEvaluate: onEvaluateStable,
      onNext: onNextStable,
      showReset: true,
      showEvaluate: !evaluated,
      showNext: evaluated && qIndex < TOTAL - 1,
      disableReset: selected == null || evaluated,
      disableNext: !evaluated,
    };
  }, [
    hasStarted,
    onEvaluateStable,
    onNextStable,
    onResetStable,
    evaluated,
    qIndex,
    selected,
  ]);

  const prevControlsRef = useRef<typeof controls>(null);
  useEffect(() => {
    if (!onControlsChangeRef.current) return;
    if (prevControlsRef.current !== controls) {
      onControlsChangeRef.current(controls);
      prevControlsRef.current = controls;
    }
  }, [controls]);

  const current = QUESTIONS[qIndex];

  // Inform parent about the visible question so AskTim can incorporate it.
  useEffect(() => {
    if (!onTaskContextChange) return;
    if (!hasStarted) {
      onTaskContextChange(null);
      return;
    }
    const ctx: TaskContext = {
      taskId: current.id,
      taskTitle: taskMeta?.title ?? 'Quiz',
      subtaskType: 'Quiz',
      contextData: {
        prompt: current.text,
        answers: current.answers,
        index: qIndex,
        total: TOTAL,
      },
      solution: {
        correctIndex: current.correctIndex,
      },
    };
    onTaskContextChange(ctx);
    return () => onTaskContextChange(null);
  }, [onTaskContextChange, hasStarted, qIndex, current, taskMeta]);
  // Keep controls/HUD stable (this effect intentionally minimal)
  useEffect(() => {
    onControlsChangeRef.current?.(controls ?? null);
  }, [controls]);

  return (
    <div className="quiz-container">
      {hasStarted ? (
        <div className="quiz-content">
          <div className="quiz-left">
            <img
              className="quiz-illustration"
              src="/timothy.svg"
              alt="Assistent"
            />
          </div>
          <div className="quiz-card">
            <div className="quiz-question">{current.text}</div>
            <div className="quiz-answers">
              {current.answers.map((a, idx) => {
                const isSelected = selected === idx;
                const isCorrect = evaluated && idx === current.correctIndex;
                const isWrong = evaluated && isSelected && !isCorrect;
                return (
                  <button
                    key={`${current.id}:ans:${idx}`}
                    className={`quiz-answer ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                    onClick={() => {
                      if (!evaluated) setSelected(idx);
                    }}
                    disabled={evaluated}
                    aria-pressed={isSelected}>
                    <span className="letter">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text">{a}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <GameStartScreen
          statusTitle="Systemcheck – Tetraden-Codes"
          statusDescription={
            <>
              „Bevor wir weitermachen, muss ich sichergehen, dass die Tetraden-Codes richtig funktionieren. Diese speziellen BCD-Codes sind wichtig für die korrekte Darstellung von Dezimalzahlen im Computer!"
              <br />
              <br />
              <strong>Ziel der Reparatur:</strong> Tim stellt dir Kontrollfragen zu Tetraden-Codes (BCD, Aiken, Excess-3, Gray-Code). Beantworte die Fragen zu den verschiedenen Codesystemen und ihrer Anwendung, um zu beweisen, dass du die Tetraden-Darstellung beherrschst.
            </>
          }
          taskCount={TOTAL}
          estimatedTime={taskMeta?.timeLimit ?? 0}
          fetchBestAttempt
          taskId={taskMeta?.id}
          onStart={handleStart}
          startLabel="Mission starten"
        />
      )}
    </div>
  );
};

export default Quiz;
