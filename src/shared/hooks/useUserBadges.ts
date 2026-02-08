import {useContext} from 'react';
import {
  UserBadgesContext,
  type UserBadgesContextType,
} from '../context/UserBadgesContext';

/**
 * Access the user's topic badges (badge levels, loading state, refresh).
 * Must be used within a `<UserBadgesProvider>`.
 */
export const useUserBadges = (): UserBadgesContextType => {
  const ctx = useContext(UserBadgesContext);
  if (ctx === undefined) {
    throw new Error(
      'useUserBadges must be used within a UserBadgesProvider',
    );
  }
  return ctx;
};
