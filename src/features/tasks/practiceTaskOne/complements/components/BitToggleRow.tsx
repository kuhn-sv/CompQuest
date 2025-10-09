import React from 'react';
import BitToggleButton from './BitToggleButton';

interface BitToggleRowProps {
  bits: number[];               // array of 0/1, MSB-first
  onChange: (bits: number[]) => void;
  className?: string;
  disabled?: boolean;
}

const BitToggleRow: React.FC<BitToggleRowProps> = ({ bits, onChange, className, disabled = false }) => {
  const toggleBit = (idx: number) => {
    if (disabled) return;
    onChange(bits.map((b, i) => (i === idx ? (b === 0 ? 1 : 0) : b)));
  };

  return (
    <div className={className ?? ''} aria-label="Bits umschalten">
      {bits.map((b, i) => (
        <BitToggleButton key={`bit:${i}:${b}`} value={b} onToggle={() => toggleBit(i)} disabled={disabled} />
      ))}
    </div>
  );
};

export default BitToggleRow;
