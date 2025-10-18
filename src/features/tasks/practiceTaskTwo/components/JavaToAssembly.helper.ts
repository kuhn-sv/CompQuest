import type {AssemblyCommand, BaseAssemblyTask} from './shared/assembly.types';
import {
  parseAssemblerCommand,
  generateAvailableCommands as generateAvailableCommandsBase,
  generateRounds as generateRoundsBase,
} from './shared/assembly.utils';

/**
 * Task interface for Java to Assembly conversion exercises
 */
export interface JavaToAssemblyTask extends BaseAssemblyTask {
  /** Topic/title of the task */
  topic: string;
  /** Java code to convert */
  java: string;
  /** Memory addresses for each instruction */
  addresses: string[];
  /** Assembly instructions as strings */
  assembler: string[];
}

/**
 * Distractor commands for Java to Assembly tasks
 * These are incorrect commands used to increase difficulty
 */
const DISTRACTOR_COMMANDS: AssemblyCommand[] = [
  {op: 'LDA', arg: '(14)'},
  {op: 'LDA', arg: '#1'},
  {op: 'LDA', arg: '#2'},
  {op: 'ADD', arg: '(14)'},
  {op: 'ADD', arg: '#1'},
  {op: 'SUB', arg: '(13)'},
  {op: 'SUB', arg: '#1'},
  {op: 'STA', arg: '14'},
  {op: 'STA', arg: '13'},
  {op: 'BRZ', arg: '0100'},
  {op: 'BRP', arg: '0100'},
  {op: 'JMP', arg: '0000'},
  {op: 'MUL', arg: '(13)'},
  {op: 'DIV', arg: '(14)'},
];

/**
 * All available Java to Assembly tasks
 */
export const JAVA_TO_ASSEMBLY_TASKS: JavaToAssemblyTask[] = [
  {
    id: 'T1_add',
    topic: 'Addition',
    java: 'static int add(int a, int b) {\n    return a + b;\n}',
    addresses: ['0000', '0001', '0010', '0011'],
    assembler: ['LDA (13)', 'ADD (14)', 'STA 15', 'END'],
    difficulty: 'leicht',
  },
  {
    id: 'T2_sub',
    topic: 'Subtraktion',
    java: 'static int sub(int a, int b) {\n    return a - b;\n}',
    addresses: ['0000', '0001', '0010', '0011'],
    assembler: ['LDA (13)', 'SUB (14)', 'STA 15', 'END'],
    difficulty: 'leicht',
  },
  {
    id: 'T3_mulBy2',
    topic: 'Multiplikation',
    java: 'static int mulBy2(int x) {\n    return x + x;\n}',
    addresses: ['0000', '0001', '0010', '0011'],
    assembler: ['LDA (13)', 'ADD (13)', 'STA 15', 'END'],
    difficulty: 'leicht',
  },
  {
    id: 'T4_divFloor',
    topic: 'Ganzzahlige Division',
    java: 'static int divFloor(int a, int b) {\n    if (b <= 0) throw new IllegalArgumentException("b > 0 required");\n    int q = 0;\n    while (a >= b) {\n        a -= b;\n        q++;\n    }\n    return q;\n}',
    addresses: [
      '0000',
      '0001',
      '0010',
      '0011',
      '0100',
      '0101',
      '0110',
      '0111',
      '1000',
      '1001',
      '1010',
    ],
    assembler: [
      'LDA #0',
      'STA 15',
      'LDA (13)',
      'SUB (14)',
      'BRN 1010',
      'STA 13',
      'LDA (15)',
      'ADD #1',
      'STA 15',
      'JMP 0010',
      'END',
    ],
    difficulty: 'schwer',
  },
  {
    id: 'T5_absVal',
    topic: 'Betrag',
    java: 'static int absVal(int x) {\n    return (x < 0) ? -x : x;\n}',
    addresses: ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111'],
    assembler: [
      'LDA (13)',
      'BRN 0100',
      'STA 15',
      'END',
      'LDA #0',
      'SUB (13)',
      'STA 15',
      'END',
    ],
    difficulty: 'mittel',
  },
  {
    id: 'T6_min2',
    topic: 'Minimum',
    java: 'static int min2(int a, int b) {\n    return (a < b) ? a : b;\n}',
    addresses: [
      '0000',
      '0001',
      '0010',
      '0011',
      '0100',
      '0101',
      '0110',
      '0111',
      '1000',
    ],
    assembler: [
      'LDA (13)',
      'SUB (14)',
      'BRN 0110',
      'LDA (14)',
      'STA 15',
      'END',
      'LDA (13)',
      'STA 15',
      'END',
    ],
    difficulty: 'mittel',
  },
  {
    id: 'T7_max2',
    topic: 'Maximum',
    java: 'static int max2(int a, int b) {\n    return (a < b) ? b : a;\n}',
    addresses: [
      '0000',
      '0001',
      '0010',
      '0011',
      '0100',
      '0101',
      '0110',
      '0111',
      '1000',
    ],
    assembler: [
      'LDA (13)',
      'SUB (14)',
      'BRN 0110',
      'LDA (13)',
      'STA 15',
      'END',
      'LDA (14)',
      'STA 15',
      'END',
    ],
    difficulty: 'mittel',
  },
];

/**
 * Generates available commands for a Java to Assembly task
 * Includes all correct commands plus 3-5 random distractors
 *
 * @param task - The JavaToAssemblyTask
 * @returns Shuffled array of available commands
 */
export const generateAvailableCommands = (
  task: JavaToAssemblyTask,
): AssemblyCommand[] => {
  const correctCommands = task.assembler.map(parseAssemblerCommand);
  return generateAvailableCommandsBase(correctCommands, DISTRACTOR_COMMANDS, [3, 5]);
};

/**
 * Generates 4 rounds with specific difficulty progression:
 * - Round 1-2: leicht
 * - Round 3: mittel
 * - Round 4: schwer
 *
 * @returns Array of 4 selected tasks following the progression
 */
export const generateRounds = (): JavaToAssemblyTask[] => {
  return generateRoundsBase(JAVA_TO_ASSEMBLY_TASKS, [
    'leicht',
    'leicht',
    'mittel',
    'schwer',
  ]);
};

/**
 * Parses assembler string array to commands for a task
 *
 * @param task - The JavaToAssemblyTask
 * @returns Array of AssemblyCommand objects
 */
export const getTaskCommands = (task: JavaToAssemblyTask): AssemblyCommand[] => {
  return task.assembler.map(parseAssemblerCommand);
};

// Re-export shared types for convenience
export type {AssemblyCommand};
