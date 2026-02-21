import React, {useEffect, useState} from 'react';
import './GameStartScreen.component.scss';
import type {
  BestAttempt,
  GameStartScreenProps,
} from './gameStartScreen.interfaces';
import { useAuth } from '../../../../auth';
import { trainingService } from '../../../../../services/supabase';
import { formatDuration } from '@shared/utils/formatTime.utils';
import Leaderboard from '../leaderboard/Leaderboard';

export type {
  BestAttempt,
  GameStartScreenProps,
} from './gameStartScreen.interfaces';

export const GameStartScreen: React.FC<GameStartScreenProps> = ({
  statusTitle,
  statusDescription,
  taskCount,
  estimatedTime,
  bestAttempt,
  fetchBestAttempt = false,
  taskId,
  onStart,
  startLabel = 'Mission starten',
  className,
}) => {
  const {userProfile} = useAuth();
  const userOptedOut = userProfile ? !userProfile.leaderboardOptIn : false;
  const [loadedBest, setLoadedBest] = useState<BestAttempt | null | undefined>(
    undefined,
  );

  useEffect(() => {
    // If a bestAttempt prop is provided (even null), respect it and don't fetch
    if (bestAttempt !== undefined) {
      setLoadedBest(bestAttempt);
      return;
    }
    if (!fetchBestAttempt || !taskId) {
      setLoadedBest(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const row = await trainingService.getStatsForTask(taskId);
        if (cancelled) return;
        if (
          row &&
          row.best_accuracy !== null &&
          row.best_time_ms !== null &&
          row.best_points !== null
        ) {
          setLoadedBest({
            timeMs: row.best_time_ms,
            accuracyPercent: Number(row.best_accuracy),
            points: row.best_points,
            date: row.last_attempt_at ?? undefined,
          });
        } else {
          setLoadedBest(null);
        }
      } catch (err) {
        // Non-blocking: if unauthenticated or RLS blocks, just show empty state
        console.warn('Could not load best attempt:', err);
        if (!cancelled) setLoadedBest(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bestAttempt, fetchBestAttempt, taskId]);

  const attemptToShow = bestAttempt !== undefined ? bestAttempt : loadedBest;
  return (
    <div className={`game-start-screen ${className ?? ''}`.trim()}>
      <div className="gss-content">
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
                <div className="gss-fact-icon" aria-hidden>
                  🎯
                </div>
                <div className="gss-fact-text">
                  <div className="label">Aufgaben</div>
                  <div className="value">{taskCount}</div>
                </div>
              </div>
              <div className="gss-fact">
                <div className="gss-fact-icon">⏱️</div>
                <div className="gss-fact-text">
                  <div className="label">Geschätzte Zeit</div>
                  <div className="value">~{Math.round(estimatedTime / 60000)} min</div>
                </div>
              </div>
            </div>

            <div className="gss-best">
              <div className="gss-best-title">
                <img src="/trophy.svg" alt="" />
                Bester Versuch
              </div>
              {attemptToShow ? (
                <div className="gss-best-stats">
                  <div className="stat">
                    <span>Zeit</span>
                    <strong>{formatDuration(attemptToShow.timeMs)}</strong>
                  </div>
                  <div className="stat">
                    <span>Genauigkeit</span>
                    <strong>
                      {Math.round(attemptToShow.accuracyPercent)}%
                    </strong>
                  </div>
                  <div className="stat">
                    <span>Punkte</span>
                    <strong>{attemptToShow.points}</strong>
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
        {taskId && <Leaderboard taskId={taskId} className="gss-leaderboard" userOptedOut={userOptedOut} />}
      </div>
    </div>
  );
};

export default GameStartScreen;
