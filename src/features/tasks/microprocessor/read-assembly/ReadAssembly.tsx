import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {SubTaskComponentProps, TaskContext} from '@shared/interfaces/tasking.interfaces';
import './ReadAssembly.component.scss';
import {
  useFooterControls,
  useHudState,
  useGameStartScreen,
} from '@shared/hooks';
import GameStartScreen from '@features/tasks/shared/components/game-start-screen/GameStartScreen.component';
import {Difficulty} from '@shared/enums/difficulty.enum';
import type {AssemblyTask} from './readAssembly.interfaces';
import {generateRounds} from './readAssembly.utils';

const ReadAssembly: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  onTaskContextChange,
  taskMeta,
  getElapsed,
}) => {
  const rounds: AssemblyTask[] = useMemo(() => generateRounds(), []);

  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Start-screen lifecycle
  const {hasStarted, startTask: baseStart} = useGameStartScreen({
    onHudChange,
    totalTasks: rounds.length,
    subtitle: 'Wähle die richtige Antwort aus.',
  });

  // Accumulate per-round scores (used via setStageScores updater function)
  const [_stageScores, setStageScores] = useState<
    Array<{
      difficulty: Difficulty;
      correct: number;
      total: number;
      points: number;
    }>
  >([]);

  const current = rounds[roundIndex];

  // Use ref to store current evaluation data to avoid stale closure issues
  // when parent component doesn't update callback references
  const evaluationDataRef = useRef({
    selectedAnswer,
    correctIndex: current.correct_index,
    roundIndex,
    roundsLength: rounds.length,
  });

  // Keep ref up-to-date with current values
  useEffect(() => {
    evaluationDataRef.current = {
      selectedAnswer,
      correctIndex: current.correct_index,
      roundIndex,
      roundsLength: rounds.length,
    };
  }, [selectedAnswer, current.correct_index, roundIndex, rounds.length]);

  // Initialize round state when round changes
  useEffect(() => {
    setSelectedAnswer(null);
    setEvaluated(false);
  }, [roundIndex]);

  // Update task context for Tim whenever the current task changes
  useEffect(() => {
    if (!current || !hasStarted) {
      onTaskContextChange?.(null);
      return;
    }

    const taskContext: TaskContext = {
      subtaskType: 'ReadAssembly',
      taskId: current.id,
      taskTitle: 'Assembler lesen',
      description: current.question,
      contextData: {
          roundIndex: roundIndex,
          variant: current.variant,
          assemblyProgram: current.program.map(instr => ({
            address: instr.addr,
            operation: instr.op,
            argument: instr.arg,
          })),
          answerOptions: current.options,
          initialValues: current.initial_values || null,
      },
      userState: {
          selectedAnswer: selectedAnswer !== null ? current.options[selectedAnswer] : null
      },
      solution: {
          correctAnswer: current.options[current.correct_index],
          correctAnswerIndex: current.correct_index
      }
    };

    onTaskContextChange?.(taskContext);
  }, [current, roundIndex, rounds.length, hasStarted, onTaskContextChange, selectedAnswer]);

  const startTask = useCallback(() => {
    baseStart();
    setSelectedAnswer(null);
    setEvaluated(false);
  }, [baseStart]);

  const resetTask = useCallback(() => {
    setSelectedAnswer(null);
    setEvaluated(false);
  }, []);

  const evaluate = useCallback(() => {
    setEvaluated(true);

    // Read current values from ref to avoid stale closure issues
    const {selectedAnswer, correctIndex, roundIndex, roundsLength} =
      evaluationDataRef.current;

    const isCorrect = selectedAnswer === correctIndex;
    const correct = isCorrect ? 1 : 0;
    const total = 1;
    const points = isCorrect ? 1 : 0;
    const difficulty = Difficulty.Easy;

    setStageScores(prev => {
      const next = [...prev];
      next[roundIndex] = {difficulty, correct, total, points};

      // If last round, compute final result and emit to container using fresh state
      if (roundIndex === roundsLength - 1) {
        const elapsedMs = getElapsed?.() ?? 0;

        onSummaryChange?.({
          elapsedMs,
          perStage: next.map(s => ({...s, difficulty: s.difficulty})),
        });
      }

      return next;
    });
  }, [getElapsed, onSummaryChange]);

  const next = useCallback(() => {
    if (roundIndex < rounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex);
      setSelectedAnswer(null);
      setEvaluated(false);
    }
  }, [roundIndex, rounds.length]);

  // Footer controls (stabilised via hook)
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
      subtitle: 'Wähle die richtige Antwort aus.',
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

  const handleAnswerSelect = (index: number) => {
    if (!evaluated) {
      setSelectedAnswer(index);
    }
  };

  return (
    <div className="read-assembly">
      {!hasStarted ? (
        <GameStartScreen
          statusTitle="Instruktionsdecoder beschädigt!"
          statusDescription={
            <>
              Der Mikrocode deines Prozessors ist korrupt – Befehle werden nicht
              mehr korrekt interpretiert. Die CPU versteht nur noch Fragmente
              aus alten Assembler-Instruktionen.
              <br />
              <br />
              <strong>Deine Mission:</strong> Du musst du die verbleibenden
              Assemblerfragmente analysieren, um ihre Bedeutung zu
              rekonstruieren.
              <br />
              Beantworte Fragen wie:
              <br />
              <br />
              • Was tut dieses Programm?
              <br />• Welche Werte stehen am Ende in bestimmten Speicherzellen?{' '}
              <br />
              <br />
              Nur wenn du die Logik der CPU wieder verstehst, kann der Prozessor
              korrekt kompilierte Befehle ausführen.
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
