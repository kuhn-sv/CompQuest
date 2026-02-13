import React from 'react';
import './OverflowToggle.scss';

/** Visual feedback state after evaluation. */
export type OverflowState = 'neutral' | 'correct' | 'wrong';

export interface OverflowToggleProps {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** Visual feedback after evaluation. */
  state?: OverflowState;
}

const OverflowToggle: React.FC<OverflowToggleProps> = ({
  active,
  onToggle,
  disabled = false,
  state = 'neutral',
}) => {
  const cls = [
    'overflow-toggle',
    active ? 'active' : '',
    disabled ? 'disabled' : '',
    state !== 'neutral' ? `overflow-toggle--${state}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={cls}
      onClick={disabled ? undefined : onToggle}
      aria-pressed={active}
      aria-label="Überlauf melden"
      disabled={disabled}>
      <svg
        className="overflow-toggle__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </button>
  );
};

export default OverflowToggle;
