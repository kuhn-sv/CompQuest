import React from 'react';
import DigitSelect from './DigitSelect';
import type { DigitState } from './DigitSelect';
import './DigitsRow.scss';

export type { DigitState };

export interface DigitsRowProps {
  digits: number[];
  onChange: (digits: number[]) => void;
  base: 8 | 16;
  className?: string;
  disabled?: boolean;
  showPowers?: boolean;
  powerLabels?: Array<number | string>;
  digitStates?: DigitState[];
}

const DigitsRow: React.FC<DigitsRowProps> = ({
  digits,
  onChange,
  base,
  className,
  disabled = false,
  showPowers = false,
  powerLabels,
  digitStates,
}) => {
  const cols = digits.length;
  const canShowPowers = showPowers && Array.isArray(powerLabels) && powerLabels.length === cols;
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    columnGap: '12px',
    rowGap: '6px',
    justifyItems: 'center',
  };

  const handleChangeAt = (idx: number, v: number) => {
    onChange(digits.map((x, i) => (i === idx ? v : x)));
  };

  return (
    <div className="digits-row-component">
      <div className={`digit-grid ${className ?? ''}`.trim()} style={gridStyle}>
        {digits.map((d, i) => (
          <div key={`col:${i}`} className="digit-col">
            <DigitSelect value={d} onChange={(v) => handleChangeAt(i, v)} base={base} disabled={disabled} state={digitStates?.[i]} />
            {canShowPowers && <div className="power" aria-hidden="true">{powerLabels![i]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitsRow;
