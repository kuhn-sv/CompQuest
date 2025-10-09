import React, { useEffect, useMemo, useState } from 'react';
import '../number-system/number-system.page.scss';
import './complements.page.scss';
import BitToggleRow from './components/BitToggleRow';
// Footer buttons rendered by parent
import type { SubTaskComponentProps } from '../interfaces';
import { useTimer } from '../../../../shared/hooks';
import { generateRounds, ComplementRound, invertBits, twosComplement, bitsToString } from './complements.helper.ts';

type Round = ComplementRound;

const DEFAULT_BIT_COUNT = 8;

const ComplementsComponent: React.FC<SubTaskComponentProps> = ({ onControlsChange, onHudChange }) => {
  const rounds: Round[] = useMemo(() => generateRounds(4, DEFAULT_BIT_COUNT), []);
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [bits, setBits] = useState<number[]>(Array(DEFAULT_BIT_COUNT).fill(0));
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const { isRunning, start, stop, reset } = useTimer();

  const current = rounds[roundIndex];

  const expectedBits = useMemo(() => {
    if (current.mode === 'ones') return invertBits(current.sourceBits);
    return twosComplement(current.sourceBits);
  }, [current]);

  const isCorrect = evaluated && bitsToString(bits) === bitsToString(expectedBits);

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
  }, [stop]);

  const next = React.useCallback(() => {
    if (roundIndex < rounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex);
  setBits(Array(rounds[nextIndex].bitCount).fill(0));
      setEvaluated(false);
      start();
    }
  }, [roundIndex, rounds, start]);

  // Provide footer controls to parent
  useEffect(() => {
    if (!hasStarted) {
      onControlsChange?.(null);
      onHudChange?.(null);
      return;
    }
    onControlsChange?.({
      onReset: resetTask,
      onEvaluate: evaluate,
      onNext: next,
      showReset: !evaluated,
      showEvaluate: true,
      showNext: evaluated && roundIndex < rounds.length - 1,
      disableReset: evaluated, // disable reset after evaluation
      disableEvaluate: evaluated, // disable evaluate after evaluation
      disableNext: !evaluated, // next only after evaluation
    });
    return () => {
      onControlsChange?.(null);
      onHudChange?.(null);
    };
  }, [hasStarted, evaluated, roundIndex, rounds.length, isCorrect, expectedBits, onControlsChange, onHudChange, resetTask, evaluate, next]);

  // Update HUD in parent: subtitle + progress + timer control
  useEffect(() => {
    if (!hasStarted) return;
    onHudChange?.({
      subtitle: 'Datenfluss wiederherstellen',
      progress: { current: roundIndex + 1, total: rounds.length },
      requestTimer: isRunning ? 'start' : undefined,
    });
  }, [hasStarted, roundIndex, rounds.length, isRunning, onHudChange]);

  return (
    <div className="number-system-container complements-container">
      <div className="ns-header">
        <h1>Einer- & Zweierkomplement – Übung 1.3</h1>
      </div>

      {/* Header timer/progress moved to container */}

      {hasStarted && (
      <div className="complements-content">
        <div className="target-box" aria-label="Ziel Binärzahl">
          Ausgang: <strong className="mono">{bitsToString(current.sourceBits)}</strong>
          <div className="sub">
            Modus: {current.mode === 'ones' ? 'Einerkomplement' : 'Zweierkomplement'}
          </div>
        </div>
        <div className={`bits-frame ${evaluated ? (isCorrect ? 'success' : 'error') : ''} ${evaluated ? 'evaluated' : ''}`}>
          <BitToggleRow bits={bits} onChange={setBits} className="bits-box" disabled={evaluated} />
          <div className="bits-frame__overlay" aria-hidden="true" />
        </div>
        {evaluated && (
          <div className="info-line">
            <span className={`expected ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect ? '✓ richtig' : `✗ erwartet: ${bitsToString(expectedBits)}`}
            </span>
          </div>
        )}
      </div>
      )}

      {/* Controls moved to parent footer */}

      {!hasStarted && (
        <div className="ns-start-overlay">
          <button className="ns-start-button" onClick={startTask} aria-label="Aufgabe starten">Start</button>
        </div>
      )}
    </div>
  );
};

export default ComplementsComponent;
