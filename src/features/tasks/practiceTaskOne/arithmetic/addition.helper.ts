import type { Difficulty } from '../../../../shared/enums/difficulty.enum';
import type { ArithmeticMode } from '../interfaces';

export interface AdditionTask {
  id: string;
  left: string; // z.B. "1010 + 1101"
  base: number; // 2, 8, 16
  expected: string; // Ergebnis als String in der jeweiligen Basis
  sourceValue: string;
  expectedValue: string;
  toBase: number | string;
}

export interface AdditionSet {
  tasks: AdditionTask[];
  answerPool: { value: string; base: number }[];
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const uid = () => Math.random().toString(36).slice(2, 9);

function toBaseString(n: number, base: number): string {
  return base === 16 ? n.toString(base).toUpperCase() : n.toString(base);
}
// Two's complement helpers
function toBinN(value: number, bits: number): string {
  const mask = (1 << bits) - 1;
  return (value & mask).toString(2).padStart(bits, '0');
}

function fromTwosComplement(bin: string): number {
  const bits = bin.length;
  if (bin[0] === '1') {
    // negative
    const val = parseInt(bin, 2);
    const signed = val - (1 << bits);
    return signed;
  }
  return parseInt(bin, 2);
}

function addTwosComplement(aBin: string, bBin: string): string {
  const bits = aBin.length;
  const a = fromTwosComplement(aBin);
  const b = fromTwosComplement(bBin);
  const sum = a + b; // JS number can handle small bit-width sums
  return toBinN(sum, bits);
}

function generateAdditionSet(difficulty: Difficulty, mode: ArithmeticMode = 'positive'): AdditionSet {
  // In twos-complement mode, we force binary and a fixed bit width per difficulty
  if (mode === 'twos-complement') {
    // Choose bit width per difficulty
    const bits = ((): number => {
      switch (difficulty) {
        case 'easy': return 4;  // values -8..+7
        case 'medium': return 5; // -16..+15
        case 'hard': return 8;  // -128..+127
        default: return 4;
      }
    })();
    const min = -(1 << (bits - 1));
    const max = (1 << (bits - 1)) - 1;
    const tasks: AdditionTask[] = [];
    for (let i = 0; i < 4; i++) {
      const a = randomInt(min, max);
      const b = randomInt(min, max);
      const aBin = toBinN(a, bits);
      const bBin = toBinN(b, bits);
      const left = `${aBin} + ${bBin}`;
      const expected = addTwosComplement(aBin, bBin);
      tasks.push({
        id: uid(),
        left,
        base: 2,
        expected,
        sourceValue: left,
        expectedValue: expected,
        toBase: 2
      });
    }
    const answerPool = tasks.map(t => ({ value: t.expected, base: 2 }));
    return { tasks, answerPool: answerPool.sort(() => Math.random() - 0.5) };
  }

  // Default positive arithmetic mode (original behavior)
  let base: number;
  switch (difficulty) {
    case 'easy': base = 2; break;
    case 'medium': base = 8; break;
    case 'hard': base = 16; break;
    default: base = 2;
  }
  const min = 1, max = base === 2 ? 31 : base === 8 ? 127 : 255;
  const tasks: AdditionTask[] = [];
  for (let i = 0; i < 4; i++) {
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    const left = `${toBaseString(a, base)} + ${toBaseString(b, base)}`;
    const expected = toBaseString(a + b, base);
    tasks.push({
      id: uid(),
      left,
      base,
      expected,
      sourceValue: left,
      expectedValue: expected,
      toBase: base
    });
  }
  const answerPool = tasks.map(t => ({ value: t.expected, base: t.base }));
  return { tasks, answerPool: answerPool.sort(() => Math.random() - 0.5) };
}

export { generateAdditionSet };