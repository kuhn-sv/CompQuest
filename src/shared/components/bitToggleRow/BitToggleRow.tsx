import React from 'react';
import BitToggleButton from '../bitToggleButton/BitToggleButton';
import './BitToggleRow.scss';

interface BitToggleRowProps {
  bits: number[];               // array of 0/1, MSB-first
  onChange: (bits: number[]) => void;
  className?: string;
  disabled?: boolean;
  showPowers?: boolean;         // when true, render powers row below
  powerLabels?: Array<number | string>; // labels to show per bit, must match bits.length when showPowers
}

const BitToggleRow: React.FC<BitToggleRowProps> = ({ bits, onChange, className, disabled = false, showPowers = false, powerLabels }) => {
  const toggleBit = (idx: number) => {
    if (disabled) return;
    onChange(bits.map((b, i) => (i === idx ? (b === 0 ? 1 : 0) : b)));
  };

  const canShowPowers = showPowers && Array.isArray(powerLabels) && powerLabels.length === bits.length;
  const cols = bits.length;
  const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, columnGap: '12px', rowGap: '6px', justifyItems: 'center' };

  return (
    <div className="bit-toggle-row">
      <div className={`bit-grid ${className ?? ''}`.trim()} style={gridStyle}>
        {bits.map((b, i) => (
          <div key={`col:${i}`} className="bit-col">
            <BitToggleButton value={b} onToggle={() => toggleBit(i)} disabled={disabled} />
            {canShowPowers && (
              <div className="power" aria-hidden="true">{powerLabels![i]}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BitToggleRow;
