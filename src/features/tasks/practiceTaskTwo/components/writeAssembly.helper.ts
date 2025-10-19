import type {AssemblyCommand, BaseAssemblyTask} from './shared/assembly.types';
import {generateAvailableCommands as generateAvailableCommandsBase} from './shared/assembly.utils';

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
  {op: 'JMP', arg: '0000'},
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

// Re-export shared types for convenience
export type {AssemblyCommand};
