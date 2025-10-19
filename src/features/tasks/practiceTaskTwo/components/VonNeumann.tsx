import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SubTaskComponentProps } from '../../../../shared/interfaces/tasking.interfaces';
import './VonNeumannQuiz.component.scss';
import {VonNeumannRound} from './vonneumann.helper';
import vonNeumannData from '../../../../data/tasks/von-neumann.json';
import {useTimer} from '../../../../shared/hooks';
import GameStartScreen from '../../../../shared/components/startScreen/GameStartScreen.component.tsx';
import { Difficulty } from '../../../../shared/enums/difficulty.enum';
import VonNeumannFunctions from './VonNeumannFunctions';
import VonNeumannReconstruct from './VonNeumannReconstruct';
import VonNeumannBusAssignment from './VonNeumannBusAssignment';
import type {TaskStageScore} from '../../../../shared/interfaces/tasking.interfaces';
import {shuffle} from './shared';

type RoundType = 'quiz' | 'functions' | 'reconstruct' | 'busAssignment';

// Generate rounds from JSON data
const generateRounds = (count: number): VonNeumannRound[] => {
  const rounds: VonNeumannRound[] = [];
  const data = vonNeumannData as {
    quizItems: {id: string; label: string; isCore: boolean}[];
    reconstructComponents: string[];
    busComponents: string[];
    idToLabel: Record<string, string>;
    idToDesc: Record<string, string>;
  };

  const generateFunctionPairs = () => {
    const poolIds = ['cpu', 'ram', 'peripherie', 'bus', 'alu', 'control', 'rom'];
    const shuffledIds = shuffle(poolIds);
    const chosenIds = shuffledIds.slice(0, 4);
    const leftItems = chosenIds.map(id => ({id, label: data.idToLabel[id]}));
    const rightItems = shuffle(chosenIds.map(id => ({id, label: data.idToDesc[id]})));

    return {left: leftItems, right: rightItems};
  };

  for (let i = 0; i < count; i++) {
    if (i === 2) {
      rounds.push({
        id: 'vonneumann-reconstruct-3',
        type: 'reconstruct',
        components: data.reconstructComponents,
      });
    } else if (i === 3) {
      rounds.push({
        id: 'vonneumann-bus-4',
        type: 'busAssignment',
        buses: data.busComponents,
      });
    } else {
      const type: RoundType = i % 2 === 0 ? 'quiz' : 'functions';

      if (type === 'quiz') {
        rounds.push({
          id: `vonneumann-quiz-${i + 1}`,
          type: 'quiz',
          items: data.quizItems,
        });
      } else {
        rounds.push({
          id: `vonneumann-functions-${i + 1}`,
          type: 'functions',
          functionPairs: generateFunctionPairs(),
        });
      }
    }
  }

  return rounds;
};

const DEFAULT_ROUNDS = 4;

const VonNeumann: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  onTaskContextChange,
  taskMeta,
}) => {
  const rounds: VonNeumannRound[] = useMemo(
    () => generateRounds(DEFAULT_ROUNDS),
    [],
  );

  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [evaluated, setEvaluated] = useState<boolean>(false);

  // Quiz state
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [shuffledItems, setShuffledItems] = useState<
    {id: string; label: string; isCore: boolean}[]
  >([]);

  // Functions state
  const [functionsScore, setFunctionsScore] = useState<TaskStageScore | null>(
    null,
  );

  // Reconstruct state
  const [reconstructScore, setReconstructScore] = useState<TaskStageScore | null>(
    null,
  );
  const [reconstructResetKey, setReconstructResetKey] = useState<number>(0);
  const [shuffledReconstructComponents, setShuffledReconstructComponents] = useState<
    string[]
  >([]);

  // Bus assignment state
  const [busAssignmentScore, setBusAssignmentScore] = useState<TaskStageScore | null>(
    null,
  );
  const [busAssignmentResetKey, setBusAssignmentResetKey] = useState<number>(0);

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
    setSelected({});
    setEvaluated(false);
    setFunctionsScore(null);
    setReconstructScore(null);
    setBusAssignmentScore(null);
    setReconstructResetKey(prev => prev + 1);
    setBusAssignmentResetKey(prev => prev + 1);

    // Shuffle quiz items if this is a quiz round
    if (current.type === 'quiz' && current.items) {
      setShuffledItems(shuffle(current.items));
    }

    // Shuffle reconstruct components if this is a reconstruct round
    if (current.type === 'reconstruct' && current.components) {
      setShuffledReconstructComponents(shuffle(current.components));
    }
  }, [roundIndex, current]);

  // Update task context for Tim whenever the current task changes
  useEffect(() => {
    if (!current || !hasStarted) {
      onTaskContextChange?.(null);
      return;
    }

    const baseContext = {
      subtaskType: 'VonNeumann',
      taskId: current.id,
      roundIndex: roundIndex,
      roundType: current.type,
    };

    let taskContext: Record<string, unknown> = baseContext;

    if (current.type === 'quiz' && current.items) {
      taskContext = {
        ...baseContext,
        question: 'Wähle die zentralen Komponenten der Von‑Neumann‑Architektur aus.',
        availableItems: current.items.map(item => item.label),
      };
    } else if (current.type === 'functions' && current.functionPairs) {
      // Send the selected component IDs so server can reconstruct the correct matches
      taskContext = {
        ...baseContext,
        question: 'Ordne die Komponenten ihren Funktionen zu.',
        components: current.functionPairs.left.map(item => item.label),
        descriptions: current.functionPairs.right.map(item => item.label),
        selectedComponentIds: current.functionPairs.left.map(item => item.id),
      };
    } else if (current.type === 'reconstruct' && current.components) {
      taskContext = {
        ...baseContext,
        question: 'Rekonstruiere die Von‑Neumann‑Architektur.',
        availableComponents: current.components,
      };
    } else if (current.type === 'busAssignment' && current.buses) {
      taskContext = {
        ...baseContext,
        question: 'Ordne die Bussysteme ihren Funktionen zu.',
        buses: current.buses,
      };
    }

    onTaskContextChange?.(taskContext);
  }, [current, roundIndex, rounds.length, hasStarted, onTaskContextChange]);

  const toggle = (id: string) => {
    setSelected(prev => ({...prev, [id]: !prev[id]}));
  };

  const startTask = useCallback(() => {
    setHasStarted(true);
    reset();
    start();
    setSelected({});
    setEvaluated(false);
    setFunctionsScore(null);
    setReconstructScore(null);
    setBusAssignmentScore(null);
  }, [reset, start]);

  const resetTask = useCallback(() => {
    setSelected({});
    setEvaluated(false);
    setFunctionsScore(null);
    setReconstructScore(null);
    setBusAssignmentScore(null);
    setReconstructResetKey(prev => prev + 1);
    setBusAssignmentResetKey(prev => prev + 1);
    reset();
    start();
  }, [reset, start]);

  const evaluate = useCallback(() => {
    setEvaluated(true);
    stop();

    let correct = 0;
    let total = 1;
    let points = 0;

    if (current.type === 'quiz' && current.items) {
      const totalPossible = current.items.filter(i => i.isCore).length;
      const correctCount = current.items.filter(
        i => selected[i.id] && i.isCore,
      ).length;
      const incorrectCount = current.items.filter(
        i => selected[i.id] && !i.isCore,
      ).length;

      correct = correctCount;
      total = totalPossible;
      points = correctCount - incorrectCount;
    } else if (current.type === 'functions' && functionsScore) {
      correct = functionsScore.correct;
      total = functionsScore.total;
      points = functionsScore.points;
    } else if (current.type === 'reconstruct' && reconstructScore) {
      correct = reconstructScore.correct;
      total = reconstructScore.total;
      points = reconstructScore.points;
    } else if (current.type === 'busAssignment' && busAssignmentScore) {
      correct = busAssignmentScore.correct;
      total = busAssignmentScore.total;
      points = busAssignmentScore.points;
    }

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
    current,
    selected,
    functionsScore,
    reconstructScore,
    busAssignmentScore,
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
      setSelected({});
      setEvaluated(false);
      setFunctionsScore(null);
      setReconstructScore(null);
      setBusAssignmentScore(null);
      start();
    }
  }, [roundIndex, rounds.length, start]);

  // Provide footer controls to parent (stabilized)
  const resetRef = useRef(resetTask);
  const evaluateRef = useRef(evaluate);
  const nextRef = useRef(next);

  useEffect(() => {
    resetRef.current = resetTask;
  }, [resetTask]);
  useEffect(() => {
    evaluateRef.current = evaluate;
  }, [evaluate]);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const onResetStable = useCallback(() => {
    resetRef.current();
  }, []);
  const onEvaluateStable = useCallback(() => {
    evaluateRef.current();
  }, []);
  const onNextStable = useCallback(() => {
    nextRef.current();
  }, []);

  const controls = useMemo(() => {
    if (!hasStarted) return null;
    return {
      onReset: onResetStable,
      onEvaluate: onEvaluateStable,
      onNext: onNextStable,
      showReset: !evaluated,
      showEvaluate: true,
      showNext: evaluated && roundIndex < rounds.length - 1,
      disableReset: evaluated,
      disableEvaluate: evaluated,
      disableNext: !evaluated,
    };
  }, [
    hasStarted,
    evaluated,
    roundIndex,
    rounds.length,
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

  // Unmount-only cleanup
  useEffect(() => {
    return () => {
      onControlsChangeRef.current?.(null);
      onHudChangeRef.current?.(null);
      onTaskContextChange?.(null);
    };
  }, [onTaskContextChange]);

  // Update HUD in parent: subtitle + progress + timer control
  useEffect(() => {
    if (!hasStarted) return;
    let subtitle = 'Kernkomponenten der Von-Neumann Architektur identifizieren';
    if (current.type === 'functions') {
      subtitle = 'Den Kernkomponenten die jeweilige Funktion zuordnen';
    } else if (current.type === 'reconstruct') {
      subtitle = 'Rekonstruiere die Von-Neumann-Architektur';
    } else if (current.type === 'busAssignment') {
      subtitle = 'Verlege die Kommunikationsverbindungen zwischen den Komponenten';
    }
    onHudChangeRef.current?.({
      subtitle,
      progress: {current: roundIndex + 1, total: rounds.length},
      requestTimer: isRunning ? 'start' : undefined,
    });
  }, [hasStarted, roundIndex, rounds.length, isRunning, current.type]);

  // Inform parent HUD about start screen visibility before task starts
  useEffect(() => {
    if (hasStarted) return;
    onHudChangeRef.current?.({
      progress: null,
      isStartScreen: true,
    });
  }, [hasStarted]);

  return (
    <div
      className={`von-quizz ${evaluated && current.type === 'quiz' ? 'is-submitted' : ''}`}>
      {!hasStarted ? (
        <div className="ns-start-overlay">
          <GameStartScreen
            statusTitle="Systemkern fragmentiert!"
            statusDescription={
              <>
                Ein Defekt in der Architektursteuerung hat den logischen Aufbau deines Rechners zerstört. Speicher, Rechenwerk und Steuerwerk sind isoliert – der Informationsfluss steht still.
                <br />
                <br />
                
                <strong>Deine Mission:</strong> Identifiziere die Komponenten und ihre Funktionen, rekonstruiere die Von-Neumann-Architektur und verbinde die Komponenten miteinander, bis der Datenstrom wieder fließt.
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
      ) : current.type === 'quiz' && current.items ? (
        <>
          <ul className="von-quizz__list">
            {shuffledItems.map(item => (
              <li
                key={item.id}
                className={`von-quizz__item ${
                  evaluated && selected[item.id]
                    ? item.isCore
                      ? 'is-correct'
                      : 'is-wrong'
                    : ''
                }`}>
                <button
                  type="button"
                  className={`von-quizz__btn ${selected[item.id] ? 'is-selected' : ''}`}
                  onClick={() => toggle(item.id)}
                  aria-pressed={!!selected[item.id]}
                  aria-label={item.label}
                  disabled={evaluated}>
                  <span
                    className={`von-quizz__radio ${selected[item.id] ? 'is-selected' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="von-quizz__label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : current.type === 'functions' && current.functionPairs ? (
        <VonNeumannFunctions
          left={current.functionPairs.left}
          right={current.functionPairs.right}
          onChange={score => setFunctionsScore(score)}
          evaluated={evaluated}
        />
      ) : current.type === 'reconstruct' && current.components ? (
        <VonNeumannReconstruct
          key={reconstructResetKey}
          components={shuffledReconstructComponents}
          onChange={score => setReconstructScore(score)}
          evaluated={evaluated}
        />
      ) : current.type === 'busAssignment' && current.buses ? (
        <VonNeumannBusAssignment
          key={busAssignmentResetKey}
          buses={current.buses}
          onChange={score => setBusAssignmentScore(score)}
          evaluated={evaluated}
        />
      ) : null}
    </div>
  );
};

export default VonNeumann;
