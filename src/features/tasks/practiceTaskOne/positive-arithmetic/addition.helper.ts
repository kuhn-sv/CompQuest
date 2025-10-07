import type { Difficulty } from '../../../../shared/enums/difficulty.enum';

export interface AdditionTask {
  id: string;
  left: string; // z.B. "1010 + 1101"
  base: number; // 2, 8, 16
  expected: string; // Ergebnis als String in der jeweiligen Basis
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

function generateAdditionSet(difficulty: Difficulty): AdditionSet {
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
    tasks.push({ id: uid(), left, base, expected });
  }
  const answerPool = tasks.map(t => ({ value: t.expected, base: t.base }));
  return { tasks, answerPool: answerPool.sort(() => Math.random() - 0.5) };
}

export { generateAdditionSet };