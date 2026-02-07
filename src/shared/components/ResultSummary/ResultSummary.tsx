import React from 'react';
import './ResultSummary.scss';
import {generateFeedback} from './resultSummary.helper';
import {Link} from 'react-router-dom';
import {Leaderboard} from '../Leaderboard/Leaderboard';
import type {SummaryResultLike} from './resultSummary.interfaces';

export type {SummaryResultLike} from './resultSummary.interfaces';

interface ResultSummaryProps {
  result: SummaryResultLike;
  formatTime: (ms: number) => string;
  taskId?: string;
  title?: string;
  endHref?: string; // if provided, renders a Link
  endLabel?: string;
  endState?: Record<string, unknown>; // passed as location.state to the Link
  onClose?: () => void; // alternative to Link: render button
  chapters?: {title: string; content?: string}[];
  timeLimit?: number; // milliseconds
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  result,
  formatTime,
  taskId,
  title = 'Zahlen-Konverter Abgeschlossen!',
  endHref,
  endLabel,
  endState,
  onClose,
  chapters,
  timeLimit,
}) => {
  const accuracy = Math.round(
    (result.totalCorrect / Math.max(1, result.totalPossible)) * 100,
  );
  const feedback = generateFeedback({
    accuracyPercent: accuracy,
    elapsedMs: result.elapsedMs,
    timeLimit,
    chapters,
    taskId,
  });
  const [feedbackTitle, ...feedbackRest] = feedback.split('\n');
  const feedbackBody = feedbackRest.join('\n').trim();
  return (
    <div className="summary-overlay" role="dialog" aria-modal="true">
      <div className="summary-header">
        <div className="summary-icon" aria-hidden="true">
          <img src="/trophy.svg" alt="" />
        </div>
        <h2 id="summary-title" className="summary-title">
          {title}
        </h2>
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
          <span className="metric-value">
            {result.totalPoints - (result.timeBonus ?? 0)}
            {(result.timeBonus ?? 0) > 0 && (
              <span className="time-bonus">
                {' '}
                (+{result.timeBonus} Zeitbonus)
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="summary-feedback">
        <h3 className="feedback-title">{feedbackTitle}</h3>
        {feedbackBody.split('\n').map((line, i) => (
          <p className="feedback-text" key={i}>
            {line}
          </p>
        ))}
      </div>

      <div className="summary-actions">
        <button className="summary-btn secondary" onClick={onClose}>
          Wiederholen
        </button>
        {endHref ? (
          <Link to={endHref} state={endState} className="summary-btn primary">
            {endLabel ?? 'Weiter'}
          </Link>
        ) : (
          <button className="summary-btn primary" onClick={onClose}>
            {endLabel ?? 'Weiter'}
          </button>
        )}
      </div>

      {taskId && (
        <Leaderboard taskId={taskId} className="summary-leaderboard" />
      )}
    </div>
  );
};

export default ResultSummary;
