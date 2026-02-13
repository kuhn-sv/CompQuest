import React, {useEffect, useRef} from 'react';
import type {SettingsModalProps} from '../interfaces/settings.interface';
import './SettingsModal.component.scss';

const SettingsModal: React.FC<SettingsModalProps> = ({
  show,
  onClose,
  onSignOut,
  isAdmin,
  onNavigateToAdmin,
  leaderboardOptIn,
  onLeaderboardOptInChange,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!show) return;

    closeRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!show) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="settings-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={handleOverlayClick}>
      <div className="settings-modal__card">
        {/* Header */}
        <div className="settings-modal__header">
          <h3 id="settings-modal-title" className="settings-modal__title">
            Einstellungen
          </h3>
          <button
            ref={closeRef}
            className="settings-modal__close-btn"
            onClick={onClose}
            aria-label="Schließen">
            ✕
          </button>
        </div>

        {/* Leaderboard Toggle */}
        <div className="settings-modal__section">
          <div className="settings-modal__toggle-row">
            <span className="settings-modal__toggle-label">
              Am Leaderboard teilnehmen
            </span>
            <button
              className={`settings-modal__toggle ${leaderboardOptIn ? 'settings-modal__toggle--active' : ''}`}
              onClick={() => onLeaderboardOptInChange(!leaderboardOptIn)}
              role="switch"
              aria-checked={leaderboardOptIn}
              aria-label="Am Leaderboard teilnehmen">
              <span className="settings-modal__toggle-thumb" />
            </button>
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="settings-modal__divider" />
            <div className="settings-modal__section">
              <p className="settings-modal__section-label">Administration</p>
              <button
                className="settings-modal__admin-btn"
                onClick={onNavigateToAdmin}>
                Zum Lehrpersonen-Dashboard wechseln
              </button>
            </div>
          </>
        )}

        {/* Sign Out */}
        <div className="settings-modal__divider" />
        <div className="settings-modal__section">
          <button className="settings-modal__signout-btn" onClick={onSignOut}>
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
