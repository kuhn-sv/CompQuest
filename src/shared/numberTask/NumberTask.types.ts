// Gemeinsame Typen für Aufgaben und Antworten
export interface NumberTaskBase {
  id: string;
  sourceValue: string;
  expectedValue: string;
  toBase: number | string;
}

export interface AnswerOptionBase {
  value: string;
  base?: number | string;
}

export type AssignmentMapBase = Record<string, AnswerOptionBase | null>;
