import React, {useCallback, useEffect, useState, type ReactNode} from 'react';
import {trainingService} from '../../services/supabase/training.service';
import type {UserTopicBadge} from '../interfaces';
import {
  UserBadgesContext,
  type UserBadgesContextType,
} from './userBadges.context';

// Re-export types so consumers can import from one place
export type {UserBadgesContextType} from './userBadges.context';
export {UserBadgesContext} from './userBadges.context';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface Props {
  /** Whether the user is authenticated (badges are only fetched when true). */
  isAuthenticated: boolean;
  children: ReactNode;
}

export const UserBadgesProvider: React.FC<Props> = ({
  isAuthenticated,
  children,
}) => {
  const [badges, setBadges] = useState<Record<string, UserTopicBadge>>({});
  const [loading, setLoading] = useState(false);

  const hasFetchedOnce = React.useRef(false);

  const fetchBadges = useCallback(async () => {
    // Only show global loading spinner on first load
    if (!hasFetchedOnce.current) {
      setLoading(true);
    }
    try {
      const badgeData = await trainingService.getUserBadges();
      const map: Record<string, UserTopicBadge> = {};
      for (const b of badgeData) {
        map[b.category] = b;
      }
      setBadges(map);
      hasFetchedOnce.current = true;
    } catch {
      // Silently ignore – user can still use the app
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch badges on login, clear on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setBadges({});
      setLoading(false);
      hasFetchedOnce.current = false;
      return;
    }
    fetchBadges();
  }, [isAuthenticated, fetchBadges]);

  const value: UserBadgesContextType = {
    badges,
    loading,
    refreshBadges: fetchBadges,
  };

  return (
    <UserBadgesContext.Provider value={value}>
      {children}
    </UserBadgesContext.Provider>
  );
};
