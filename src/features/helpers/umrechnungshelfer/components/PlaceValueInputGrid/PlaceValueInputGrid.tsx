import React from 'react';
import {BaseValueSpinner} from '../../../../../shared/components';
import './PlaceValueInputGrid.scss';

export type PlaceValueInputGridProps = {
  base: 2 | 8;
  width: number; // number of positions (e.g., 8 bits)
  values: Array<number | null>; // user-entered digits, MSB->LSB
  expected: number[]; // expected digits, MSB->LSB
  evaluated: boolean;
  onChange: (index: number, val: number | null) => void; // index in MSB->LSB order
  labelBuilder?: (power: number) => string; // defaults to `1×{base}^{power} =`
};

const PlaceValueInputGrid: React.FC<PlaceValueInputGridProps> = ({
  base,
  width,
  values,
  expected,
  evaluated,
  onChange,
  labelBuilder,
}) => {
  const mode: 'binary' | 'octal' = base === 2 ? 'binary' : 'octal';
  const defaultLabel = (p: number) => `1×${base}^{${p}} =`;
  const label = labelBuilder ?? defaultLabel;

  const renderRow = (power: number) => {
    // power 0 .. width-1 maps to index from LSB-right; transform to MSB-left index
    const idx = width - 1 - power; // MSB-left index
    const user = values[idx];
    const exp = expected[idx];
    const isCorrect = evaluated ? user === exp : false;
    const hasValue = user !== null;
    const stateClass = evaluated && hasValue ? (isCorrect ? 'ok' : 'err') : '';
    return (
      <div key={power} className={`uh-row ${stateClass}`}>
        <div className="uh-label">{label(power)}</div>
        <div className="uh-input">
          <BaseValueSpinner
            mode={mode}
            ariaLabel={`Stelle ${power}`}
            width={64}
            value={user === null ? '' : String(user)}
            onChange={next => {
              if (next === '') {
                onChange(idx, null);
              } else {
                const n = Number(next);
                const clamped =
                  base === 2 ? (n === 1 ? 1 : 0) : Math.max(0, Math.min(7, n));
                onChange(idx, clamped);
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="uh-grid">
      <div className="uh-col">{[0, 1, 2, 3].map(renderRow)}</div>
      <div className="uh-col">{[4, 5, 6, 7].map(renderRow)}</div>
    </div>
  );
};

export default PlaceValueInputGrid;
