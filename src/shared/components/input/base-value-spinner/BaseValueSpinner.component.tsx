import React from 'react';
import { NumberField } from '@base-ui-components/react/number-field';

export type SpinnerMode = 'binary' | 'octal' | 'hex' | 'decimal';

export interface BaseValueSpinnerProps {
  mode: SpinnerMode;
  value: string; // canonically uppercased, no base prefix
  onChange: (next: string) => void;
  ariaLabel?: string;
  width?: number; // px width for input field
  min?: number;
  max?: number;
  step?: number;
  useSpinner?: boolean; // when true and mode === 'hex', render inc/dec spinner cycling 0..F
  placeholder?: string;
}

const getCharset = (mode: SpinnerMode): string[] => {
  switch (mode) {
    case 'binary':
      return ['0', '1'];
    case 'octal':
      return ['0','1','2','3','4','5','6','7'];
    case 'hex':
      return ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    case 'decimal':
      return ['0','1','2','3','4','5','6','7','8','9'];
    default:
      return ['0'];
  }
};

const clampToCharset = (s: string, mode: SpinnerMode): string => {
  const allowed = new Set(getCharset(mode));
  const upper = s.toUpperCase();
  // Keep only allowed characters, empty string stays empty to allow clearing
  const filtered = Array.from(upper).filter(ch => allowed.has(ch)).join('');
  return filtered;
};

// stepping is handled by native number input for binary, octal, decimal; hex can use text or optional spinner

const BaseValueSpinner: React.FC<BaseValueSpinnerProps> = ({ mode, value, onChange, ariaLabel, width = 80, min, max, step, useSpinner, placeholder }) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = clampToCharset(e.target.value, mode);
    onChange(v);
  };

  if (mode === 'binary' || mode === 'octal' || mode === 'decimal') {
    const defaultMax = mode === 'binary' ? 1 : mode === 'octal' ? 7 : (max ?? 999);
    const defaultMin = min ?? 0;
    const s = step ?? 1;
  const ph = placeholder ?? (mode === 'binary' ? '0/1' : mode === 'octal' ? '0–7' : '0–9');
    const numericValue = value === '' ? null : Math.max(defaultMin, Math.min(defaultMax, Number(value)));
    return (
      <div className="base-spinner">
        <NumberField.Root
          aria-label={ariaLabel}
          value={numericValue}
          onValueChange={(val) => {
            onChange(val === null ? '' : String(val));
          }}
          min={defaultMin}
          max={defaultMax}
          step={s}
          className="base-number-field"
        >
          <NumberField.Group className="base-number-field-group">
            <NumberField.Decrement className="dec-btn" aria-label={(ariaLabel ?? 'Wert') + ' verringern'}>−</NumberField.Decrement>
            <NumberField.Input
              className="field"
              placeholder={ph}
              style={{ width }}
            />
            <NumberField.Increment className="inc-btn" aria-label={(ariaLabel ?? 'Wert') + ' erhöhen'}>+</NumberField.Increment>
          </NumberField.Group>
        </NumberField.Root>
      </div>
    );
  }

  // Hex: optional spinner across allowed charset, or plain filtered text input
  if (mode === 'hex' && useSpinner) {
    const charset = getCharset('hex');
    const idx = Math.max(0, charset.indexOf((value || '0').toUpperCase().charAt(0)));
    const setByIndex = (i: number) => {
      const next = charset[(i + charset.length) % charset.length];
      onChange(next);
    };
    return (
      <div className="base-spinner">
        <div className="base-number-field">
          <div className="base-number-field-group">
            <button type="button" className="dec-btn" aria-label={(ariaLabel ?? 'Wert') + ' verringern'} onClick={() => setByIndex(idx - 1)}>−</button>
            <input
              className="field"
              aria-label={ariaLabel}
              value={value}
              onChange={(e) => {
                const filtered = clampToCharset(e.target.value, 'hex').slice(0, 1);
                onChange(filtered);
              }}
              style={{ width }}
              placeholder={placeholder ?? '0–F'}
            />
            <button type="button" className="inc-btn" aria-label={(ariaLabel ?? 'Wert') + ' erhöhen'} onClick={() => setByIndex(idx + 1)}>+</button>
          </div>
        </div>
      </div>
    );
  }

  // Hex default text input
  return (
    <div className="base-spinner">
      <input
        className="field"
        inputMode={'text'}
        aria-label={ariaLabel}
        value={value}
        onChange={handleTextChange}
        onBlur={(e) => {
          const v = clampToCharset(e.target.value, mode);
          if (v !== value) onChange(v);
        }}
        style={{ width }}
        placeholder={placeholder ?? '0–F'}
      />
    </div>
  );
};

export default BaseValueSpinner;
