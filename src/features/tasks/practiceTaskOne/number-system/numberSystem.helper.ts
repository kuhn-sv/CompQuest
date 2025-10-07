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
  // Two directions: bin->dec and dec->bin; produce 3 tasks total
  const directions: Array<{ from: Base; to: Base }> = [
    { from: 2, to: 10 },
    { from: 10, to: 2 },
  ];
  const tasks: NumberTask[] = [];

  // generate 3 random tasks, alternating directions
  for (let i = 0; i < 3; i++) {
    const dir = directions[i % directions.length];
    const n = randomInt(min, max);
    const sourceValue = dir.from === 10 ? String(n) : toBaseString(n, dir.from);
    const expectedValue = toBaseString(n, dir.to);
    tasks.push({ id: uid(), fromBase: dir.from, toBase: dir.to, sourceValue, expectedValue });
  }

  const answerPool: AnswerOption[] = shuffle(
    tasks.map<AnswerOption>(t => ({ value: t.expectedValue, base: t.toBase }))
  );
  return { tasks, answerPool };
};

export const generateSet = (difficulty: Difficulty): GeneratedSet => {
  switch (difficulty) {
    case Difficulty.Easy:
      return generateLeichtSet();
    case Difficulty.Medium:
    case Difficulty.Hard:
    case Difficulty.Expert:
      // Placeholder: refine later for each difficulty
      return generateLeichtSet();
    default:
      return generateLeichtSet();
  }
};
