export type RoundMode = 'fixed' | 'float';

export interface FixedFloatingRound {
    mode: RoundMode;
    targetValue: number;       // The decimal value to display
    expectedBits: number[];    // The correct 8-bit representation
    bitCount: number;
}

// Fixed Point 4.4
// Range: [-8, 7.9375], step 0.0625 (2^-4)
const STEP_FIXED = 0.0625;
const MIN_FIXED = -8;
const MAX_FIXED = 7.9375;

// Floating Point 1-4-3 Bias 7
// Exponent bits: 4 => Bias = 2^(4-1) - 1 = 7.
// storedE = actualE + 7.
// Range of storedE: 0..15.
// Normalized: storedE in [1..14] => actualE in [-6..7].
// Denormalized: storedE=0 => actualE = -6 (conceptually 1-bias, but for simplifiction often treated as special).
// We'll stick to normalized values for this exercise to generate "nice" numbers.
const BIAS = 7;

/**
 * Generates rounds.
 * 2 Fixed Point rounds (one positive, one negative).
 * 2 Floating Point rounds (one positive, one negative).
 */
export function generateRounds(): FixedFloatingRound[] {
    const rounds: FixedFloatingRound[] = [];

    // 1. Fixed Point Positive (e.g. 2.25)
    rounds.push(generateFixedPointRound(true));
    // 2. Fixed Point Negative (e.g. -3.5)
    rounds.push(generateFixedPointRound(false));

    // 3. Floating Point Positive
    rounds.push(generateFloatingPointRound(true));
    // 4. Floating Point Negative
    rounds.push(generateFloatingPointRound(false));

    return rounds;
}

function generateFixedPointRound(positive: boolean): FixedFloatingRound {
    // Generate a multiple of 0.0625 within range
    // Integer part 0..7
    // Fractional part 0..15 * 0.0625
    let val = 0;
    do {
        const intPart = Math.floor(Math.random() * 8); // 0..7
        const fracPart = Math.floor(Math.random() * 16); // 0..15
        val = intPart + fracPart * STEP_FIXED;
        if (!positive) val = -val;
        // ensure within range (simple check, though construction is mostly safe except -8 edge cases)
    } while (val < MIN_FIXED || val > MAX_FIXED || val === 0); // avoid 0 for simplicity if desired, or allow it.

    return {
        mode: 'fixed',
        targetValue: val,
        expectedBits: toFixedPointBits(val),
        bitCount: 8,
    };
}

function generateFloatingPointRound(positive: boolean): FixedFloatingRound {
    // We want clean numbers if possible, or at least representable ones.
    // Construct via (Sign, Exp, Mantissa) -> Value, then we know it's representable.

    const sign = positive ? 0 : 1;

    // Pick a normalized exponent: storedE in [1..14] -> actualE in [-6..7]
    const storedE = Math.floor(Math.random() * 14) + 1;
    const actualE = storedE - BIAS;

    // Pick mantissa bits (3 bits) -> val = 1.MMM
    const mInt = Math.floor(Math.random() * 8); // 0..7
    // mVal = 1 + mInt / 8
    const mVal = 1 + mInt / 8;

    const val = (sign === 1 ? -1 : 1) * mVal * Math.pow(2, actualE);

    // Re-verify we can convert it back (it is constructed from bits so it should be exact)
    return {
        mode: 'float',
        targetValue: val,
        expectedBits: constructFloatBits(sign, storedE, mInt),
        bitCount: 8,
    };
}

// 4.4 Fixed Point Conversion
// Value = IntegerBits.FractionBits
// If negative, 2s complement of the absolute value logic effectively applies to the whole 8-bit sequence treated as an integer * 2^-4.
export function toFixedPointBits(value: number): number[] {
    // Scale by 2^4 to get the integer representation
    const scaled = Math.round(value * 16);

    // To 8-bit integer (handles 2s complement for negatives automatically with & 0xFF)
    // e.g. -1 -> -16 scaled -> ...11110000
    let intVal = scaled;
    if (intVal < 0) {
        intVal = 0xFF + 1 + intVal; // simpler JS way to get 2s comp: 256 + negVal
    }

    // Extract bits
    const bits: number[] = [];
    for (let i = 7; i >= 0; i--) {
        bits.push((intVal >> i) & 1);
    }
    return bits;
}

// Helper to combine parts
function constructFloatBits(s: number, e: number, m: number): number[] {
    // S (1) | E (4) | M (3)
    const bits: number[] = [];
    bits.push(s);

    // E (4 bits)
    for (let i = 3; i >= 0; i--) {
        bits.push((e >> i) & 1);
    }

    // M (3 bits)
    for (let i = 2; i >= 0; i--) {
        bits.push((m >> i) & 1);
    }
    return bits;
}

export function bitsToString(bits: number[]): string {
    return bits.join('');
}
