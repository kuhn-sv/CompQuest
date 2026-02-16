import React, {useCallback, useEffect, useMemo, useState} from 'react';
import './VonNeumannQuiz.component.scss';
import {VonNeumannRound} from './vonneumann.helper';


import VonNeumannQuiz from './VonNeumannQuiz';
import VonNeumannFunctions from './VonNeumannFunctions';
import VonNeumannReconstruct from './VonNeumannReconstruct';
import VonNeumannBusAssignment from './VonNeumannBusAssignment';
import {generateRounds, DEFAULT_ROUNDS} from './vonNeumann.utils';
import { GameStartScreen } from '../../shared/components';
import { Difficulty } from '@shared/enums/difficulty.enum';
import { useGameStartScreen, useFooterControls, useHudState } from '@shared/hooks';
import { SubTaskComponentProps, TaskStageScore } from '../../number-representation';
import { shuffle } from '../shared';
import { TaskContext } from '@/shared/interfaces/tasking.interfaces';

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

  const [currentRoundScore, setCurrentRoundScore] = useState<TaskStageScore | null>(null);

  const handleScoreChange = useCallback((score: TaskStageScore | null) => {
    setCurrentRoundScore(score);
  }, []);

  const [shuffledItems, setShuffledItems] = useState<
    {id: string; label: string; isCore: boolean}[]
  >([]);

  const [shuffledReconstructComponents, setShuffledReconstructComponents] =
    useState<string[]>([]);

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
    setCurrentRoundScore(null); // Reset score for new round
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
      taskTitle: 'Von-Neumann-Architektur', // Generic title for this subtask type
    };

    let taskContext: TaskContext;

    if (current.type === 'quiz' && current.items) {
      taskContext = {
        ...baseContext,
        description: 'Wähle die zentralen Komponenten der Von‑Neumann‑Architektur aus.',
        contextData: {
            roundType: current.type,
            roundIndex: roundIndex,
            availableItems: current.items.map(item => item.label),
        },
        solution: {
            correctItems: current.items.filter(i => i.isCore).map(i => i.label)
        }
      };
    } else if (current.type === 'functions' && current.functionPairs) {
      taskContext = {
        ...baseContext,
        description: 'Ordne die Komponenten ihren Funktionen zu.',
        contextData: {
            roundType: current.type,
            roundIndex: roundIndex,
            components: current.functionPairs.left.map(item => item.label),
            descriptions: current.functionPairs.right.map(item => item.label),
        },
        userState: {
           // We could track current selection here if we had access to it easily, 
           // but for now we only send setup data.
        },
        solution: {
            // Map Id to Description for verification
            correctMatches: current.functionPairs.left.reduce((acc, item) => {
                const partner = current.functionPairs!.right.find(r => r.id === item.id);
                if (partner) acc[item.label] = partner.label;
                return acc;
            }, {} as Record<string, string>)
        }
      };
    } else if (current.type === 'reconstruct' && current.components) {
      taskContext = {
        ...baseContext,
        description: 'Rekonstruiere die Von‑Neumann‑Architektur. Ziehe dafür die Komponenten an ihren Platz.',
        contextData: {
            roundType: current.type,
            roundIndex: roundIndex,
            availableComponents: current.components,
        },
        solution: {
            correctPlacements: {
                cpuZones: ['Steuerwerk', 'Rechenwerk'],
                transportZone: 'Transportmedium',
                bottomZones: ['RAM', 'ROM', 'Peripherie'],
            }
        }
      };
    } else if (current.type === 'busAssignment' && current.buses) {
      taskContext = {
        ...baseContext,
        description: 'Ordne die Bussysteme ihren Funktionen zu.',
        contextData: {
            roundType: current.type,
            roundIndex: roundIndex,
            buses: current.buses,
        },
        solution: {
            correctAssignments: {
                leftZone: 'Datenbus',
                rightZones: ['Adressbus', 'Steuerbus'],
            }
        }
      };
    } else {
        // Fallback for unknown types to satisfy TS
        taskContext = {
            ...baseContext,
            contextData: { roundType: current.type }
        };
    }

    onTaskContextChange?.(taskContext);
  }, [current, roundIndex, rounds.length, hasStarted, onTaskContextChange]);

  const startTask = useCallback(() => {
    baseStart();
    setEvaluated(false);
    setCurrentRoundScore(null);
    setResetKey(prev => prev + 1);
  }, [baseStart]);

  const resetTask = useCallback(() => {
    setEvaluated(false);
    setCurrentRoundScore(null);
    setResetKey(prev => prev + 1);
  }, []);

  const evaluate = useCallback(() => {
    setEvaluated(true);

    let correct = 0;
    let total = 1;
    let points = 0;

    if (currentRoundScore) {
      correct = currentRoundScore.correct;
      total = currentRoundScore.total;
      points = currentRoundScore.points;
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
    currentRoundScore,
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
          statusTitle="Systemarchitektur verloren!"
          statusDescription={
            <>
              „Das Steuerwerk hat die Systemarchitektur verloren! Der Computer weiß nicht mehr, wie seine Komponenten zusammenarbeiten. Ohne dieses Grundwissen kann er keine Programme ausführen."
              <br />
              <br />
              <strong>Ziel der Reparatur:</strong> Beantworte Quiz-Fragen zur Von-Neumann-Architektur. Zeige, dass du die Komponenten (Steuerwerk, Rechenwerk, Speicher, Ein-/Ausgabe) und ihr Zusammenspiel verstehst, damit das System wieder koordiniert arbeiten kann.
            </>
          }
          taskCount={rounds.length}
          estimatedTime={taskMeta?.timeLimit ?? 0}
          fetchBestAttempt
          taskId={taskMeta?.id}
          onStart={startTask}
          startLabel="Quiz starten"
        />
      ) : current.type === 'quiz' && current.items ? (
        <VonNeumannQuiz
          key={resetKey}
          items={shuffledItems}
          onChange={handleScoreChange}
          evaluated={evaluated}
        />
      ) : current.type === 'functions' && current.functionPairs ? (
        <VonNeumannFunctions
          key={resetKey}
          left={current.functionPairs.left}
          right={current.functionPairs.right}
          onChange={handleScoreChange}
          evaluated={evaluated}
        />
      ) : current.type === 'reconstruct' && current.components ? (
        <VonNeumannReconstruct
          key={resetKey}
          components={shuffledReconstructComponents}
          onChange={handleScoreChange}
          evaluated={evaluated}
        />
      ) : current.type === 'busAssignment' && current.buses ? (
        <VonNeumannBusAssignment
          key={resetKey}
          buses={current.buses}
          onChange={handleScoreChange}
          evaluated={evaluated}
        />
      ) : null}
    </div>
  );
};

export default VonNeumann;
