import {createContext} from 'react';
import type {UserTopicBadge} from '../interfaces';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserBadgesContextType {
  /** Badge data keyed by category (e.g. 'zahlendarstellung'). */
  badges: Record<string, UserTopicBadge>;
  /** Whether the initial badge fetch is still in progress. */
  loading: boolean;
  /** Manually re-fetch badges (e.g. after completing a task). */
  refreshBadges: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const UserBadgesContext = createContext<
  UserBadgesContextType | undefined
>(undefined);
