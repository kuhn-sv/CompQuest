import React, {useCallback, useEffect, useMemo, useState} from 'react';
import './VonNeumannQuiz.component.scss';
import {VonNeumannRound} from './vonneumann.helper';


import VonNeumannQuiz from './VonNeumannQuiz';
import VonNeumannFunctions from './VonNeumannFunctions';
import VonNeumannReconstruct from './VonNeumannReconstruct';
import VonNeumannBusAssignment from './VonNeumannBusAssignment';
import {generateRounds, DEFAULT_ROUNDS} from './vonNeumann.utils';
import { GameStartScreen } from '../../../../shared/components';
import { Difficulty } from '../../../../shared/enums/difficulty.enum';
import { useGameStartScreen, useFooterControls, useHudState } from '../../../../shared/hooks';
import { SubTaskComponentProps, TaskStageScore } from '../../number-representation';
import { shuffle } from '../shared';

const VonNeumann: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  onTaskContextChange,
  taskMeta,
  getElapsed,
}) => {
  const rounds: VonNeumannRound[] = useMemo(
    () => generateRounds(DEFAULT_ROUNDS),
    [],
  );

  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [evaluated, setEvaluated] = useState<boolean>(false);

  // Start-screen lifecycle
  const {hasStarted, startTask: baseStart} = useGameStartScreen({
    onHudChange,
    totalTasks: rounds.length,
  });

  // Quiz state
  const [quizScore, setQuizScore] = useState<TaskStageScore | null>(null);
  const [shuffledItems, setShuffledItems] = useState<
    {id: string; label: string; isCore: boolean}[]
  >([]);

  // Functions state
  const [functionsScore, setFunctionsScore] = useState<TaskStageScore | null>(
    null,
  );

  // Reconstruct state
  const [reconstructScore, setReconstructScore] =
    useState<TaskStageScore | null>(null);
  const [shuffledReconstructComponents, setShuffledReconstructComponents] =
    useState<string[]>([]);

  // Bus assignment state
  const [busAssignmentScore, setBusAssignmentScore] =
    useState<TaskStageScore | null>(null);

  // Single reset key for all sub-components (remounts them on change)
  const [resetKey, setResetKey] = useState<number>(0);

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
    setEvaluated(false);
    setResetKey(prev => prev + 1);

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
        question:
          'Wähle die zentralen Komponenten der Von‑Neumann‑Architektur aus.',
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
        question:
          'Rekonstruiere die Von‑Neumann‑Architektur. Ziehe dafür die Komponenten an ihren Platz.',
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

  const startTask = useCallback(() => {
    baseStart();
    setEvaluated(false);
    setResetKey(prev => prev + 1);
  }, [baseStart]);

  const resetTask = useCallback(() => {
    setEvaluated(false);
    setResetKey(prev => prev + 1);
  }, []);

  const evaluate = useCallback(() => {
    setEvaluated(true);

    let correct = 0;
    let total = 1;
    let points = 0;

    if (current.type === 'quiz' && quizScore) {
      correct = quizScore.correct;
      total = quizScore.total;
      points = quizScore.points;
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
      const elapsedMs = getElapsed?.() ?? 0;
      const base = [...stageScores];
      base[roundIndex] = {difficulty, correct, total, points};

      onSummaryChange?.({
        elapsedMs,
        perStage: base.map(s => ({...s, difficulty: s.difficulty})),
      });
    }
  }, [
    current,
    quizScore,
    functionsScore,
    reconstructScore,
    busAssignmentScore,
    getElapsed,
    onSummaryChange,
    roundIndex,
    rounds.length,
    stageScores,
  ]);

  const next = useCallback(() => {
    if (roundIndex < rounds.length - 1) {
      setRoundIndex(roundIndex + 1);
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
    let subtitle = 'Kernkomponenten der Von-Neumann Architektur identifizieren';
    if (current.type === 'functions') {
      subtitle = 'Den Kernkomponenten die jeweilige Funktion zuordnen';
    } else if (current.type === 'reconstruct') {
      subtitle =
        'Rekonstruiere die Von‑Neumann‑Architektur. Ziehe dafür die Komponenten an ihren Platz.';
    } else if (current.type === 'busAssignment') {
      subtitle =
        'Verlege die Kommunikationsverbindungen zwischen den Komponenten';
    }
    return {
      subtitle,
      progress: {current: roundIndex + 1, total: rounds.length},
    };
  }, [hasStarted, roundIndex, rounds.length, current.type]);
  useHudState(onHudChange, hudState);

  // Cleanup task context on unmount
  useEffect(() => {
    return () => {
      onTaskContextChange?.(null);
    };
  }, [onTaskContextChange]);

  return (
    <div
      className={`von-quizz ${evaluated && current.type === 'quiz' ? 'is-submitted' : ''}`}>
      {!hasStarted ? (
        <GameStartScreen
          statusTitle="Systemkern fragmentiert!"
          statusDescription={
            <>
              Ein Defekt in der Architektursteuerung hat den logischen Aufbau
              deines Rechners zerstört. Speicher, Rechenwerk und Steuerwerk sind
              isoliert – der Informationsfluss steht still.
              <br />
              <br />
              <strong>Deine Mission:</strong> Identifiziere die Komponenten und
              ihre Funktionen, rekonstruiere die Von-Neumann-Architektur und
              verbinde die Komponenten miteinander, bis der Datenstrom wieder
              fließt.
            </>
          }
          taskCount={rounds.length}
          estimatedTime="~8 min"
          fetchBestAttempt
          taskId={taskMeta?.id}
          onStart={startTask}
          startLabel="Quiz starten"
        />
      ) : current.type === 'quiz' && current.items ? (
        <VonNeumannQuiz
          key={resetKey}
          items={shuffledItems}
          onChange={score => setQuizScore(score)}
          evaluated={evaluated}
        />
      ) : current.type === 'functions' && current.functionPairs ? (
        <VonNeumannFunctions
          key={resetKey}
          left={current.functionPairs.left}
          right={current.functionPairs.right}
          onChange={score => setFunctionsScore(score)}
          evaluated={evaluated}
        />
      ) : current.type === 'reconstruct' && current.components ? (
        <VonNeumannReconstruct
          key={resetKey}
          components={shuffledReconstructComponents}
          onChange={score => setReconstructScore(score)}
          evaluated={evaluated}
        />
      ) : current.type === 'busAssignment' && current.buses ? (
        <VonNeumannBusAssignment
          key={resetKey}
          buses={current.buses}
          onChange={score => setBusAssignmentScore(score)}
          evaluated={evaluated}
        />
      ) : null}
    </div>
  );
};

export default VonNeumann;
