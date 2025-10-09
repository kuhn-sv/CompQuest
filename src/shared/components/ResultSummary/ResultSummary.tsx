import React from 'react';
import './ResultSummary.scss';
import { Link } from 'react-router-dom';

export interface SummaryResultLike {
  elapsedMs: number;
  totalCorrect: number;
  totalPossible: number;
  totalPoints: number;
}

interface SummaryOverlayProps {
  result: SummaryResultLike;
  formatTime: (ms: number) => string;
  title?: string;
  endHref?: string; // if provided, renders a Link
  endLabel?: string;
  onClose?: () => void; // alternative to Link: render button
}

export const SummaryOverlay: React.FC<SummaryOverlayProps> = ({
  result,
  formatTime,
  title = 'Zahlen-Konverter Abgeschlossen!',
  endHref,
  endLabel,
  onClose,
}) => {
  const accuracy = Math.round((result.totalCorrect / Math.max(1, result.totalPossible)) * 100);
  return (
    <div className="summary-overlay" role="dialog" aria-modal="true">
          <div className="summary-header">
            <div className="summary-icon" aria-hidden="true">
              <img src="/trophy.svg" alt="" />
            </div>
            <h2 id="summary-title" className="summary-title">{title}</h2>
          </div>

          <div className="summary-metrics" aria-label="Ergebnisstatistiken">
            <div className="metric">
              <span className="metric-label">Zeit</span>
              <span className="metric-value">{formatTime(result.elapsedMs)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Genauigkeit</span>
              <span className="metric-value">{accuracy}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Punkte</span>
              <span className="metric-value">{result.totalPoints}</span>
            </div>
          </div>

          <div className="summary-feedback">
            <h3 className="feedback-title">Das lief doch schon ganz gut!</h3>
            <p className="feedback-text">„Da hat die Umrechnung doch schon gut geklappt. Es schleichen sich immer mal wieder kleine Rechenfehler ein, daher solltest du vielleicht nochmal die Umrechnungsmethoden durchgehen, um die Rechnungen zu verfestigen.</p>
            <p className="feedback-text">Im Kapitel 3.1 bei Dirk W. Hoffmann in „Grundlagen der Technischen Informatik“ findest du mehr.“</p>
          </div>

          <div className="summary-actions">
            <button className="summary-btn secondary" onClick={onClose}>Wiederholen</button>
            {endHref ? (
              <Link to={endHref} className="summary-btn primary">{endLabel ?? 'Weiter'}</Link>
            ) : (
              <button className="summary-btn primary" onClick={onClose}>{endLabel ?? 'Weiter'}</button>
            )}
          </div>

      </div>
  );
};

export default SummaryOverlay;
