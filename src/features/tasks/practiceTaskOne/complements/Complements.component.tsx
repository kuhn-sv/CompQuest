import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import '../number-system/number-system.page.scss';
import './complements.page.scss';
import BitToggleRow from '../../../../shared/components/bitToggleRow/BitToggleRow.tsx';
import GameStartScreen from '../../../../shared/components/startScreen/GameStartScreen.component.tsx';
// Footer buttons rendered by parent
import type {SubTaskComponentProps} from '../interfaces';
import {useTimer} from '../../../../shared/hooks';
import {
  generateRounds,
  ComplementRound,
  invertBits,
  twosComplement,
  bitsToString,
} from './complements.helper.ts';
import {Difficulty} from '../../../../shared/enums/difficulty.enum';

type Round = ComplementRound;

const DEFAULT_BIT_COUNT = 8;

const ComplementsComponent: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
  taskMeta,
  onTaskContextChange,
}) => {
  const rounds: Round[] = useMemo(
    () => generateRounds(4, DEFAULT_BIT_COUNT),
    [],
  );
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [bits, setBits] = useState<number[]>(Array(DEFAULT_BIT_COUNT).fill(0));
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const {isRunning, start, stop, reset, getElapsed} = useTimer();

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

  const startTask = React.useCallback(() => {
    setHasStarted(true);
    reset();
    start();
    setBits(Array(current.bitCount).fill(0));
    setEvaluated(false);
  }, [current.bitCount, reset, start]);

  const resetTask = React.useCallback(() => {
    setBits(Array(current.bitCount).fill(0));
    setEvaluated(false);
    reset();
    start();
  }, [current.bitCount, reset, start]);

  const evaluate = React.useCallback(() => {
    setEvaluated(true);
    stop();
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
      const elapsedMs = getElapsed();
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
    stop,
  ]);

  const next = React.useCallback(() => {
    if (roundIndex < rounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex);
      setBits(Array(rounds[nextIndex].bitCount).fill(0));
      setEvaluated(false);
      start();
    }
  }, [roundIndex, rounds, start]);

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

  // Unmount-only cleanup (use refs to avoid re-running on parent callback identity changes)
  useEffect(() => {
    return () => {
      onControlsChangeRef.current?.(null);
      onHudChangeRef.current?.(null);
    };
  }, []);

  // Update HUD in parent: subtitle + progress + timer control
  useEffect(() => {
    if (!hasStarted) return;
    onHudChangeRef.current?.({
      subtitle: 'Datenfluss wiederherstellen',
      progress: {current: roundIndex + 1, total: rounds.length},
      requestTimer: isRunning ? 'start' : undefined,
    });
  }, [hasStarted, roundIndex, rounds.length, isRunning]);

  // Inform parent HUD about start screen visibility before task starts
  useEffect(() => {
    if (hasStarted) return;
    onHudChangeRef.current?.({
      progress: null,
      isStartScreen: true,
    });
  }, [hasStarted]);

  // Provide current round context to AskTim
  useEffect(() => {
    if (!onTaskContextChange) return;
    if (!hasStarted) {
      onTaskContextChange(null);
      return;
    }
    const ctx = {
      title: taskMeta?.title ?? 'Einer-/Zweierkomplement',
      round: roundIndex + 1,
      totalRounds: rounds.length,
      mode: current.mode,
      sourceBits: bitsToString(current.sourceBits),
      bitCount: current.bitCount,
    } as const;
    onTaskContextChange(ctx);
    return () => onTaskContextChange(null);
  }, [
    onTaskContextChange,
    hasStarted,
    roundIndex,
    current,
    taskMeta,
    rounds.length,
  ]);

  return (
    <div className="number-system-container complements-container">
      <div className="ns-header">
        <h1>Einer- & Zweierkomplement – Übung 1.3</h1>
      </div>

      {/* Header timer/progress moved to container */}

      {hasStarted && (
        <div className="complements-content">
          <div className="target-box" aria-label="Ziel Binärzahl">
            Ausgang:{' '}
            <strong className="mono">{bitsToString(current.sourceBits)}</strong>
            <div className="sub">
              Modus:{' '}
              {current.mode === 'ones' ? 'Einerkomplement' : 'Zweierkomplement'}
            </div>
          </div>
          <div
            className={`bits-frame ${evaluated ? (isCorrect ? 'success' : 'error') : ''} ${evaluated ? 'evaluated' : ''}`}>
            <BitToggleRow
              bits={bits}
              onChange={setBits}
              className="bits-row"
              disabled={evaluated}
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
        <div className="ns-start-overlay">
          <GameStartScreen
            statusTitle="Bit-Inversion erforderlich!"
            statusDescription={
              <>
                Einige Speicherzellen enthalten defekte oder invertierte Werte.
                Um die Signale wieder korrekt zu interpretieren, musst du ihre
                Komplementdarstellungen erzeugen.
                <br />
                <br />
                <strong>Deine Mission:</strong> Entsprechend dem Modus erzeuge
                die Einer-/ Zweierkomplement, um den Speicher wieder
                funktionsfähig zu machen.
              </>
            }
            taskCount={rounds.length}
            estimatedTime="~5 min"
            fetchBestAttempt
            taskId={taskMeta?.id}
            onStart={startTask}
            startLabel="Mission starten"
          />
        </div>
      )}

      {/* Summary overlay moved to container */}
    </div>
  );
};

export default ComplementsComponent;
