import type {AssemblyCommand, BaseAssemblyTask} from './shared/assembly.types';
import {
  generateAvailableCommands as generateAvailableCommandsBase,
  generateRounds as generateRoundsBase,
} from './shared/assembly.utils';

/**
 * Task interface for Write Assembly exercises
 */
export interface WriteAssemblyTask extends BaseAssemblyTask {
  /** Descriptive text explaining what the program should do */
  prosa_text: string;
  /** Array of assembly commands that form the correct solution */
  commands: AssemblyCommand[];
}

/**
 * Distractor commands for Write Assembly tasks
 * These are incorrect commands used to increase difficulty
 */
const DISTRACTOR_COMMANDS: AssemblyCommand[] = [
  {op: 'LDA', arg: '(14)'},
  {op: 'LDA', arg: '#1'},
  {op: 'ADD', arg: '(14)'},
  {op: 'ADD', arg: '#1'},
  {op: 'SUB', arg: '(13)'},
  {op: 'SUB', arg: '#1'},
  {op: 'STA', arg: '14'},
  {op: 'STA', arg: '13'},
  {op: 'BRZ', arg: '0100'},
  {op: 'BRP', arg: '0100'},
  {op: 'JMP', arg: '0000'},
];

/**
 * All available Write Assembly tasks
 */
export const WRITE_ASSEMBLY_TASKS: WriteAssemblyTask[] = [
  {
    id: 'T1_subtract',
    prosa_text: 'Berechne x − y aus (13) und (14) und schreibe das Ergebnis nach (15).',
    difficulty: 'leicht',
    commands: [
      {op: 'LDA', arg: '(13)'},
      {op: 'SUB', arg: '(14)'},
      {op: 'STA', arg: '15'},
      {op: 'END', arg: null},
    ],
  },
  {
    id: 'T2_absolute',
    prosa_text: 'Lies a aus (13). Wenn a < 0, speichere -a, sonst a, in (15).',
    difficulty: 'leicht',
    commands: [
      {op: 'LDA', arg: '(13)'},
      {op: 'BRN', arg: '0100'},
      {op: 'STA', arg: '15'},
      {op: 'JMP', arg: '0111'},
      {op: 'LDA', arg: '#0'},
      {op: 'SUB', arg: '(13)'},
      {op: 'STA', arg: '15'},
      {op: 'END', arg: null},
    ],
  },
  {
    id: 'T3_multiply_by_3',
    prosa_text: 'Multipliziere x in (13) mit 3 und speichere das Ergebnis in (15).',
    difficulty: 'leicht',
    commands: [
      {op: 'LDA', arg: '(13)'},
      {op: 'ADD', arg: '(13)'},
      {op: 'ADD', arg: '(13)'},
      {op: 'STA', arg: '15'},
      {op: 'END', arg: null},
    ],
  },
  {
    id: 'T4_maximum',
    prosa_text: 'Vergleiche x (13) und y (14). Schreibe die größere Zahl nach (15).',
    difficulty: 'mittel',
    commands: [
      {op: 'LDA', arg: '(13)'},
      {op: 'SUB', arg: '(14)'},
      {op: 'BRN', arg: '0101'},
      {op: 'LDA', arg: '(13)'},
      {op: 'JMP', arg: '0110'},
      {op: 'LDA', arg: '(14)'},
      {op: 'STA', arg: '15'},
      {op: 'END', arg: null},
    ],
  },
  {
    id: 'T5_divide_by_2',
    prosa_text: 'Teile x aus (13) ganzzahlig durch 2. Ergebnis in (15).',
    difficulty: 'mittel',
    commands: [
      {op: 'LDA', arg: '#0'},
      {op: 'STA', arg: '15'},
      {op: 'LDA', arg: '(13)'},
      {op: 'SUB', arg: '#2'},
      {op: 'BRN', arg: '1010'},
      {op: 'STA', arg: '13'},
      {op: 'LDA', arg: '(15)'},
      {op: 'ADD', arg: '#1'},
      {op: 'STA', arg: '15'},
      {op: 'JMP', arg: '0010'},
      {op: 'END', arg: null},
    ],
  },
  {
    id: 'T6_multiply',
    prosa_text:
      'Multipliziere a in (13) mit b in (14) per wiederholter Addition; Ergebnis in (15).',
    difficulty: 'schwer',
    commands: [
      {op: 'LDA', arg: '#0'},
      {op: 'STA', arg: '15'},
      {op: 'LDA', arg: '(14)'},
      {op: 'BRZ', arg: '1010'},
      {op: 'SUB', arg: '#1'},
      {op: 'STA', arg: '14'},
      {op: 'LDA', arg: '(15)'},
      {op: 'ADD', arg: '(13)'},
      {op: 'STA', arg: '15'},
      {op: 'JMP', arg: '0010'},
      {op: 'END', arg: null},
    ],
  },
];

/**
 * Generates available commands for a Write Assembly task
 * Includes all correct commands plus 3-5 random distractors
 *
 * @param task - The WriteAssemblyTask
 * @returns Shuffled array of available commands
 */
export const generateAvailableCommands = (
  task: WriteAssemblyTask,
): AssemblyCommand[] => {
  return generateAvailableCommandsBase(task.commands, DISTRACTOR_COMMANDS, [3, 5]);
};

/**
 * Generates 4 rounds with specific difficulty progression:
 * - Round 1-2: leicht
 * - Round 3: mittel
 * - Round 4: schwer
 *
 * @returns Array of 4 selected tasks following the progression
 */
export const generateRounds = (): WriteAssemblyTask[] => {
  return generateRoundsBase(WRITE_ASSEMBLY_TASKS, [
    'leicht',
    'leicht',
    'mittel',
    'schwer',
  ]);
};

// Re-export shared types for convenience
export type {AssemblyCommand};
