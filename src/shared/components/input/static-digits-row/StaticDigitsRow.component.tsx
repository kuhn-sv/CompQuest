import React from 'react';
import './StaticDigitsRow.scss';

export interface StaticDigitsRowProps {
  /** Digit values (MSB first). Hex digits >9 are displayed as A-F. */
  digits: number[];
  /** Optional row label, e.g. "ZAHL 1". */
  label?: string;
  /** Optional prefix symbol, e.g. "+" shown before the label. */
  prefix?: string;
  className?: string;
}

/** Formats a digit for display — 0-9 as-is, 10-15 as A-F. */
const formatDigit = (d: number): string =>
  d >= 10 ? String.fromCharCode(55 + d) : String(d);

const StaticDigitsRow: React.FC<StaticDigitsRowProps> = ({
  digits,
  label,
  prefix,
  className,
}) => {
  const cols = digits.length;
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 60px)`,
    gap: '12px',
    justifyContent: 'center',
  };

  return (
    <div className={`static-digits-row ${className ?? ''}`.trim()}>
      {(label || prefix) && (
        <span className="static-digits-row__label">
          {prefix && (
            <span className="static-digits-row__prefix">{prefix}</span>
          )}
          {label}
        </span>
      )}
      <div className="static-digits-row__grid" style={gridStyle}>
        {digits.map((d, i) => (
          <div key={i} className="static-digits-row__cell">
            {formatDigit(d)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaticDigitsRow;
