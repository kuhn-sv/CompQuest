import type { Base } from '../types/bases.type';

export interface NumberTask {
  id: string;
  fromBase: Base;
  toBase: Base;
  sourceValue: string; // value in fromBase
  expectedValue: string; // value in toBase
}

export interface AnswerOption {
  value: string;
  base: Base;
}

export interface GeneratedSet {
  tasks: NumberTask[];
  answerPool: AnswerOption[]; // expected values with base (shuffled)
}
