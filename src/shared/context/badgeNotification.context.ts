import {createContext} from 'react';
import type {BadgeLevel} from '../interfaces';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BadgeUpgradeNotification {
  category: string;
  previousLevel: BadgeLevel;
  newLevel: BadgeLevel;
  accuracy: number;
}

export interface BadgeNotificationContextType {
  /** Call after a successful recordAttempt to check for badge upgrades. */
  enqueueBadgeCheck: () => Promise<void>;
  /** The notification currently being displayed (null = nothing shown). */
  currentNotification: BadgeUpgradeNotification | null;
  /** Dismiss the current notification and show the next queued one (if any). */
  dismissNotification: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const BadgeNotificationContext = createContext<
  BadgeNotificationContextType | undefined
>(undefined);
