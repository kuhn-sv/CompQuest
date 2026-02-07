import React from 'react';
import {BADGE_CONFIG} from '../../interfaces';
import {useBadgeNotification} from '../../hooks/useBadgeNotification';
import {CATEGORY_DISPLAY_NAMES} from '../../context/badgeNotification.constants';
import './BadgeCelebrationPopup.scss';

const BadgeCelebrationPopup: React.FC = () => {
  const {currentNotification, dismissNotification} = useBadgeNotification();

  if (!currentNotification) return null;

  const {newLevel, accuracy, category} = currentNotification;
  const config = BADGE_CONFIG[newLevel];
  const categoryName = CATEGORY_DISPLAY_NAMES[category] ?? category;

  return (
    <div
      className="badge-popup__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-popup-title">
      <div className="badge-popup__card">
        {/* Animated badge icon */}
        <div
          className={`badge-popup__icon-wrapper badge-popup__icon-wrapper--${newLevel}`}>
          <span className="badge-popup__icon" aria-hidden="true">
            {config.icon}
          </span>
        </div>

        <h2 id="badge-popup-title" className="badge-popup__title">
          Neues Badge erreicht!
        </h2>

        <p className="badge-popup__message">
          Super! Mit einer Genauigkeit von{' '}
          <strong>{Math.round(accuracy)}%</strong> in{' '}
          <strong>{categoryName}</strong> hast du dir das{' '}
          <strong>{config.label}-Badge</strong> verdient.
        </p>

        <button
          className="badge-popup__btn"
          onClick={dismissNotification}
          autoFocus>
          Großartig!
        </button>
      </div>
    </div>
  );
};

export default BadgeCelebrationPopup;
