// filepath: c:\Users\Nutzer\Desktop\Uni\Neuer Ordner\CompQuest\src\shared\components\startScreen\GameStartScreen.component.tsx
import React from 'react';
import './GameStartScreen.component.scss';

export interface BestAttempt {
  timeMs: number;
  accuracyPercent: number; // 0-100
  points: number;
  // Optional metadata for later use
  date?: string | Date;
}

export interface GameStartScreenProps {
  // Main status block on the left
  statusTitle: string;
  statusDescription: string | React.ReactNode;

  // Quick facts on the right
  taskCount: number;
  estimatedTime: string; // display-ready, e.g. "~5 min"

  // Optional best attempt summary
  bestAttempt?: BestAttempt | null;

  // Start CTA
  onStart: () => void;
  startLabel?: string; // default: "Mission starten"

  className?: string;
}

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const GameStartScreen: React.FC<GameStartScreenProps> = ({
  statusTitle,
  statusDescription,
  taskCount,
  estimatedTime,
  bestAttempt,
  onStart,
  startLabel = 'Mission starten',
  className,
}) => {
  return (
    <div className={`game-start-screen ${className ?? ''}`.trim()}>
      <div className="gss-card">
        <div className="gss-left">
          <div className="gss-status">
            <div className="gss-status-texts">
              <div className="gss-status-title">
                <div className="gss-status-title-icon">
                  <img src="/error_logo.svg" alt="Error Zeichen" />
                </div>

                <div className="gss-status-title-text">{statusTitle}</div>
              </div>
              <div className="gss-status-desc">{statusDescription}</div>
            </div>
          </div>
          <div className="gss-character" aria-hidden>
            <img src="/timothy.svg" alt="" />
          </div>
        </div>

        <div className="gss-right">
          <div className="gss-facts">
            <div className="gss-fact">
              <div className="gss-fact-icon">🎯 </div>
              <div className="ggs-fact-text">
                <div className="label">Aufgaben</div>
                <div className="value">{taskCount}</div>
              </div>
            </div>
            <div className="gss-fact">
              <div className="gss-fact-icon">⏱️</div>
              <div className="ggs-fact-text">
                <div className="label">Geschätzte Zeit</div>
                <div className="value">{estimatedTime}</div>
              </div>
            </div>
          </div>

          <div className="gss-best">
            <div className="gss-best-title">
              <img src="/trophy.svg" alt="" />
              Bester Versuch
            </div>
            {bestAttempt ? (
              <div className="gss-best-stats">
                <div className="stat">
                  <span>Zeit</span>
                  <strong>{formatDuration(bestAttempt.timeMs)}</strong>
                </div>
                <div className="stat">
                  <span>Genauigkeit</span>
                  <strong>{Math.round(bestAttempt.accuracyPercent)}%</strong>
                </div>
                <div className="stat">
                  <span>Punkte</span>
                  <strong>{bestAttempt.points}</strong>
                </div>
              </div>
            ) : (
              <div className="gss-best-empty">
                Noch keinen Versuch gestartet
              </div>
            )}
          </div>

          <div className="gss-actions">
            <button
              className="gss-start-button"
              onClick={onStart}
              aria-label={startLabel}>
              {startLabel}
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStartScreen;
