import React from 'react';
import './PotenzValueExpression.component.scss';

export type Mode = 'binary' | 'octal' | 'hex';

interface ValueExpressionProps {
  mode: Mode;
  bits: number[];
  octDigits: number[];
  hexDigits: number[];
  powers: number[];
  octPowers: number[];
  hexPowers: number[];
  currentValue: number;
  evaluated: boolean;
  isCorrect: boolean;
}

const ValueExpression: React.FC<ValueExpressionProps> = ({
  mode,
  bits,
  octDigits,
  hexDigits,
  powers,
  octPowers,
  hexPowers,
  currentValue,
  evaluated,
  isCorrect,
}) => {
  return (
    <div className="expression potenz-value-expression">
      {mode === 'binary' && (
        <>
          {bits.map((b, idx) => (
            <span key={idx} className="term">
              <span className={`value value--active`}>{b}</span>
              <span className="operator">×</span>
              <span className="power">{powers[idx]}</span>
              {idx < bits.length - 1 ? ' + ' : ''}
            </span>
          ))}
          {' = '}<span className={`solution ${isCorrect ? 'solution--success' : ''}`}>{currentValue}</span>
          <span className="base">10</span>
          {evaluated && (
            <span className={`result ${isCorrect ? 'ok' : 'err'}`}> {isCorrect ? '✓' : '✗'}</span>
          )}
        </>
      )}

      {mode === 'octal' && (
        <div className="sum-line">
          {octDigits.map((d, idx) => (
            <span key={idx} className="term">
              <span className={`value value--active`}>{d}</span>
              <span className="operator">×</span>
              <span className="power">{octPowers[idx]}</span>
              {idx < octDigits.length - 1 ? ' + ' : ''}
            </span>
          ))}
          {' = '}<span className={`solution ${isCorrect ? 'solution--success' : ''}`}>{currentValue}</span>
          <span className="base">10</span>
          {evaluated && (
            <span className={`result ${isCorrect ? 'ok' : 'err'}`}> {isCorrect ? '✓' : '✗'}</span>
          )}
        </div>
      )}

      {mode === 'hex' && (
        <div className="sum-line">
          {hexDigits.map((d, idx) => (
            <span key={idx} className="term">
              <span className={`value value--active`}>{d < 10 ? d : String.fromCharCode(55 + d)}</span>
              <span className="operator">×</span>
              <span className="power">{hexPowers[idx]}</span>
              {idx < hexDigits.length - 1 ? ' + ' : ''}
            </span>
          ))}
          {' = '}<span className={`solution ${isCorrect ? 'solution--success' : ''}`}>{currentValue}</span>
          <span className="base">10</span>
          {evaluated && (
            <span className={`result ${isCorrect ? 'ok' : 'err'}`}> {isCorrect ? '✓' : '✗'}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ValueExpression;
