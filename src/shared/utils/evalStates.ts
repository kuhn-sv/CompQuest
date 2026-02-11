/**
 * Compares each element of `actual` against `expected` and returns
 * a per-element evaluation state ('correct' or 'wrong').
 *
 * When `evaluated` is false, returns `undefined` (no feedback).
 * Used by BitToggleRow and DigitsRow consumers to provide visual
 * feedback after evaluation.
 */
export type EvalState = 'correct' | 'wrong';

export function computeEvalStates(
    actual: number[] | boolean[],
    expected: number[] | boolean[],
    evaluated = true,
): EvalState[] | undefined {
    if (!evaluated) return undefined;
    return actual.map((v, i) => v === expected[i] ? 'correct' : 'wrong');
}
