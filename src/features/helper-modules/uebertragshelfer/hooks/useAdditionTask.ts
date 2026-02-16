import { useCallback, useMemo } from 'react';
import { computeEvalStates } from '@shared/utils/evalStates';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export type AdditionMode = 'binary' | 'octal' | 'hex';

export interface AdditionTask {
  /** Operand A as digit array (MSB first). */
  operandA: number[];
  /** Operand B as digit array (MSB first). */
  operandB: number[];
  /** Expected carry flags per column (MSB first — leftmost = overflow carry). */
  expectedCarries: boolean[];
  /** Expected result digits (MSB first, same length as operands). */
  expectedResult: number[];
  /** Whether the addition overflows the available digit width. */
  expectedOverflow: boolean;
}

export interface AdditionValidation {
  /** Per-carry correctness (same indexing as carries array). */
  carryResults: ('correct' | 'wrong')[];
  /** Per-digit correctness for the result row. */
  digitResults: ('correct' | 'wrong')[];
  /** Whether the overflow flag is correct. */
  overflowCorrect: boolean;
  /** Overall correctness. */
  allCorrect: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

const MODE_CONFIG: Record<AdditionMode, { base: number; digitCount: number }> = {
  binary: { base: 2, digitCount: 8 },
  octal: { base: 8, digitCount: 3 },
  hex: { base: 16, digitCount: 2 },
};

// ────────────────────────────────────────────────────────────────────────────
// Helpers (pure)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Convert a non-negative integer to a digit array in the given base,
 * zero-padded to `width` digits, MSB first.
 */
function toDigits(value: number, base: number, width: number): number[] {
  const arr: number[] = [];
  let v = value;
  for (let i = 0; i < width; i++) {
    arr.push(v % base);
    v = Math.floor(v / base);
  }
  return arr.reverse(); // MSB first
}

/**
 * Generate a random integer in [0, max) (exclusive).
 */
function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/**
 * Perform column-wise addition of two same-length digit arrays in a given base.
 * Returns carries (length = digits + 1, index 0 = overflow carry), result digits,
 * and overflow flag.
 */
function addDigitArrays(
  a: number[],
  b: number[],
  base: number,
): { carries: boolean[]; result: number[]; overflow: boolean } {
  const len = a.length;
  const result = new Array<number>(len);
  // carries[i] represents the carry INTO column i (from the right).
  // carries[0] is the carry out of the most-significant column (overflow).
  const carriesRaw = new Array<number>(len + 1).fill(0);

  // Work right-to-left
  for (let i = len - 1; i >= 0; i--) {
    const sum = a[i] + b[i] + carriesRaw[i + 1];
    result[i] = sum % base;
    carriesRaw[i] = Math.floor(sum / base);
  }

  // carries array: same length as digits. carries[i] = carry INTO column i
  // For the user: carries[i] means "there was a carry from column i+1 into column i"
  // We expose carries right-aligned: index 0 = leftmost column
  const carries = carriesRaw.slice(0, len).map(c => c > 0);
  const overflow = carriesRaw[0] > 0;

  return { carries, result, overflow };
}

// ────────────────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────────────────

export interface UseAdditionTaskReturn {
  /** Generate a fresh task for the given mode. */
  generate: (mode: AdditionMode) => AdditionTask;
  /** Validate user answers against the current task. */
  validate: (
    task: AdditionTask,
    userCarries: boolean[],
    userResult: number[],
    userOverflow: boolean,
  ) => AdditionValidation;
  /** Get the digit count for a mode. */
  getDigitCount: (mode: AdditionMode) => number;
}

/**
 * Hook encapsulating addition-task generation and validation logic
 * for the Übertragshelfer module.
 */
export function useAdditionTask(): UseAdditionTaskReturn {
  const generate = useCallback((mode: AdditionMode): AdditionTask => {
    const { base, digitCount } = MODE_CONFIG[mode];
    const max = base ** digitCount; // e.g. 256 for binary-8

    const valA = randomInt(max);
    const valB = randomInt(max);

    const operandA = toDigits(valA, base, digitCount);
    const operandB = toDigits(valB, base, digitCount);

    const { carries, result, overflow } = addDigitArrays(operandA, operandB, base);

    return {
      operandA,
      operandB,
      expectedCarries: carries,
      expectedResult: result,
      expectedOverflow: overflow,
    };
  }, []);

  const validate = useCallback(
    (
      task: AdditionTask,
      userCarries: boolean[],
      userResult: number[],
      userOverflow: boolean,
    ): AdditionValidation => {
      const carryResults = computeEvalStates(userCarries, task.expectedCarries)!;

      const digitResults = computeEvalStates(userResult, task.expectedResult)!;

      const overflowCorrect = userOverflow === task.expectedOverflow;

      const allCorrect =
        carryResults.every(r => r === 'correct') &&
        digitResults.every(r => r === 'correct') &&
        overflowCorrect;

      return { carryResults, digitResults, overflowCorrect, allCorrect };
    },
    [],
  );

  const getDigitCount = useCallback(
    (mode: AdditionMode) => MODE_CONFIG[mode].digitCount,
    [],
  );

  return useMemo(
    () => ({ generate, validate, getDigitCount }),
    [generate, validate, getDigitCount],
  );
}
