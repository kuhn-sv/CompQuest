// filepath: c:\Users\Nutzer\Desktop\Uni\Neuer Ordner\CompQuest\src\features\tasks\practiceTaskOne\quiz\Quiz.component.tsx
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import './quiz.page.scss';
import {GameStartScreen} from '../../../../shared/components';
import type {SubTaskComponentProps, TaskStageScore} from '../interfaces';
import {useTimer} from '../../../../shared/hooks';

interface QuizQuestion {
  id: string;
  text: string;
  answers: string[]; // length 4
  correctIndex: number; // 0..3
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'Was sind Tetraden-Codes?',
    answers: [
      'Binärcode, der eine Zahl ziffernweise codiert',
      'Hexadezimal Darstellung von Zahlen',
      'Ein Fehlererkennungscode',
      'Eine Komprimierungsmethode',
    ],
    correctIndex: 0,
  },
  {
    id: 'q2',
    text: 'Was ist der am häufigsten eingesetzte Tetraden-Code?',
    answers: ['Gray-Code', 'Aiken-Code', 'BCD-Code', 'Stibitz-Code'],
    correctIndex: 2,
  },
  {
    id: 'q3',
    text: 'Welchen Nachteil haben Tetraden-Codes wie BCD-Code, Stibitz-Code, Aiken-Code oder Gray-Code?',
    answers: [
      'Zu komplex',
      'Nicht fehlererkennend',
      'Zu langsam in der Verarbeitung',
      'Benötigen zu viel Speicherplatz',
    ],
    correctIndex: 1,
  },
];

const TOTAL = QUESTIONS.length;

const Quiz: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [evaluated, setEvaluated] = useState(false);
  const [scores, setScores] = useState<TaskStageScore[]>([]);

  const {start, stop, reset, getElapsed} = useTimer();

  // refs for stable callbacks to parent
  const onControlsChangeRef = useRef(onControlsChange);
  const onHudChangeRef = useRef(onHudChange);
  const onSummaryChangeRef = useRef(onSummaryChange);
  useEffect(() => {
    onControlsChangeRef.current = onControlsChange;
  }, [onControlsChange]);
  useEffect(() => {
    onHudChangeRef.current = onHudChange;
  }, [onHudChange]);
  useEffect(() => {
    onSummaryChangeRef.current = onSummaryChange;
  }, [onSummaryChange]);

  // Start HUD state before quiz begins
  useEffect(() => {
    if (!hasStarted) {
      onHudChangeRef.current?.({
        progress: null,
        isStartScreen: true,
        subtitle: 'Beantworte Tims Fragen zum Thema Zahlendarstellung. ',
      });
    }
  }, [hasStarted]);

  const handleStart = useCallback(() => {
    setHasStarted(true);
    setQIndex(0);
    setSelected(null);
    setEvaluated(false);
    setScores([]);
    reset();
    start();
    onHudChangeRef.current?.({
      progress: {current: 1, total: TOTAL},
      requestTimer: 'start',
      subtitle: 'Beantworte Tims Fragen zum Thema Zahlendarstellung. ',
      isStartScreen: false,
    });
  }, [reset, start]);

  const resetQuestion = useCallback(() => {
    setSelected(null);
    setEvaluated(false);
  }, []);

  const evaluate = useCallback(() => {
    if (selected == null) return;
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
      stop();
      const elapsedMs = getElapsed();
      const timeBonusThresholdMs = 3 * 60 * 1000;
      const timeBonusPoints = 1;
      const withinThreshold = elapsedMs <= timeBonusThresholdMs;
      const timeBonus = withinThreshold ? timeBonusPoints : 0;
      const filled = (() => {
        const base = [...scores];
        base[qIndex] = entry;
        return base;
      })();
      const totalCorrect = filled.reduce((s, x) => s + (x?.correct ?? 0), 0);
      const totalPossible = filled.reduce((s, x) => s + (x?.total ?? 0), 0);
      const totalPoints = totalCorrect + timeBonus;
      onSummaryChangeRef.current?.({
        elapsedMs,
        withinThreshold,
        timeBonus,
        perStage: filled,
        totalCorrect,
        totalPossible,
        totalPoints,
        thresholdMs: timeBonusThresholdMs,
      });
    }
  }, [selected, qIndex, scores, stop, getElapsed]);

  const next = useCallback(() => {
    if (qIndex < TOTAL - 1) {
      const nextIdx = qIndex + 1;
      setQIndex(nextIdx);
      setSelected(null);
      setEvaluated(false);
      onHudChangeRef.current?.({
        progress: {current: nextIdx + 1, total: TOTAL},
      });
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
      showReset: !evaluated,
      showEvaluate: true,
      showNext: evaluated && qIndex < TOTAL - 1,
      disableReset: selected == null || evaluated,
      disableEvaluate: selected == null || evaluated,
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
        <div className="ns-start-overlay">
          <GameStartScreen
            statusTitle="Timothy braucht deine Hilfe!"
            statusDescription={
              <>
                Timothy ist unsicher, ob er alle Prinzipien der digitalen
                Zahlensysteme richtig verstanden hat.
                <br />
                <br />
                <strong>Deine Mission:</strong> Beantworte Timothys Fragen
                korrekt und hilf ihm, sein Wissen zum Thema{' '}
                <i>Zahlendarstellung</i> zu festigen.
              </>
            }
            taskCount={TOTAL}
            estimatedTime="~2 min"
            bestAttempt={null}
            onStart={handleStart}
            startLabel="Mission starten"
          />
        </div>
      )}
    </div>
  );
};

export default Quiz;
