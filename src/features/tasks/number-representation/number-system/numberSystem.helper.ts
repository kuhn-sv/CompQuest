import { Difficulty } from '../../../../shared/enums/difficulty.enum';
import type { Base } from './types/bases.type';
import type { NumberTask, GeneratedSet, AnswerOption } from './interfaces/numberSystem.interface';

export const toSubscript = (base: Base): string => {
  const map: Record<string, string> = {
    '2': '₂',
    '8': '₈',
    '10': '₁₀',
    '16': '₁₆',
  };
  return map[String(base)];
};

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generates an array of unique random integers within a given range.
 * @param count - Number of unique integers to generate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Array of unique random integers
 */
const generateUniqueRandomInts = (count: number, min: number, max: number): number[] => {
  const range = max - min + 1;
  if (count > range) {
    throw new Error(`Cannot generate ${count} unique values from range [${min}, ${max}]`);
  }
  
  const values = new Set<number>();
  let attempts = 0;
  const maxAttempts = 1000;
  
  while (values.size < count && attempts < maxAttempts) {
    values.add(randomInt(min, max));
    attempts++;
  }
  
  if (values.size < count) {
    throw new Error(`Failed to generate ${count} unique values after ${maxAttempts} attempts`);
  }
  
  return Array.from(values);
};

export const formatWithBase = (value: string | number, base: Base): string => `${value}${toSubscript(base)}`;

export const parseFromBase = (value: string, base: Base): number => {
  // sanitize and accept uppercase hex
  const trimmed = value.trim();
  const parsed = parseInt(trimmed, base);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid value '${value}' for base ${base}`);
  }
  return parsed;
};

export const toBaseString = (value: number, base: Base): string => {
  if (!Number.isFinite(value)) return '0';
  const str = value.toString(base);
  return base === 16 ? str.toUpperCase() : str;
};

export const convertBase = (value: string, fromBase: Base, toBase: Base): string => {
  const decimal = parseFromBase(value, fromBase);
  return toBaseString(decimal, toBase);
};

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const uid = () => Math.random().toString(36).slice(2, 9);

// Difficulty ranges to keep numbers readable in UI
const ranges: Record<Difficulty, { min: number; max: number }> = {
  [Difficulty.Easy]: { min: 0, max: 255 },
  [Difficulty.Medium]: { min: 0, max: 255 },
  [Difficulty.Hard]: { min: 0, max: 1023 },
  [Difficulty.Expert]: { min: 0, max: 4095 },
};

export const generateLeichtSet = (): GeneratedSet => {
  const { min, max } = ranges[Difficulty.Easy];
  // Easy: Always decimal (left) to binary (right), 4 tasks
  // Generate 4 unique decimal values
  const uniqueValues = generateUniqueRandomInts(4, min, max);
  
  const tasks: NumberTask[] = uniqueValues.map(n => {
    const fromBase: Base = 10;
    const toBaseVal: Base = 2;
    const sourceValue = String(n);
    const expectedValue = toBaseString(n, toBaseVal);
    return { id: uid(), fromBase, toBase: toBaseVal, sourceValue, expectedValue };
  });

  const answerPool: AnswerOption[] = shuffle(
    tasks.map<AnswerOption>(t => ({ value: t.expectedValue, base: t.toBase }))
  );
  return { tasks, answerPool };
};

// Medium: decimal ↔ binary, octal, hexadecimal (cover all three bases once)
export const generateMittelSet = (): GeneratedSet => {
  const { min, max } = ranges[Difficulty.Medium];
  const bases: Base[] = [2, 8, 16];

  // Medium: Always decimal (left) to one of [2,8,16]; 4 tasks
  // Ensure all three bases appear at least once; the 4th is a random repeat
  const extraBase = bases[randomInt(0, bases.length - 1)];
  const taskBases: Base[] = shuffle([...bases, extraBase]);

  // Generate 4 unique decimal values
  const uniqueValues = generateUniqueRandomInts(4, min, max);

  const tasks: NumberTask[] = taskBases.map((b, idx) => {
    const n = uniqueValues[idx];
    const fromBase: Base = 10;
    const toBaseVal: Base = b;
    const sourceValue = String(n);
    const expectedValue = toBaseString(n, toBaseVal);
    return { id: uid(), fromBase, toBase: toBaseVal, sourceValue, expectedValue };
  });

  const answerPool: AnswerOption[] = shuffle(
    tasks.map<AnswerOption>((t) => ({ value: t.expectedValue, base: t.toBase }))
  );

  return { tasks, answerPool };
};

// Hard: all base variations between 2, 8, 10, 16 (unordered pairs), random direction per pair
export const generateSchwerSet = (): GeneratedSet => {
  const { min, max } = ranges[Difficulty.Hard];
  const bases: Base[] = [2, 8, 10, 16];
  const pairs: Array<[Base, Base]> = [];
  for (let i = 0; i < bases.length; i++) {
    for (let j = i + 1; j < bases.length; j++) {
      pairs.push([bases[i], bases[j]]);
    }
  }

  // Pick exactly 4 unique random pairs
  const selectedPairs = shuffle(pairs).slice(0, 4);

  // Generate 4 unique decimal values
  const uniqueValues = generateUniqueRandomInts(4, min, max);

  const tasks: NumberTask[] = selectedPairs.map(([a, b], idx) => {
    const n = uniqueValues[idx];
    const flip = Math.random() < 0.5;
    const fromBase: Base = flip ? a : b;
    const toBaseVal: Base = flip ? b : a;
    const sourceValue = fromBase === 10 ? String(n) : toBaseString(n, fromBase);
    const expectedValue = toBaseString(n, toBaseVal);
    return { id: uid(), fromBase, toBase: toBaseVal, sourceValue, expectedValue };
  });

  const answerPool: AnswerOption[] = shuffle(
    tasks.map<AnswerOption>((t) => ({ value: t.expectedValue, base: t.toBase }))
  );

  return { tasks, answerPool };
};

export const generateSet = (difficulty: Difficulty): GeneratedSet => {
  switch (difficulty) {
    case Difficulty.Easy:
      return generateLeichtSet();
    case Difficulty.Medium:
      return generateMittelSet();
    case Difficulty.Hard:
      return generateSchwerSet();
    case Difficulty.Expert:
      // Placeholder: refine later for each difficulty
      return generateLeichtSet();
    default:
      return generateLeichtSet();
  }
};
