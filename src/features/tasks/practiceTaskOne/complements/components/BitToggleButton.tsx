import React from 'react';

interface BitToggleButtonProps {
  value: 0 | 1 | number; // number to stay permissive with callers providing 0/1
  onToggle: () => void;
  className?: string;
  disabled?: boolean;
}

const BitToggleButton: React.FC<BitToggleButtonProps> = ({ value, onToggle, className, disabled = false }) => {
  const active = value === 1;
  return (
    <button
      type="button"
      className={`bit-button ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${className ?? ''}`.trim()}
      onClick={disabled ? undefined : onToggle}
      aria-pressed={active}
      disabled={disabled}
    >
      {value}
    </button>
  );
};

export default BitToggleButton;
