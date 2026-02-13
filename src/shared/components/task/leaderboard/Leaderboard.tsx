import React, {useCallback, useEffect, useState} from 'react';
import { trainingService } from '../../../../services/supabase';
import { LeaderboardEntry, LeaderboardResult } from '../../../../services/supabase/training.service';
import { formatDuration } from '../../../utils/formatTime.utils';
import { PAGE_SIZE, RANK_ICONS } from './leaderboard.constants';
import './Leaderboard.scss';

interface LeaderboardProps {
  taskId: string;
  className?: string;
  userOptedOut?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  taskId,
  className,
  userOptedOut = false,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(
    async (currentOffset: number, append: boolean) => {
      try {
        const result: LeaderboardResult = await trainingService.getLeaderboard(
          taskId,
          PAGE_SIZE,
          currentOffset,
        );
        if (append) {
          setEntries(prev => {
            // Deduplicate by rank in case currentUser row overlaps
            const existingRanks = new Set(prev.map(e => e.rank));
            const newEntries = result.entries.filter(
              e => !existingRanks.has(e.rank),
            );
            return [...prev, ...newEntries];
          });
        } else {
          setEntries(result.entries);
        }
        setCurrentUser(result.currentUser);
        setTotalCount(result.totalCount);
      } catch (err) {
        console.warn('Could not load leaderboard:', err);
        setError('Bestenliste konnte nicht geladen werden.');
      }
    },
    [taskId],
  );

  // Initial load
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setEntries([]);
    setOffset(0);
    (async () => {
      await fetchLeaderboard(0, false);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchLeaderboard]);

  const handleLoadMore = async () => {
    const newOffset = offset + PAGE_SIZE;
    setLoadingMore(true);
    await fetchLeaderboard(newOffset, true);
    setOffset(newOffset);
    setLoadingMore(false);
  };

  // Check if current user is already visible in loaded entries
  const currentUserInEntries = currentUser
    ? entries.some(e => e.rank === currentUser.rank)
    : true;

  const hasMore = entries.length < totalCount;

  // Determine accuracy color class
  const getAccuracyClass = (accuracy: number): string => {
    if (accuracy >= 90) return 'leaderboard__accuracy--high';
    if (accuracy >= 70) return 'leaderboard__accuracy--medium';
    return 'leaderboard__accuracy--low';
  };

  if (loading) {
    return (
      <div className={`leaderboard ${className ?? ''}`.trim()}>
        <div className="leaderboard__header">
          <span className="leaderboard__header-icon">🏆</span>
          <h3 className="leaderboard__title">Bestenliste</h3>
        </div>
        <div className="leaderboard__loading">Wird geladen…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`leaderboard ${className ?? ''}`.trim()}>
        <div className="leaderboard__header">
          <span className="leaderboard__header-icon">🏆</span>
          <h3 className="leaderboard__title">Bestenliste</h3>
        </div>
        <div className="leaderboard__error">{error}</div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className={`leaderboard ${className ?? ''}`.trim()}>
        <div className="leaderboard__header">
          <span className="leaderboard__header-icon">🏆</span>
          <h3 className="leaderboard__title">Bestenliste</h3>
        </div>
        <div className="leaderboard__empty">
          Noch keine Ergebnisse vorhanden.
        </div>
      </div>
    );
  }

  const renderRow = (entry: LeaderboardEntry, isHighlighted: boolean) => (
    <tr
      key={`${entry.rank}-${entry.gamertag}`}
      className={`leaderboard__row ${isHighlighted ? 'leaderboard__row--current' : ''}`}>
      <td className="leaderboard__cell leaderboard__cell--rank">
        {RANK_ICONS[entry.rank] ? (
          <span className="leaderboard__medal">{RANK_ICONS[entry.rank]}</span>
        ) : (
          <span className="leaderboard__rank-number">#{entry.rank}</span>
        )}
      </td>
      <td className="leaderboard__cell leaderboard__cell--name">
        <span className="leaderboard__gamertag">{entry.gamertag}</span>
        {isHighlighted && <span className="leaderboard__you-badge">Du</span>}
      </td>
      <td
        className={`leaderboard__cell leaderboard__cell--accuracy ${getAccuracyClass(entry.bestAccuracy)}`}>
        {Math.round(entry.bestAccuracy)}%
      </td>
      <td className="leaderboard__cell leaderboard__cell--time">
        {formatDuration(entry.bestTimeMs)}
      </td>
    </tr>
  );

  return (
    <div className={`leaderboard ${className ?? ''}`.trim()}>
      <div className="leaderboard__header">
        <span className="leaderboard__header-icon">🏆</span>
        <h3 className="leaderboard__title">Bestenliste</h3>
      </div>

      <table className="leaderboard__table">
        <thead>
          <tr>
            <th className="leaderboard__th">Rang</th>
            <th className="leaderboard__th">Name</th>
            <th className="leaderboard__th">Genauigkeit</th>
            <th className="leaderboard__th">Zeit</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => renderRow(entry, entry.isCurrentUser))}

          {/* Show current user separately if outside loaded range */}
          {!currentUserInEntries && currentUser && (
            <>
              <tr className="leaderboard__separator">
                <td colSpan={4}>
                  <span className="leaderboard__dots">···</span>
                </td>
              </tr>
              {renderRow(currentUser, true)}
            </>
          )}
        </tbody>
      </table>

      {hasMore && (
        <div className="leaderboard__footer">
          <button
            className="leaderboard__load-more"
            onClick={handleLoadMore}
            disabled={loadingMore}>
            {loadingMore ? 'Wird geladen…' : 'Weitere Plätze laden'}
          </button>
        </div>
      )}

      {userOptedOut && !currentUser && (
        <div className="leaderboard__opt-out-info">
          <span className="leaderboard__opt-out-icon">ℹ️</span>
          <span>Du nimmst aktuell nicht am Leaderboard teil. Du kannst dies in den Einstellungen ändern.</span>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
