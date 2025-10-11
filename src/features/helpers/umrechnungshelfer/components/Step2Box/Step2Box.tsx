import React, {useEffect, useMemo, useState} from 'react';
import {BaseValueSpinner} from '../../../../../shared/components';
import './Step2Box.scss';

export type Step2BoxProps = {
  base: 8 | 16;
  restMode: 'octal' | 'hex';
  initialDecimal?: number; // fills first row dividend when mounted open
  showContent: boolean; // whether step 2 is open and permitted
  onAddRow?: () => void;
  expectedDigits?: string; // to color success when matches (e.g., HEX or OCT)
};

type DivRow = {n: string; q: string; r: string};

const Step2Box: React.FC<Step2BoxProps> = ({
  base,
  restMode,
  initialDecimal,
  showContent,
  expectedDigits,
}) => {
  const [rows, setRows] = useState<DivRow[]>([]);

  useEffect(() => {
    if (
      showContent &&
      rows.length === 0 &&
      typeof initialDecimal === 'number'
    ) {
      setRows([{n: String(initialDecimal), q: '', r: ''}]);
    }
  }, [showContent, initialDecimal, rows.length]);

  const addRow = () => setRows(prev => [...prev, {n: '', q: '', r: ''}]);
  const setRow = (i: number, patch: Partial<DivRow>) =>
    setRows(prev =>
      prev.map((row, idx) => (idx === i ? {...row, ...patch} : row)),
    );

  const computedDigits = useMemo(() => {
    const valid = rows.every(
      row =>
        (row.q === '' || /^\d+$/.test(row.q)) &&
        (restMode === 'hex'
          ? /^[0-9A-F]$/.test(row.r) || row.r === ''
          : /^[0-7]$/.test(row.r) || row.r === ''),
    );
    if (!valid || rows.length === 0) return '';
    const remainders = rows.map(r => r.r).filter(Boolean);
    if (remainders.length === 0) return '';
    return remainders.slice().reverse().join('');
  }, [rows, restMode]);

  const isSolved =
    computedDigits !== '' &&
    expectedDigits &&
    computedDigits.toUpperCase() === expectedDigits.toUpperCase();

  return (
    <>
      <div className="uh-grid" style={{gridTemplateColumns: '1fr'}}>
        {rows.map((row, i) => (
          <div key={i} className="uh-row ok">
            <div
              className="uh-label"
              style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <div className="base-spinner">
                <input
                  className="field"
                  type="number"
                  aria-label={`Dividend Zeile ${i + 1}`}
                  placeholder="Dividend"
                  value={row.n}
                  onChange={e =>
                    setRow(i, {n: e.target.value.replace(/[^\d]/g, '')})
                  }
                  style={{width: 64}}
                  min={0}
                />
              </div>
              <div className="base-spinner">
                : {base} ={' '}
                <input
                  className="field"
                  type="number"
                  aria-label={`Quotient Zeile ${i + 1}`}
                  placeholder="Quotient"
                  value={row.q}
                  onChange={e =>
                    setRow(i, {q: e.target.value.replace(/\D+/g, '')})
                  }
                  style={{width: 64}}
                  min={0}
                />
              </div>{' '}
              , Rest:
              <BaseValueSpinner
                mode={restMode === 'hex' ? 'hex' : 'octal'}
                useSpinner
                ariaLabel={`Rest Zeile ${i + 1}`}
                width={64}
                value={row.r}
                onChange={v =>
                  setRow(i, {
                    r:
                      restMode === 'hex'
                        ? v.toUpperCase().slice(0, 1)
                        : v.slice(0, 1),
                  })
                }
              />
            </div>
          </div>
        ))}
        <div className="uh-row" style={{justifyContent: 'center'}}>
          <button
            type="button"
            className="uh-step-cta"
            onClick={addRow}
            aria-label="Zeile hinzufügen">
            +
          </button>
        </div>
      </div>

      <div className="uh-result">
        <div className="uh-result-label">
          {restMode === 'hex' ? 'Hexadezimal:' : 'Oktal:'}
        </div>
        <div className={`uh-result-value ${isSolved ? 'ok' : ''}`}>
          {computedDigits || '—'}
          <span className="uh-base">{restMode === 'hex' ? '₁₆' : '₈'}</span>
        </div>
      </div>
    </>
  );
};

export default Step2Box;
