import React from 'react';
import './BadgeCelebrationPopup.scss';
import { CATEGORY_DISPLAY_NAMES } from '../../../context/badgeNotification.constants';
import { useBadgeNotification } from '../../../hooks';
import { BADGE_CONFIG } from '../../../interfaces';

const BadgeCelebrationPopup: React.FC = () => {
  const {currentNotification, dismissNotification} = useBadgeNotification();

  // Play celebration sound when a badge notification appears
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  React.useEffect(() => {
    if (!currentNotification) return;
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/badge_feedback_sound.mpeg');
      audioRef.current.load();
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, [currentNotification]);

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

        {category === 'zahlendarstellung' && newLevel === 'bronze' && (
          <p className="badge-popup__unlock-hint">
            🔓 Du hast den Bereich <strong>Mikroprozessortechnik</strong>{' '}
            freigeschaltet!
          </p>
        )}

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
