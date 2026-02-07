import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {trainingService} from '../../services/supabase/training.service';
import type {BadgeLevel, UserTopicBadge} from '../interfaces';
import {
  BadgeNotificationContext,
  type BadgeUpgradeNotification,
} from './badgeNotification.context';

// Re-export types & context so existing imports keep working
export type {
  BadgeUpgradeNotification,
  BadgeNotificationContextType,
} from './badgeNotification.context';
export {BadgeNotificationContext} from './badgeNotification.context';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Delay (ms) before showing a badge popup so the ResultSummary can appear first. */
const DISPLAY_DELAY_MS = 600;

const BADGE_RANK: Record<BadgeLevel, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface Props {
  /** Whether the user is authenticated (badges are only fetched when true). */
  isAuthenticated: boolean;
  children: ReactNode;
}

export const BadgeNotificationProvider: React.FC<Props> = ({
  isAuthenticated,
  children,
}) => {
  // Cache of badge levels per category – populated on login / first check.
  const badgeCacheRef = useRef<Record<string, BadgeLevel>>({});
  const cacheInitializedRef = useRef(false);

  // Notification queue + currently displayed notification
  const [queue, setQueue] = useState<BadgeUpgradeNotification[]>([]);
  const [current, setCurrent] = useState<BadgeUpgradeNotification | null>(null);

  // ------ initial cache population when user logs in ------
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear cache on logout
      badgeCacheRef.current = {};
      cacheInitializedRef.current = false;
      setCurrent(null);
      setQueue([]);
      return;
    }

    // Populate the cache silently (no notifications on first load)
    trainingService
      .getUserBadges()
      .then(badges => {
        const map: Record<string, BadgeLevel> = {};
        for (const b of badges) {
          map[b.category] = b.badgeLevel;
        }
        badgeCacheRef.current = map;
        cacheInitializedRef.current = true;
      })
      .catch(() => {
        // If fetch fails, we'll populate on the first badge check instead
      });
  }, [isAuthenticated]);

  // ------ show next queued notification when current is dismissed ------
  // Delay showing by DISPLAY_DELAY_MS so the ResultSummary can appear first.
  const displayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (current === null && queue.length > 0) {
      displayTimerRef.current = setTimeout(() => {
        setQueue(prev => {
          if (prev.length === 0) return prev;
          setCurrent(prev[0]);
          return prev.slice(1);
        });
      }, DISPLAY_DELAY_MS);
    }

    return () => {
      if (displayTimerRef.current) {
        clearTimeout(displayTimerRef.current);
        displayTimerRef.current = null;
      }
    };
  }, [current, queue]);

  // ------ core: fetch badges, diff against cache, enqueue upgrades ------
  const enqueueBadgeCheck = useCallback(async () => {
    let badges: UserTopicBadge[];
    try {
      badges = await trainingService.getUserBadges();
    } catch {
      return; // silently ignore – the user still sees ResultSummary
    }

    const upgrades: BadgeUpgradeNotification[] = [];

    for (const b of badges) {
      const prevLevel: BadgeLevel = badgeCacheRef.current[b.category] ?? 'none';
      const newLevel = b.badgeLevel;

      if (BADGE_RANK[newLevel] > BADGE_RANK[prevLevel] && newLevel !== 'none') {
        upgrades.push({
          category: b.category,
          previousLevel: prevLevel,
          newLevel,
          accuracy: b.avgAccuracy,
        });
      }

      // Always update cache
      badgeCacheRef.current[b.category] = newLevel;
    }
    cacheInitializedRef.current = true;

    if (upgrades.length === 0) return;

    // Enqueue all upgrades (they will be shown one after another)
    setQueue(prev => [...prev, ...upgrades]);
  }, []);

  const dismissNotification = useCallback(() => {
    setCurrent(null);
  }, []);

  return (
    <BadgeNotificationContext.Provider
      value={{
        enqueueBadgeCheck,
        currentNotification: current,
        dismissNotification,
      }}>
      {children}
    </BadgeNotificationContext.Provider>
  );
};
