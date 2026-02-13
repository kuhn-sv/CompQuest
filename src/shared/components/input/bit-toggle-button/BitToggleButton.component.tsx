import React from 'react';
import './BitToggleButton.scss';

export type BitState = 'neutral' | 'correct' | 'wrong';

interface BitToggleButtonProps {
  value: 0 | 1 | number; // number to stay permissive with callers providing 0/1
  onToggle: () => void;
  className?: string;
  disabled?: boolean;
  /** Visual feedback after evaluation. */
  state?: BitState;
}

const BitToggleButton: React.FC<BitToggleButtonProps> = ({ value, onToggle, className, disabled = false, state = 'neutral' }) => {
  const active = value === 1;
  const stateCls = state !== 'neutral' ? `bit-button--${state}` : '';
  return (
    <button
      type="button"
      className={`bit-button ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${stateCls} ${className ?? ''}`.trim()}
      onClick={disabled ? undefined : onToggle}
      aria-pressed={active}
      disabled={disabled}
    >
      {value}
    </button>
  );
};

export default BitToggleButton;
