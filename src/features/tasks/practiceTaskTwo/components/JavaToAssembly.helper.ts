import type {AssemblyCommand, BaseAssemblyTask} from './shared/assembly.types';
import {
  parseAssemblerCommand,
  generateAvailableCommands as generateAvailableCommandsBase,
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
  {op: 'JMP', arg: '0000'},
  {op: 'MUL', arg: '(13)'},
  {op: 'DIV', arg: '(14)'},
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
