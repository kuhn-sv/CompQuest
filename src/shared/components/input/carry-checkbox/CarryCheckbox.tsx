import React from 'react';
import './CarryCheckbox.scss';

/** Visual feedback state after evaluation. */
export type CarryState = 'neutral' | 'correct' | 'wrong';

export interface CarryCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Visual feedback after evaluation. */
  state?: CarryState;
}

const CarryCheckbox: React.FC<CarryCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  state = 'neutral',
}) => {
  const cls = [
    'carry-checkbox',
    checked ? 'checked' : '',
    disabled ? 'disabled' : '',
    state !== 'neutral' ? `carry-checkbox--${state}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={cls}
      onClick={disabled ? undefined : () => onChange(!checked)}
      aria-pressed={checked}
      aria-label="Übertrag"
      disabled={disabled}>
      {checked && (
        <svg
          className="carry-checkbox__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
};

export default CarryCheckbox;
