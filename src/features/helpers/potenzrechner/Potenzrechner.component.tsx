import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SubTaskComponentProps } from '../../../shared/interfaces/tasking.interfaces';
import BitToggleRow from '../../../shared/components/bitToggleRow/BitToggleRow';
import { DigitsRow } from '../../../shared/components';
import './Potenzrechner.scss';
import ValueExpression from './components/PotenzValueExpression.component';
import TabRow from '../../../shared/components/tabRow/TabRow';

type Mode = 'binary' | 'octal' | 'hex';

const BITS_BINARY = 8; // 8 bits -> 0..255
const DIGITS_OCTAL = 4;
const DIGITS_HEX = 3;

const Potenzrechner: React.FC<SubTaskComponentProps> = ({ onControlsChange, onHudChange, onSummaryChange }) => {
  const [mode, setMode] = useState<Mode>('binary');
  const [bits, setBits] = useState<number[]>(Array(BITS_BINARY).fill(0));
  const [octDigits, setOctDigits] = useState<number[]>(Array(DIGITS_OCTAL).fill(0));
  const [hexDigits, setHexDigits] = useState<number[]>(Array(DIGITS_HEX).fill(0));
  const [target, setTarget] = useState<number>(0);
  const [evaluated, setEvaluated] = useState(false);

  // Calculate 2^n labels for binary mode (LSB right)
  const powers = useMemo(() => Array.from({ length: BITS_BINARY }, (_, i) => 2 ** (BITS_BINARY - 1 - i)), []);

  // Precompute base powers for each mode (descending powers)
  const octPowers = useMemo(() => Array.from({ length: DIGITS_OCTAL }, (_, i) => 8 ** (DIGITS_OCTAL - 1 - i)), []);
  const hexPowers = useMemo(() => Array.from({ length: DIGITS_HEX }, (_, i) => 16 ** (DIGITS_HEX - 1 - i)), []);

  // Compute current value from user input per mode
  const currentValue = useMemo(() => {
    if (mode === 'binary') return bits.reduce((sum, b, idx) => sum + b * powers[idx], 0);
    if (mode === 'octal') return octDigits.reduce((sum, d, idx) => sum + d * octPowers[idx], 0);
    return hexDigits.reduce((sum, d, idx) => sum + d * hexPowers[idx], 0);
  }, [bits, powers, mode, octDigits, octPowers, hexDigits, hexPowers]);

  const randomTarget = (m: Mode) => {
    if (m === 'binary') return Math.floor(Math.random() * (2 ** BITS_BINARY)); // 0..255
    if (m === 'octal') return Math.floor(Math.random() * (8 ** DIGITS_OCTAL));
    return Math.floor(Math.random() * (16 ** DIGITS_HEX));
  };

  // Initialize task UI in HUD and footer controls
  const newTask = useCallback((m: Mode) => {
    setEvaluated(false);
    setTarget(randomTarget(m));
    if (m === 'binary') setBits(Array(BITS_BINARY).fill(0));
    if (m === 'octal') setOctDigits(Array(DIGITS_OCTAL).fill(0));
    if (m === 'hex') setHexDigits(Array(DIGITS_HEX).fill(0));
  }, []);

  useEffect(() => {
    onHudChange?.({
      subtitle: 'Aufgabe: Stelle die Zahl ' + target + ' in ' + (mode === 'binary' ? 'binär' : mode === 'octal' ? 'oktal' : 'hexadezimal') + ' dar.',
      progress: null, // standalone helper has no rounds
    });

    onControlsChange?.({
  onReset: () => newTask(mode),
      onEvaluate: () => setEvaluated(true),
  onNext: () => newTask(mode),
      showReset: true,
      showEvaluate: true,
      showNext: true,
      disableReset: false,
      disableEvaluate: false,
      disableNext: false,
    });

    return () => {
      onHudChange?.(null);
      onControlsChange?.(null);
      onSummaryChange?.(null);
    };
  }, [mode, target, newTask, onControlsChange, onHudChange, onSummaryChange]);

  // initialize first task
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      newTask('binary');
      onHudChange?.({ progress: null, requestTimer: 'reset' });
    }
  }, [newTask, onHudChange]);

  // Bits werden über BitToggleRow onChange gesetzt

  const isCorrect = currentValue === target;

  return (
    <div className="potenzrechner">
      <TabRow
        mode={mode}
        onSelect={(m) => {
          setMode(m);
          newTask(m);
        }}
      />
      <div className="potenzrechner__body">
        <div className="task-statement">
        Aufgabe: Stelle die Zahl <strong>{target}</strong> in {mode === 'binary' ? 'binär' : mode === 'octal' ? 'oktal' : 'hexadezimal'} dar.
        <div className="hint">
          {mode === 'binary' && 'Nutze die 2er-Potenz unter den Bits als Hilfestellung.'}
          {mode === 'octal' && 'Nutze die 8er-Potenzen unter den Ziffern als Hilfestellung.'}
          {mode === 'hex' && 'Nutze die 16er-Potenzen unter den Ziffern als Hilfestellung.'}
        </div>
        </div>
      <div className="potenzrechner__content">
        {mode === 'binary' && (
            <BitToggleRow
              bits={bits}
              onChange={setBits}
              className="bits-row"
              showPowers
              powerLabels={powers}
            />
        )}

        {mode === 'octal' && (
          <div className="digits-board octal">
            <DigitsRow
              digits={octDigits}
              onChange={setOctDigits}
              base={8}
              className="digits-row"
              showPowers
              powerLabels={octPowers}
            />
          </div>
        )}

        {mode === 'hex' && (
          <div className="digits-board hex">
            <DigitsRow
              digits={hexDigits}
              onChange={setHexDigits}
              base={16}
              className="digits-row"
              showPowers
              powerLabels={hexPowers}
            />
          </div>
        )}
      </div>

      <ValueExpression
        mode={mode}
        bits={bits}
        octDigits={octDigits}
        hexDigits={hexDigits}
        powers={powers}
        octPowers={octPowers}
        hexPowers={hexPowers}
        currentValue={currentValue}
        evaluated={evaluated}
        isCorrect={isCorrect}
      />
      </div>
    </div>
  );
};

export default Potenzrechner;
