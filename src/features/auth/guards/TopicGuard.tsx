import React from 'react';
import {Navigate} from 'react-router-dom';
import {useUserBadges} from '../../../shared/hooks/useUserBadges';
import {
  isBadgeLevelSufficient,
  type BadgeLevel,
} from '../../../shared/interfaces/badge.interfaces';
import './TopicGuard.scss';

interface TopicGuardProps {
  children: React.ReactNode;
  /** The category that must have the required badge level. */
  requiredCategory: string;
  /** The minimum badge level required to access the route. */
  requiredLevel: BadgeLevel;
}

/**
 * Route guard that blocks access unless the user has achieved
 * a minimum badge level in a given topic category.
 *
 * Usage:
 * ```tsx
 * <TopicGuard requiredCategory="zahlendarstellung" requiredLevel="bronze">
 *   <PracticeTaskTwoPage />
 * </TopicGuard>
 * ```
 */
const TopicGuard: React.FC<TopicGuardProps> = ({
  children,
  requiredCategory,
  requiredLevel,
}) => {
  const {badges, loading} = useUserBadges();

  if (loading) {
    return (
      <div className="topic-guard-loading">
        <div className="topic-guard-loading__spinner">
          <div className="spinner"></div>
        </div>
        <p className="topic-guard-loading__text">Lade Fortschrittsdaten...</p>
      </div>
    );
  }

  const currentLevel: BadgeLevel =
    badges[requiredCategory]?.badgeLevel ?? 'none';

  if (!isBadgeLevelSufficient(currentLevel, requiredLevel)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default TopicGuard;
