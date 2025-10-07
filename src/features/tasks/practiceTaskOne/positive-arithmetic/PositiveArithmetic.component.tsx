import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../number-system/number-system.page.scss';
import { ConnectionOverlay, Timer } from '../../../../shared/components';
import { useTimer } from '../../../../shared/hooks';

// Temporary interfaces to mirror the staged flow and evaluation pattern.
// You can extend this later with actual arithmetic tasks and logic.
interface PAStageScore {
  stage: number;
  correct: number;
  total: number;
  points: number;
}

interface PAResultSummary {
  elapsedMs: number;
  withinThreshold: boolean;
  timeBonus: number;
  perStage: PAStageScore[];
  totalCorrect: number;
  totalPossible: number;
  totalPoints: number;
}

const PositiveArithmeticComponent: React.FC = () => {
  // 3-stage flow to mirror NumberSystem UX
  const stages = [0, 1, 2];
  const [stageIndex, setStageIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [evaluated, setEvaluated] = useState(false);
  const [stageScores, setStageScores] = useState<PAStageScore[]>([]);
  const [finalResult, setFinalResult] = useState<PAResultSummary | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Config: 3 minutes threshold = 180000 ms, 1 point bonus
  const timeBonusThresholdMs = useMemo(() => 3 * 60 * 1000, []);
  const timeBonusPoints = 1;

  const { time, isRunning, start, stop, reset, formatTime, getElapsed } = useTimer();

  // Placeholder task state per stage; replace with actual arithmetic generation later.
  // For now, we simulate 4 pairs per stage and allow immediate evaluation.
  const totalPerStage = 4;
  const [correctSimulated, setCorrectSimulated] = useState(0);

  const startStage = useCallback((_idx: number, opts?: { resetTimer?: boolean }) => {
    const { resetTimer: shouldResetTimer = true } = opts ?? {};
    setEvaluated(false);
    setCorrectSimulated(0);
    if (shouldResetTimer) {
      reset();
    }
    start();
  }, [reset, start]);

  const handleInitialStart = () => {
    setHasStarted(true);
    setStageIndex(0);
    startStage(0, { resetTimer: true });
  };

  const evaluate = () => {
    setEvaluated(true);
    stop();

    const correct = correctSimulated; // replace with real check later
    const total = totalPerStage;
    const points = correct;

    const updated = [...stageScores];
    updated[stageIndex] = { stage: stageIndex + 1, correct, total, points };
    setStageScores(updated);

    if (stageIndex === stages.length - 1) {
      const elapsedMs = getElapsed();
      const withinThreshold = elapsedMs <= timeBonusThresholdMs;
      const timeBonus = withinThreshold ? timeBonusPoints : 0;
      const totalCorrect = updated.reduce((s, x) => s + (x?.correct ?? 0), 0);
      const totalPossible = updated.reduce((s, x) => s + (x?.total ?? 0), 0);
      const totalPoints = totalCorrect + timeBonus;
      setFinalResult({ elapsedMs, withinThreshold, timeBonus, perStage: updated, totalCorrect, totalPossible, totalPoints });
    }
  };

  const goToNextStage = () => {
    if (stageIndex < stages.length - 1) {
      const next = stageIndex + 1;
      setStageIndex(next);
      startStage(next, { resetTimer: false });
    }
  };

  return (
    <div className="number-system-container">
      <div className="ns-header">
        <Link to="/dashboard" className="back-to-dashboard">← Zurück zum Dashboard</Link>
        <h1>Positive Arithmetik – Übung 1.2</h1>
      </div>

      {hasStarted && (
        <div className="ns-timer-section">
          <div className="ns-titles">
            <div className="ns-title">Additionen und Subtraktionen (positiv)</div>
            <div className="ns-subtitle">Löse die Aufgaben pro Stufe und werte aus.</div>
          </div>
          <Timer 
            time={time}
            isRunning={isRunning}
            formatTime={formatTime}
            getElapsed={getElapsed}
            className="ns-timer"
          />
          <div className="task-progress-info">
            <span className="progress-text">Aufgabe {stageIndex + 1} / {stages.length}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      {hasStarted && (
        <div className="ns-content" ref={containerRef}>
          <div className="equations-and-results">
            <div className="equations-section">
              {/* Placeholder content; swap with actual arithmetic problems later */}
              <div className="equation-row">Aufgaben hier platzieren (Stufe {stageIndex + 1})</div>
            </div>
            <div className="results-section">
              <div className="result-item">
                Simulierte Korrekte: 
                <button onClick={() => setCorrectSimulated((c) => Math.min(totalPerStage, c + 1))}>+1</button>
                <button onClick={() => setCorrectSimulated((c) => Math.max(0, c - 1))}>-1</button>
                <strong style={{ marginLeft: 8 }}>{correctSimulated} / {totalPerStage}</strong>
              </div>
            </div>
          </div>

          <ConnectionOverlay connectionLines={[]} />

          <div className="ns-controls">
            <div className="actions">
              {/* No reset needed for placeholder; add later when tasks exist */}
              <button onClick={evaluate}>Auswerten</button>
              {evaluated && stageIndex < stages.length - 1 && (
                <button onClick={goToNextStage}>Weiter</button>
              )}
            </div>
            {evaluated && (
              <div className="result">Ergebnis: {correctSimulated} / {totalPerStage} richtig</div>
            )}
          </div>
        </div>
      )}

      {!hasStarted && (
        <div className="ns-start-overlay">
          <button className="ns-start-button" onClick={handleInitialStart} aria-label="Aufgabe starten">Start</button>
        </div>
      )}

      {finalResult && (
        <div className="ns-summary-overlay" role="dialog" aria-modal="true">
          <div className="ns-summary-card">
            <h2>Auswertung</h2>
            <div className="ns-summary-row">
              <span>Zeit:</span>
              <strong>{formatTime(finalResult.elapsedMs)}</strong>
            </div>
            <div className="ns-summary-row">
              <span>Grenze für Bonus:</span>
              <strong>{formatTime(timeBonusThresholdMs)} ({finalResult.withinThreshold ? 'unter' : 'über'})</strong>
            </div>
            <hr />
            <div className="ns-summary-stages">
              {finalResult.perStage.map((s, idx) => (
                <div key={idx} className="ns-summary-row">
                  <span>Stufe {s.stage}:</span>
                  <strong>{s.correct} / {s.total} Punkte</strong>
                </div>
              ))}
            </div>
            <hr />
            <div className="ns-summary-row">
              <span>Gesamt (Antworten):</span>
              <strong>{finalResult.totalCorrect} / {finalResult.totalPossible}</strong>
            </div>
            <div className="ns-summary-row">
              <span>Zeitbonus:</span>
              <strong>{finalResult.timeBonus}</strong>
            </div>
            <div className="ns-summary-total">
              <span>Gesamtpunkte:</span>
              <strong>{finalResult.totalPoints}</strong>
            </div>
            <div className="ns-summary-actions">
              <Link to="/dashboard" className="button">Beenden</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositiveArithmeticComponent;
