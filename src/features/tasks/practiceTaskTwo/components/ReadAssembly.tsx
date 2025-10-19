import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { SubTaskComponentProps } from '../../../../shared/interfaces/tasking.interfaces';
import './ReadAssembly.component.scss';
import { generateRounds, AssemblyTask } from './readAssembly.helper';
import { useTimer } from '../../../../shared/hooks';
import GameStartScreen from '../../../../shared/components/startScreen/GameStartScreen.component.tsx';
import { Difficulty } from '../../../../shared/enums/difficulty.enum';

const ReadAssembly: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  taskMeta,
}) => {
  const rounds: AssemblyTask[] = useMemo(() => generateRounds(), []);

  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

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

  // Initialize round state when round changes
  useEffect(() => {
    setSelectedAnswer(null);
    setEvaluated(false);
  }, [roundIndex]);

  const startTask = useCallback(() => {
    setHasStarted(true);
    reset();
    start();
    setSelectedAnswer(null);
    setEvaluated(false);
  }, [reset, start]);

  const resetTask = useCallback(() => {
    setSelectedAnswer(null);
    setEvaluated(false);
    reset();
    start();
  }, [reset, start]);

  const evaluate = useCallback(() => {
    setEvaluated(true);
    stop();

    const isCorrect = selectedAnswer === current.correct_index;
    const correct = isCorrect ? 1 : 0;
    const total = 1;
    const points = isCorrect ? 1 : 0;
    const difficulty = Difficulty.Easy;

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

      onSummaryChange?.({
        elapsedMs,
        perStage: base.map(s => ({...s, difficulty: s.difficulty})),
      });
    }
  }, [
    current.correct_index,
    selectedAnswer,
    stop,
    getElapsed,
    onSummaryChange,
    roundIndex,
    rounds.length,
    stageScores,
  ]);

  const next = useCallback(() => {
    if (roundIndex < rounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex);
      setSelectedAnswer(null);
      setEvaluated(false);
      start();
    }
  }, [roundIndex, rounds.length, start]);

  // Update controls when state changes
  useEffect(() => {
    if (!hasStarted) {
      onControlsChange?.(null);
      return;
    }

    onControlsChange?.({
      onReset: resetTask,
      onEvaluate: evaluate,
      onNext: next,
      showReset: !evaluated,
      showEvaluate: true,
      showNext: evaluated && roundIndex < rounds.length - 1,
      disableReset: evaluated,
      disableEvaluate: evaluated || selectedAnswer === null,
      disableNext: !evaluated,
    });
  }, [
    hasStarted,
    evaluated,
    roundIndex,
    rounds.length,
    selectedAnswer,
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
        subtitle: 'Wähle die richtige Antwort aus.',
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

  const handleAnswerSelect = (index: number) => {
    if (!evaluated) {
      setSelectedAnswer(index);
    }
  };

  return (
    <div className="read-assembly">
      {!hasStarted ? (
        <div className="ns-start-overlay">
          <GameStartScreen
            statusTitle="Instruktionsdecoder beschädigt!"
            statusDescription={
              <>
                Der Mikrocode deines Prozessors ist korrupt – Befehle werden nicht mehr korrekt interpretiert. Die CPU versteht nur noch Fragmente aus alten Assembler-Instruktionen.
              <br />
              <br />
                <strong>Deine Mission:</strong> Du musst du die verbleibenden Assemblerfragmente analysieren, um ihre Bedeutung zu rekonstruieren.
              <br />
              Beantworte Fragen wie:<br /><br />
              • Was tut dieses Programm?<br />
              • Welche Werte stehen am Ende in bestimmten Speicherzellen? <br /><br />
              Nur wenn du die Logik der CPU wieder verstehst, kann der Prozessor korrekt kompilierte Befehle ausführen.
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
        <div className="read-assembly__content">
          <div className="read-assembly__left">
            <div className="read-assembly__program">
              <h3 className="read-assembly__program-title">
                Assembler-Programm
              </h3>
              {current.variant === 2 && current.initial_values && (
                <div className="read-assembly__initial-values">
                  {Object.entries(current.initial_values).map(
                    ([addr, val], idx, arr) => (
                      <React.Fragment key={addr}>
                        Adresse {addr}: <strong>{val}</strong>
                        {idx < arr.length - 1 && '; '}
                      </React.Fragment>
                    ),
                  )}
                </div>
              )}
              <table className="read-assembly__table">
                <thead>
                  <tr>
                    <th>Adresse</th>
                    <th>Label</th>
                    <th>Befehl</th>
                    <th>Operand</th>
                  </tr>
                </thead>
                <tbody>
                  {current.program.map((instruction, idx) => (
                    <tr key={idx}>
                      <td>{instruction.addr}</td>
                      <td></td>
                      <td>{instruction.op}</td>
                      <td>{instruction.arg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="read-assembly__right">
            <div className="read-assembly__question">
              <h3 className="read-assembly__question-title">
                {current.question}
              </h3>
              <ul className="read-assembly__options">
                {current.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === current.correct_index;
                  const showFeedback = evaluated && isSelected;

                  return (
                    <li
                      key={idx}
                      className={`read-assembly__option ${
                        showFeedback
                          ? isCorrect
                            ? 'is-correct'
                            : 'is-wrong'
                          : ''
                      }`}>
                      <button
                        type="button"
                        className={`read-assembly__option-btn ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={evaluated}
                        aria-pressed={isSelected}
                        aria-label={option}>
                        <span
                          className={`read-assembly__radio ${isSelected ? 'is-selected' : ''}`}
                          aria-hidden="true"
                        />
                        <span className="read-assembly__option-label">
                          {option}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadAssembly;

