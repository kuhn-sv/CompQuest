import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import '../number-system/number-system.page.scss';
import './complements.page.scss';
import {computeEvalStates} from '@shared/utils/evalStates';
import TargetValueDisplay from '../../../../features/tasks/shared/components/target-value-display/TargetValueDisplay.component';
import {GameStartScreen} from '../../../../features/tasks/shared/components';
// Footer buttons rendered by parent
import type {SubTaskComponentProps} from '../interfaces';
import {useGameStartScreen, useHudState} from '@shared/hooks';
import {
  generateRounds,
  ComplementRound,
  invertBits,
  twosComplement,
  bitsToString,
} from './complements.helper.ts';
import {Difficulty} from '@shared/enums/difficulty.enum';
import { BitToggleRow } from '@/shared/components/index.ts';
import { TaskContext } from '@/shared/interfaces/tasking.interfaces.ts';

type Round = ComplementRound;

const DEFAULT_BIT_COUNT = 8;

const ComplementsComponent: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  taskMeta,
  onTaskContextChange,
  getElapsed,
}) => {
  const rounds: Round[] = useMemo(
    () => generateRounds(4, DEFAULT_BIT_COUNT),
    [],
  );
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [bits, setBits] = useState<number[]>(Array(DEFAULT_BIT_COUNT).fill(0));
  const [evaluated, setEvaluated] = useState<boolean>(false);

  // Start-screen lifecycle
  const {hasStarted, startTask} = useGameStartScreen({
    onHudChange,
    totalTasks: rounds.length,
    subtitle: 'Datenfluss wiederherstellen',
  });

  // Accumulate per-round scores and final summary
  const [stageScores, setStageScores] = useState<
    Array<{
      difficulty: Difficulty;
      correct: number;
      total: number;
      points: number;
    }>
  >([]);

  const current = rounds[roundIndex];

  const expectedBits = useMemo(() => {
    if (current.mode === 'ones') return invertBits(current.sourceBits);
    return twosComplement(current.sourceBits);
  }, [current]);

  const isCorrect =
    evaluated && bitsToString(bits) === bitsToString(expectedBits);

  const bitStates = computeEvalStates(bits, expectedBits, evaluated);

  const startTaskHandler = React.useCallback(() => {
    startTask();
    setBits(Array(current.bitCount).fill(0));
    setEvaluated(false);
  }, [startTask, current.bitCount]);

  const resetTask = React.useCallback(() => {
    setBits(Array(current.bitCount).fill(0));
    setEvaluated(false);
  }, [current.bitCount]);

  const evaluate = React.useCallback(() => {
    setEvaluated(true);
    const correct = bitsToString(bits) === bitsToString(expectedBits) ? 1 : 0;
    const total = 1;
    const points = correct;
    const difficulty = Difficulty.Easy; // Complements rounds have uniform difficulty for now

    setStageScores(prev => {
      const next = [...prev];
      next[roundIndex] = {difficulty, correct, total, points};
      return next;
    });

    // If last round, compute final result and emit to container
    if (roundIndex === rounds.length - 1) {
      const elapsedMs = getElapsed?.() ?? 0;
      const baseScores = (() => {
        const base = [...stageScores];
        base[roundIndex] = {difficulty, correct, total, points};
        return base;
      })();
      onSummaryChange?.({
        elapsedMs,
        perStage: baseScores.map(s => ({...s, difficulty: s.difficulty})),
      });
    }
  }, [
    bits,
    expectedBits,
    getElapsed,
    onSummaryChange,
    roundIndex,
    rounds.length,
    stageScores,
  ]);

  const next = React.useCallback(() => {
    if (roundIndex < rounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex);
      setBits(Array(rounds[nextIndex].bitCount).fill(0));
      setEvaluated(false);
    }
  }, [roundIndex, rounds]);

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
      showReset: true,
      showEvaluate: !evaluated,
      showNext: evaluated && roundIndex < rounds.length - 1,
      disableReset: evaluated,
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
  useEffect(() => {
    onControlsChangeRef.current = onControlsChange;
  }, [onControlsChange]);
  useEffect(() => {
    if (!onControlsChangeRef.current) return;
    if (prevControlsRef.current !== controls) {
      onControlsChangeRef.current(controls);
      prevControlsRef.current = controls;
    }
  }, [controls]);

  // Unmount-only cleanup (use refs to avoid re-running on parent callback identity changes)
  useEffect(() => {
    return () => {
      onControlsChangeRef.current?.(null);
    };
  }, []);

  // HUD state (stabilised via hook)
  const hudState = useMemo(() => {
    if (!hasStarted) return {progress: null, isStartScreen: true} as const;
    return {
      subtitle: 'Datenfluss wiederherstellen',
      progress: {current: roundIndex + 1, total: rounds.length},
    };
  }, [hasStarted, roundIndex, rounds.length]);
  useHudState(onHudChange, hudState);

  // Provide current round context to AskTim
  useEffect(() => {
    if (!onTaskContextChange) return;
    if (!hasStarted) {
      onTaskContextChange(null);
      return;
    }

    const taskContext: TaskContext = {
      subtaskType: 'Complements', // New type, needs to be handled in ask-tim if specific logic is needed, or just use generic
      taskId: taskMeta?.id || 'Complements',
      taskTitle: taskMeta?.title ?? 'Einer-/Zweierkomplement',
      description: current.mode === 'ones' ? 'Bilden Sie das Einerkomplement.' : 'Bilden Sie das Zweierkomplement.',
      contextData: {
          round: roundIndex + 1,
          totalRounds: rounds.length,
          mode: current.mode,
          sourceBits: bitsToString(current.sourceBits),
          bitCount: current.bitCount,
      },
      userState: {
          currentBits: bitsToString(bits)
      },
      solution: {
          expectedBits: bitsToString(expectedBits)
      }
    };
    onTaskContextChange(taskContext);
    return () => onTaskContextChange(null);
  }, [
    onTaskContextChange,
    hasStarted,
    roundIndex,
    current,
    taskMeta,
    rounds.length,
    bits,
    expectedBits
  ]);

  return (
    <div className="number-system-container complements-container">
      <div className="ns-header">
        <h1>Einer- & Zweierkomplement – Übung 1.3</h1>
      </div>

      {/* Header timer/progress moved to container */}

      {hasStarted && (
        <div className="complements-content">
          <TargetValueDisplay
            value={bitsToString(current.sourceBits)}
            subLabel="Modus"
            subValue={current.mode === 'ones' ? 'Einerkomplement' : 'Zweierkomplement'}
            className="target-box"
          />
          <div
            className={`bits-frame ${evaluated ? (isCorrect ? 'success' : 'error') : ''} ${evaluated ? 'evaluated' : ''}`}>
            <BitToggleRow
              bits={bits}
              onChange={setBits}
              className="bits-row"
              disabled={evaluated}
              bitStates={bitStates}
            />
            <div className="bits-frame__overlay" aria-hidden="true" />
          </div>
          {evaluated && (
            <div className="info-line">
              <span className={`expected ${isCorrect ? 'correct' : 'wrong'}`}>
                {isCorrect
                  ? '✓ richtig'
                  : `✗ erwartet: ${bitsToString(expectedBits)}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Controls moved to parent footer */}

      {!hasStarted && (
        <GameStartScreen
          statusTitle="Bit-Inversion erforderlich!"
          statusDescription={
            <>
              Einige Speicherzellen enthalten defekte oder invertierte Werte. Um
              die Signale wieder korrekt zu interpretieren, musst du ihre
              Komplementdarstellungen erzeugen.
              <br />
              <br />
              <strong>Deine Mission:</strong> Entsprechend dem Modus erzeuge die
              Einer-/ Zweierkomplement, um den Speicher wieder funktionsfähig zu
              machen.
            </>
          }
          taskCount={rounds.length}
          estimatedTime={taskMeta?.timeLimit ?? 0}
          fetchBestAttempt
          taskId={taskMeta?.id}
          onStart={startTaskHandler}
          startLabel="Mission starten"
        />
      )}

      {/* Summary overlay moved to container */}
    </div>
  );
};

export default ComplementsComponent;
