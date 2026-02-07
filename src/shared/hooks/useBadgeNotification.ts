import {useContext} from 'react';
import {
  BadgeNotificationContext,
  type BadgeNotificationContextType,
} from '../context/BadgeNotificationContext';

/**
 * Access the badge-notification system (enqueue checks, read current notification, dismiss).
 * Must be used within a `<BadgeNotificationProvider>`.
 */
export const useBadgeNotification = (): BadgeNotificationContextType => {
  const ctx = useContext(BadgeNotificationContext);
  if (ctx === undefined) {
    throw new Error(
      'useBadgeNotification must be used within a BadgeNotificationProvider',
    );
  }
  return ctx;
};
