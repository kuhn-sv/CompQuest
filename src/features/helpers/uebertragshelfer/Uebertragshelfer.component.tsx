import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {SubTaskComponentProps} from '../../../shared/interfaces/tasking.interfaces';
import BitToggleRow from '../../../shared/components/input/bit-toggle-row/BitToggleRow';
import {DigitsRow, StaticDigitsRow} from '../../../shared/components';
import CarryCheckbox from '../../../shared/components/input/carry-checkbox/CarryCheckbox';
import OverflowToggle from '../../../shared/components/input/overflow-toggle/OverflowToggle';
import TabRow from '../../../shared/components/ui/tabRow/TabRow.component';
import {useHelperTask} from '../../../shared/hooks';
import {
  useAdditionTask,
  type AdditionMode,
  type AdditionTask,
  type AdditionValidation,
} from './hooks/useAdditionTask';
import './Uebertragshelfer.scss';

// ────────────────────────────────────────────────────────────────────────────

const Uebertragshelfer: React.FC<SubTaskComponentProps> = ({
  onControlsChange,
  onHudChange,
  onSummaryChange,
}) => {
  const {generate, validate, getDigitCount} = useAdditionTask();

  // ── State ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<AdditionMode>('binary');
  const [task, setTask] = useState<AdditionTask | null>(null);

  // User answers
  const [carries, setCarries] = useState<boolean[]>([]);
  const [resultDigits, setResultDigits] = useState<number[]>([]);
  const [overflowMarked, setOverflowMarked] = useState(false);

  // Validation result (set after evaluate)
  const [validation, setValidation] = useState<AdditionValidation | null>(null);

  // ── Task generation ────────────────────────────────────────────────────
  const newTask = useCallback(
    (m: AdditionMode) => {
      const t = generate(m);
      setTask(t);
      const dc = getDigitCount(m);
      setCarries(Array(dc).fill(false));
      setResultDigits(Array(dc).fill(0));
      setOverflowMarked(false);
      setValidation(null);
    },
    [generate, getDigitCount],
  );

  // `generateTask` for the hook — uses current mode
  const generateTask = useCallback(() => newTask(mode), [newTask, mode]);

  // ── HUD ────────────────────────────────────────────────────────────────
  const hudState = useMemo(
    () => ({
      subtitle:
        'Addiere die beiden Zahlen in ' +
        (mode === 'binary'
          ? 'binär'
          : mode === 'octal'
            ? 'oktal'
            : 'hexadezimal') +
        ' und markiere die Überträge.',
      progress: null,
    }),
    [mode],
  );

  // ── Lifecycle (useHelperTask) ──────────────────────────────────────────
  const {evaluated} = useHelperTask({
    onControlsChange,
    onHudChange,
    onSummaryChange,
    generateTask,
    hudState,
  });

  // ── Evaluate ───────────────────────────────────────────────────────────
  // When `evaluated` flips to true, compute validation
  const prevEvaluated = useRef(false);
  useEffect(() => {
    if (evaluated && !prevEvaluated.current && task) {
      const v = validate(task, carries, resultDigits, overflowMarked);
      setValidation(v);
    }
    prevEvaluated.current = evaluated;

    // When `evaluated` flips to false (new task), clear validation
    if (!evaluated) {
      setValidation(null);
    }
  }, [evaluated, task, carries, resultDigits, overflowMarked, validate]);

  // ── Carry toggle handler ───────────────────────────────────────────────
  const toggleCarry = useCallback(
    (idx: number) => {
      if (evaluated) return;
      setCarries(prev => prev.map((c, i) => (i === idx ? !c : c)));
    },
    [evaluated],
  );

  // ── Overflow toggle ────────────────────────────────────────────────────
  const toggleOverflow = useCallback(() => {
    if (evaluated) return;
    setOverflowMarked(prev => !prev);
  }, [evaluated]);

  // ── Result change handlers ─────────────────────────────────────────────
  const handleResultBitsChange = useCallback(
    (bits: number[]) => {
      if (evaluated) return;
      setResultDigits(bits);
    },
    [evaluated],
  );

  const handleResultDigitsChange = useCallback(
    (digits: number[]) => {
      if (evaluated) return;
      setResultDigits(digits);
    },
    [evaluated],
  );

  // ── Derived ────────────────────────────────────────────────────────────
  const base: 8 | 16 = mode === 'octal' ? 8 : 16;

  // ── Early return if no task yet ────────────────────────────────────────
  if (!task) return null;

  // ── Helpers for carry state display ────────────────────────────────────
  const carryState = (idx: number): 'neutral' | 'correct' | 'wrong' => {
    if (!validation) return 'neutral';
    return validation.carryResults[idx];
  };

  const overflowState = (): 'neutral' | 'correct' | 'wrong' => {
    if (!validation) return 'neutral';
    return validation.overflowCorrect ? 'correct' : 'wrong';
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="uebertragshelfer">
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

      <p className="uebertragshelfer__hint">
        Markiere Überträge per Checkbox und nutze das Warndreieck für den
        Überlauf.
      </p>

      <div className="uebertragshelfer__board">
        {/* ── Operand A ───────────────────────────────────────── */}
        <StaticDigitsRow
          digits={task.operandA}
          label="Zahl 1"
          className="uebertragshelfer__row"
        />

        {/* ── Operand B ───────────────────────────────────────── */}
        <StaticDigitsRow
          digits={task.operandB}
          label="Zahl 2"
          prefix="+"
          className="uebertragshelfer__row"
        />

        {/* ── Carry row ───────────────────────────────────────── */}
        <div className="uebertragshelfer__row uebertragshelfer__carries-row">
          <span className="uebertragshelfer__row-label">Übertrag</span>
          <div className={`uebertragshelfer__carries-grid uebertragshelfer__carries-grid--${mode}`}>
            {carries.map((c, i) => (
              <CarryCheckbox
                key={i}
                checked={c}
                onChange={() => toggleCarry(i)}
                disabled={evaluated}
                state={carryState(i)}
              />
            ))}
          </div>
        </div>

        {/* ── Separator ───────────────────────────────────────── */}
        <div className="uebertragshelfer__separator" />

        {/* ── Result row with overflow toggle ─────────────────── */}
        <div className="uebertragshelfer__row uebertragshelfer__result-row">
          <div className="uebertragshelfer__overflow-area">
            <OverflowToggle
              active={overflowMarked}
              onToggle={toggleOverflow}
              disabled={evaluated}
              state={overflowState()}
            />
            <span className="uebertragshelfer__overflow-label">Überlauf</span>
          </div>

          <span className="uebertragshelfer__arrow">→</span>

          <div className="uebertragshelfer__result-input">
            {mode === 'binary' ? (
              <BitToggleRow
                bits={resultDigits}
                onChange={handleResultBitsChange}
                disabled={evaluated}
                bitStates={validation?.digitResults}
              />
            ) : (
              <DigitsRow
                digits={resultDigits}
                onChange={handleResultDigitsChange}
                base={base}
                disabled={evaluated}
                digitStates={validation?.digitResults}
              />
            )}
          </div>
        </div>

        {/* ── Per-digit feedback after evaluation ─────────────── */}
        {validation && (
          <div className="uebertragshelfer__feedback">
            {validation.allCorrect ? (
              <span className="uebertragshelfer__feedback--correct">
                ✓ Alles richtig!
              </span>
            ) : (
              <span className="uebertragshelfer__feedback--wrong">
                ✗ Einige Antworten sind noch falsch.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Uebertragshelfer;
