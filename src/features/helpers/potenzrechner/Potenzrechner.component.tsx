import React, {useCallback, useMemo, useState} from 'react';
import {computeEvalStates} from '../../../shared/utils/evalStates';
import type {SubTaskComponentProps} from '../../../shared/interfaces/tasking.interfaces';
import BitToggleRow from '../../../shared/components/bitToggleRow/BitToggleRow';
import {DigitsRow} from '../../../shared/components';
import './Potenzrechner.scss';
import ValueExpression from './components/PotenzValueExpression.component';
import TabRow from '../../../shared/components/tabRow/TabRow.component';
import {useHelperTask} from '../../../shared/hooks';

type Mode = 'binary' | 'octal' | 'hex';

const BITS_BINARY = 8; // 8 bits -> 0..255
const DIGITS_OCTAL = 4;
const DIGITS_HEX = 3;

const Potenzrechner: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
}) => {
  const [mode, setMode] = useState<Mode>('binary');
  const [bits, setBits] = useState<number[]>(Array(BITS_BINARY).fill(0));
  const [octDigits, setOctDigits] = useState<number[]>(
    Array(DIGITS_OCTAL).fill(0),
  );
  const [hexDigits, setHexDigits] = useState<number[]>(
    Array(DIGITS_HEX).fill(0),
  );
  const [target, setTarget] = useState<number>(0);

  // Calculate 2^n labels for binary mode (LSB right)
  const powers = useMemo(
    () =>
      Array.from({length: BITS_BINARY}, (_, i) => 2 ** (BITS_BINARY - 1 - i)),
    [],
  );

  // Precompute base powers for each mode (descending powers)
  const octPowers = useMemo(
    () =>
      Array.from({length: DIGITS_OCTAL}, (_, i) => 8 ** (DIGITS_OCTAL - 1 - i)),
    [],
  );
  const hexPowers = useMemo(
    () =>
      Array.from({length: DIGITS_HEX}, (_, i) => 16 ** (DIGITS_HEX - 1 - i)),
    [],
  );

  // Compute current value from user input per mode
  const currentValue = useMemo(() => {
    if (mode === 'binary')
      return bits.reduce((sum, b, idx) => sum + b * powers[idx], 0);
    if (mode === 'octal')
      return octDigits.reduce((sum, d, idx) => sum + d * octPowers[idx], 0);
    return hexDigits.reduce((sum, d, idx) => sum + d * hexPowers[idx], 0);
  }, [bits, powers, mode, octDigits, octPowers, hexDigits, hexPowers]);

  const randomTarget = (m: Mode) => {
    if (m === 'binary') return Math.floor(Math.random() * 2 ** BITS_BINARY); // 0..255
    if (m === 'octal') return Math.floor(Math.random() * 8 ** DIGITS_OCTAL);
    return Math.floor(Math.random() * 16 ** DIGITS_HEX);
  };

  // Initialize task UI in HUD and footer controls
  const newTask = useCallback((m: Mode) => {
    setTarget(randomTarget(m));
    if (m === 'binary') setBits(Array(BITS_BINARY).fill(0));
    if (m === 'octal') setOctDigits(Array(DIGITS_OCTAL).fill(0));
    if (m === 'hex') setHexDigits(Array(DIGITS_HEX).fill(0));
  }, []);

  // Wrap newTask for the hook (uses current mode)
  const generateTask = useCallback(() => newTask(mode), [newTask, mode]);

  // HUD state (reactive to mode + target)
  const hudState = useMemo(
    () => ({
      subtitle:
        'Aufgabe: Stelle die Zahl ' +
        target +
        ' in ' +
        (mode === 'binary'
          ? 'binär'
          : mode === 'octal'
            ? 'oktal'
            : 'hexadezimal') +
        ' dar.',
      progress: null,
    }),
    [mode, target],
  );

  const {evaluated} = useHelperTask({
    onControlsChange,
    onHudChange,
    onSummaryChange,
    generateTask,
    hudState,
  });

  // Bits werden über BitToggleRow onChange gesetzt

  const isCorrect = currentValue === target;

  // Compute expected digit arrays for octal/hex
  const expectedOctDigits = useMemo(() => {
    const arr: number[] = [];
    let v = target;
    for (let i = 0; i < DIGITS_OCTAL; i++) { arr.push(v % 8); v = Math.floor(v / 8); }
    return arr.reverse();
  }, [target]);

  const expectedHexDigits = useMemo(() => {
    const arr: number[] = [];
    let v = target;
    for (let i = 0; i < DIGITS_HEX; i++) { arr.push(v % 16); v = Math.floor(v / 16); }
    return arr.reverse();
  }, [target]);

  // Per-digit/bit evaluation states (only after evaluate)
  const octDigitStates = computeEvalStates(octDigits, expectedOctDigits, evaluated);
  const hexDigitStates = computeEvalStates(hexDigits, expectedHexDigits, evaluated);

  // Compute expected bits for binary (MSB first)
  const expectedBits = useMemo(() => {
    const arr: number[] = [];
    let v = target;
    for (let i = 0; i < BITS_BINARY; i++) { arr.push(v % 2); v = Math.floor(v / 2); }
    return arr.reverse();
  }, [target]);

  const bitStates = computeEvalStates(bits, expectedBits, evaluated);

  return (
    <div className="potenzrechner">
      <TabRow
        value={mode}
        items={[
          {value: 'binary', label: 'Binär'},
          {value: 'octal', label: 'Oktal'},
          {value: 'hex', label: 'Hexadezimal'},
        ]}
        onSelect={m => {
          setMode(m);
          newTask(m);
        }}
        ariaLabel="Darstellungsmodus"
      />
      <div className="potenzrechner__body">
        <div className="task-statement">
          Aufgabe: Stelle die Zahl <strong>{target}</strong> in{' '}
          {mode === 'binary'
            ? 'binär'
            : mode === 'octal'
              ? 'oktal'
              : 'hexadezimal'}{' '}
          dar.
          <div className="hint">
            {mode === 'binary' &&
              'Nutze die 2er-Potenz unter den Bits als Hilfestellung.'}
            {mode === 'octal' &&
              'Nutze die 8er-Potenzen unter den Ziffern als Hilfestellung.'}
            {mode === 'hex' &&
              'Nutze die 16er-Potenzen unter den Ziffern als Hilfestellung.'}
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
              bitStates={bitStates}
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
                digitStates={octDigitStates}
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
                digitStates={hexDigitStates}
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
